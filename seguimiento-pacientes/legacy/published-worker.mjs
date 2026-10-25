var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../../src/domain.ts
var fields = {
  habits: [
    {
      key: "stepsWeekly",
      label: "Promedio diario de pasos de la \xFAltima semana",
      unit: "pasos/d\xEDa",
      min: 0
    },
    { key: "sleepQuality", label: "Calidad del sue\xF1o", text: true },
    { key: "steps", label: "Pasos promedio diarios", min: 0 },
    {
      key: "stepsMonthly",
      label: "Promedio diario de pasos del \xFAltimo mes",
      unit: "pasos/d\xEDa",
      min: 0
    },
    { key: "sleep", label: "Sue\xF1o", unit: "h/d\xEDa", min: 0, max: 24 },
    { key: "water", label: "Agua", unit: "L/d\xEDa", min: 0 },
    { key: "liquids", label: "Ingesta l\xEDquida total", unit: "L/d\xEDa", min: 0 },
    { key: "stress", label: "Estr\xE9s", min: 1, max: 10 },
    { key: "stressSources", label: "Fuentes de estr\xE9s", text: true },
    { key: "hunger", label: "Hambre promedio", min: 0, max: 10 },
    { key: "foodThoughts", label: "Pensamientos sobre comida", text: true },
    {
      key: "lossOfControl",
      label: "Episodios de p\xE9rdida de control",
      unit: "por semana",
      min: 0
    },
    { key: "adherence", label: "Adherencia al plan", min: 0, max: 10 },
    {
      key: "ultraprocessed",
      label: "Ultraprocesados",
      unit: "d\xEDas/semana",
      min: 0,
      max: 7
    },
    { key: "alcoholDrinks", label: "Alcohol", unit: "tragos/d\xEDa", min: 0 },
    {
      key: "alcoholDays",
      label: "Consumo de alcohol",
      unit: "d\xEDas/semana",
      min: 0,
      max: 7
    },
    {
      key: "delivery",
      label: "Delivery o salidas",
      unit: "veces/semana",
      min: 0
    },
    {
      key: "sweetSnacks",
      label: "Picoteos dulces",
      unit: "veces/semana",
      min: 0
    },
    {
      key: "saltySnacks",
      label: "Picoteos salados",
      unit: "veces/semana",
      min: 0
    },
    { key: "fruit", label: "Frutas", unit: "porciones/d\xEDa", min: 0 },
    { key: "vegetables", label: "Verduras", unit: "porciones/d\xEDa", min: 0 },
    { key: "fish", label: "Pescados", unit: "d\xEDas/semana", min: 0, max: 7 },
    { key: "legumes", label: "Legumbres", unit: "d\xEDas/semana", min: 0, max: 7 },
    { key: "notes", label: "Observaciones", text: true }
  ],
  anthropometry: [
    { key: "bmi", label: "IMC calculado", unit: "kg/m\xB2", min: 0 },
    { key: "waistHipRatio", label: "\xCDndice cintura/cadera calculado", min: 0 },
    {
      key: "waistHeightRatio",
      label: "\xCDndice cintura/estatura calculado",
      min: 0
    },
    { key: "height", label: "Estatura", unit: "cm", min: 1 },
    { key: "armRelaxed", label: "Brazo relajado", unit: "cm", min: 1 },
    { key: "armFlexed", label: "Brazo contra\xEDdo", unit: "cm", min: 1 },
    { key: "forearm", label: "Antebrazo", unit: "cm", min: 1 },
    { key: "chest", label: "T\xF3rax", unit: "cm", min: 1 },
    { key: "thighMax", label: "Muslo m\xE1ximo", unit: "cm", min: 1 },
    { key: "thighMid", label: "Muslo medio", unit: "cm", min: 1 },
    { key: "calf", label: "Pantorrilla m\xE1xima", unit: "cm", min: 1 },
    { key: "systolic", label: "Presi\xF3n sist\xF3lica", unit: "mmHg", min: 1 },
    { key: "diastolic", label: "Presi\xF3n diast\xF3lica", unit: "mmHg", min: 1 },
    {
      key: "heartRate",
      label: "Frecuencia card\xEDaca en reposo",
      unit: "lat/min",
      min: 1
    },
    { key: "weight", label: "Peso", unit: "kg", min: 1 },
    { key: "waistSmall", label: "Cintura menor", unit: "cm", min: 1 },
    { key: "waistWHO", label: "Cintura media (OMS)", unit: "cm", min: 1 },
    { key: "waistNavel", label: "Cintura al ombligo", unit: "cm", min: 1 },
    { key: "hip", label: "Cadera", unit: "cm", min: 1 },
    { key: "notes", label: "Observaciones", text: true }
  ],
  inbody: [
    { key: "weight", label: "Peso", unit: "kg", min: 1 },
    { key: "muscle", label: "Masa muscular esquel\xE9tica", unit: "kg", min: 0 },
    { key: "fat", label: "Masa grasa", unit: "kg", min: 0 },
    { key: "fatPercent", label: "Grasa corporal", unit: "%", min: 0, max: 100 },
    { key: "bmi", label: "IMC", unit: "kg/m\xB2", min: 0 },
    { key: "visceralFat", label: "Nivel de grasa visceral", min: 0 },
    { key: "height", label: "Estatura", unit: "cm", min: 1 },
    { key: "totalWater", label: "Agua corporal total", unit: "L", min: 0 },
    { key: "protein", label: "Prote\xEDnas", unit: "kg", min: 0 },
    { key: "minerals", label: "Minerales", unit: "kg", min: 0 },
    { key: "fatFreeMass", label: "Masa libre de grasa", unit: "kg", min: 0 },
    { key: "bmr", label: "Metabolismo basal", unit: "kcal/d\xEDa", min: 0 },
    { key: "waistHipRatio", label: "Relaci\xF3n cintura/cadera", min: 0 },
    { key: "inbodyScore", label: "Puntuaci\xF3n InBody", min: 0 },
    {
      key: "targetWeight",
      label: "Peso objetivo del informe",
      unit: "kg",
      min: 0
    },
    { key: "weightControl", label: "Control de peso del informe", unit: "kg" },
    { key: "fatControl", label: "Control de grasa del informe", unit: "kg" },
    { key: "muscleControl", label: "Control muscular del informe", unit: "kg" },
    { key: "ecwRatio", label: "Relaci\xF3n AEC/ACT", min: 0, max: 1 },
    {
      key: "leanRightArm",
      label: "Masa magra \xB7 brazo derecho",
      unit: "kg",
      min: 0
    },
    {
      key: "leanLeftArm",
      label: "Masa magra \xB7 brazo izquierdo",
      unit: "kg",
      min: 0
    },
    { key: "leanTrunk", label: "Masa magra \xB7 tronco", unit: "kg", min: 0 },
    {
      key: "leanRightLeg",
      label: "Masa magra \xB7 pierna derecha",
      unit: "kg",
      min: 0
    },
    {
      key: "leanLeftLeg",
      label: "Masa magra \xB7 pierna izquierda",
      unit: "kg",
      min: 0
    },
    { key: "fatRightArm", label: "Grasa \xB7 brazo derecho", unit: "kg", min: 0 },
    { key: "fatLeftArm", label: "Grasa \xB7 brazo izquierdo", unit: "kg", min: 0 },
    { key: "fatTrunk", label: "Grasa \xB7 tronco", unit: "kg", min: 0 },
    { key: "fatRightLeg", label: "Grasa \xB7 pierna derecha", unit: "kg", min: 0 },
    {
      key: "fatLeftLeg",
      label: "Grasa \xB7 pierna izquierda",
      unit: "kg",
      min: 0
    },
    { key: "notes", label: "Observaciones", text: true }
  ],
  lab: [
    { key: "name", label: "Nombre del examen", text: true, required: true },
    { key: "value", label: "Resultado" },
    {
      key: "qualitative",
      label: "Resultado textual (si no es num\xE9rico)",
      text: true
    },
    { key: "unit", label: "Unidad", text: true },
    { key: "referenceLow", label: "L\xEDmite inferior" },
    { key: "referenceHigh", label: "L\xEDmite superior" },
    { key: "notes", label: "Observaciones", text: true }
  ],
  exercise: [
    {
      key: "category",
      label: "Categor\xEDa (fuerza o cardiovascular)",
      text: true,
      required: true
    },
    { key: "modality", label: "Modalidad", text: true, required: true },
    { key: "minutes", label: "Minutos por sesi\xF3n", min: 0, required: true },
    { key: "sessions", label: "Sesiones por semana", min: 0, required: true },
    { key: "notes", label: "Observaciones", text: true }
  ]
};
function validDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
__name(validDate, "validDate");
function validateRecord(kind, date, data) {
  if (typeof kind !== "string" || !Object.hasOwn(fields, kind))
    return "Tipo de registro inv\xE1lido.";
  if (!validDate(date)) return "Fecha inv\xE1lida.";
  if (!data || typeof data !== "object" || Array.isArray(data))
    return "Datos inv\xE1lidos.";
  const schema = fields[kind];
  const values = data;
  if (Object.keys(values).some((key) => !schema.some((f) => f.key === key)))
    return "Campo desconocido.";
  for (const f of schema) {
    const v = values[f.key];
    if (v === void 0 || v === null || v === "") {
      if (f.required) return `${f.label} es obligatorio.`;
      continue;
    }
    if (f.text) {
      if (typeof v !== "string" || v.length > 4e3)
        return `${f.label}: texto inv\xE1lido.`;
      if (f.required && !v.trim()) return `${f.label} es obligatorio.`;
    } else if (typeof v !== "number" || !Number.isFinite(v) || f.min !== void 0 && v < f.min || f.max !== void 0 && v > f.max)
      return `${f.label}: valor fuera de rango.`;
  }
  if (kind === "lab" && typeof values.value !== "number" && !(typeof values.qualitative === "string" && values.qualitative.trim()))
    return "Completa el resultado num\xE9rico o textual del examen.";
  if (kind === "lab" && typeof values.value === "number" && typeof values.qualitative === "string" && values.qualitative.trim())
    return "Usa un resultado num\xE9rico o textual, no ambos.";
  if (!schema.some(
    (f) => values[f.key] !== void 0 && values[f.key] !== null && values[f.key] !== ""
  ))
    return "Completa al menos un campo.";
  if (kind === "exercise" && !["fuerza", "cardiovascular"].includes(String(values.category)))
    return "Categor\xEDa de ejercicio inv\xE1lida.";
  if (kind === "lab" && typeof values.referenceLow === "number" && typeof values.referenceHigh === "number" && values.referenceLow > values.referenceHigh)
    return "El rango de referencia est\xE1 invertido.";
  return null;
}
__name(validateRecord, "validateRecord");
function anthropometryData(data) {
  const result = { ...data };
  for (const key of ["bmi", "waistHipRatio", "waistHeightRatio"])
    delete result[key];
  const { weight, height, waistWHO, hip } = data;
  if (typeof weight === "number" && typeof height === "number" && height > 0)
    result.bmi = weight / (height / 100) ** 2;
  if (typeof waistWHO === "number" && typeof hip === "number" && hip > 0)
    result.waistHipRatio = waistWHO / hip;
  if (typeof waistWHO === "number" && typeof height === "number" && height > 0)
    result.waistHeightRatio = waistWHO / height;
  return result;
}
__name(anthropometryData, "anthropometryData");
var displayDate = /* @__PURE__ */ __name((d) => new Intl.DateTimeFormat("es-CL", {
  timeZone: "UTC",
  day: "2-digit",
  month: "2-digit",
  year: "numeric"
}).format(/* @__PURE__ */ new Date(`${d}T12:00:00Z`)), "displayDate");

// ../../src/control.ts
var numeric = /* @__PURE__ */ __name((v) => {
  if (typeof v !== "string" && typeof v !== "number") return null;
  if (String(v).trim() === "") return null;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}, "numeric");
var energyFields = [
  "sex",
  "age",
  "weight",
  "height",
  "fatPercent",
  "ffm",
  "measured",
  "factor",
  "formula",
  "thermic",
  "cadence",
  "walkingMet",
  "vo2",
  "target",
  "proteinFactor",
  "fatFactor",
  "goal",
  "adjustment"
];
var formulas = [
  "Mifflin-St Jeor",
  "Harris-Benedict (original)",
  "Katch-McArdle",
  "Cunningham (1980)",
  "Mifflin (masa libre de grasa)",
  "Owen (masa libre de grasa)",
  "FAO/OMS (18\u201330 a\xF1os)",
  "Medido"
];
function basal(e, formula) {
  const w = numeric(e.weight), h = numeric(e.height), a = numeric(e.age), fp = numeric(e.fatPercent);
  const lean = numeric(e.ffm) ?? (w !== null && fp !== null ? w * (1 - fp / 100) : null);
  const male = e.sex === "Masculino";
  if (formula === "Medido") return numeric(e.measured);
  if ([
    "Mifflin-St Jeor",
    "Harris-Benedict (original)",
    "FAO/OMS (18\u201330 a\xF1os)",
    "Owen (masa libre de grasa)"
  ].includes(formula) && !["Masculino", "Femenino"].includes(e.sex))
    return null;
  if (formula === "Mifflin-St Jeor")
    return w && h && a !== null ? 10 * w + 6.25 * h - 5 * a + (male ? 5 : -161) : null;
  if (formula === "Harris-Benedict (original)")
    return w && h && a !== null ? male ? 66.47 + 13.75 * w + 5 * h - 6.76 * a : 655.1 + 9.56 * w + 1.85 * h - 4.68 * a : null;
  if (formula === "FAO/OMS (18\u201330 a\xF1os)")
    return w && a !== null && a >= 18 && a <= 30 ? male ? 15.3 * w + 679 : 14.7 * w + 496 : null;
  if (!lean) return null;
  if (formula === "Katch-McArdle") return 370 + 21.6 * lean;
  if (formula === "Cunningham (1980)") return 500 + 22 * lean;
  if (formula === "Mifflin (masa libre de grasa)") return 413 + 19.7 * lean;
  if (formula === "Owen (masa libre de grasa)")
    return male ? 290 + 22.3 * lean : 334 + 19.7 * lean;
  return null;
}
__name(basal, "basal");
function dayEnergy(day, e) {
  const b = basal(e, e.formula || formulas[0]), w = numeric(e.weight), steps = numeric(day.steps);
  const cadence = numeric(e.cadence) ?? 83.33, walking = numeric(e.walkingMet) ?? 3, thermic = numeric(e.thermic) ?? 10;
  const neat = w && steps !== null ? steps / cadence * walking / 60 * w : null;
  const results = day.activities.map((a) => {
    const minutes = numeric(a.minutes), met = numeric(a.met), hr = numeric(a.heartRate), age = numeric(e.age), vo2 = numeric(e.vo2);
    let gross = null;
    if (a.method === "manual") gross = numeric(a.calories);
    else if (w && minutes !== null && a.method === "met" && met !== null)
      gross = met * w * minutes / 60;
    else if (w && minutes !== null && a.method === "hr" && hr !== null && age !== null && vo2 !== null && ["Masculino", "Femenino"].includes(e.sex))
      gross = Math.max(
        0,
        (e.sex === "Masculino" ? -95.7735 + 0.271 * age + 0.394 * w + 0.404 * vo2 + 0.634 * hr : -59.3954 + 0.274 * age + 0.103 * w + 0.38 * vo2 + 0.45 * hr) / 4.184 * minutes
      );
    const net = gross !== null && minutes !== null && b !== null ? Math.max(0, gross - b * minutes / 1440) : null;
    return { gross, net };
  });
  const exercise = results.every((r) => r.net !== null) ? results.reduce((s, r) => s + r.net, 0) : null;
  const total = b !== null && neat !== null && exercise !== null ? b * (1 + thermic / 100) + neat + exercise : null;
  const intake = numeric(day.intake), protein = numeric(day.protein), fat = numeric(day.fat);
  const carbs = intake !== null && w && protein !== null && fat !== null ? (intake - 4 * protein * w - 9 * fat * w) / 4 : null;
  const lean = numeric(e.ffm) ?? (w && numeric(e.fatPercent) !== null ? w * (1 - numeric(e.fatPercent) / 100) : null);
  return {
    basal: b,
    neat,
    exercise,
    total,
    results,
    protein: w && protein !== null ? w * protein : null,
    fat: w && fat !== null ? w * fat : null,
    carbs,
    balance: total !== null && intake !== null ? intake - total : null,
    availability: lean && intake !== null && exercise !== null ? (intake - exercise) / lean : null
  };
}
__name(dayEnergy, "dayEnergy");
function validateControl(date, data) {
  if (!validDate(date)) return "Fecha de control inv\xE1lida.";
  if (!data || typeof data !== "object" || Array.isArray(data))
    return "Datos del control inv\xE1lidos.";
  const d = data;
  if (Object.keys(d).some(
    (k) => ![
      "medications",
      "supplements",
      "energy",
      "days",
      "nutrition",
      "portions",
      "nextVisit"
    ].includes(k)
  ))
    return "Campo de control desconocido.";
  if (d.nextVisit !== void 0 && (typeof d.nextVisit !== "string" || d.nextVisit !== "" && (!validDate(d.nextVisit) || d.nextVisit <= date)))
    return "El pr\xF3ximo control debe tener una fecha posterior a esta atenci\xF3n.";
  for (const list of [d.medications, d.supplements]) {
    if (!Array.isArray(list) || list.length > 50)
      return "Lista de tratamientos inv\xE1lida.";
    for (const t of list) {
      if (!t || Object.keys(t).some(
        (k) => !["name", "dose", "frequency", "notes"].includes(k)
      ) || ![t.name, t.dose, t.frequency, t.notes].every(
        (v) => typeof v === "string" && v.length <= 1e3
      ) || !t.name.trim() || !t.dose.trim() || !t.frequency.trim())
        return "Completa nombre, dosis y frecuencia de cada medicamento o suplemento.";
    }
    if (new Set(list.map((t) => t.name.trim().toLowerCase())).size !== list.length)
      return "Tratamiento duplicado.";
  }
  if (!d.energy || typeof d.energy !== "object" || Array.isArray(d.energy))
    return "Datos energ\xE9ticos inv\xE1lidos.";
  for (const [k, v] of Object.entries(d.energy)) {
    if (!energyFields.includes(k) || typeof v !== "string" || v.length > 100)
      return "Campo energ\xE9tico inv\xE1lido.";
    if (v && !["sex", "formula", "goal"].includes(k)) {
      const n = numeric(v);
      if (n === null || n < (k === "adjustment" ? -1e5 : 0) || n > 1e5)
        return "Valor energ\xE9tico inv\xE1lido.";
      if (["height", "weight", "ffm", "cadence", "walkingMet", "factor"].includes(
        k
      ) && n === 0)
        return "El valor debe ser mayor que cero.";
      if (["fatPercent", "thermic"].includes(k) && n > 100)
        return "Porcentaje inv\xE1lido.";
      if (k === "age" && n > 120) return "Edad inv\xE1lida.";
      if (k === "factor" && (n < 1 || n > 3))
        return "Factor de actividad fuera de rango.";
    }
  }
  if (d.energy.sex && !["Masculino", "Femenino"].includes(d.energy.sex))
    return "Sexo para la f\xF3rmula inv\xE1lido.";
  if (d.energy.formula && !formulas.includes(d.energy.formula))
    return "F\xF3rmula inv\xE1lida.";
  if (d.energy.goal && !["Mantener", "Reducir", "Aumentar"].includes(d.energy.goal))
    return "Objetivo inv\xE1lido.";
  const w = numeric(d.energy.weight), target = numeric(d.energy.target), p = numeric(d.energy.proteinFactor), f = numeric(d.energy.fatFactor);
  if (w !== null && target !== null && p !== null && f !== null && 4 * w * p + 9 * w * f > target)
    return "Las calor\xEDas de la meta no alcanzan para la prote\xEDna y grasa planificadas.";
  const lean = numeric(d.energy.ffm);
  if (w !== null && lean !== null && lean > w)
    return "La masa libre de grasa supera el peso registrado.";
  if (!Array.isArray(d.days) || d.days.length !== 7)
    return "La semana debe contener siete d\xEDas.";
  for (const day of d.days) {
    if (!day || Object.keys(day).some(
      (k) => !["steps", "intake", "protein", "fat", "activities"].includes(k)
    ))
      return "D\xEDa inv\xE1lido.";
    for (const k of ["steps", "intake", "protein", "fat"])
      if (typeof day[k] !== "string" || day[k].length > 100 || day[k] !== "" && (numeric(day[k]) === null || numeric(day[k]) < 0 || numeric(day[k]) > 1e5))
        return "Valor diario inv\xE1lido.";
    if (!Array.isArray(day.activities) || day.activities.length > 20)
      return "Actividades inv\xE1lidas.";
    let duration = 0;
    for (const a of day.activities) {
      if (!a || Object.keys(a).some(
        (k) => ![
          "name",
          "method",
          "met",
          "minutes",
          "heartRate",
          "calories"
        ].includes(k)
      ) || typeof a.name !== "string" || !a.name.trim() || a.name.length > 500 || !["met", "hr", "manual"].includes(a.method))
        return "Actividad inv\xE1lida.";
      for (const k of ["met", "minutes", "heartRate", "calories"])
        if (typeof a[k] !== "string" || a[k].length > 100 || a[k] !== "" && (numeric(a[k]) === null || numeric(a[k]) < 0 || numeric(a[k]) > 1e5))
          return "Valor de actividad inv\xE1lido.";
      if (numeric(a.minutes) === null || numeric(a.minutes) <= 0)
        return "Completa la duraci\xF3n de cada actividad.";
      duration += numeric(a.minutes);
      if (a.method === "met" && (numeric(a.met) === null || numeric(a.met) <= 0 || numeric(a.met) > 30))
        return "Completa los MET de cada actividad.";
      if (a.method === "manual" && numeric(a.calories) === null)
        return "Completa el gasto manual.";
      if (a.method === "hr" && (!numeric(a.heartRate) || !numeric(d.energy.vo2) || numeric(d.energy.age) === null || !d.energy.sex))
        return "La f\xF3rmula por frecuencia card\xEDaca requiere frecuencia, edad, sexo y VO\u2082m\xE1x.";
    }
    if (duration > 1440) return "La actividad diaria supera 24 horas.";
    if (dayEnergy(day, d.energy).carbs !== null && dayEnergy(day, d.energy).carbs < 0)
      return "Las calor\xEDas no alcanzan para los gramos de prote\xEDna y grasa registrados.";
  }
  if (![d.nutrition, d.portions].every(
    (v) => typeof v === "string" && v.length <= 1e4
  ))
    return "Plan alimentario demasiado extenso.";
  return null;
}
__name(validateControl, "validateControl");

// ../../worker/photos.ts
var json = /* @__PURE__ */ __name((data, status = 200) => Response.json(data, {
  status,
  headers: {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  }
}), "json");
var fail = /* @__PURE__ */ __name((error, status = 400) => json({ error }, status), "fail");
async function audit(env, action, type, id) {
  await env.DB.prepare(
    "INSERT INTO audit_events(id,action,resource_type,resource_id,actor) VALUES(?,?,?,?,?)"
  ).bind(crypto.randomUUID(), action, type, id, "professional").run();
}
__name(audit, "audit");
var digest = /* @__PURE__ */ __name(async (bytes) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))].map((n) => n.toString(16).padStart(2, "0")).join(""), "digest");
var angles = [
  "Frontal",
  "Lateral derecha",
  "Lateral izquierda",
  "Posterior",
  "Otro"
];
async function getLink(req, env) {
  const token = req.headers.get("Authorization")?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
  if (!token) return null;
  return env.DB.prepare(
    "SELECT l.id,l.patient_id,l.expires_at,l.uploads,l.attention_date,p.name FROM photo_links l JOIN patients p ON p.id=l.patient_id WHERE token_hash=? AND revoked=0 AND expires_at>? AND uploads<20"
  ).bind(
    await digest(new TextEncoder().encode(token)),
    (/* @__PURE__ */ new Date()).toISOString()
  ).first();
}
__name(getLink, "getLink");
async function upload(req, env, patientId, source, link) {
  if (Number(req.headers.get("Content-Length") || 0) > 11 * 1024 * 1024)
    return fail("La imagen supera el l\xEDmite de tama\xF1o.");
  const form = await req.formData(), file = form.get("file"), date = form.get("date"), angle = String(form.get("angle") || "Frontal"), notes = String(form.get("notes") || ""), attention = source === "professional" ? form.get("attention_date") : link?.attention_date ?? null;
  if (!(file instanceof File) || file.type !== "image/jpeg" || file.size < 4 || file.size > 10 * 1024 * 1024)
    return fail("Sube una imagen JPG de hasta 10 MB.");
  if (!validDate(date) || attention !== null && !validDate(attention) || !angles.includes(angle) || notes.length > 2e3)
    return fail("Fecha, vista u observaciones inv\xE1lidas.");
  const bytes = await file.arrayBuffer(), head = new Uint8Array(bytes);
  if (head[0] !== 255 || head[1] !== 216 || head[2] !== 255)
    return fail("La imagen no es un JPG v\xE1lido.");
  const sha = await digest(bytes);
  if (await env.DB.prepare(
    "SELECT id FROM photos WHERE patient_id=? AND content_sha256=?"
  ).bind(patientId, sha).first())
    return fail("Esta fotograf\xEDa ya est\xE1 guardada para el paciente.", 409);
  if (link) {
    const reserved = await env.DB.prepare(
      "UPDATE photo_links SET uploads=uploads+1 WHERE id=? AND revoked=0 AND expires_at>? AND uploads<20 RETURNING id"
    ).bind(link.id, (/* @__PURE__ */ new Date()).toISOString()).first();
    if (!reserved)
      return fail("El enlace caduc\xF3 o alcanz\xF3 su l\xEDmite de fotograf\xEDas.", 401);
  }
  const id = crypto.randomUUID(), key = `photos/${patientId}/${id}.jpg`;
  try {
    await env.DOCUMENTS.put(key, bytes, {
      httpMetadata: { contentType: "image/jpeg" }
    });
    await env.DB.prepare(
      "INSERT INTO photos(id,patient_id,date,attention_date,angle,notes,object_key,size,content_sha256,source) VALUES(?,?,?,?,?,?,?,?,?,?)"
    ).bind(
      id,
      patientId,
      date,
      attention,
      angle,
      notes,
      key,
      file.size,
      sha,
      source
    ).run();
  } catch (e) {
    await env.DOCUMENTS.delete(key);
    if (link)
      await env.DB.prepare(
        "UPDATE photo_links SET uploads=max(0,uploads-1) WHERE id=?"
      ).bind(link.id).run();
    if (String(e).includes("UNIQUE"))
      return fail("Esta fotograf\xEDa ya est\xE1 guardada.", 409);
    throw e;
  }
  await env.DB.prepare(
    "INSERT INTO audit_events(id,action,resource_type,resource_id,actor) VALUES(?,?,?,?,?)"
  ).bind(
    crypto.randomUUID(),
    "upload",
    "photo",
    id,
    source === "patient" ? "patient-photo-link" : "professional"
  ).run();
  return json({ id, date, source }, 201);
}
__name(upload, "upload");
async function photoPortal(req, env) {
  const path = new URL(req.url).pathname;
  if (!["/api/photo-upload", "/api/photo-upload/session"].includes(path))
    return null;
  const link = await getLink(req, env);
  if (!link)
    return fail(
      "Este enlace no est\xE1 disponible. Solicita un nuevo enlace a tu profesional.",
      401
    );
  if (path.endsWith("/session") && req.method === "GET")
    return json({
      name: link.name,
      expires_at: link.expires_at,
      remaining: 20 - link.uploads,
      attention_date: link.attention_date
    });
  if (path === "/api/photo-upload" && req.method === "POST")
    return upload(req, env, link.patient_id, "patient", link);
  return fail("El enlace permite \xFAnicamente enviar fotograf\xEDas.", 405);
}
__name(photoPortal, "photoPortal");
async function clinicalPhotos(req, env, patientId, collection, resourceId, action) {
  if (collection === "photo-links") {
    if (resourceId || action) return fail("Ruta no encontrada.", 404);
    if (req.method === "GET") {
      const rows = await env.DB.prepare(
        "SELECT id,expires_at,uploads,created_at FROM photo_links WHERE patient_id=? AND revoked=0 AND expires_at>? ORDER BY created_at DESC"
      ).bind(patientId, (/* @__PURE__ */ new Date()).toISOString()).all();
      return json(rows.results);
    }
    if (req.method === "DELETE") {
      await env.DB.prepare(
        "UPDATE photo_links SET revoked=1 WHERE patient_id=?"
      ).bind(patientId).run();
      await audit(env, "revoke", "photo-link", patientId);
      return json({ ok: true });
    }
    if (req.method === "POST") {
      const patient = await env.DB.prepare(
        "SELECT is_demo FROM patients WHERE id=?"
      ).bind(patientId).first();
      if (patient?.is_demo)
        return fail(
          "Este paciente de demostraci\xF3n no admite enlaces de env\xEDo externos."
        );
      const id = crypto.randomUUID(), token = [...crypto.getRandomValues(new Uint8Array(32))].map((n) => n.toString(16).padStart(2, "0")).join(""), expires = new Date(Date.now() + 7 * 864e5).toISOString();
      await env.DB.batch([
        env.DB.prepare(
          "UPDATE photo_links SET revoked=1 WHERE patient_id=?"
        ).bind(patientId),
        env.DB.prepare(
          "INSERT INTO photo_links(id,patient_id,token_hash,expires_at) VALUES(?,?,?,?)"
        ).bind(
          id,
          patientId,
          await digest(new TextEncoder().encode(token)),
          expires
        )
      ]);
      await audit(env, "create", "photo-link", id);
      return json(
        {
          url: `${new URL(req.url).origin}/fotos#${token}`,
          expires_at: expires
        },
        201
      );
    }
    return fail("M\xE9todo no permitido.", 405);
  }
  if (collection !== "photos") return null;
  if (req.method === "GET" && !resourceId) {
    const rows = await env.DB.prepare(
      "SELECT id,date,attention_date,angle,notes,size,source,created_at,version FROM photos WHERE patient_id=? ORDER BY date,created_at,id"
    ).bind(patientId).all();
    return json(rows.results);
  }
  if (req.method === "POST" && !resourceId)
    return upload(req, env, patientId, "professional");
  const photo = resourceId ? await env.DB.prepare("SELECT * FROM photos WHERE id=? AND patient_id=?").bind(resourceId, patientId).first() : null;
  if (!photo) return fail("Fotograf\xEDa no encontrada.", 404);
  if (req.method === "GET" && action === "image") {
    const image = await env.DOCUMENTS.get(String(photo.object_key));
    if (!image) return fail("Archivo no encontrado.", 404);
    return new Response(image.body, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": "inline",
        "Referrer-Policy": "no-referrer"
      }
    });
  }
  if (req.method === "PATCH" && !action) {
    if (Number(req.headers.get("Content-Length") || 0) > 1e4)
      return fail("Solicitud demasiado extensa.");
    const text = await req.text();
    if (text.length > 1e4) return fail("Solicitud demasiado extensa.");
    const body = JSON.parse(text);
    if (!body || !validDate(body.date) || typeof body.angle !== "string" || !angles.includes(body.angle) || typeof body.notes !== "string" || body.notes.length > 2e3)
      return fail("Datos de fotograf\xEDa inv\xE1lidos.");
    if (body.expectedVersion !== photo.version)
      return fail(
        "La fotograf\xEDa cambi\xF3 en otra sesi\xF3n. Recarga antes de editar.",
        409
      );
    const result = await env.DB.prepare(
      "UPDATE photos SET date=?,angle=?,notes=?,version=version+1 WHERE id=? AND patient_id=? AND version=?"
    ).bind(
      body.date,
      body.angle,
      body.notes,
      resourceId,
      patientId,
      body.expectedVersion
    ).run();
    if (!result.meta.changes)
      return fail("La fotograf\xEDa cambi\xF3 en otra sesi\xF3n.", 409);
    await audit(env, "update", "photo", resourceId);
    return json({ ok: true });
  }
  return fail("M\xE9todo no permitido.", 405);
}
__name(clinicalPhotos, "clinicalPhotos");

// ../../worker/photo-requests.ts
var mailConfigured = /* @__PURE__ */ __name((env) => !!env.EMAIL && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.EMAIL_FROM || ""), "mailConfigured");
function photoMail(to, from, url, date, replyTo) {
  return {
    to,
    from,
    subject: "Enlace privado para enviar tus fotograf\xEDas",
    text: `Hola:

Para completar tu seguimiento de la evaluaci\xF3n del ${displayDate(date)}, puedes enviar tus fotograf\xEDas desde este enlace privado:

${url}

Abre el enlace en tu celular, elige la fotograf\xEDa y confirma su fecha y vista. Puedes tomar una foto nueva o elegirla de tu galer\xEDa.

El enlace dura 7 d\xEDas y admite hasta 20 fotograf\xEDas. Las im\xE1genes quedar\xE1n disponibles para tu profesional. No compartas el enlace con otras personas.

Si tienes preguntas, comun\xEDcate con tu profesional.`,
    ...replyTo ? { replyTo } : {}
  };
}
__name(photoMail, "photoMail");
async function requestPhotos(env, origin, patientId, date, retry = false) {
  if (!validDate(date)) throw new Error("Invalid attention date");
  const patient = await env.DB.prepare(
    "SELECT email,is_demo FROM patients WHERE id=?"
  ).bind(patientId).first();
  if (!patient) throw new Error("Patient not found");
  if (patient.is_demo) return { status: "demo" };
  const initial = !patient.email ? "missing_email" : !mailConfigured(env) ? "unconfigured" : "sending";
  const inserted = await env.DB.prepare(
    "INSERT OR IGNORE INTO photo_requests(id,patient_id,attention_date,status,recipient) VALUES(?,?,?,?,?) RETURNING *"
  ).bind(crypto.randomUUID(), patientId, date, initial, patient.email).first();
  let row = inserted || await env.DB.prepare(
    "SELECT * FROM photo_requests WHERE patient_id=? AND attention_date=?"
  ).bind(patientId, date).first();
  if (!row) throw new Error("Request not found");
  if (!inserted) {
    if (!retry || row.status === "sending") return row;
    if (row.status === "sent") {
      const active = await env.DB.prepare(
        "SELECT id FROM photo_links WHERE id=? AND revoked=0 AND expires_at>? AND uploads<20"
      ).bind(row.link_id, (/* @__PURE__ */ new Date()).toISOString()).first();
      if (active && row.recipient === patient.email) return row;
    }
    const claimed = await env.DB.prepare(
      "UPDATE photo_requests SET status=?,recipient=?,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=? AND status=? RETURNING *"
    ).bind(initial, patient.email, row.id, row.status).first();
    if (!claimed) return row;
    row = claimed;
  }
  if (initial !== "sending") return row;
  const token = [...crypto.getRandomValues(new Uint8Array(32))].map((n) => n.toString(16).padStart(2, "0")).join("");
  const hash = [
    ...new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token))
    )
  ].map((n) => n.toString(16).padStart(2, "0")).join("");
  const linkId = crypto.randomUUID();
  let submitted = false;
  try {
    await env.DB.batch([
      env.DB.prepare("UPDATE photo_links SET revoked=1 WHERE id=?").bind(
        row.link_id
      ),
      env.DB.prepare(
        "INSERT INTO photo_links(id,patient_id,token_hash,expires_at,attention_date) VALUES(?,?,?,?,?)"
      ).bind(
        linkId,
        patientId,
        hash,
        new Date(Date.now() + 7 * 864e5).toISOString(),
        date
      ),
      env.DB.prepare(
        "UPDATE photo_requests SET link_id=?,message_id=NULL,sent_at=NULL WHERE id=?"
      ).bind(linkId, row.id)
    ]);
    const result = await env.EMAIL.send(
      photoMail(
        patient.email,
        env.EMAIL_FROM,
        `${origin}/fotos#${token}`,
        date,
        env.EMAIL_REPLY_TO
      )
    );
    submitted = true;
    await env.DB.prepare(
      "UPDATE photo_requests SET status='sent',message_id=?,sent_at=strftime('%Y-%m-%dT%H:%M:%fZ','now'),updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?"
    ).bind(result.messageId, row.id).run();
    await env.DB.prepare(
      "INSERT INTO audit_events(id,action,resource_type,resource_id,actor) VALUES(?,?,?,?,?)"
    ).bind(
      crypto.randomUUID(),
      "send",
      "photo-request",
      row.id,
      "professional"
    ).run().catch(() => void 0);
    return {
      ...row,
      status: "sent",
      link_id: linkId,
      recipient: patient.email
    };
  } catch {
    await env.DB.batch([
      ...submitted ? [] : [
        env.DB.prepare("UPDATE photo_links SET revoked=1 WHERE id=?").bind(
          linkId
        )
      ],
      env.DB.prepare(
        "UPDATE photo_requests SET status='failed',updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?"
      ).bind(row.id)
    ]);
    return { ...row, status: "failed" };
  }
}
__name(requestPhotos, "requestPhotos");
async function automaticPhotoRequest(env, origin, patientId, date) {
  try {
    return await requestPhotos(env, origin, patientId, date);
  } catch {
    return { status: "failed" };
  }
}
__name(automaticPhotoRequest, "automaticPhotoRequest");
async function photoRequests(req, env, patientId) {
  if (req.method === "GET") {
    const rows = await env.DB.prepare(
      "SELECT r.attention_date,r.status,r.recipient,r.sent_at,r.updated_at,l.expires_at,l.revoked,l.uploads FROM photo_requests r LEFT JOIN photo_links l ON l.id=r.link_id WHERE r.patient_id=? ORDER BY r.attention_date DESC"
    ).bind(patientId).all();
    return Response.json(
      { configured: mailConfigured(env), requests: rows.results },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
  if (req.method === "POST") {
    const body = await req.json();
    if (!validDate(body.date))
      return Response.json(
        { error: "Fecha de atenci\xF3n inv\xE1lida." },
        { status: 400 }
      );
    const visit = await env.DB.prepare(
      "SELECT 1 FROM records WHERE patient_id=? AND coalesce(attention_date,date)=? UNION ALL SELECT 1 FROM control_plans WHERE patient_id=? AND date=? LIMIT 1"
    ).bind(patientId, body.date, patientId, body.date).first();
    if (!visit)
      return Response.json(
        { error: "Guarda primero la evaluaci\xF3n de esa fecha." },
        { status: 400 }
      );
    const result = await requestPhotos(
      env,
      new URL(req.url).origin,
      patientId,
      body.date,
      true
    );
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  }
  return Response.json({ error: "M\xE9todo no permitido." }, { status: 405 });
}
__name(photoRequests, "photoRequests");

// ../../worker/written-documents.ts
var json2 = /* @__PURE__ */ __name((value, status = 200) => Response.json(value, { status, headers: { "Cache-Control": "no-store" } }), "json");
async function writtenDocuments(req, db, patientId, id) {
  const table = patientId ? "written_documents" : "document_templates";
  const filter = patientId ? "patient_id=?" : "1=1";
  if (req.method === "GET" && !id) {
    const statement = db.prepare(
      `SELECT * FROM ${table} WHERE ${filter} ORDER BY updated_at DESC,id`
    );
    return json2(
      (await (patientId ? statement.bind(patientId) : statement).all()).results
    );
  }
  if (!["POST", "PATCH"].includes(req.method) || req.method === "PATCH" && !id || req.method === "POST" && id)
    return json2({ error: "M\xE9todo no permitido." }, 405);
  const body = await req.json();
  if (!["prescription", "exam_order"].includes(String(body.kind)) || typeof body.title !== "string" || !body.title.trim() || body.title.length > 200 || typeof body.content !== "string" || !body.content.trim() || body.content.length > 2e4 || patientId && !validDate(body.date))
    return json2(
      { error: "Completa el tipo, t\xEDtulo, fecha y texto del documento." },
      400
    );
  if (id) {
    if (!Number.isInteger(body.expectedVersion))
      return json2({ error: "Versi\xF3n requerida." }, 400);
    const result = await (patientId ? db.prepare(
      "UPDATE written_documents SET kind=?,date=?,title=?,content=?,version=version+1,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=? AND patient_id=? AND version=?"
    ).bind(
      body.kind,
      body.date,
      body.title.trim(),
      body.content.trim(),
      id,
      patientId,
      body.expectedVersion
    ) : db.prepare(
      "UPDATE document_templates SET kind=?,title=?,content=?,version=version+1,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=? AND version=?"
    ).bind(
      body.kind,
      body.title.trim(),
      body.content.trim(),
      id,
      body.expectedVersion
    )).run();
    if (!result.meta.changes)
      return json2(
        {
          error: "El documento cambi\xF3 o no est\xE1 disponible. Recarga antes de guardar."
        },
        409
      );
  } else {
    id = crypto.randomUUID();
    await (patientId ? db.prepare(
      "INSERT INTO written_documents(id,patient_id,date,kind,title,content) VALUES(?,?,?,?,?,?)"
    ).bind(
      id,
      patientId,
      body.date,
      body.kind,
      body.title.trim(),
      body.content.trim()
    ) : db.prepare(
      "INSERT INTO document_templates(id,kind,title,content) VALUES(?,?,?,?)"
    ).bind(id, body.kind, body.title.trim(), body.content.trim())).run();
  }
  await db.prepare(
    "INSERT INTO audit_events(id,action,resource_type,resource_id,actor) VALUES(?,?,?,?,?)"
  ).bind(
    crypto.randomUUID(),
    req.method === "POST" ? "create" : "update",
    patientId ? "written-document" : "document-template",
    id,
    "professional"
  ).run();
  return json2(
    await db.prepare(`SELECT * FROM ${table} WHERE id=?`).bind(id).first(),
    req.method === "POST" ? 201 : 200
  );
}
__name(writtenDocuments, "writtenDocuments");

// ../../worker/index.ts
var encoder = new TextEncoder();
var attempts = /* @__PURE__ */ new Map();
var json3 = /* @__PURE__ */ __name((data, status = 200) => Response.json(data, {
  status,
  headers: {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  }
}), "json");
var fail2 = /* @__PURE__ */ __name((message, status = 400) => json3({ error: message }, status), "fail");
var local = /* @__PURE__ */ __name((req, env) => env.DEV_MODE === "local" && ["localhost", "127.0.0.1"].includes(new URL(req.url).hostname), "local");
async function sessionKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}
__name(sessionKey, "sessionKey");
async function sign(expiry, secret) {
  const signature = await crypto.subtle.sign(
    "HMAC",
    await sessionKey(secret),
    encoder.encode(expiry)
  );
  return `${expiry}.${Array.from(new Uint8Array(signature), (b) => b.toString(16).padStart(2, "0")).join("")}`;
}
__name(sign, "sign");
async function authenticated(req, env) {
  if (local(req, env)) return true;
  if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET || env.SESSION_SECRET.length < 32)
    return false;
  const cookie = req.headers.get("Cookie")?.split(";").map((s) => s.trim()).find((s) => s.startsWith("clinic_session="))?.slice(15);
  if (!cookie) return false;
  const [expiry, signature] = cookie.split(".");
  if (!/^\d{13}$/.test(expiry) || Number(expiry) <= Date.now() || !signature || !/^[a-f0-9]{64}$/.test(signature))
    return false;
  return crypto.subtle.verify(
    "HMAC",
    await sessionKey(env.SESSION_SECRET),
    Uint8Array.from(signature.match(/../g), (h) => parseInt(h, 16)),
    encoder.encode(expiry)
  );
}
__name(authenticated, "authenticated");
async function audit2(env, action, type, id, isLocal) {
  return env.DB.prepare(
    "INSERT INTO audit_events(id,action,resource_type,resource_id,actor) VALUES(?,?,?,?,?)"
  ).bind(
    crypto.randomUUID(),
    action,
    type,
    id,
    isLocal ? "local-development" : "professional"
  ).run();
}
__name(audit2, "audit");
async function parse(req) {
  if (Number(req.headers.get("Content-Length") || 0) > 5e5)
    throw new Error("body");
  const txt = await req.text();
  if (txt.length > 5e5) throw new Error("body");
  const parsed = JSON.parse(txt);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
    throw new Error("body");
  return parsed;
}
__name(parse, "parse");
var clean = /* @__PURE__ */ __name((v, max) => typeof v === "string" ? v.trim().slice(0, max) : "", "clean");
var normalizeName = /* @__PURE__ */ __name((v) => v.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("es-CL"), "normalizeName");
var normalizeRut = /* @__PURE__ */ __name((v) => v.replace(/[.\s]/g, "").toUpperCase(), "normalizeRut");
function validRut(rut) {
  if (!/^\d{7,8}-[\dK]$/.test(rut)) return false;
  const [body, dv] = rut.split("-");
  let sum = 0, m = 2;
  for (const n of [...body].reverse()) {
    sum += Number(n) * m;
    m = m === 7 ? 2 : m + 1;
  }
  const r = 11 - sum % 11;
  return dv === (r === 11 ? "0" : r === 10 ? "K" : String(r));
}
__name(validRut, "validRut");
async function handle(req, env) {
  const url = new URL(req.url);
  const path = url.pathname;
  const isLocal = local(req, env);
  if (!path.startsWith("/api/")) return env.ASSETS.fetch(req);
  if (path === "/api/health")
    return json3({ ok: true, mode: isLocal ? "local" : "private" });
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    const origin = req.headers.get("Origin");
    if (!isLocal && origin !== url.origin)
      return fail2("Origen no autorizado.", 403);
    if (isLocal && origin && origin !== url.origin && !["http://127.0.0.1:5173", "http://localhost:5173"].includes(origin))
      return fail2("Origen no autorizado.", 403);
  }
  const portalResponse = await photoPortal(req, env);
  if (portalResponse) return portalResponse;
  if (path === "/api/login" && req.method === "POST") {
    if (isLocal) return json3({ ok: true });
    if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET || env.SESSION_SECRET.length < 32)
      return fail2("Acceso de producci\xF3n pendiente de configuraci\xF3n.", 503);
    const ip = req.headers.get("CF-Connecting-IP") || "unknown";
    const previous = attempts.get(ip);
    if (previous && previous.until > Date.now() && previous.count >= 5)
      return fail2("Demasiados intentos. Intenta en 15 minutos.", 429);
    const body = await parse(req);
    const candidate = typeof body.password === "string" ? body.password : "";
    const [a, b] = await Promise.all([
      crypto.subtle.digest("SHA-256", encoder.encode(candidate)),
      crypto.subtle.digest("SHA-256", encoder.encode(env.ADMIN_PASSWORD))
    ]);
    let diff = 0;
    const aa = new Uint8Array(a), bb = new Uint8Array(b);
    for (let i = 0; i < aa.length; i++) diff |= aa[i] ^ bb[i];
    if (diff !== 0) {
      attempts.set(ip, {
        count: previous && previous.until > Date.now() ? previous.count + 1 : 1,
        until: Date.now() + 9e5
      });
      return fail2("Contrase\xF1a incorrecta.", 401);
    }
    attempts.delete(ip);
    const token = await sign(
      String(Date.now() + 8 * 60 * 60 * 1e3),
      env.SESSION_SECRET
    );
    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "Set-Cookie": `clinic_session=${token}; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`
      }
    });
  }
  if (path === "/api/logout" && req.method === "POST")
    return new Response("{}", {
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": "clinic_session=; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=0",
        "Cache-Control": "no-store"
      }
    });
  if (!await authenticated(req, env))
    return fail2("Inicia sesi\xF3n para acceder.", 401);
  if (path === "/api/session") return json3({ ok: true, local: isLocal });
  const templateRoute = path.match(/^\/api\/document-templates(?:\/([^/]+))?$/);
  if (templateRoute)
    return writtenDocuments(req, env.DB, void 0, templateRoute[1]);
  if (path === "/api/patients" && req.method === "GET") {
    const search = (url.searchParams.get("q") || "").trim().slice(0, 200);
    const normalized = normalizeRut(search);
    const rows = await env.DB.prepare(
      "SELECT * FROM patients WHERE instr(name_search,?)>0 OR instr(coalesce(rut,''),?)>0 ORDER BY name COLLATE NOCASE"
    ).bind(normalizeName(search), normalized).all();
    return json3(rows.results);
  }
  let match = path.match(/^\/api\/patients(?:\/([^/]+))?$/);
  if (match && ["POST", "PATCH"].includes(req.method)) {
    const id = match[1];
    if (req.method === "PATCH" && !id || req.method === "POST" && id)
      return fail2("Ruta inv\xE1lida.", 405);
    const body = await parse(req);
    const name = clean(body.name, 200), rut = normalizeRut(clean(body.rut, 30)), email = clean(body.email, 254), phone = clean(body.phone, 50);
    if (!name) return fail2("El nombre es obligatorio.");
    if (req.method === "POST" && !email)
      return fail2(
        "El correo del paciente es obligatorio para solicitar fotograf\xEDas."
      );
    if (rut && !validRut(rut))
      return fail2("RUT inv\xE1lido. Usa el formato 12345678-5.");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return fail2("Correo inv\xE1lido.");
    if (rut) {
      const existing = await env.DB.prepare(
        "SELECT id FROM patients WHERE rut=? AND id<>?"
      ).bind(rut, id || "").first();
      if (existing) return fail2("Ya existe un paciente con ese RUT.", 409);
    }
    const patientId2 = id || crypto.randomUUID();
    const result = id ? await env.DB.prepare(
      "UPDATE patients SET name=?,name_search=?,rut=?,email=?,phone=?,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?"
    ).bind(
      name,
      normalizeName(name),
      rut || null,
      email || null,
      phone || null,
      id
    ).run() : await env.DB.prepare(
      "INSERT INTO patients(id,name,name_search,rut,email,phone) VALUES(?,?,?,?,?,?)"
    ).bind(
      patientId2,
      name,
      normalizeName(name),
      rut || null,
      email || null,
      phone || null
    ).run();
    if (!result.meta.changes) return fail2("Paciente no encontrado.", 404);
    await audit2(env, id ? "update" : "create", "patient", patientId2, isLocal);
    return json3(
      await env.DB.prepare("SELECT * FROM patients WHERE id=?").bind(patientId2).first(),
      id ? 200 : 201
    );
  }
  match = path.match(
    /^\/api\/patients\/([^/]+)\/(records|documents|controls|photos|photo-links|photo-requests|written-documents)(?:\/([^/]+))?(?:\/(download|image))?$/
  );
  if (!match) return fail2("Ruta no encontrada.", 404);
  const [, patientId, collection, resourceId, download] = match;
  if (!await env.DB.prepare("SELECT id FROM patients WHERE id=?").bind(patientId).first())
    return fail2("Paciente no encontrado.", 404);
  if (collection === "photo-requests" && !resourceId && !download)
    return photoRequests(req, env, patientId);
  if (collection === "written-documents" && !download)
    return writtenDocuments(req, env.DB, patientId, resourceId);
  const photoResponse = await clinicalPhotos(
    req,
    env,
    patientId,
    collection,
    resourceId,
    download
  );
  if (photoResponse) return photoResponse;
  if (collection === "controls") {
    if (req.method === "GET" && !resourceId) {
      const rows = await env.DB.prepare(
        "SELECT * FROM control_plans WHERE patient_id=? ORDER BY date"
      ).bind(patientId).all();
      return json3(
        rows.results.map((r) => ({ ...r, data: JSON.parse(String(r.data)) }))
      );
    }
    if (req.method === "PUT" && resourceId) {
      const body = await parse(req);
      const error = validateControl(resourceId, body.data);
      if (error) return fail2(error, 400);
      const old = await env.DB.prepare(
        "SELECT version FROM control_plans WHERE patient_id=? AND date=?"
      ).bind(patientId, resourceId).first();
      if ((old?.version ?? 0) !== body.expectedVersion)
        return fail2(
          "El control cambi\xF3 en otra sesi\xF3n. Recarga antes de guardar.",
          409
        );
      if (old) {
        const result = await env.DB.prepare(
          "UPDATE control_plans SET data=?,version=version+1,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE patient_id=? AND date=? AND version=?"
        ).bind(JSON.stringify(body.data), patientId, resourceId, old.version).run();
        if (!result.meta.changes)
          return fail2("El control cambi\xF3 en otra sesi\xF3n.", 409);
      } else {
        try {
          await env.DB.prepare(
            "INSERT INTO control_plans(patient_id,date,data) VALUES(?,?,?)"
          ).bind(patientId, resourceId, JSON.stringify(body.data)).run();
        } catch (e) {
          if (String(e).includes("UNIQUE"))
            return fail2("El control cambi\xF3 en otra sesi\xF3n.", 409);
          throw e;
        }
      }
      await audit2(
        env,
        "update",
        "control",
        `${patientId}:${resourceId}`,
        isLocal
      );
      const row = await env.DB.prepare(
        "SELECT * FROM control_plans WHERE patient_id=? AND date=?"
      ).bind(patientId, resourceId).first();
      const photo_request = await automaticPhotoRequest(
        env,
        new URL(req.url).origin,
        patientId,
        resourceId
      );
      return json3({
        ...row,
        data: JSON.parse(String(row.data)),
        photo_request
      });
    }
    return fail2("M\xE9todo no permitido.", 405);
  }
  if (collection === "records") {
    if (req.method === "GET" && !resourceId) {
      const rows = await env.DB.prepare(
        "SELECT * FROM records WHERE patient_id=? ORDER BY date,created_at,id"
      ).bind(patientId).all();
      return json3(
        rows.results.map((r) => ({ ...r, data: JSON.parse(r.data) }))
      );
    }
    const existing = resourceId ? await env.DB.prepare(
      "SELECT * FROM records WHERE id=? AND patient_id=?"
    ).bind(resourceId, patientId).first() : null;
    if (resourceId && !existing) return fail2("Registro no encontrado.", 404);
    if (req.method === "DELETE" && resourceId) {
      const body = await parse(req);
      if (body.expectedVersion !== existing.version)
        return fail2("El registro cambi\xF3. Recarga antes de eliminar.", 409);
      const deleted = await env.DB.prepare(
        "DELETE FROM records WHERE id=? AND patient_id=? AND version=?"
      ).bind(resourceId, patientId, body.expectedVersion).run();
      if (!deleted.meta.changes)
        return fail2("El registro cambi\xF3. Recarga antes de eliminar.", 409);
      await audit2(env, "delete", "record", resourceId, isLocal);
      return json3({ ok: true });
    }
    if (req.method === "POST" && !resourceId || req.method === "PATCH" && resourceId) {
      const body = await parse(req);
      const kind = existing?.kind || body.kind;
      const error = validateRecord(kind, body.date, body.data);
      if (error) return fail2(error);
      if (kind === "anthropometry")
        body.data = anthropometryData(
          body.data
        );
      const attentionDate = body.attention_date === void 0 ? existing?.attention_date || null : body.attention_date;
      if (attentionDate !== null && !validDate(attentionDate))
        return fail2("Fecha de atenci\xF3n inv\xE1lida.");
      if (attentionDate && !["lab", "inbody"].includes(String(kind)) && body.date !== attentionDate)
        return fail2("Este registro debe usar la fecha de atenci\xF3n.");
      if (existing && body.expectedVersion !== existing.version)
        return fail2("El registro cambi\xF3. Recarga antes de guardar.", 409);
      const documentId = body.document_id === void 0 ? existing?.document_id || null : body.document_id || null;
      if (documentId) {
        const source = await env.DB.prepare(
          "SELECT id,kind,date FROM documents WHERE id=? AND patient_id=?"
        ).bind(documentId, patientId).first();
        if (!source) return fail2("Documento no encontrado para este paciente.");
        if (["lab", "inbody"].includes(String(kind)) && (source.kind !== kind || source.date !== body.date))
          return fail2(
            "El resultado debe usar el tipo y la fecha de medici\xF3n del documento fuente."
          );
      }
      const id = resourceId || crypto.randomUUID();
      const data = JSON.stringify(body.data);
      const result = existing ? await env.DB.prepare(
        "UPDATE records SET date=?,data=?,document_id=?,attention_date=?,version=version+1,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=? AND patient_id=? AND version=?"
      ).bind(
        body.date,
        data,
        documentId,
        attentionDate,
        id,
        patientId,
        body.expectedVersion
      ).run() : await env.DB.prepare(
        "INSERT INTO records(id,patient_id,kind,date,data,document_id,attention_date) VALUES(?,?,?,?,?,?,?)"
      ).bind(
        id,
        patientId,
        kind,
        body.date,
        data,
        documentId,
        attentionDate
      ).run();
      if (!result.meta.changes)
        return fail2("El registro cambi\xF3. Recarga antes de guardar.", 409);
      await audit2(env, existing ? "update" : "create", "record", id, isLocal);
      const record = await env.DB.prepare("SELECT * FROM records WHERE id=?").bind(id).first();
      const photo_request = await automaticPhotoRequest(
        env,
        new URL(req.url).origin,
        patientId,
        String(attentionDate || body.date)
      );
      return json3(
        { ...record, data: JSON.parse(record.data), photo_request },
        existing ? 200 : 201
      );
    }
  } else {
    if (req.method === "GET" && !resourceId) {
      const rows = await env.DB.prepare(
        "SELECT id,kind,date,name,size,extracted_text,created_at,version FROM documents WHERE patient_id=? ORDER BY date,created_at,id"
      ).bind(patientId).all();
      return json3(rows.results);
    }
    const doc = resourceId ? await env.DB.prepare(
      "SELECT * FROM documents WHERE id=? AND patient_id=?"
    ).bind(resourceId, patientId).first() : null;
    if (resourceId && !doc) return fail2("Documento no encontrado.", 404);
    if (req.method === "GET" && download) {
      const object = await env.DOCUMENTS.get(doc.object_key);
      if (!object) return fail2("Archivo no encontrado.", 404);
      return new Response(object.body, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(doc.name)}`,
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff"
        }
      });
    }
    if (req.method === "POST" && !resourceId) {
      if (Number(req.headers.get("Content-Length") || 0) > 11 * 1024 * 1024)
        return fail2("El PDF supera el l\xEDmite de 10 MB.", 413);
      const form = await req.formData();
      const file = form.get("file");
      const date = form.get("date"), kind = form.get("kind");
      if (!(file instanceof File) || file.size === 0 || file.size > 10 * 1024 * 1024)
        return fail2("Selecciona un PDF de hasta 10 MB.");
      if (!["application/pdf", ""].includes(file.type) || new TextDecoder().decode(await file.slice(0, 5).arrayBuffer()) !== "%PDF-")
        return fail2("El archivo no es un PDF v\xE1lido.");
      if (!validDate(date) || !["inbody", "lab", "other"].includes(String(kind)))
        return fail2("Fecha o tipo de documento inv\xE1lido.");
      let imported = [];
      const attentionDate = form.get("attention_date");
      if (form.get("results")) {
        let input;
        try {
          input = JSON.parse(String(form.get("results")));
        } catch {
          return fail2("Resultados del PDF inv\xE1lidos.");
        }
        if (!Array.isArray(input) || input.length > 200)
          return fail2("M\xE1ximo 200 resultados por PDF.");
        if (input.length && !validDate(attentionDate))
          return fail2("Confirma la fecha de atenci\xF3n.");
        for (const row of input) {
          if (!row || typeof row !== "object" || row.kind !== kind || !["lab", "inbody"].includes(row.kind))
            return fail2("Los resultados deben corresponder al tipo del PDF.");
          const error = validateRecord(row.kind, date, row.data);
          if (error) return fail2(error);
          imported.push(row);
        }
        if (kind === "inbody" && imported.length > 1)
          return fail2("Un PDF InBody debe contener una medici\xF3n revisada.");
      }
      const bytes = await file.arrayBuffer();
      const digest2 = await crypto.subtle.digest("SHA-256", bytes);
      const hash = [...new Uint8Array(digest2)].map((v) => v.toString(16).padStart(2, "0")).join("");
      if (await env.DB.prepare(
        "SELECT id FROM documents WHERE patient_id=? AND content_sha256=?"
      ).bind(patientId, hash).first())
        return fail2(
          "Este PDF ya est\xE1 guardado para el paciente. Rev\xEDsalo en Documentos; no se duplicaron resultados.",
          409
        );
      const id = crypto.randomUUID(), key = `${patientId}/${id}.pdf`;
      await env.DOCUMENTS.put(key, bytes, {
        httpMetadata: { contentType: "application/pdf" }
      });
      try {
        const documentInsert = env.DB.prepare(
          "INSERT INTO documents(id,patient_id,kind,date,name,object_key,size,extracted_text,content_sha256) VALUES(?,?,?,?,?,?,?,?,?)"
        ).bind(
          id,
          patientId,
          kind,
          date,
          file.name.slice(0, 200),
          key,
          file.size,
          String(form.get("text") || "").slice(0, 25e4),
          hash
        );
        await env.DB.batch([
          documentInsert,
          ...imported.map(
            (row) => env.DB.prepare(
              "INSERT INTO records(id,patient_id,kind,date,data,document_id,attention_date) VALUES(?,?,?,?,?,?,?)"
            ).bind(
              crypto.randomUUID(),
              patientId,
              row.kind,
              date,
              JSON.stringify(row.data),
              id,
              attentionDate
            )
          )
        ]);
      } catch (e) {
        await env.DOCUMENTS.delete(key);
        if (String(e).includes("UNIQUE"))
          return fail2("Este PDF ya est\xE1 guardado para el paciente.", 409);
        throw e;
      }
      await audit2(env, "upload", "document", id, isLocal);
      const photo_request = imported.length ? await automaticPhotoRequest(
        env,
        new URL(req.url).origin,
        patientId,
        String(attentionDate || date)
      ) : null;
      return json3({ id, imported: imported.length, photo_request }, 201);
    }
    if (req.method === "PATCH" && resourceId) {
      const body = await parse(req);
      if (!validDate(body.date)) return fail2("Fecha inv\xE1lida.");
      if (body.expectedVersion !== doc.version)
        return fail2("El documento cambi\xF3. Recarga antes de guardar.", 409);
      await env.DB.batch([
        env.DB.prepare(
          "UPDATE documents SET date=?,version=version+1 WHERE id=? AND patient_id=?"
        ).bind(body.date, resourceId, patientId),
        env.DB.prepare(
          "UPDATE records SET date=?,version=version+1,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE document_id=? AND patient_id=?"
        ).bind(body.date, resourceId, patientId)
      ]);
      await audit2(env, "update", "document", resourceId, isLocal);
      return json3({ ok: true });
    }
    if (req.method === "DELETE" && resourceId) {
      const linked = await env.DB.prepare(
        "SELECT count(*) AS n FROM records WHERE document_id=?"
      ).bind(resourceId).first();
      if (linked.n)
        return fail2(
          "El documento tiene resultados asociados. Elimina o desvincula esos resultados antes de borrarlo.",
          409
        );
      await env.DOCUMENTS.delete(doc.object_key);
      await env.DB.prepare("DELETE FROM documents WHERE id=? AND patient_id=?").bind(resourceId, patientId).run();
      await audit2(env, "delete", "document", resourceId, isLocal);
      return json3({ ok: true });
    }
  }
  return fail2("M\xE9todo no permitido.", 405);
}
__name(handle, "handle");
var index_default = {
  async fetch(req, env) {
    try {
      return await handle(req, env);
    } catch (error) {
      if (error instanceof SyntaxError || error instanceof Error && error.message === "body")
        return fail2("Solicitud inv\xE1lida.");
      console.error(
        "Request failed:",
        error instanceof Error ? error.name : "unknown"
      );
      return fail2(
        "No se pudo completar la operaci\xF3n. Intenta nuevamente.",
        500
      );
    }
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map

// Named exports expose the unchanged deployed validation/auth helpers to the additive workflow routes.
export { authenticated, local, validateRecord, anthropometryData, validateControl, fields, automaticPhotoRequest };
