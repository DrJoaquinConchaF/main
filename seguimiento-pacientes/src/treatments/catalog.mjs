const entry = (id, kind, name, doses = [], clickCounting = false) => ({
  id,
  kind,
  name,
  doses,
  clickCounting,
});
export const defaultCatalog = [
  entry(
    "wegovy",
    "medication",
    "Wegovy",
    ["0.25 mg", "0.5 mg", "1 mg", "1.7 mg", "2.4 mg"],
    true,
  ),
  entry(
    "ozempic",
    "medication",
    "Ozempic",
    ["0.25 mg", "0.5 mg", "1 mg"],
    true,
  ),
  entry("tirzepatida", "medication", "Tirzepatida", [
    "2.5 mg",
    "5 mg",
    "7.5 mg",
    "10 mg",
    "12.5 mg",
    "15 mg",
  ]),
  entry("contrave", "medication", "Contrave", ["8 mg / 90 mg por comprimido"]),
  entry("fentermina", "medication", "Fentermina", ["18.75 mg", "37.5 mg"]),
  entry("orlistat", "medication", "Orlistat", ["60 mg", "120 mg"]),
  entry("topiramato", "medication", "Topiramato", ["25 mg", "50 mg", "100 mg"]),
  entry("samexid", "medication", "Samexid", ["30 mg", "50 mg", "70 mg"]),
  entry("rybelsus", "medication", "Rybelsus", ["3 mg", "7 mg", "14 mg"]),
  entry("whey", "supplement", "Whey protein", ["20 g", "25 g", "30 g"]),
  entry("vegetal", "supplement", "Proteína vegetal", ["20 g", "25 g", "30 g"]),
  entry("creatina", "supplement", "Creatina", ["3 g", "5 g"]),
  entry("hierro-oral", "supplement", "Hierro oral", []),
  entry("hierro-ev", "supplement", "Hierro endovenoso", []),
  entry("b12-oral", "supplement", "Vitamina B12 oral", ["500 µg", "1000 µg"]),
  entry("b12-im", "supplement", "Vitamina B12 inyectable", ["1 mg"]),
  entry("d-oral", "supplement", "Vitamina D oral", [
    "1000 UI",
    "2000 UI",
    "4000 UI",
  ]),
  entry("d-gotas", "supplement", "Vitamina D en gotas", []),
  entry("zinc", "supplement", "Zinc oral", []),
  entry("cafeina", "supplement", "Cafeína", ["100 mg", "200 mg"]),
  entry("betaalanina", "supplement", "Beta-alanina", ["1.6 g", "3.2 g"]),
  entry("omega3", "supplement", "Omega 3", []),
  entry("magnesio", "supplement", "Magnesio", []),
  entry("multivit", "supplement", "Multivitamínico", []),
];
export function validateCatalog(items) {
  if (!Array.isArray(items) || items.length > 250)
    return "El catálogo admite hasta 250 productos.";
  const ids = new Set(),
    names = new Set();
  for (const e of items) {
    if (
      !e ||
      typeof e !== "object" ||
      Object.keys(e).some(
        (k) => !["id", "kind", "name", "doses", "clickCounting"].includes(k),
      ) ||
      typeof e.id !== "string" ||
      !e.id ||
      e.id.length > 80 ||
      !["medication", "supplement"].includes(e.kind) ||
      typeof e.name !== "string" ||
      !e.name.trim() ||
      e.name.length > 100 ||
      typeof e.clickCounting !== "boolean" ||
      !Array.isArray(e.doses) ||
      e.doses.length > 40 ||
      e.doses.some((d) => typeof d !== "string" || !d.trim() || d.length > 120)
    )
      return "Revisa nombre, tipo y dosis del catálogo.";
    const name = e.kind + "|" + e.name.trim().toLocaleLowerCase("es");
    if (ids.has(e.id) || names.has(name))
      return "Hay productos duplicados en el catálogo.";
    ids.add(e.id);
    names.add(name);
  }
  return null;
}
export function selectedProduct(values, name) {
  return values.some(
    (m) =>
      m.name.trim().toLocaleLowerCase("es") ===
      name.trim().toLocaleLowerCase("es"),
  );
}
export function toggleProduct(values, entry, checked) {
  if (!checked) return values.filter((m) => !selectedProduct([m], entry.name));
  if (selectedProduct(values, entry.name)) return values;
  return [...values, { name: entry.name, dose: "", frequency: "", notes: "" }];
}
const marker = "Con conteo de clics";
export const hasClicks = (notes) =>
  String(notes || "")
    .split("\n")
    .some((line) => line.startsWith(marker));
export function setClicks(notes, enabled) {
  const lines = String(notes || "")
    .split("\n")
    .filter((line) => !line.startsWith(marker));
  return [...(enabled ? [marker] : []), ...lines].filter(Boolean).join("\n");
}
