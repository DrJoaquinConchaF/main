function clean(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/años?\.?/g, "")
    .replace(/kgs?\.?/g, "")
    .trim();
}
export function ageValue(value) {
  const s = clean(value);
  if (!/^\d+(?:[.,]\d+)?$/.test(s)) return null;
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) && n >= 0 && n <= 150 ? n : null;
}
export function ageRange(value) {
  const exact = ageValue(value);
  if (exact !== null) return [exact, exact];
  const match = clean(value).match(
    /^(\d+(?:[.,]\d+)?)\s*(?:a|al|[-–])\s*(\d+(?:[.,]\d+)?)$/,
  );
  if (!match) return null;
  const a = ageValue(match[1]),
    b = ageValue(match[2]);
  return a !== null && b !== null && a <= b ? [a, b] : null;
}
export function weightValue(value) {
  const s = clean(value).replace(/^(?:aprox\.?|~|≈)\s*/, "");
  if (!/^\d+(?:[.,]\d+)?$/.test(s)) return null;
  const n = Number(s.replace(",", "."));
  return n > 0 && Number.isFinite(n) ? n : null;
}
export function historyYear(entry, demographics, date) {
  const range = ageRange(entry.age);
  if (!range) return "";
  const birth = demographics?.birthDate;
  let base = null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(birth || "")) base = Number(birth.slice(0, 4));
  else {
    const age = ageValue(demographics?.age);
    if (age !== null && /^\d{4}-/.test(date || ""))
      base = Number(date.slice(0, 4)) - age;
  }
  if (base === null) return "";
  const from = Math.floor(base + range[0]),
    to = Math.floor(base + range[1]);
  return from === to ? String(from) : `${from}–${to}`;
}
export function historyPlot(values) {
  return values
    .map((v, index) => ({
      ...v,
      index,
      age: ageValue(v.age),
      weight: weightValue(v.weight),
    }))
    .filter((v) => v.age !== null && v.weight !== null)
    .sort((a, b) => a.age - b.age || a.index - b.index);
}
export function historyForSave(values, demographics, date) {
  return values.map((v) => {
    const computed = historyYear(v, demographics, date);
    return computed
      ? {
          ...v,
          ...(v.year && v.year !== computed && !v.originalYear
            ? { originalYear: v.year }
            : {}),
          year: computed,
        }
      : v;
  });
}
