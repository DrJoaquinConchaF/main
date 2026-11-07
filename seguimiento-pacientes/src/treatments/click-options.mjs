import { readDevice, writeDevice, validateDevice } from "./device.mjs";
export const clickChartSource =
  "https://penclickchart.com/wegovy-click-calculator/";
const sourcePrefix = "Fuente de dosis/clics: ";
export function validateClickOptions(options) {
  if (options === undefined) return null;
  if (!Array.isArray(options) || options.length > 200)
    return "La tabla admite hasta 200 combinaciones por producto.";
  const keys = new Set();
  for (const row of options) {
    if (
      !row ||
      typeof row !== "object" ||
      Object.keys(row).some(
        (k) => !["pen", "dose", "clicks", "source", "verified"].includes(k),
      ) ||
      typeof row.verified !== "boolean" ||
      ["pen", "dose", "clicks", "source"].some(
        (k) =>
          typeof row[k] !== "string" ||
          row[k].length > (k === "source" ? 1000 : 250),
      )
    )
      return "Revisa la tabla de dosis y clics.";
    if (row.verified) {
      if (
        !row.pen.trim() ||
        !row.dose.trim() ||
        !/^https:\/\//i.test(row.source)
      )
        return "Cada combinación revisada requiere pluma exacta, dosis y enlace de referencia.";
      const candidate = {
        name: "Producto",
        frequency: "Registrada",
        notes: "Pluma utilizada: " + row.pen + "\nCon conteo de clics",
        dose: row.dose + " (" + row.clicks + " clics)",
      };
      if (!row.clicks.trim() || validateDevice(candidate))
        return "Revisa el número o rango de clics de la combinación.";
      const key =
        row.pen.trim().toLowerCase() + "|" + row.dose.trim().toLowerCase();
      if (keys.has(key))
        return "Hay dosis duplicadas para la misma pluma en la tabla.";
      keys.add(key);
    }
  }
  return null;
}
export function choicesForPen(entry, pen) {
  return (entry?.clickOptions || []).filter(
    (row) => row.verified && row.pen === pen && !validateClickOptions([row]),
  );
}
export function applyClickChoice(treatment, row) {
  if (validateClickOptions([row]) || !row?.verified)
    throw Error("La combinación necesita revisión antes de utilizarse.");
  if (readDevice(treatment).pen !== row.pen)
    throw Error("La tabla corresponde a otra presentación de pluma.");
  const withoutOldSource = {
    ...treatment,
    notes: [
      "Con conteo de clics",
      ...String(treatment.notes || "")
        .split("\n")
        .filter(
          (line) =>
            !line.startsWith(sourcePrefix) &&
            !line.startsWith("Con conteo de clics"),
        ),
    ]
      .filter(Boolean)
      .join("\n"),
  };
  const result = writeDevice(
    writeDevice(withoutOldSource, { dose: row.dose }),
    { clicks: row.clicks },
  );
  return {
    ...result,
    notes: [result.notes, sourcePrefix + row.source].filter(Boolean).join("\n"),
  };
}
