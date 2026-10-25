import definitions from "../clinical-workflow/fields.json";
export const num = (v: any): number | null =>
  v === undefined || v === null || String(v).trim() === ""
    ? null
    : Number.isFinite(Number(String(v).replace(",", ".")))
      ? Number(String(v).replace(",", "."))
      : null;
export const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export const display = (date: string) =>
  date ? date.split("-").reverse().join("-") : "Sin fecha";
export const format = (n: any) =>
  typeof n === "number" && Number.isFinite(n)
    ? new Intl.NumberFormat("es-CL", { maximumFractionDigits: 1 }).format(n)
    : "Pendiente";
export const historyFields = definitions.history;
export const measureFields = [
  ["weight", "Peso", "kg"],
  ["height", "Estatura", "cm"],
  ["waistWHO", "Cintura OMS", "cm"],
  ["waistNavel", "Cintura al ombligo", "cm"],
  ["waistSmall", "Cintura menor", "cm"],
  ["hip", "Cadera", "cm"],
  ["armRelaxed", "Brazo relajado", "cm"],
  ["armFlexed", "Brazo contraído", "cm"],
  ["forearm", "Antebrazo", "cm"],
  ["chest", "Tórax", "cm"],
  ["thighMax", "Muslo máximo", "cm"],
  ["thighMid", "Muslo medio", "cm"],
  ["calf", "Pantorrilla máxima", "cm"],
  ["systolic", "Presión sistólica", "mmHg"],
  ["diastolic", "Presión diastólica", "mmHg"],
  ["heartRate", "Frecuencia cardíaca", "lat/min"],
];
export const habitFields = [
  ["stepsMonthly", "Pasos promedio diarios del último mes", "pasos/día"],
  ["stress", "Estrés de vida", "1–10"],
  ["sleep", "Horas de sueño", "h/noche"],
  ["hunger", "Hambre promedio", "0–10"],
];
export const foodFields = [
  ["ultraprocessed", "Ultraprocesados, chatarra o frituras", "días/semana"],
  ["sweetSnacks", "Picoteos dulces / postres", "veces/semana"],
  ["saltySnacks", "Picoteos salados", "veces/semana"],
  ["delivery", "Delivery o salidas a comer", "veces/semana"],
  ["alcoholDrinks", "Alcohol", "tragos/día"],
  ["alcoholDays", "Días con alcohol", "días/semana"],
  ["fruit", "Frutas", "porciones/día"],
  ["vegetables", "Verduras", "porciones/día"],
  ["fish", "Pescado", "días/semana"],
  ["legumes", "Legumbres", "días/semana"],
];
export const textHabits = [
  ["stressSources", "Fuentes de estrés"],
  ["sleepQuality", "Calidad del sueño / descanso"],
];
export const newActivity = () => ({
  key: crypto.randomUUID(),
  name: "",
  category: "fuerza",
  sessions: "",
  minutes: "",
  met: "",
  method: "met",
  manualCalories: "",
  intensity: "",
  included: true,
});
export const newTreatment = () => ({
  name: "",
  dose: "",
  frequency: "",
  notes: "",
});
export function seedVisit(date: string, bundle: any) {
  const saved = bundle.visits?.find((v: any) => v.date === date);
  const current =
    bundle.records?.filter((r: any) => (r.attention_date || r.date) === date) ||
    [];
  const plan = bundle.plans?.find((p: any) => p.date === date);
  const history = bundle.history?.data || {};
  const prior = bundle.visits?.filter((v: any) => v.date < date).at(-1);
  const base: any = {
    date,
    type:
      bundle.records?.some(
        (r: any) =>
          (r.attention_date ||
            (!["lab", "inbody"].includes(r.kind) ? r.date : null)) &&
          (r.attention_date || r.date) < date,
      ) || prior
        ? "control"
        : "initial",
    modality: "in_person",
    history: structuredClone(history),
    context: "",
    weightHistory: [],
    general: {},
    habits: {},
    foodNotes: {},
    recall: {
      date: "",
      context: "",
      typical: "",
      meals: definitions.recall.meals.map((name) => ({
        name,
        time: "",
        food: "",
        amount: "",
        preparation: "",
      })),
    },
    measurements: {},
    measurementSource: "clinic",
    activities: [],
    drinks: [],
    medications: structuredClone(plan?.data.medications || []),
    supplements: structuredClone(plan?.data.supplements || []),
    demographics: structuredClone(prior?.data.demographics || {}),
    energy: {
      method: "mifflinStJeor",
      factor: "1.2",
      adjustment: "0",
      proteinValue: "1.6",
      proteinUnit: "g_per_kg",
      fatValue: "0.5",
      fatUnit: "g_per_kg",
      tef: "10",
    },
    portions: {},
    allocations: {},
    closing: {
      dietNotes: plan?.data.nutrition || "",
      nextVisit: plan?.data.nextVisit || "",
    },
    _recordRefs: [],
  };
  const data = { ...base, ...structuredClone(saved?.data || {}) };
  data.history = structuredClone(history);
  for (const kind of ["anthropometry", "habits"]) {
    const r = current
      .filter((r: any) => r.kind === kind && !r.document_id)
      .at(-1);
    if (r) {
      const key = kind === "anthropometry" ? "measurements" : "habits";
      data[key] = { ...data[key], ...r.data };
      if (kind === "habits" && typeof r.data.adherence === "number")
        data.general.adherencePercent = String(r.data.adherence * 10);
    }
  }
  if (!saved) {
    data.activities = current
      .filter((r: any) => r.kind === "exercise")
      .map((r: any) => ({
        key: "existing-" + r.id,
        sourceId: r.id,
        name: r.data.modality || "",
        category: r.data.category,
        sessions: r.data.sessions ?? "",
        minutes: r.data.minutes ?? "",
        met: r.data.met ?? "",
        intensity: r.data.notes || "",
        included: true,
      }));
    const e = plan?.data.energy;
    if (e) {
      data.demographics = {
        age: e.age,
        sex:
          e.sex === "Masculino" ? "male" : e.sex === "Femenino" ? "female" : "",
      };
      data.energy = {
        ...data.energy,
        age: e.age,
        fatPercent: e.fatPercent,
        referenceWeight: e.weight,
        referenceHeight: e.height,
      };
    }
  }
  if (saved) {
    const represented = new Set();
    for (const a of data.activities) {
      const ref = data._recordRefs?.find((r: any) => r.clientKey === a.key);
      const source = current.find((r: any) => r.id === (ref?.id || a.sourceId));
      if (source) {
        represented.add(source.id);
        if (a.name !== source.data.modality) a.met = "";
        a.name = source.data.modality;
        a.sessions = source.data.sessions;
        a.minutes = source.data.minutes;
        a.category = source.data.category;
        a.intensity = source.data.notes || "";
      }
    }
    for (const source of current.filter(
      (r: any) => r.kind === "exercise" && !represented.has(r.id),
    )) {
      data.activities.push({
        key: "existing-" + source.id,
        sourceId: source.id,
        name: source.data.modality,
        category: source.data.category,
        sessions: source.data.sessions,
        minutes: source.data.minutes,
        met: "",
        intensity: source.data.notes || "",
        included: true,
      });
    }
  }
  if (plan) {
    data.medications = structuredClone(plan.data.medications);
    data.supplements = structuredClone(plan.data.supplements);
  }
  if (saved && plan && plan.version !== saved.data._planVersion) {
    data.closing.dietStrategy = "";
    data.closing.dietNotes = plan.data.nutrition || "";
    data.closing.nextVisit = plan.data.nextVisit || "";
  }
  return { data, version: saved?.version || 0 };
}
const nonempty = (d: any) =>
  Object.values(d).some((v) => v !== "" && v !== null && v !== undefined);
export function buildSave(data: any, bundle: any, expectedVersion: number) {
  const numericGroups = [
    [data.measurements, measureFields],
    [data.habits, [...habitFields, ...foodFields, ["water"], ["liquids"]]],
  ];
  for (const [group, keys] of numericGroups as any) {
    for (const [key] of keys) {
      const v = group[key];
      if (
        v !== undefined &&
        v !== null &&
        String(v).trim() !== "" &&
        num(v) === null
      )
        throw Error("Valor numérico inválido: " + key);
    }
  }
  const records: any[] = [],
    date = data.date,
    byDate = (kind: string) =>
      bundle.records
        .filter(
          (r: any) =>
            r.kind === kind &&
            !r.document_id &&
            (r.attention_date || r.date) === date,
        )
        .at(-1);
  for (const kind of ["anthropometry", "habits"]) {
    const source = byDate(kind),
      values = { ...(source?.data || {}) };
    const fields =
      kind === "anthropometry"
        ? measureFields
        : [
            ...habitFields,
            ...foodFields,
            ["water", "Agua", "L"],
            ["liquids", "Líquidos totales", "L"],
          ];
    for (const [key] of fields) {
      const v = num(
        (kind === "anthropometry" ? data.measurements : data.habits)[key],
      );
      if (v === null) delete values[key];
      else values[key] = v;
    }
    if (kind === "habits")
      for (const [key] of textHabits) {
        if (data.habits[key]) values[key] = data.habits[key];
        else delete values[key];
      }
    if (kind === "habits" && num(data.general.adherencePercent) !== null)
      values.adherence = num(data.general.adherencePercent)! / 10;
    else if (kind === "habits") delete values.adherence;
    if (nonempty(values))
      records.push({
        kind,
        data: values,
        ...(source ? { id: source.id, expectedVersion: source.version } : {}),
      });
  }
  for (const a of data.activities.filter(
    (a: any) =>
      a.name.trim() && num(a.sessions) !== null && num(a.minutes) !== null,
  )) {
    const reference = data._recordRefs?.find((r: any) => r.clientKey === a.key);
    const source = bundle.records.find(
      (r: any) => r.id === (reference?.id || a.sourceId),
    );
    records.push({
      clientKey: a.key,
      kind: "exercise",
      data: {
        category: a.category,
        modality: a.name,
        sessions: num(a.sessions),
        minutes: num(a.minutes),
        ...(a.intensity ? { notes: a.intensity } : {}),
      },
      ...(source ? { id: source.id, expectedVersion: source.version } : {}),
    });
  }
  const oldPlan = bundle.plans.find((p: any) => p.date === date),
    plan = oldPlan
      ? structuredClone(oldPlan.data)
      : {
          medications: [],
          supplements: [],
          energy: {},
          days: Array.from({ length: 7 }, () => ({
            steps: "",
            intake: "",
            protein: "",
            fat: "",
            activities: [],
          })),
          nutrition: "",
          portions: "",
        };
  plan.medications = data.medications.filter((m: any) => m.name.trim());
  plan.supplements = data.supplements.filter((m: any) => m.name.trim());
  if (data.closing.nextVisit) plan.nextVisit = data.closing.nextVisit;
  else delete plan.nextVisit;
  plan.nutrition = [data.closing.dietStrategy, data.closing.dietNotes]
    .filter(Boolean)
    .join("\n");
  const dto = {
    ...data,
    adherencePercent: num(data.general.adherencePercent),
    stress1to10: num(data.habits.stress),
  };
  return {
    data: dto,
    expectedVersion,
    records,
    history: {
      data: data.history,
      expectedVersion: bundle.history?.version || 0,
    },
    plan: { data: plan, expectedVersion: oldPlan?.version || 0 },
  };
}
export function visitTexts(data: any, patient: any, calculation: any) {
  const join = (list: any[]) =>
    list
      .filter((m) => m.name?.trim())
      .map((m) =>
        [m.name, m.dose, m.frequency, m.notes].filter(Boolean).join(" · "),
      )
      .join("\n");
  const general = [
    ["Tolerancia / cambios de tratamiento", data.general.tolerance],
    ["Estrés y alimentación / actividad", data.general.stressEating],
    ["Apoyos / psicoterapia", data.general.support],
    ["Ronquidos", data.general.snoring],
    ["Pausas respiratorias observadas", data.general.breathingPauses],
    ["Sueño reparador", data.general.restorative],
    ["Comprensión", data.general.understanding],
    ["Dudas y dificultades", data.general.barriers],
    [
      "Adherencia",
      data.general.adherencePercent !== "" &&
      data.general.adherencePercent != null
        ? data.general.adherencePercent + " %"
        : null,
    ],
    ["Cambios corporales", data.general.bodyChanges],
    ["Rendimiento y recuperación", data.general.performance],
  ];
  const context = [["Motivo / contexto", data.context], ...general]
    .filter(([, v]) => v)
    .map(([l, v]) => l + ": " + v)
    .join("\n");
  const meals = data.recall.meals
    .filter((m: any) => m.food || m.amount)
    .map(
      (m: any) =>
        `${m.name}${m.time ? " (" + m.time + ")" : ""}: ${[m.food, m.amount, m.preparation].filter(Boolean).join(" · ")}`,
    )
    .join("\n");
  const c = data.closing;
  const recommendations = [
    ["Alimentación", [c.dietStrategy, c.dietNotes].filter(Boolean).join(" · ")],
    ["Derivación", c.referral],
    ["Pasos mínimos", c.stepsMin ? c.stepsMin + " pasos/día" : null],
    ["Pasos ideales", c.stepsIdeal ? c.stepsIdeal + " pasos/día" : null],
    ["Fuerza", c.strength ? c.strength + " sesiones/semana" : null],
    ["Cardio", c.cardio ? c.cardio + " minutos/semana" : null],
    ["Indicaciones adicionales", c.notes],
    ["Exámenes solicitados", c.exams],
    ["Próximo control recomendado", c.nextVisit ? display(c.nextVisit) : null],
    ["Cita agendada en Reservo", c.bookedVisit ? display(c.bookedVisit) : null],
  ]
    .filter(([, v]) => v)
    .map(([l, v]) => l + ": " + v)
    .join("\n");
  const currentMeds = join(data.medications),
    currentSupp = join(data.supplements);
  const numericText = [
    ...measureFields.map(([k, l, u]) =>
      data.measurements[k] !== undefined && data.measurements[k] !== ""
        ? `${l}: ${data.measurements[k]} ${u}`
        : "",
    ),
    ...[...habitFields, ...foodFields].map(([k, l, u]) =>
      data.habits[k] !== undefined && data.habits[k] !== ""
        ? `${l}: ${data.habits[k]} ${u}`
        : "",
    ),
    ...textHabits.map(([k, l]) =>
      data.habits[k] ? `${l}: ${data.habits[k]}` : "",
    ),
  ]
    .filter(Boolean)
    .join("\n");
  const activitiesText = data.activities
    .filter((a: any) => a.name)
    .map(
      (a: any) =>
        `${a.name}: ${a.sessions || "?"} sesiones/semana × ${a.minutes || "?"} min/sesión${a.intensity ? " · " + a.intensity : ""}`,
    )
    .join("\n");
  const hydrationText = data.drinks
    .filter((d: any) => d.count !== "" && d.count != null)
    .map((d: any) => `${d.name}: ${d.count} × ${d.volume} ml/día`)
    .join("; ");
  const historyText = historyFields
    .map((f) => {
      const entry = data.history[f.id];
      return entry && entry.status === "reported" && entry.text
        ? f.title + ": " + entry.text
        : entry?.status === "none"
          ? f.title + ": Niega"
          : "";
    })
    .filter(Boolean)
    .join("\n");
  const foodLabels: any = {
    portions: "Porciones y consumo fuera de lo acordado",
    sugars: "Azúcares y bebidas azucaradas",
    social: "Eventos sociales y alcohol",
    notes: "Otras dificultades alimentarias",
  };
  const clinical = [
    `${data.type === "initial" ? "EVALUACIÓN INICIAL" : "CONTROL"} NUTRIOLOGÍA · ${display(data.date)}`,
    patient.name,
    historyText ? "Antecedentes:\n" + historyText : "",
    context,
    numericText,
    activitiesText ? "Ejercicio habitual:\n" + activitiesText : "",
    hydrationText ? "Hidratación:\n" + hydrationText : "",
    calculation && !calculation.error
      ? "Plan energético: " +
        Math.round(calculation.target) +
        " kcal/día; proteínas " +
        Math.round(calculation.proteinG) +
        " g; grasas " +
        Math.round(calculation.fatG) +
        " g; carbohidratos " +
        Math.round(calculation.carbohydrateG) +
        " g."
      : "",
    currentMeds ? "Fármacos en uso:\n" + currentMeds : "",
    currentSupp ? "Suplementos en uso:\n" + currentSupp : "",
    meals
      ? "Recordatorio 24 h" +
        (data.recall.date ? " (" + display(data.recall.date) + ")" : "") +
        ":\n" +
        meals
      : "",
    ...Object.entries(data.foodNotes)
      .filter(([, v]) => v)
      .map(([k, v]) => (foodLabels[k] || k) + ": " + v),
    data.closing.assessment ? "Evaluación:\n" + data.closing.assessment : "",
    recommendations,
  ]
    .filter(Boolean)
    .join("\n\n");
  const patientText = [
    `Indicaciones de Nutriología · ${display(data.date)}`,
    `Hola ${patient.name.split(" ")[0]}, este es el resumen de lo acordado:`,
    recommendations,
    c.treatmentInstructions
      ? "Tratamiento indicado:\n" + c.treatmentInstructions
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");
  return { clinical, patientText };
}
