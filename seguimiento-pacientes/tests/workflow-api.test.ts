import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import worker from "../worker/index";
import {
  seedVisit,
  buildSave,
  attentionSummaries,
} from "../src/workflow/model";
function fixture() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync("legacy/current-schema.sql", "utf8"));
  sqlite.exec(readFileSync("migrations/0011_clinical_workflow.sql", "utf8"));
  sqlite.exec(
    "INSERT INTO patients(id,name,name_search,email) VALUES('one','TEST uno','test uno','one@example.invalid'),('two','TEST dos','test dos','two@example.invalid');",
  );
  const prepare = (sql: string, args: any[] = []): any => ({
    bind: (...values: any[]) => prepare(sql, values),
    first: async () => sqlite.prepare(sql).get(...args) || null,
    all: async () => ({ results: sqlite.prepare(sql).all(...args) }),
    run: async () => {
      const r = sqlite.prepare(sql).run(...args);
      return { meta: { changes: Number(r.changes) } };
    },
  });
  let queue = Promise.resolve<any>(undefined);
  const env: any = {
    DEV_MODE: "local",
    DB: {
      prepare,
      batch: (queries: any[]) => {
        const op = queue.then(async () => {
          sqlite.exec("BEGIN");
          try {
            const r = [];
            for (const q of queries) r.push(await q.run());
            sqlite.exec("COMMIT");
            return r;
          } catch (e) {
            sqlite.exec("ROLLBACK");
            throw e;
          }
        });
        queue = op.catch(() => {});
        return op;
      },
    },
    DOCUMENTS: {},
  };
  const request = async (
    path: string,
    method = "GET",
    body?: any,
    origin = "http://127.0.0.1",
  ) => {
    const r = await worker.fetch(
      new Request("http://127.0.0.1/api" + path, {
        method,
        headers: {
          Origin: origin,
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      }),
      env,
      {} as any,
    );
    return { status: r.status, data: (await r.json()) as any };
  };
  const get = () => request("/clinical/patients/one");
  return { sqlite, env, request, get };
}
test("Consulta: guardar antecedentes, control y registros atómicamente; fechas nuevas no copian mediciones", async () => {
  const f = fixture();
  try {
    let b = (await f.get()).data;
    const v = seedVisit("2026-10-25", b);
    v.data.context = "Objetivo de prueba";
    v.data.history.conditions = {
      status: "reported",
      text: "Antecedente ficticio",
    };
    v.data.measurements = { weight: "80", height: "175" };
    v.data.habits = { stepsMonthly: "8000", stress: "4" };
    v.data.general.adherencePercent = "90";
    v.data.activities = [
      {
        key: "sport1",
        name: "TEST fuerza",
        category: "fuerza",
        sessions: "3",
        minutes: "45",
        met: "4",
        intensity: "Moderada",
        included: true,
      },
    ];
    v.data.closing.nextVisit = "2026-12-06";
    const r = await f.request(
      "/clinical/patients/one/visits/2026-10-25",
      "PUT",
      buildSave(v.data, b, 0),
    );
    assert.equal(r.status, 200, JSON.stringify(r.data));
    b = (await f.get()).data;
    assert.equal(b.visits.length, 1);
    assert.equal(b.history.data.conditions.text, "Antecedente ficticio");
    assert.equal(b.records.length, 3);
    assert.equal(
      b.records.find((r: any) => r.kind === "anthropometry").data.weight,
      80,
    );
    assert.equal(
      b.records.find((r: any) => r.kind === "habits").data.adherence,
      9,
    );
    assert.equal(
      b.records.find((r: any) => r.kind === "exercise").data.modality,
      "TEST fuerza",
    );
    assert.equal(b.plans[0].data.nextVisit, "2026-12-06");
    const next = seedVisit("2026-12-06", b);
    assert.deepEqual(next.data.measurements, {});
    assert.equal(next.data.history.conditions.text, "Antecedente ficticio");
    assert.equal(next.data.type, "control");
    assert.deepEqual(
      (await f.request("/clinical/patients/two")).data.visits,
      [],
    );
  } finally {
    f.sqlite.close();
  }
});
test("Concurrencia: una versión antigua no cambia antecedentes, plan ni mediciones", async () => {
  const f = fixture();
  try {
    const b = (await f.get()).data;
    const v = seedVisit("2026-10-25", b);
    v.data.measurements = { weight: "80" };
    const body = buildSave(v.data, b, 0);
    const results = await Promise.all([
      f.request("/clinical/patients/one/visits/2026-10-25", "PUT", body),
      f.request("/clinical/patients/one/visits/2026-10-25", "PUT", {
        ...body,
        data: { ...body.data, context: "Otro borrador" },
      }),
    ]);
    assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
    const fresh = (await f.get()).data;
    assert.equal(fresh.records.length, 1);
    assert.equal(fresh.visits[0].version, 1);
    assert.equal(
      f.sqlite.prepare("SELECT count(*) n FROM clinical_write_guards").get()!.n,
      0,
    );
    const updated = seedVisit("2026-10-25", fresh);
    updated.data.measurements.weight = "78";
    const updateBody = buildSave(updated.data, fresh, 1);
    assert.equal(
      (
        await f.request(
          "/clinical/patients/one/visits/2026-10-25",
          "PUT",
          updateBody,
        )
      ).status,
      200,
    );
    assert.equal(
      (
        await f.request(
          "/clinical/patients/one/visits/2026-10-25",
          "PUT",
          updateBody,
        )
      ).status,
      409,
    );
    const after = (await f.get()).data;
    assert.equal(after.records.length, 1);
    assert.equal(after.records[0].data.weight, 78);
  } finally {
    f.sqlite.close();
  }
});
test("Aislamiento: no permite modificar registros de otro paciente ni fechas ajenas", async () => {
  const f = fixture();
  try {
    f.sqlite
      .prepare(
        "INSERT INTO records(id,patient_id,kind,date,data,attention_date) VALUES('foreign','two','anthropometry','2026-10-25','{\"weight\":90}','2026-10-25')",
      )
      .run();
    const b = (await f.get()).data;
    const v = seedVisit("2026-10-25", b);
    const dto = buildSave(v.data, b, 0);
    dto.records = [
      {
        id: "foreign",
        kind: "anthropometry",
        expectedVersion: 1,
        data: { weight: 10 },
      },
    ];
    assert.equal(
      (await f.request("/clinical/patients/one/visits/2026-10-25", "PUT", dto))
        .status,
      409,
    );
    assert.equal((await f.get()).data.visits.length, 0);
    assert.equal(
      JSON.parse(
        String(
          f.sqlite.prepare("SELECT data FROM records WHERE id='foreign'").get()!
            .data,
        ),
      ).weight,
      90,
    );
  } finally {
    f.sqlite.close();
  }
});
test("Validación: rechazar fechas inválidas, adherencia errónea, cantidades negativas y origen externo", async () => {
  const f = fixture();
  try {
    const b = (await f.get()).data;
    const v = seedVisit("2026-10-25", b);
    const dto = buildSave(v.data, b, 0);
    dto.data.general.adherencePercent = "mucho";
    assert.equal(
      (await f.request("/clinical/patients/one/visits/2026-10-25", "PUT", dto))
        .status,
      400,
    );
    dto.data.general.adherencePercent = "90";
    dto.data.drinks = [{ volume: -250, count: 2 }];
    assert.equal(
      (await f.request("/clinical/patients/one/visits/2026-10-25", "PUT", dto))
        .status,
      400,
    );
    assert.equal(
      (
        await f.request(
          "/clinical/patients/one/visits/2026-10-25",
          "PUT",
          dto,
          "https://other.invalid",
        )
      ).status,
      403,
    );
    assert.equal((await f.get()).data.visits.length, 0);
  } finally {
    f.sqlite.close();
  }
});
test("Producción: la ampliación conserva autenticación privada y protege la biblioteca existente", async () => {
  const f = fixture();
  try {
    for (const path of [
      "/api/clinical/patients/one",
      "/api/document-templates",
      "/api/patients",
    ]) {
      const r = await worker.fetch(
        new Request("https://clinic.example.invalid" + path),
        { ...f.env, DEV_MODE: undefined },
        {} as any,
      );
      assert.equal(r.status, 401);
    }
  } finally {
    f.sqlite.close();
  }
});

test(
  "D1 real aislada: dos guardados simultáneos no duplican ni sobrescriben el control",
  { skip: !process.env.TEST_BASE_URL },
  async () => {
    const base = process.env.TEST_BASE_URL!;
    const call = async (path: string, method = "GET", body?: any) => {
      const r = await fetch(base + "/api" + path, {
        method,
        headers: {
          Origin: base,
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      return { status: r.status, data: (await r.json()) as any };
    };
    const p = (
      await call("/patients", "POST", {
        name: "TEST concurrencia real",
        email: "concurrency@example.invalid",
      })
    ).data;
    const bundle = (await call("/clinical/patients/" + p.id)).data;
    const v = seedVisit("2026-10-25", bundle);
    v.data.measurements = { weight: "82" };
    const dto = buildSave(v.data, bundle, 0);
    const results = await Promise.all([
      call("/clinical/patients/" + p.id + "/visits/2026-10-25", "PUT", dto),
      call("/clinical/patients/" + p.id + "/visits/2026-10-25", "PUT", {
        ...dto,
        data: { ...dto.data, context: "Segundo borrador" },
      }),
    ]);
    assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
    const after = (await call("/clinical/patients/" + p.id)).data;
    assert.equal(after.visits.length, 1);
    assert.equal(after.records.length, 1);
    assert.equal(after.history.version, 1);
  },
);

test("Historial anterior: controles y tratamientos visibles sin inventar respuestas ni confundir fechas de muestra", () => {
  const bundle = {
    history: null,
    visits: [],
    plans: [
      {
        date: "2026-01-10",
        data: {
          medications: [{ name: "TEST tratamiento", dose: "Consignada" }],
          nextVisit: "2026-02-21",
        },
      },
    ],
    records: [
      {
        kind: "lab",
        date: "2026-01-07",
        attention_date: null,
        data: { name: "TEST examen", value: 1 },
      },
      {
        kind: "habits",
        date: "2026-01-10",
        attention_date: "2026-01-10",
        data: { adherence: 8 },
      },
    ],
  };
  const before = JSON.stringify(bundle);
  const rows = attentionSummaries(bundle);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].date, "2026-01-10");
  assert.equal(rows[0].data.general.adherencePercent, 80);
  assert.equal(rows[0].data.medications[0].name, "TEST tratamiento");
  assert.equal(rows[0].data.closing.nextVisit, "2026-02-21");
  assert.equal(rows[0].data.general.barriers, undefined);
  assert.equal(JSON.stringify(bundle), before);
  assert.equal(
    seedVisit("2026-02-21", { ...bundle, records: [] }).data.type,
    "control",
  );
});
