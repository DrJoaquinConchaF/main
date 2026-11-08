import reference from "./wegovy-reference.json" with { type: "json" };
import { readDevice, writeDevice } from "./device.mjs";
import { choicesForPen, applyClickChoice } from "./click-options.mjs";
export const referenceFile = "/referencias/wegovy-tabla-clics.pdf";
export const referencePens = reference.models;
export function milligrams(value) {
  const match = String(value ?? "")
    .trim()
    .match(/^(\d+(?:[.,]\d+)?)\s*mg$/i);
  return match ? Number(match[1].replace(",", ".")) : null;
}
export function calculateClicks(pen, dose) {
  const model = referencePens.find((p) => p.pen === pen),
    mg = milligrams(dose);
  if (!model || mg === null || mg <= 0 || mg > model.mg) return null;
  const theoretical = (mg * model.clicks) / model.mg;
  const clicks = Math.round(theoretical + 1e-10);
  if (clicks < 1 || clicks > model.clicks) return null;
  return {
    clicks,
    theoretical,
    deliveredMg: (clicks * model.mg) / model.clicks,
    model,
    rounded: Math.abs(clicks - theoretical) > 1e-8,
  };
}
export function automateClicks(treatment, entry) {
  if (
    !String(treatment.notes || "")
      .split("\n")
      .includes("Con conteo de clics")
  )
    return treatment;
  const d = readDevice(treatment),
    mg = milligrams(d.dose);
  const exact = choicesForPen(entry, d.pen).find(
    (row) =>
      row.dose === d.dose || (mg !== null && milligrams(row.dose) === mg),
  );
  if (exact) return applyClickChoice(treatment, exact);
  const result = calculateClicks(d.pen, d.dose);
  if (!result) return treatment;
  const next = writeDevice(treatment, { clicks: String(result.clicks) });
  return {
    ...next,
    notes: [
      ...next.notes
        .split("\n")
        .filter((line) => !line.startsWith("Cálculo de clics: ")),
      `Cálculo de clics: ${result.model.mg} mg = ${result.model.clicks} clics; ${d.dose} → ${result.theoretical.toFixed(3)} teóricos → ${result.clicks} clics; dosis aproximada ${result.deliveredMg.toFixed(3)} mg. Tabla aportada por el profesional, revisar dispositivo.`,
    ].join("\n"),
  };
}
