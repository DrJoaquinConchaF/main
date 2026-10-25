import React from "react";
import { num, format, display } from "./model";

const paths: Record<string, string> = {
  arrow: "M5 12h14m-6-6 6 6-6 6",
  history: "M9 3H5v18h14V3h-4M9 3v4h6V3H9zm-1 9h8m-8 4h6",
  consultation:
    "M8 3v5a4 4 0 0 0 8 0V3M6 3h4m4 0h4m-6 9v3a5 5 0 0 0 10 0v-3m-2 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0",
  habits: "M3 12h4l3-8 4 16 3-8h4",
  measurements: "M5 3h14v18H5zM5 7h5m-5 4h3m-3 4h5m-5 4h3",
  energy: "m13 2-9 12h7l-1 8 10-13h-7l1-7z",
  closing: "M5 3h14v18H5zM8 9l2 2 5-5m-7 9h8m-8 3h6",
  evolution: "M3 3v18h18M7 15l4-5 4 3 6-8",
  templates: "M8 3h10l3 3v15H8zM3 7v14m9-11h5m-5 4h5m-5 4h3",
  water: "M12 2S5 10 5 14a7 7 0 0 0 14 0c0-4-7-12-7-12zM8 14a4 4 0 0 0 4 4",
  sleep: "M20 14A9 9 0 0 1 10 3a9 9 0 1 0 10 11z",
  weight:
    "M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2zm3 4a5 5 0 0 1 8 0l-4 4-4-4z",
};
export function Icon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.consultation} />
    </svg>
  );
}
export const sectionLook: Record<
  string,
  { icon: string; tone: string; description: string }
> = {
  Antecedentes: {
    icon: "history",
    tone: "rose",
    description: "Conoce al paciente",
  },
  Consulta: {
    icon: "consultation",
    tone: "rose",
    description: "Objetivos y tratamiento",
  },
  "Hábitos y alimentación": {
    icon: "habits",
    tone: "mint",
    description: "Rutinas y alimentación",
  },
  Mediciones: {
    icon: "measurements",
    tone: "peach",
    description: "Antropometría y signos",
  },
  "Energía y pauta": {
    icon: "energy",
    tone: "lavender",
    description: "Gasto, macros y porciones",
  },
  Cierre: {
    icon: "closing",
    tone: "mint",
    description: "Metas y próximos pasos",
  },
  Evolución: {
    icon: "evolution",
    tone: "lavender",
    description: "Compara los controles",
  },
  Configuración: {
    icon: "templates",
    tone: "rose",
    description: "Medicamentos y suplementos",
  },
  Plantillas: {
    icon: "templates",
    tone: "peach",
    description: "Tu biblioteca clínica",
  },
};
export function ConsultationOverview({ data, date, records, onSection }: any) {
  // Only actual measurements from this attention, never an energy reference weight.
  const body = records
    .filter(
      (r: any) => r.kind === "inbody" && (r.attention_date || r.date) === date,
    )
    .at(-1);
  const weight = num(data.measurements.weight) ?? num(body?.data.weight);
  const metrics = [
    {
      label: "Peso",
      value: weight,
      unit: "kg",
      icon: "weight",
      tone: "rose",
      section: "Mediciones",
    },
    {
      label: "Pasos diarios · promedio mensual",
      value: num(data.habits.stepsMonthly),
      unit: "pasos",
      icon: "habits",
      tone: "mint",
      section: "Hábitos y alimentación",
    },
    {
      label: "Sueño promedio",
      value: num(data.habits.sleep),
      unit: "h/noche",
      icon: "sleep",
      tone: "lavender",
      section: "Hábitos y alimentación",
    },
    {
      label: "Estrés percibido",
      value: num(data.habits.stress),
      unit: "/ 10",
      icon: "consultation",
      tone: "peach",
      section: "Hábitos y alimentación",
    },
  ];
  return (
    <section className="cw-overview" aria-label="Resumen de esta atención">
      <div className="cw-overview-heading">
        <div>
          <span className="cw-eyebrow">DATOS DE LA ATENCIÓN</span>
          <h2>Resumen del control</h2>
        </div>
        <span className="cw-date-chip">{display(date)}</span>
      </div>
      <div className="cw-metrics">
        {metrics.map((m) => (
          <button
            className="cw-metric"
            data-tone={m.tone}
            key={m.label}
            onClick={() => onSection(m.section)}
            aria-label={`${m.label}: ${m.value === null ? "Por registrar" : format(m.value) + " " + m.unit}. Abrir ${m.section}`}
          >
            <span className="cw-metric-icon">
              <Icon name={m.icon} />
            </span>
            <span className="cw-metric-label">{m.label}</span>
            <strong>
              {m.value === null ? (
                "Por registrar"
              ) : (
                <>
                  {format(m.value)} <small>{m.unit}</small>
                </>
              )}
            </strong>
            <span className="cw-metric-link">
              {m.value === null ? "Completar" : "Revisar"} <Icon name="arrow" />
            </span>
          </button>
        ))}
      </div>
      {num(data.measurements.weight) === null &&
        body?.data.weight != null &&
        body.date !== date && (
          <p className="cw-muted">
            Peso de InBody realizado el {display(body.date)}.
          </p>
        )}
      <div className="cw-quick-actions">
        <span>Continúa la consulta</span>
        {["Mediciones", "Energía y pauta", "Cierre", "Evolución"].map((s) => (
          <button key={s} onClick={() => onSection(s)}>
            <Icon name={sectionLook[s].icon} />
            {s}
            <span aria-hidden="true">→</span>
          </button>
        ))}
      </div>
    </section>
  );
}
