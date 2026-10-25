import { defaultCatalog, validateCatalog } from "../treatments/catalog.mjs";
import { seedVisit, buildSave } from "../workflow/model";
import { validateWorkspace } from "../clinical-workflow/consultation.mjs";
import {
  validateRecord,
  anthropometryData,
  validateControl,
} from "../../legacy/published-worker.mjs";
export const demoPatient = {
  id: "offline-demo-juan",
  name: "Juan Prueba",
  rut: null,
  email: "juan.prueba@example.invalid",
  phone: "",
  is_demo: 1,
};
const copy = (x: any) => structuredClone(x);
export function saveDemo(state: any, date: string, body: any) {
  const fail = (error: string, status = 400) => ({ status, data: { error } });
  const error = validateWorkspace(body.data);
  if (error) return fail(error);
  const previous = state.visits.find((v: any) => v.date === date);
  if (
    (previous?.version || 0) !== body.expectedVersion ||
    (state.history?.version || 0) !== body.history.expectedVersion
  )
    return fail("La consulta cambió. Vuelve a abrirla antes de guardar.", 409);
  const plan = state.plans.find((p: any) => p.date === date);
  if ((plan?.version || 0) !== body.plan.expectedVersion)
    return fail("El plan cambió.", 409);
  const planError = validateControl(date, body.plan.data);
  if (planError) return fail(planError);
  for (const r of body.records) {
    const error = validateRecord(r.kind, date, r.data);
    if (error) return fail(error);
    if (r.id) {
      const old = state.records.find((x: any) => x.id === r.id);
      if (!old || old.version !== r.expectedVersion)
        return fail("Una medición cambió.", 409);
    }
  }
  const next = copy(state),
    timestamp = new Date().toISOString(),
    refs: any[] = [];
  for (const r of body.records) {
    const id = r.id || crypto.randomUUID();
    const i = next.records.findIndex((x: any) => x.id === id);
    const row = {
      id,
      patient_id: demoPatient.id,
      kind: r.kind,
      date,
      attention_date: date,
      data: r.kind === "anthropometry" ? anthropometryData(r.data) : r.data,
      document_id: null,
      version: i >= 0 ? next.records[i].version + 1 : 1,
      created_at: i >= 0 ? next.records[i].created_at : timestamp,
      updated_at: timestamp,
    };
    if (i >= 0) next.records[i] = row;
    else next.records.push(row);
    refs.push({ id, kind: r.kind, clientKey: r.clientKey || null });
  }
  const newPlan = {
    patient_id: demoPatient.id,
    date,
    data: copy(body.plan.data),
    version: (plan?.version || 0) + 1,
  };
  const pi = next.plans.findIndex((x: any) => x.date === date);
  if (pi >= 0) next.plans[pi] = newPlan;
  else next.plans.push(newPlan);
  const visit = {
    patient_id: demoPatient.id,
    date,
    data: {
      ...copy(body.data),
      _recordRefs: refs,
      _planVersion: newPlan.version,
    },
    version: (previous?.version || 0) + 1,
    updated_at: timestamp,
  };
  const vi = next.visits.findIndex((x: any) => x.date === date);
  if (vi >= 0) next.visits[vi] = visit;
  else next.visits.push(visit);
  next.history = {
    patient_id: demoPatient.id,
    data: copy(body.history.data),
    version: (state.history?.version || 0) + 1,
  };
  next.visits.sort((a: any, b: any) => a.date.localeCompare(b.date));
  Object.assign(state, next);
  return { status: 200, data: { visit } };
}
export function initialDemo() {
  const state: any = { history: null, visits: [], records: [], plans: [] };
  const dates = [
      "2026-01-10",
      "2026-02-10",
      "2026-04-10",
      "2026-07-10",
      "2026-10-10",
    ],
    weights = [104, 100, 94, 88, 83],
    doses = ["0,25 mg", "0,5 mg", "1 mg", "1,7 mg", "1,7 mg"];
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i],
      data = seedVisit(date, state).data;
    data.type = i ? "control" : "initial";
    data.context = i
      ? "Control de evolución y ajuste de metas. Ejemplo ficticio."
      : "Mejorar salud y composición corporal. Caso de demostración.";
    data.history = {
      conditions: {
        status: "reported",
        text: "Antecedentes ficticios para explorar la aplicación",
      },
      allergies: { status: "none", text: "" },
      occupation: {
        status: "reported",
        text: "Trabajo de oficina, predominantemente sedente",
      },
      household: { status: "reported", text: "Vive con su pareja" },
      cooking: {
        status: "reported",
        text: "Cocinan en casa y algunas veces comen fuera",
      },
    };
    data.demographics = { sex: "male", age: "45" };
    data.measurements = {
      weight: String(weights[i]),
      height: "175",
      waistWHO: String(118 - i * 6),
      waistNavel: String(121 - i * 6),
      waistSmall: String(115 - i * 6),
      hip: String(115 - i * 3),
    };
    data.general = {
      understanding: "Sí",
      adherencePercent: String(65 + i * 7),
      bodyChanges: i
        ? "Mejor ajuste de la ropa y mayor facilidad para moverse."
        : "Registro inicial.",
      barriers: i
        ? "Organizar horarios en días de trabajo."
        : "Dificultades con horarios, sedentarismo y picoteos.",
      performance: i
        ? "Aumenta las cargas y mejora la recuperación."
        : "Inicia actividad progresiva.",
      tolerance: "Información simulada; no corresponde a una evaluación real.",
      snoring: i < 2 ? "Sí" : "No",
      breathingPauses: "No sabe",
      restorative: i < 2 ? "No" : "Sí",
    };
    data.habits = {
      stepsMonthly: String(3500 + i * 1400),
      stress: String(7 - i),
      sleep: String(6 + i * 0.3),
      sleepQuality: i ? "Más reparador" : "Irregular",
      liquids: String(1.5 + i * 0.2),
      water: String(1.2 + i * 0.2),
      ultraprocessed: String(5 - i),
      sweetSnacks: String(5 - i),
      saltySnacks: String(4 - i),
      delivery: String(3 - i * 0.5),
      alcoholDrinks: String(Math.max(0, 1 - i * 0.2)),
      alcoholDays: String(i < 2 ? 2 : 1),
      fruit: "2",
      vegetables: "3",
    };
    data.activities = [
      {
        key: "strength-" + i,
        name: "Entrenamiento de fuerza (simulado)",
        category: "fuerza",
        sessions: String(i ? 3 : 1),
        minutes: "45",
        met: "3.5",
        method: "met",
        manualCalories: "",
        intensity: "Moderada",
        included: true,
      },
      {
        key: "cardio-" + i,
        name: "Caminata rápida (simulada)",
        category: "cardiovascular",
        sessions: String(2 + i),
        minutes: "30",
        met: "4",
        method: "met",
        manualCalories: "",
        intensity: "Moderada",
        included: true,
      },
    ];
    data.drinks = [
      { key: "water", name: "Agua", volume: "500", count: String(2 + i * 0.5) },
      { key: "tea", name: "Té", volume: "250", count: "2" },
    ];
    data.medications = [
      {
        name: "Semaglutida · ejemplo ficticio",
        dose: doses[i],
        frequency: "Semanal (simulado)",
        notes: "Datos de demostración; no usar como pauta de tratamiento.",
      },
    ];
    data.supplements = [
      {
        name: "Proteína · ejemplo ficticio",
        dose: "Porción consignada en el ejemplo",
        frequency: "Según registro simulado",
        notes: "No es una indicación real.",
      },
    ];
    data.recall.date = date;
    data.recall.context = "Día laboral de ejemplo";
    data.recall.typical =
      "Ejemplo ficticio. Los fines de semana cambian los horarios.";
    const foods = [
      "Yogur y avena",
      "Fruta",
      "Pollo, arroz y ensalada",
      "Yogur",
      "Tortilla con verduras",
      "Agua durante el día",
    ];
    data.recall.meals.forEach((m: any, j: number) => {
      m.food = foods[j];
      m.time = ["08:00", "11:00", "14:00", "17:00", "20:00", ""][j];
      m.amount = "Cantidad a precisar durante la entrevista";
    });
    data.foodNotes = {
      portions: "Comparar días laborales y fin de semana.",
      social: "Eventos sociales ocasionales.",
    };
    data.energy = {
      ...data.energy,
      referenceWeight: String(weights[i]),
      referenceHeight: "175",
      fatPercent: String(35 - i * 3),
      method: "manual",
      manualTotal: "2400",
      adjustment: "-400",
      macroWeight: String(weights[i]),
      proteinValue: "1.6",
      fatValue: "0.6",
      stepsOutside: String(3500 + i * 800),
      overlapReviewed: true,
    };
    data.portions = {
      "exchange-47": "2.5",
      "exchange-50": "12",
      "exchange-53": "2",
      "exchange-54": "3.25",
      "exchange-55": "2",
      "exchange-56": "3",
      "exchange-58": "5",
    };
    data.allocations = {
      Desayuno: { "exchange-47": "1" },
      "Colación PM": { "exchange-47": "1.5" },
    };
    data.closing = {
      assessment:
        "Evolución simulada favorable. Estos datos sirven para probar la aplicación.",
      dietStrategy: "Derivación a nutricionista",
      referral: "Nutricionista del equipo (ejemplo)",
      dietNotes:
        "Plan de alimentación individualizado para revisar en consulta.",
      stepsMin: String(5000 + i * 1000),
      stepsIdeal: String(7000 + i * 1000),
      strength: "3",
      cardio: "150",
      nextVisit: dates[i + 1] || "2027-01-10",
      notes: "Resumen de demostración. No es una indicación médica real.",
    };
    if (!i)
      data.weightHistory = [
        {
          key: "child",
          stage: "Infancia",
          age: "10",
          year: "",
          weight: "42",
          event: "Peso recordado aproximado, simulado",
        },
        {
          key: "teen",
          stage: "Adolescencia",
          age: "18",
          year: "",
          weight: "78",
          event: "Actividad deportiva, ejemplo",
        },
        {
          key: "adult",
          stage: "Adultez",
          age: "35",
          year: "",
          weight: "95",
          event: "Cambio a trabajo de oficina, ejemplo",
        },
        {
          key: "current",
          stage: "Inicio de seguimiento",
          age: "45",
          year: "2026",
          weight: "104",
          event: "Datos ficticios",
        },
      ];
    const result = saveDemo(state, date, buildSave(data, state, 0));
    if (result.status !== 200)
      throw Error(
        "error" in result.data
          ? result.data.error
          : "No se pudo preparar la demostración.",
      );
    const measured = new Date(Date.parse(date + "T12:00:00Z") - 3 * 86400000)
      .toISOString()
      .slice(0, 10);
    state.records.push({
      id: "lab-" + i,
      patient_id: demoPatient.id,
      kind: "lab",
      date: measured,
      attention_date: date,
      data: {
        name: "Glicemia en ayunas",
        value: 108 - i * 4,
        unit: "mg/dL",
        referenceLow: 70,
        referenceHigh: 99,
        notes: "Resultado ficticio de demostración",
      },
      version: 1,
      created_at: date,
      updated_at: date,
      document_id: null,
    });
  }
  return state;
}
export function installPreviewApi() {
  let state = initialDemo();
  let templates: any[] = [];
  let catalog: any = { items: copy(defaultCatalog), version: 0 };
  const response = (data: any, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  window.fetch = async (input: any, init: any = {}) => {
    const path = new URL(
      typeof input === "string" ? input : input.url,
      "https://offline.invalid",
    ).pathname;
    const method = init.method || "GET";
    let body: any;
    try {
      body = init.body ? JSON.parse(init.body) : {};
    } catch {
      return response({ error: "Datos inválidos." }, 400);
    }
    if (path === "/api/clinical/treatment-catalog") {
      if (method === "GET") return response(copy(catalog));
      const error = validateCatalog(body.items);
      if (error) return response({ error }, 400);
      if (body.expectedVersion !== catalog.version)
        return response({ error: "El catálogo cambió." }, 409);
      catalog = { items: copy(body.items), version: catalog.version + 1 };
      return response({ version: catalog.version });
    }
    if (path === "/api/patients") return response([demoPatient]);
    if (path === "/api/clinical/patients/" + demoPatient.id && method === "GET")
      return response(copy(state));
    const visit = path.match(
      /^\/api\/clinical\/patients\/offline-demo-juan\/visits\/([0-9-]+)$/,
    );
    if (visit && method === "PUT") {
      const r = saveDemo(state, visit[1], body);
      return response(r.data, r.status);
    }
    if (path === "/api/document-templates" && method === "GET")
      return response(copy(templates));
    if (path === "/api/document-templates" && method === "POST") {
      if (!body.title?.trim() || !body.content?.trim())
        return response({ error: "Completa título y texto." }, 400);
      const t = { ...body, id: crypto.randomUUID(), version: 1 };
      templates.push(t);
      return response(t, 201);
    }
    const template = path.match(/^\/api\/document-templates\/([^/]+)$/);
    if (template && method === "PATCH") {
      const i = templates.findIndex((t) => t.id === template[1]);
      if (i < 0) return response({ error: "Plantilla no encontrada." }, 404);
      if (templates[i].version !== body.expectedVersion)
        return response({ error: "La plantilla cambió." }, 409);
      templates[i] = {
        ...templates[i],
        kind: body.kind,
        title: body.title,
        content: body.content,
        version: templates[i].version + 1,
      };
      return response(templates[i]);
    }
    return response(
      {
        error:
          "Esta función requiere la versión online. Esta demostración HTML no usa servidores ni archivos reales.",
      },
      501,
    );
  };
  return {
    reset() {
      state = initialDemo();
      templates = [];
    },
    state: () => copy(state),
  };
}
