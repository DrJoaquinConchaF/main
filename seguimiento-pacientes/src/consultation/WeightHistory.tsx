import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  historyYear,
  historyPlot,
  historyForSave,
  ageValue,
  weightValue,
} from "./weight-history.mjs";
export function WeightHistory({
  values,
  onChange,
  demographics,
  date,
  onDemographicsChange,
  previousHistory,
}: any) {
  const plot = historyPlot(values);
  const update = (i: number, key: string, value: string) => {
    const next = structuredClone(values);
    next[i][key] = value;
    onChange(next);
  };
  const loaded = historyForSave(values, demographics, date);
  return (
    <section className="cw-card" aria-label="Historia del peso">
      <div className="cw-card-head">
        <div>
          <h2>Historia del peso</h2>
          <p>
            Ingresa la edad; el año se estima automáticamente. Todos los relatos
            se conservan en la tabla.
          </p>
        </div>
      </div>
      <div className="cw-grid">
        <label className="cw-field">
          Fecha de nacimiento para historia de peso
          <input
            type="date"
            aria-label="Fecha de nacimiento para historia de peso"
            value={demographics.birthDate || ""}
            onChange={(e) =>
              onDemographicsChange({
                ...demographics,
                birthDate: e.target.value,
              })
            }
          />
        </label>
        {!demographics.birthDate && (
          <>
            <label className="cw-field">
              Edad actual para estimar años
              <input
                aria-label="Edad actual para estimar años"
                value={demographics.age ?? ""}
                onChange={(e) =>
                  onDemographicsChange({ ...demographics, age: e.target.value })
                }
              />
            </label>
            <small>
              Sin fecha de nacimiento, los años son aproximados según la edad
              actual y la fecha de esta atención.
            </small>
          </>
        )}
      </div>
      {!values.length && previousHistory?.data.weightHistory?.length > 0 && (
        <button
          onClick={() =>
            onChange(structuredClone(previousHistory.data.weightHistory))
          }
        >
          Traer historia registrada en el control del{" "}
          {previousHistory.date.split("-").reverse().join("-")}
        </button>
      )}
      {values.map((v: any, i: number) => (
        <article className="cw-repeater" key={v.key}>
          <div className="cw-grid">
            {[
              ["stage", "Etapa de vida"],
              ["age", "Edad aproximada"],
              ["weight", "Peso aproximado (kg)"],
              ["event", "Evento / contexto"],
            ].map(([key, label]) => (
              <label className="cw-field" key={key}>
                {label + " " + (i + 1)}
                <input
                  aria-label={label + " " + (i + 1)}
                  value={v[key] ?? ""}
                  placeholder={
                    key === "age"
                      ? "Ej.: 27; también puedes registrar un rango"
                      : key === "weight"
                        ? "Número para graficar; texto para conservar el relato"
                        : undefined
                  }
                  onChange={(e) => update(i, key, e.target.value)}
                />
              </label>
            ))}
            <label className="cw-field">
              Año calculado {i + 1}
              <input
                aria-label={"Año calculado " + (i + 1)}
                readOnly
                value={historyYear(v, demographics, date)}
                placeholder="Completa edad y fecha de nacimiento o edad actual"
              />
              {(v.originalYear ||
                (v.year && v.year !== historyYear(v, demographics, date))) && (
                <small>
                  Año registrado anteriormente: {v.originalYear || v.year}
                </small>
              )}
            </label>
          </div>
          <button
            onClick={() =>
              onChange(values.filter((_: any, j: number) => j !== i))
            }
          >
            Quitar punto
          </button>
        </article>
      ))}
      <button
        onClick={() =>
          onChange([
            ...values,
            {
              key: crypto.randomUUID(),
              stage: "",
              age: "",
              year: "",
              weight: "",
              event: "",
            },
          ])
        }
      >
        Agregar etapa / evento
      </button>
      {!!values.length && (
        <>
          <p className="cw-muted">
            {plot.length} de {values.length} entradas se pueden graficar. Se
            requiere una edad puntual y un peso numérico; los rangos y relatos
            siguen visibles abajo.
          </p>
          <div className="compact-table">
            <table>
              <thead>
                <tr>
                  <th>Edad</th>
                  <th>Año estimado</th>
                  <th>Peso / relato</th>
                  <th>Contexto</th>
                  <th>Gráfico</th>
                </tr>
              </thead>
              <tbody>
                {loaded.map((v: any, i: number) => (
                  <tr key={v.key}>
                    <td>{v.age ?? "Sin edad"}</td>
                    <td>{v.year || "Sin calcular"}</td>
                    <td>{v.weight || "Sin peso"}</td>
                    <td>
                      {[v.stage, v.event].filter(Boolean).join(" · ") || "—"}
                    </td>
                    <td>
                      {ageValue(v.age) === null
                        ? "Edad en rango o texto"
                        : weightValue(v.weight) === null
                          ? "Sin peso numérico"
                          : "Incluido"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {plot.length > 0 && (
        <div className="cw-chart">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={plot}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="age"
                type="number"
                domain={
                  plot.length === 1
                    ? [Math.max(0, plot[0].age - 1), plot[0].age + 1]
                    : ["dataMin", "dataMax"]
                }
                label={{
                  value: "Edad aproximada",
                  position: "insideBottom",
                  offset: -3,
                }}
              />
              <YAxis unit=" kg" />
              <Tooltip
                formatter={(value: any) => [value + " kg", "Peso recordado"]}
                labelFormatter={(age: any, p: any) =>
                  "Edad " + age + " · " + (p?.[0]?.payload?.event || "")
                }
              />
              <Line
                dataKey="weight"
                stroke="var(--brand-accent)"
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
