const numberPattern = "[+-]?(?:\\d+(?:[.,]\\d+)?|[.,]\\d+)";
const unitPattern =
  /(?:(?<![a-zA-Z])(?:x?10\^?\d+\s*\/\s*[µμu]?l|(?:[µμu]?mol|mmol|nmol|pmol|mg|ng|pg|µg|μg|ug|g|[µμu]?ui|[µμu]?iu|miu|mui|u|meq|mm|cel(?:ulas)?|c[eé]l)\s*\/\s*(?:dl|ml|l|mm[³3]|ul|µl|μl)|fl|pg|mmhg)\b|%)/gi;
const header =
  /^(fecha|paciente|nombre|rut|folio|edad|sexo|p[aá]gina|page|c[oó]digo|solicitud|direcci[oó]n|m[eé]dico|laboratorio|m[eé]todo|t[eé]cnica|validado|observaci[oó]n|resultado|unidad|valor de referencia)\b/i;
const qualitative =
  "no\\s+reactivo|no\\s+detectado|reactivo|negativo|positivo|detectado|normal|ausente|presente";
const letters = /[a-záéíóúñ]/i;
const unitOnly =
  /^(?:mg|mmol|nmol|pmol|ng|pg|g|dl|ml|l|ui|iu|u|fl|µg|ug|µl|ul|\s|[/.%µμ³²\d])+$/i;
export function numeric(value) {
  if (value === "" || value === null || value === undefined) return null;
  const s = String(value).trim().replace(",", ".");
  return /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(s) && Number.isFinite(Number(s))
    ? Number(s)
    : null;
}
export function labNumber(value) {
  if (typeof value !== "number") return String(value ?? "—");
  if (value !== 0 && Math.abs(value) < 0.000001) return value.toExponential(3);
  return new Intl.NumberFormat("es-CL", { maximumFractionDigits: 6 }).format(
    value,
  );
}
export function labDirection(data) {
  return typeof data.value === "number" &&
    typeof data.referenceLow === "number" &&
    data.value < data.referenceLow
    ? "low"
    : typeof data.value === "number" &&
        typeof data.referenceHigh === "number" &&
        data.value > data.referenceHigh
      ? "high"
      : null;
}
export function labReference(data) {
  const low = numeric(data.referenceLow),
    high = numeric(data.referenceHigh);
  return low !== null && high !== null
    ? `(${labNumber(low)}–${labNumber(high)})`
    : low !== null
      ? `(≥ ${labNumber(low)})`
      : high !== null
        ? `(≤ ${labNumber(high)})`
        : "(sin referencia)";
}
export function layoutPdfItems(items) {
  const rows = [];
  for (const item of items
    .filter((i) => typeof i.str === "string" && i.str.trim())
    .sort(
      (a, b) =>
        b.transform[5] - a.transform[5] || a.transform[4] - b.transform[4],
    )) {
    const y = item.transform[5];
    let row = rows.find((r) => Math.abs(r.y - y) <= 3);
    if (!row) {
      row = { y, items: [] };
      rows.push(row);
    }
    row.items.push(item);
  }
  return rows
    .sort((a, b) => b.y - a.y)
    .map((row) =>
      row.items
        .sort((a, b) => a.transform[4] - b.transform[4])
        .map((item, i, list) => {
          if (!i) return item.str;
          const prior = list[i - 1],
            gap = item.transform[4] - (prior.transform[4] + (prior.width || 0));
          return (gap > 12 ? "\t" : " ") + item.str;
        })
        .join(""),
    )
    .join("\n");
}
export function parseLabText(text, dateInfo = {}) {
  const rows = [],
    warnings = [];
  let priorName = "",
    pending = "";
  const lines = String(text)
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  for (const line of lines) {
    if (line.length > 1500 || header.test(line)) {
      pending = "";
      continue;
    }
    const units = [...line.matchAll(unitPattern)];
    const unit = units[0]?.[0]?.replace(/\s/g, "") || "";
    const clean = line
      .replace(/\b25\s+OH\b/gi, "25-OH")
      .replace(/\bB\s+(12|6|1|2)\b/gi, "B$1")
      .replace(unitPattern, " ")
      .replace(/[|\t]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    let match = clean.match(
      new RegExp(
        `^(.*?)\\s+([<>≤≥]?\\s*${numberPattern}|${qualitative})(?:\\s+|$)(.*)$`,
        "i",
      ),
    );
    if (!match)
      match = clean.match(
        new RegExp(
          `^()([<>≤≥]?\\s*${numberPattern}|${qualitative})(?:\\s+|$)(.*)$`,
          "i",
        ),
      );
    if (!match) {
      if (
        letters.test(clean) &&
        !unit &&
        clean.length < 90 &&
        !/\d{4}/.test(clean)
      )
        pending = clean;
      continue;
    }
    let name = match[1].replace(/[\s:|.*]+$/g, "").trim();
    let doubtful = false,
      warning = "";
    if (!letters.test(name) || unitOnly.test(name)) {
      if (pending) {
        name = pending;
        pending = "";
      } else if (priorName && unit) {
        name = priorName;
        doubtful = true;
        warning =
          "Posible resultado alternativo en otra unidad; coteja el nombre y selecciona solo si corresponde.";
      } else {
        warnings.push(
          "Línea sin nombre de examen reconocible: " + line.slice(0, 100),
        );
        continue;
      }
    }
    const rest = match[3].trim();
    if (
      /^[a-záéíóúñ]/i.test(rest) &&
      !/^((valores?|rangos?|referencias?|normal|adultos?|hombres|mujeres|positivo|negativo)\b)/i.test(
        rest,
      )
    ) {
      warnings.push("Revisa la línea: " + line.slice(0, 100));
      continue;
    }
    const ref = rest.match(
      new RegExp(
        `(${numberPattern})\\s*(?:[-–]|a|hasta)\\s*(${numberPattern})`,
        "i",
      ),
    );
    const single = rest.match(new RegExp(`([<>≤≥])\\s*(${numberPattern})`));
    let low = ref?.[1] || "",
      high = ref?.[2] || "";
    if (!ref && single) {
      if (["<", "≤"].includes(single[1])) high = single[2];
      else low = single[2];
    }
    if (/hombres|mujeres|niños|embaraz|\b\d+\s*años/i.test(rest)) {
      doubtful = true;
      warning =
        "Referencia dependiente de sexo/edad: revisa los límites aplicables.";
    }
    if (
      [match[2], low, high].some((v) => /^[1-9]\d*[.,]\d{3}$/.test(v.trim()))
    ) {
      doubtful = true;
      warning =
        "Separador decimal o de miles ambiguo; confirma el número en el informe.";
    }
    const value = numeric(match[2]);
    rows.push({
      name,
      value: value === null ? match[2].trim() : String(value),
      unit,
      referenceLow: low ? String(numeric(low) ?? low) : "",
      referenceHigh: high ? String(numeric(high) ?? high) : "",
      selected: !doubtful,
      warning,
    });
    priorName = name;
    pending = "";
    if (rows.length >= 200) {
      warnings.push("Límite de 200 resultados; revisa el resto del documento.");
      break;
    }
  }
  if (!dateInfo.date)
    warnings.push("Confirma la fecha de toma de muestra antes de guardar.");
  if (!rows.length)
    warnings.push(
      "No se reconocieron resultados con suficiente claridad; revisa el PDF y transcribe los datos necesarios.",
    );
  warnings.push(
    "Coteja los resultados y las unidades con el informe. Las filas dudosas no están seleccionadas.",
  );
  return { date: dateInfo.date || "", rows, warnings };
}
export function buildLabResults(rows) {
  return rows
    .filter((r) => r.selected)
    .map((r) => {
      const name = String(r.name || "").trim();
      if (!letters.test(name) || unitOnly.test(name))
        throw Error(
          "Revisa el nombre del examen; una unidad no es un nombre válido.",
        );
      const value = numeric(r.value),
        low = numeric(r.referenceLow),
        high = numeric(r.referenceHigh);
      if (!String(r.value ?? "").trim())
        throw Error("Completa el resultado del examen.");
      if (
        (r.referenceLow?.trim() && low === null) ||
        (r.referenceHigh?.trim() && high === null) ||
        (low !== null && high !== null && low > high)
      )
        throw Error("Revisa los límites de referencia del examen.");
      return {
        kind: "lab",
        data: {
          name,
          ...(value === null
            ? { qualitative: String(r.value).trim() }
            : { value }),
          ...(r.unit?.trim() ? { unit: r.unit.trim() } : {}),
          ...(low !== null ? { referenceLow: low } : {}),
          ...(high !== null ? { referenceHigh: high } : {}),
        },
      };
    });
}
export function normalizeHabitsForDisplay(data) {
  return {
    ...data,
    ...(typeof data.adherence === "number"
      ? { adherence: data.adherence * 10 }
      : {}),
  };
}
