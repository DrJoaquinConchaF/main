const penPrefix = "Pluma utilizada: ";
export function readDevice(treatment) {
  const notes = String(treatment.notes || "");
  const pen =
    notes
      .split("\n")
      .find((line) => line.startsWith(penPrefix))
      ?.slice(penPrefix.length) || "";
  const dose = String(treatment.dose || "");
  const match = dose.match(/^(.*?)\s*\(([^()]+)\s+clics\)\s*$/i);
  return {
    pen,
    dose: match ? match[1].trim() : dose,
    clicks: match ? match[2].trim() : "",
  };
}
export function writeDevice(treatment, patch) {
  const previous = readDevice(treatment);
  const current = { ...previous, ...patch };
  if (
    (patch.pen !== undefined && patch.pen !== previous.pen) ||
    (patch.dose !== undefined && patch.dose !== previous.dose)
  )
    current.clicks = "";
  const lines = String(treatment.notes || "")
    .split("\n")
    .filter((line) => !line.startsWith(penPrefix))
    .map((line) =>
      line === "Con conteo de clics · lápiz y número de clics: por completar"
        ? "Con conteo de clics"
        : line,
    );
  return {
    ...treatment,
    dose:
      current.dose + (current.clicks ? " (" + current.clicks + " clics)" : ""),
    notes: [...(current.pen ? [penPrefix + current.pen] : []), ...lines]
      .filter(Boolean)
      .join("\n"),
  };
}
export const wegovyResources = [
  {
    id: "guide",
    title: "Guía de uso de Wegovy (revisar presentación)",
    url: "https://www.wegovy.com/obesity/starting-wegovy/starting-wegovy-pen.html",
    note: "Sitio de EE. UU.; puede corresponder a una pluma monodosis. Comprueba que la guía coincida con el dispositivo del paciente.",
  },
  {
    id: "video",
    title: "Vídeo aportado sobre conteo de clics",
    url: "https://youtu.be/P272OrKhqvk?si=syV9PfywPQTdifss",
    note: "Material aportado por el profesional. Revisa que corresponda a la pluma y al esquema registrado antes de compartir.",
  },
  {
    id: "benefits",
    title: "NovoCare Beneficios Chile",
    url: "https://www.novocarebeneficios.cl",
    note: "Consulta los beneficios disponibles, medicamentos participantes y requisitos de inscripción. No se han verificado condiciones ni descuentos vigentes.",
  },
];
export const benefitsExplanation =
  "Consulta en NovoCare Beneficios Chile si tu medicamento participa en programas de apoyo o beneficios de compra y qué requisitos de inscripción se aplican. La disponibilidad y las condiciones vigentes las informa el programa.";
export function resourceText(settings = {}) {
  return wegovyResources
    .filter((r) => settings[r.id] === true)
    .map((r) => {
      if (r.id === "benefits")
        return (
          (settings.benefitsExplanation ?? benefitsExplanation) + "\n" + r.url
        );
      return (
        r.title +
        ":\n" +
        r.url +
        "\nUtiliza únicamente las instrucciones que correspondan a la pluma y al esquema indicados en tu consulta."
      );
    })
    .join("\n\n");
}
export function devicePrescription(medications) {
  return medications
    .filter((m) => /\bwegovy\b/i.test(m.name))
    .map((m) => {
      const d = readDevice(m);
      const lines = [
        m.name,
        d.pen
          ? "Pluma/lápiz: " + d.pen
          : "Pluma/lápiz: pendiente de especificar",
        m.dose ? "Dosis indicada: " + m.dose : "Dosis: pendiente",
        m.frequency ? "Frecuencia: " + m.frequency : "Frecuencia: pendiente",
      ];
      const other = String(m.notes || "")
        .split("\n")
        .filter(
          (line) =>
            line &&
            !line.startsWith(penPrefix) &&
            !line.startsWith("Con conteo de clics"),
        );
      if (d.clicks)
        lines.push(
          "Conteo registrado por el profesional para esta pluma; no trasladar a otra presentación.",
        );
      return [...lines, ...other].join("\n");
    })
    .join("\n\n");
}
export function validateDevice(treatment) {
  if (!treatment || typeof treatment !== "object")
    return "Tratamiento inválido.";
  const d = readDevice(treatment);
  if (d.clicks) {
    if (!d.dose.trim())
      return "Completa la dosis administrada además de los clics.";
    if (!d.pen.trim())
      return "Especifica la pluma exacta para los clics indicados.";
    if (!/^\d+(?:\s*[-–]\s*\d+)?$/.test(d.clicks))
      return "Registra un número o rango de clics (por ejemplo, 37–38).";
    const values = d.clicks.split(/[-–]/).map(Number);
    if (
      values.some((v) => v <= 0) ||
      (values.length === 2 && values[0] > values[1])
    )
      return "Revisa el número o rango de clics registrado.";
  }
  if (
    d.pen &&
    String(treatment.notes || "").includes("Con conteo de clics") &&
    !d.clicks
  )
    return "Completa los clics indicados para la pluma seleccionada.";
  return null;
}
export function canUseDevicePrescription(medications) {
  const drugs = medications.filter((m) => m && /\bwegovy\b/i.test(m.name));
  return (
    drugs.length > 0 &&
    drugs.every(
      (m) =>
        typeof m.dose === "string" &&
        m.dose.trim() &&
        typeof m.frequency === "string" &&
        m.frequency.trim() &&
        readDevice(m).pen.trim() &&
        !validateDevice(m),
    )
  );
}
