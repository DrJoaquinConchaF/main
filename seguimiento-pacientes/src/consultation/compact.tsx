import {
  parseLabText,
  buildLabResults,
  layoutPdfItems,
  normalizeHabitsForDisplay,
  labDirection,
  labReference,
  labNumber,
  numeric,
} from "./labs.mjs";
import "./compact.css";
const dateLabel = (date: string) =>
  date?.split("-").reverse().join("-") || "Sin fecha";
export function LabValue({ data }: any) {
  const direction = labDirection(data);
  const value =
    typeof data.value === "number"
      ? labNumber(data.value)
      : data.qualitative || data.value || "—";
  return (
    <span className="compact-lab-value">
      {direction ? (
        <strong>
          {value}{" "}
          <span
            aria-label={
              direction === "high" ? "Sobre referencia" : "Bajo referencia"
            }
          >
            {direction === "high" ? "↑" : "↓"}
          </span>
        </strong>
      ) : (
        <span>{value}</span>
      )}{" "}
      {data.unit || ""} <small>{labReference(data)}</small>
    </span>
  );
}
export function LabResults({ records, title = "Laboratorio" }: any) {
  return (
    <section className="compact-labs" aria-label={title}>
      <h3>{title}</h3>
      {records.length ? (
        <div className="compact-table">
          <table>
            <thead>
              <tr>
                <th>Examen</th>
                <th>Resultado (referencia del informe)</th>
                <th>Muestra</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r: any) => (
                <tr key={r.id}>
                  <th>{r.data.name}</th>
                  <td>
                    <LabValue data={r.data} />
                  </td>
                  <td>{dateLabel(r.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="cw-muted">Sin resultados asociados a esta atención.</p>
      )}
    </section>
  );
}
function Summary({ patient, records, plans, onOpen, onReview }: any) {
  const dates = [
    ...new Set(
      [
        ...records.map(
          (r: any) =>
            r.attention_date ||
            (!["lab", "inbody"].includes(r.kind) ? r.date : null),
        ),
        ...plans.map((p: any) => p.date),
      ].filter(Boolean),
    ),
  ].sort() as string[];
  const latest = dates.at(-1);
  const current = records.filter(
    (r: any) =>
      (r.attention_date ||
        (!["lab", "inbody"].includes(r.kind) ? r.date : null)) === latest,
  );
  const anthro = current.filter((r: any) => r.kind === "anthropometry").at(-1),
    body = current.filter((r: any) => r.kind === "inbody").at(-1),
    habits = current.filter((r: any) => r.kind === "habits").at(-1);
  const plan = plans.find((p: any) => p.date === latest);
  const labs = current.filter((r: any) => r.kind === "lab");
  const exercises = current.filter((r: any) => r.kind === "exercise");
  const stats = [
    ["Peso", anthro?.data.weight ?? body?.data.weight, "kg"],
    [
      "Pasos · promedio diario del último mes",
      habits?.data.stepsMonthly,
      "pasos/día",
    ],
    [
      "Adherencia al plan",
      typeof habits?.data.adherence === "number"
        ? habits.data.adherence * 10
        : null,
      "%",
    ],
    ["Sueño", habits?.data.sleep, "h/noche"],
  ];
  return (
    <section
      className="patient-readonly-summary"
      aria-label="Resumen del último control"
    >
      <header>
        <div>
          <span className="eyebrow">RESUMEN · SOLO LECTURA</span>
          <h2>
            {latest
              ? "Último control · " + dateLabel(latest)
              : "Sin controles registrados"}
          </h2>
          <p>
            La atención se completa y guarda únicamente en Consulta clínica.
          </p>
        </div>
        <button className="primary" onClick={() => onOpen()}>
          Registrar atención
        </button>
      </header>
      {latest && (
        <>
          <div className="compact-summary-stats">
            {stats.map(([label, value, unit]: any) => (
              <article key={label}>
                <small>{label}</small>
                <strong>
                  {value === undefined || value === null
                    ? "Sin registro"
                    : `${labNumber(value)} ${unit}`}
                </strong>
              </article>
            ))}
          </div>
          <div className="compact-summary-grid">
            <section>
              <h3>Tratamiento registrado</h3>
              {[
                ["Medicamentos", plan?.data.medications || []],
                ["Suplementos", plan?.data.supplements || []],
              ].map(([label, values]: any) => (
                <div key={label}>
                  <strong>{label}</strong>
                  {values.length ? (
                    <ul>
                      {values.map((m: any, i: number) => (
                        <li key={i}>
                          {[m.name, m.dose, m.frequency]
                            .filter(Boolean)
                            .join(" · ")}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Sin registro.</p>
                  )}
                </div>
              ))}
            </section>
            <section>
              <h3>Entrenamientos</h3>
              {exercises.length ? (
                <ul>
                  {exercises.map((r: any) => (
                    <li key={r.id}>
                      {r.data.modality}: {labNumber(r.data.sessions)}{" "}
                      sesiones/semana × {labNumber(r.data.minutes)} min
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Sin registro.</p>
              )}
              <h3>Próximo control recomendado</h3>
              <p>
                {plan?.data.nextVisit
                  ? dateLabel(plan.data.nextVisit)
                  : "Sin definir"}
              </p>
            </section>
          </div>
          <LabResults records={labs} />
        </>
      )}
      <div className="compact-summary-actions">
        {latest && (
          <button onClick={() => onOpen(latest)}>
            Revisar último control en consulta
          </button>
        )}
        <button onClick={onReview}>Ver evolución</button>
      </div>
      <details>
        <summary>Controles anteriores ({dates.length})</summary>
        <div className="compact-summary-actions">
          {dates
            .slice()
            .reverse()
            .map((d) => (
              <button key={d} onClick={() => onOpen(d)}>
                {dateLabel(d)}
              </button>
            ))}
        </div>
      </details>
    </section>
  );
}
const cache = new WeakMap();
function importComponent(React: any) {
  let C = cache.get(React);
  if (C) return C;
  C = function ImportRows({ rows, type, onChange, onRows, fields }: any) {
    const [editing, setEditing] = React.useState(null as number | null);
    return (
      <div className="compact-import-scroll">
        <table className="compact-import-table">
          <thead>
            <tr>
              <th>Incluir</th>
              <th>Examen / parámetro</th>
              <th>Valor (referencia)</th>
              <th>Revisar</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any, i: number) => {
              const data = {
                value: numeric(r.value),
                qualitative: r.value,
                unit: r.unit,
                referenceLow: numeric(r.referenceLow),
                referenceHigh: numeric(r.referenceHigh),
              };
              return (
                <React.Fragment key={i}>
                  <tr>
                    <td>
                      <input
                        aria-label={"Incluir resultado " + (i + 1)}
                        type="checkbox"
                        checked={r.selected}
                        onChange={(e) =>
                          onChange(i, "selected", e.target.checked)
                        }
                      />
                    </td>
                    <th>
                      {r.name || "Nombre por revisar"}
                      {r.warning && (
                        <small className="compact-review-warning">
                          {r.warning}
                        </small>
                      )}
                    </th>
                    <td>
                      <LabValue data={data} />
                    </td>
                    <td>
                      <button
                        type="button"
                        aria-expanded={editing === i}
                        onClick={() => setEditing(editing === i ? null : i)}
                      >
                        Editar {i + 1}
                      </button>
                    </td>
                  </tr>
                  {editing === i && (
                    <tr>
                      <td colSpan={4}>
                        {r.warning && (
                          <p className="compact-review-warning">{r.warning}</p>
                        )}
                        <div className="compact-import-editor">
                          {type === "inbody" ? (
                            <label>
                              Parámetro
                              <select
                                value={r.key || ""}
                                onChange={(e) => {
                                  const f = fields.find(
                                    (f: any) => f.key === e.target.value,
                                  );
                                  onRows((old: any[]) =>
                                    old.map((v, j) =>
                                      j === i
                                        ? {
                                            ...v,
                                            key: f.key,
                                            name: f.label,
                                            unit: f.unit || "",
                                          }
                                        : v,
                                    ),
                                  );
                                }}
                              >
                                {fields
                                  .filter((f: any) => !f.text)
                                  .map((f: any) => (
                                    <option key={f.key} value={f.key}>
                                      {f.label}
                                    </option>
                                  ))}
                              </select>
                            </label>
                          ) : (
                            <label>
                              Nombre del examen
                              <input
                                aria-label={"Nombre del examen " + (i + 1)}
                                value={r.name}
                                onChange={(e) =>
                                  onChange(i, "name", e.target.value)
                                }
                              />
                            </label>
                          )}
                          {[
                            ["value", "Resultado"],
                            ["unit", "Unidad"],
                            ...(type === "lab"
                              ? [
                                  ["referenceLow", "Límite inferior"],
                                  ["referenceHigh", "Límite superior"],
                                ]
                              : []),
                          ].map(([k, label]) => (
                            <label key={k}>
                              {label}
                              <input
                                aria-label={label + " " + (i + 1)}
                                readOnly={type === "inbody" && k === "unit"}
                                value={r[k]}
                                onChange={(e) => onChange(i, k, e.target.value)}
                              />
                            </label>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };
  cache.set(React, C);
  return C;
}
export function installCompactClinical() {
  const w = window as any;
  w.__compactClinical = {
    parseLabText,
    buildLabResults,
    layoutPdfItems,
    normalizeHabitsForDisplay,
    summary: (props: any, React: any) => React.createElement(Summary, props),
    importReview: (props: any, React: any) =>
      React.createElement(importComponent(React), props),
  };
  window.dispatchEvent(new Event("compact-clinical-ready"));
}
