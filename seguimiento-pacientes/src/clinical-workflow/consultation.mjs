import {
  validateDevice,
  canUseDevicePrescription,
} from "../treatments/device.mjs";
import fields from "./fields.json" with { type: "json" };
const statuses = new Set(fields.historyStatuses);
export function historyForReservo(history) {
  const parts = [];
  for (const field of fields.history) {
    const entry = history[field.id];
    if (!entry) continue;
    if (!statuses.has(entry.status))
      throw new Error("Estado de antecedente desconocido.");
    const detail = typeof entry.text === "string" ? entry.text.trim() : "";
    const text =
      entry.status === "none"
        ? "Niega"
        : entry.status === "unknown"
          ? "Desconoce"
          : entry.status === "prefers_discussion"
            ? "Por conversar"
            : entry.status === "reported"
              ? detail
              : "";
    if (entry.status === "reported" && !detail)
      throw new Error("Completa el antecedente informado.");
    if (text) parts.push(`${field.abbreviation}: ${text}`);
  }
  const text = parts.join("; "),
    count = [...text].length;
  return {
    text,
    count,
    limit: 400,
    fits: count <= 400,
    remaining: 400 - count,
  };
}
export function validDate(date) {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return false;
  const d = new Date(date + "T12:00:00Z");
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === date;
}
export function recommendedNextVisit(date, days = 42) {
  if (!validDate(date) || !Number.isInteger(days) || days < 1)
    throw new Error("Fecha o intervalo inválido.");
  return new Date(Date.parse(date + "T12:00:00Z") + days * 86400000)
    .toISOString()
    .slice(0, 10);
}
export function validateVisit(visit) {
  if (!validDate(visit.date)) return "Fecha de atención inválida.";
  if (!["initial", "control"].includes(visit.type))
    return "Tipo de atención inválido.";
  if (!["in_person", "online"].includes(visit.modality))
    return "Modalidad inválida.";
  if (
    visit.adherencePercent != null &&
    (typeof visit.adherencePercent !== "number" ||
      !Number.isFinite(visit.adherencePercent) ||
      visit.adherencePercent < 0 ||
      visit.adherencePercent > 100)
  )
    return "La adherencia debe estar entre 0 y 100.";
  if (
    visit.stress1to10 != null &&
    (typeof visit.stress1to10 !== "number" ||
      !Number.isFinite(visit.stress1to10) ||
      visit.stress1to10 < 1 ||
      visit.stress1to10 > 10)
  )
    return "El estrés debe estar entre 1 y 10.";
  if (
    visit.recommendedNextVisit &&
    (!validDate(visit.recommendedNextVisit) ||
      visit.recommendedNextVisit <= visit.date)
  )
    return "El próximo control debe ser posterior a esta atención.";
  return null;
}
/** Explicitly composing stored professional text; does not invent dose, frequency or duration. */
export function composeTemplates(templates, selectedIds, context) {
  const byId = new Map(templates.map((t) => [t.id, t]));
  const selected = [...new Set(selectedIds)].map((id) => {
    if (!byId.has(id)) throw new Error("Plantilla no encontrada.");
    return byId.get(id);
  });
  const substitute = (text) =>
    text.replace(/\{\{(paciente|rut|fecha)\}\}/g, (_, key) =>
      String(context[key] ?? ""),
    );
  const prescription = selected
    .filter((t) => t.category === "prescription")
    .map((t) => substitute(t.text))
    .join("\n\n");
  const exams = selected
    .filter((t) => t.category === "exam_order")
    .flatMap((t) => substitute(t.text).split("\n"))
    .map((line) => line.replace(/^\s*\d+[.)]\s*/, "").trim())
    .filter(Boolean);
  const seen = new Set(),
    unique = exams.filter((exam) => {
      const key = exam.normalize("NFC").toLocaleLowerCase("es");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  return {
    prescription,
    examOrder: unique.map((e, i) => `${i + 1}. ${e}`).join("\n"),
    sourceTemplateIds: selected.map((t) => t.id),
  };
}

/** Validate the structured workspace independently of the UI; empty values remain unknown. */
export function validateWorkspace(data) {
  const base = validateVisit(data);
  if (base) return base;
  const object = (x) => x && typeof x === "object" && !Array.isArray(x);
  for (const key of [
    "general",
    "habits",
    "measurements",
    "recall",
    "energy",
    "closing",
    "portions",
    "allocations",
    "demographics",
  ])
    if (!object(data[key])) return "Sección de consulta inválida: " + key;
  for (const key of [
    "activities",
    "drinks",
    "weightHistory",
    "medications",
    "supplements",
  ])
    if (!Array.isArray(data[key]) || data[key].length > 100)
      return "Lista inválida: " + key;
  if (data.closing.wegovyResources !== undefined) {
    const r = data.closing.wegovyResources;
    if (
      !object(r) ||
      Object.keys(r).some(
        (k) =>
          ![
            "guide",
            "video",
            "benefits",
            "benefitsExplanation",
            "includeRegimen",
          ].includes(k),
      ) ||
      ["guide", "video", "benefits", "includeRegimen"].some(
        (k) => r[k] !== undefined && typeof r[k] !== "boolean",
      ) ||
      (r.benefitsExplanation !== undefined &&
        (typeof r.benefitsExplanation !== "string" ||
          r.benefitsExplanation.length > 1500))
    )
      return "Revisa los materiales de apoyo seleccionados.";
  }
  for (const treatment of data.medications) {
    const error = validateDevice(treatment);
    if (error) return error;
  }
  if (
    data.closing.wegovyResources?.includeRegimen &&
    !canUseDevicePrescription(data.medications)
  )
    return "Revisa la pluma, dosis, frecuencia y clics antes de incluir el esquema en el resumen.";
  if (!Array.isArray(data.recall.meals) || data.recall.meals.length > 20)
    return "Recordatorio alimentario inválido.";
  const numeric = (v) =>
    v === "" || v === undefined || v === null
      ? null
      : typeof v === "string" || typeof v === "number"
        ? Number(String(v).replace(",", "."))
        : NaN;
  const check = (v, min, max) => {
    const n = numeric(v);
    return n === null || (Number.isFinite(n) && n >= min && n <= max);
  };
  if (!check(data.general.adherencePercent, 0, 100))
    return "La adherencia debe estar entre 0 y 100.";
  if (!check(data.habits.stress, 1, 10))
    return "El estrés debe estar entre 1 y 10.";
  if (!check(data.habits.sleep, 0, 24)) return "Horas de sueño fuera de rango.";
  for (const key of [
    "stepsMonthly",
    "water",
    "liquids",
    "alcoholDrinks",
    "delivery",
    "sweetSnacks",
    "saltySnacks",
    "fruit",
    "vegetables",
    "legumes",
    "fish",
  ])
    if (!check(data.habits[key], 0, 100000))
      return "Valor de hábito inválido: " + key;
  if (
    data.demographics.birthDate &&
    (!validDate(data.demographics.birthDate) ||
      data.demographics.birthDate > data.date)
  )
    return "Fecha de nacimiento inválida.";
  if (!check(data.demographics.age, 0, 120)) return "Edad inválida.";
  for (const key of [
    "referenceWeight",
    "referenceHeight",
    "macroWeight",
    "leanMass",
    "proteinValue",
    "fatValue",
    "manualTotal",
    "stepsOutside",
  ])
    if (!check(data.energy[key], 0, 100000))
      return "Valor energético inválido: " + key;
  if (
    !check(data.energy.fatPercent, 0, 100) ||
    !check(data.energy.tef, 0, 99) ||
    !check(data.energy.factor, 1, 3) ||
    !check(data.energy.adjustment, -100000, 100000)
  )
    return "Revisa factor, porcentajes y ajuste energético.";
  if (
    data.closing.nextVisit &&
    (!validDate(data.closing.nextVisit) || data.closing.nextVisit <= data.date)
  )
    return "El próximo control debe ser posterior a esta atención.";
  if (
    data.closing.bookedVisit &&
    (!validDate(data.closing.bookedVisit) ||
      data.closing.bookedVisit <= data.date)
  )
    return "Fecha de cita agendada inválida.";
  for (const a of data.activities)
    if (
      !object(a) ||
      !check(a.sessions, 0, 100) ||
      !check(a.minutes, 0, 10080) ||
      !check(a.met, 0, 50) ||
      !check(a.manualCalories, 0, 1000000)
    )
      return "Frecuencia, duración o MET de actividad inválidos.";
  for (const d of data.drinks)
    if (!object(d) || !check(d.volume, 0, 10000) || !check(d.count, 0, 1000))
      return "Volumen o cantidad de bebida inválidos.";
  for (const v of Object.values(data.portions))
    if (!check(v, 0, 1000)) return "Porciones inválidas.";
  for (const meal of Object.values(data.allocations)) {
    if (!object(meal)) return "Distribución de comidas inválida.";
    for (const v of Object.values(meal))
      if (!check(v, 0, 1000)) return "Distribución de comidas inválida.";
  }
  return null;
}
