export const bodyMetrics = [
  {
    key: "weight",
    label: "Peso",
    unit: "kg",
    color: "#881b3a",
    soft: "#f7e5eb",
  },
  {
    key: "fat",
    label: "Masa grasa",
    unit: "kg",
    color: "#b78308",
    soft: "#fff3cc",
  },
  {
    key: "muscle",
    label: "Masa muscular esquelética",
    unit: "kg",
    color: "#d34c74",
    soft: "#fbe5ed",
  },
  {
    key: "fatPercent",
    label: "Grasa corporal",
    unit: "%",
    deltaUnit: "puntos porcentuales",
    color: "#b17405",
    soft: "#fff0d6",
  },
  {
    key: "visceralFat",
    label: "Grasa visceral",
    unit: "nivel",
    deltaUnit: "niveles",
    color: "#725299",
    soft: "#eee7f7",
  },
];
export const measureMetrics = [
  {
    key: "weight",
    label: "Peso",
    unit: "kg",
    color: "#881b3a",
    soft: "#f7e5eb",
  },
  {
    key: "bmi",
    label: "IMC",
    unit: "kg/m²",
    color: "#725299",
    soft: "#eee7f7",
  },
  {
    key: "waistNavel",
    label: "Cintura al ombligo",
    unit: "cm",
    color: "#b45b32",
    soft: "#fceadd",
  },
  {
    key: "waistWHO",
    label: "Cintura OMS",
    unit: "cm",
    color: "#287565",
    soft: "#e3f3ec",
  },
  {
    key: "waistSmall",
    label: "Cintura menor",
    unit: "cm",
    color: "#d34c74",
    soft: "#fbe5ed",
  },
  {
    key: "hip",
    label: "Cadera",
    unit: "cm",
    color: "#526fa0",
    soft: "#e9eff9",
  },
];
const numeric = (value) => typeof value === "number" && Number.isFinite(value);
export function seriesFor(records, kind, key, plans = []) {
  return records
    .filter((r) => r.kind === kind)
    .map((r) => {
      const data = { ...r.data };
      if (kind === "anthropometry") {
        // Recompute indices from measurements of this same record only.
        data.bmi =
          numeric(data.weight) && numeric(data.height) && data.height > 0
            ? data.weight / (data.height / 100) ** 2
            : null;
        data.waistHipRatio =
          numeric(data.waistWHO) && numeric(data.hip) && data.hip > 0
            ? data.waistWHO / data.hip
            : null;
        data.waistHeightRatio =
          numeric(data.waistWHO) && numeric(data.height) && data.height > 0
            ? data.waistWHO / data.height
            : null;
      }
      const attention =
        r.attention_date || (kind === "anthropometry" ? r.date : null);
      return {
        id: r.id,
        date: r.date,
        attention,
        value: data[key],
        created: r.created_at || "",
        treatment:
          plans
            .find((p) => p.date === attention)
            ?.data.medications?.map((m) =>
              [m.name, m.dose].filter(Boolean).join(" "),
            )
            .join("; ") || "Sin tratamiento registrado para esta atención",
      };
    })
    .filter((r) => numeric(r.value))
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        a.created.localeCompare(b.created) ||
        String(a.id).localeCompare(String(b.id)),
    );
}
export function ratioReference(metric, sex) {
  if (metric === "waistHeightRatio")
    return {
      limit: 0.5,
      label: "Referencia 0,50 · ambos sexos",
      source:
        "NICE NG246: adultos con IMC menor de 35; mantener cintura menor que la mitad de la estatura.",
    };
  if (sex === "male" || sex === "female")
    return {
      limit: sex === "male" ? 0.9 : 0.85,
      label: `Referencia ${sex === "male" ? "0,90 · masculino" : "0,85 · femenino"}`,
      source:
        "OMS, Waist Circumference and Waist–Hip Ratio (2008): umbral de riesgo aumentado en adultos.",
    };
  return null;
}
export function referenceSex(bundle) {
  const sex = [...(bundle.visits || [])]
    .sort((a, b) => a.date.localeCompare(b.date))
    .at(-1)?.data.demographics?.sex;
  if (sex === "male" || sex === "female") return sex;
  const legacy = [...(bundle.plans || [])]
    .sort((a, b) => a.date.localeCompare(b.date))
    .at(-1)?.data.energy?.sex;
  return legacy === "Masculino"
    ? "male"
    : legacy === "Femenino"
      ? "female"
      : "";
}
