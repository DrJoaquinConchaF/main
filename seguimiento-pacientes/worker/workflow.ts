import {
  authenticated,
  local,
  validateRecord,
  anthropometryData,
  validateControl,
  automaticPhotoRequest,
} from "../legacy/published-worker.mjs";
import {
  validDate,
  validateVisit,
  validateWorkspace,
} from "../src/clinical-workflow/consultation.mjs";
const json = (data: any, status = 200) =>
  Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
const fail = (error: string, status = 400) => json({ error }, status);
const decode = (r: any) => (r ? { ...r, data: JSON.parse(r.data) } : null);
const object = (x: any) => x && typeof x === "object" && !Array.isArray(x);
const version = (x: any) => Number.isInteger(x) && x >= 0;
export async function clinicalApi(req: Request, env: any): Promise<Response> {
  const url = new URL(req.url),
    isLocal = local(req, env);
  if (!["GET", "HEAD"].includes(req.method)) {
    const origin = req.headers.get("Origin");
    if (
      (!isLocal && origin !== url.origin) ||
      (isLocal &&
        origin &&
        origin !== url.origin &&
        !["http://127.0.0.1:5173", "http://localhost:5173"].includes(origin))
    )
      return fail("Origen no autorizado.", 403);
  }
  if (!(await authenticated(req, env)))
    return fail("Inicia sesión para acceder.", 401);
  const route = url.pathname.match(
    /^\/api\/clinical\/patients\/([^/]+)(?:\/visits\/([0-9-]+))?$/,
  );
  if (!route) return fail("Ruta no encontrada.", 404);
  const patientId = route[1],
    date = route[2],
    db: D1Database = env.DB;
  const patient = await db
    .prepare("SELECT id FROM patients WHERE id=?")
    .bind(patientId)
    .first();
  if (!patient) return fail("Paciente no encontrado.", 404);
  if (req.method === "GET" && !date) {
    const [history, visits, records, plans] = await Promise.all([
      db
        .prepare("SELECT * FROM patient_histories WHERE patient_id=?")
        .bind(patientId)
        .first(),
      db
        .prepare(
          "SELECT * FROM clinical_visits WHERE patient_id=? ORDER BY date",
        )
        .bind(patientId)
        .all(),
      db
        .prepare(
          "SELECT * FROM records WHERE patient_id=? ORDER BY date,created_at,id",
        )
        .bind(patientId)
        .all(),
      db
        .prepare("SELECT * FROM control_plans WHERE patient_id=? ORDER BY date")
        .bind(patientId)
        .all(),
    ]);
    return json({
      history: decode(history),
      visits: visits.results.map(decode),
      records: records.results.map(decode),
      plans: plans.results.map(decode),
    });
  }
  if (req.method !== "PUT" || !date) return fail("Método no permitido.", 405);
  if (!validDate(date)) return fail("Fecha inválida.");
  if (Number(req.headers.get("Content-Length") || 0) > 250000)
    return fail("La consulta supera el tamaño permitido.", 413);
  const raw = await req.text();
  if (raw.length > 250000)
    return fail("La consulta supera el tamaño permitido.", 413);
  let body: any;
  try {
    body = JSON.parse(raw);
  } catch {
    return fail("Solicitud inválida.");
  }
  if (!object(body) || !object(body.data) || !version(body.expectedVersion))
    return fail("Consulta o versión inválida.");
  if (body.data.date !== date)
    return fail("La fecha del registro debe coincidir con la atención.");
  const error = validateWorkspace(body.data);
  if (error) return fail(error);
  if (!Array.isArray(body.records) || body.records.length > 40)
    return fail("Registros inválidos.");
  if (
    body.history &&
    (!object(body.history.data) || !version(body.history.expectedVersion))
  )
    return fail("Antecedentes inválidos.");
  if (body.history)
    for (const entry of Object.values(body.history.data) as any[])
      if (
        !object(entry) ||
        ![
          "not_asked",
          "none",
          "reported",
          "unknown",
          "prefers_discussion",
        ].includes(entry.status) ||
        typeof entry.text !== "string" ||
        entry.text.length > 4000
      )
        return fail("Antecedente inválido.");
  const guards: string[] = [
    "coalesce((SELECT version FROM clinical_visits WHERE patient_id=? AND date=?),0)=?",
  ];
  const guardArgs: any[] = [patientId, date, body.expectedVersion];
  if (body.history) {
    guards.push(
      "coalesce((SELECT version FROM patient_histories WHERE patient_id=?),0)=?",
    );
    guardArgs.push(patientId, body.history.expectedVersion);
  }
  const prepared: any[] = [];
  const ids = new Set();
  const recordRefs: any[] = [];
  for (const r of body.records) {
    if (
      !object(r) ||
      !["anthropometry", "habits", "exercise"].includes(r.kind) ||
      !object(r.data)
    )
      return fail("Tipo de registro inválido.");
    const e = validateRecord(r.kind, date, r.data);
    if (e) return fail(e);
    let data = r.kind === "anthropometry" ? anthropometryData(r.data) : r.data;
    const id = r.id || crypto.randomUUID();
    if (typeof id !== "string" || id.length > 150 || ids.has(id))
      return fail("Identificador de registro inválido.");
    ids.add(id);
    recordRefs.push({ id, kind: r.kind, clientKey: r.clientKey || null });
    if (r.id) {
      const old: any = await db
        .prepare("SELECT * FROM records WHERE id=? AND patient_id=?")
        .bind(r.id, patientId)
        .first();
      if (!old || old.kind !== r.kind || old.document_id || old.date !== date)
        return fail(
          "El registro original no corresponde a esta atención.",
          409,
        );
      if (!version(r.expectedVersion))
        return fail("Versión de registro inválida.");
      guards.push(
        "coalesce((SELECT version FROM records WHERE id=? AND patient_id=?),0)=?",
      );
      guardArgs.push(r.id, patientId, r.expectedVersion);
      prepared.push(
        db
          .prepare(
            "UPDATE records SET data=?,attention_date=?,version=version+1,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=? AND patient_id=?",
          )
          .bind(JSON.stringify(data), date, id, patientId),
      );
    } else
      prepared.push(
        db
          .prepare(
            "INSERT INTO records(id,patient_id,kind,date,data,attention_date) VALUES(?,?,?,?,?,?)",
          )
          .bind(id, patientId, r.kind, date, JSON.stringify(data), date),
      );
  }
  if (body.plan) {
    if (!object(body.plan) || !version(body.plan.expectedVersion))
      return fail("Plan inválido.");
    const e = validateControl(date, body.plan.data);
    if (e) return fail(e);
    guards.push(
      "coalesce((SELECT version FROM control_plans WHERE patient_id=? AND date=?),0)=?",
    );
    guardArgs.push(patientId, date, body.plan.expectedVersion);
    prepared.push(
      db
        .prepare(
          "INSERT INTO control_plans(patient_id,date,data) VALUES(?,?,?) ON CONFLICT(patient_id,date) DO UPDATE SET data=excluded.data,version=control_plans.version+1,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now')",
        )
        .bind(patientId, date, JSON.stringify(body.plan.data)),
    );
  }
  const token = crypto.randomUUID();
  const statements = [
    db
      .prepare(
        "INSERT INTO clinical_write_guards(token,allowed) VALUES(?,CASE WHEN " +
          guards.join(" AND ") +
          " THEN 1 ELSE 0 END)",
      )
      .bind(token, ...guardArgs),
    db
      .prepare(
        "INSERT INTO clinical_visits(patient_id,date,data,revision_token) VALUES(?,?,?,?) ON CONFLICT(patient_id,date) DO UPDATE SET data=excluded.data,revision_token=excluded.revision_token,version=clinical_visits.version+1,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now')",
      )
      .bind(
        patientId,
        date,
        JSON.stringify({
          ...body.data,
          _recordRefs: recordRefs,
          _planVersion: body.plan ? body.plan.expectedVersion + 1 : null,
        }),
        token,
      ),
    ...prepared,
  ];
  if (body.history)
    statements.push(
      db
        .prepare(
          "INSERT INTO patient_histories(patient_id,data) VALUES(?,?) ON CONFLICT(patient_id) DO UPDATE SET data=excluded.data,version=patient_histories.version+1,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now')",
        )
        .bind(patientId, JSON.stringify(body.history.data)),
    );
  statements.push(
    db
      .prepare(
        "INSERT INTO audit_events(id,action,resource_type,resource_id,actor) VALUES(?,?,?,?,?)",
      )
      .bind(
        crypto.randomUUID(),
        "save",
        "clinical-visit",
        patientId + ":" + date,
        isLocal ? "local-development" : "professional",
      ),
    db.prepare("DELETE FROM clinical_write_guards WHERE token=?").bind(token),
  );
  await db.batch(statements);
  const saved = await db
    .prepare("SELECT * FROM clinical_visits WHERE patient_id=? AND date=?")
    .bind(patientId, date)
    .first();
  // Existing service is unconfigured; do not activate an email provider. Demo protections remain inherited.
  const photo_request = await automaticPhotoRequest(
    env,
    url.origin,
    patientId,
    date,
  ).catch(() => ({ status: "failed" }));
  return json({ visit: decode(saved), photo_request });
}
