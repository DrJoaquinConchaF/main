import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import {
  bodyMetrics,
  measureMetrics,
  seriesFor,
  ratioReference,
  referenceSex,
} from "./model.mjs";
import { display } from "../workflow/model";
import "./body.css";
const valueFormat = (value: number, metric: any) =>
  new Intl.NumberFormat("es-CL", {
    maximumFractionDigits: metric.key.includes("Ratio") ? 3 : 1,
  }).format(value);
function Plot({ metric, points, reference }: any) {
  const latest = points.at(-1),
    first = points[0];
  return (
    <article
      className="bce-plot"
      style={
        {
          "--series": metric.color,
          "--series-soft": metric.soft,
        } as React.CSSProperties
      }
      aria-label={"Gráfico de " + metric.label}
    >
      <header>
        <div>
          <span className="bce-dot" />
          <h4>{metric.label}</h4>
          <small>{metric.unit || "índice"}</small>
        </div>
        <strong>
          {latest ? valueFormat(latest.value, metric) : "Sin datos"}
          <small>{latest ? " " + (metric.unit || "") : ""}</small>
        </strong>
      </header>
      {latest ? (
        <>
          <div
            className="bce-chart"
            role="img"
            aria-label={`${metric.label}: ${points.length} mediciones, última ${valueFormat(latest.value, metric)} ${metric.unit || ""}, ${display(latest.date)}`}
          >
            <ResponsiveContainer width="100%" height={210}>
              <BarChart
                data={points}
                margin={{ top: 18, right: 16, left: -14, bottom: 4 }}
                accessibilityLayer
              >
                <CartesianGrid
                  strokeDasharray="3 4"
                  vertical={false}
                  stroke="var(--brand-border)"
                />
                <XAxis
                  dataKey="id"
                  tickFormatter={(id: any) => {
                    const p = points.find((p: any) => p.id === id);
                    return p
                      ? display(p.date).slice(0, 6) + p.date.slice(2, 4)
                      : "";
                  }}
                  tick={{ fontSize: 10, fill: "var(--brand-muted)" }}
                  interval="preserveStartEnd"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={(value: number) =>
                    new Intl.NumberFormat("es-CL", {
                      maximumFractionDigits: metric.key.includes("Ratio")
                        ? 2
                        : 1,
                    }).format(value)
                  }
                  tick={{ fontSize: 10, fill: "var(--brand-muted)" }}
                  tickLine={false}
                  axisLine={false}
                  width={52}
                  domain={[
                    0,
                    (max: number) =>
                      Math.max(
                        max * 1.12,
                        reference?.limit ? reference.limit * 1.2 : 0,
                      ),
                  ]}
                />
                <Tooltip
                  cursor={{ fill: "var(--brand-soft)" }}
                  content={({ active, payload }: any) => {
                    const p = payload?.[0]?.payload;
                    return active && p ? (
                      <div className="bce-tooltip">
                        <strong>{display(p.date)}</strong>
                        <p>
                          {metric.label}: {valueFormat(p.value, metric)}{" "}
                          {metric.unit}
                        </p>
                        <p>
                          {p.attention
                            ? "Atención " + display(p.attention)
                            : "Sin atención asociada"}
                        </p>
                        <p>{p.treatment}</p>
                      </div>
                    ) : null;
                  }}
                />
                {reference && (
                  <ReferenceLine
                    y={reference.limit}
                    stroke="var(--brand-text)"
                    strokeDasharray="5 4"
                    strokeWidth={2}
                    ifOverflow="extendDomain"
                  />
                )}
                <Bar
                  dataKey="value"
                  name={metric.label}
                  fill={metric.color}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={38}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <footer>
            <span>Último: {display(latest.date)}</span>
            <span>
              {points.length > 1
                ? `${latest.value - first.value > 0 ? "+" : ""}${valueFormat(latest.value - first.value, metric)} ${metric.deltaUnit || metric.unit || ""} desde ${display(first.date)}`
                : "Primera medición"}
            </span>
          </footer>
          {reference && (
            <p className="bce-reference">
              Línea discontinua: {reference.label}. Último valor{" "}
              {latest.value >= reference.limit ? "en o sobre" : "bajo"} el
              umbral.
            </p>
          )}
        </>
      ) : (
        <p className="bce-empty">
          Aún no hay mediciones registradas para este parámetro.
        </p>
      )}
    </article>
  );
}
export function BodyEvolution({ bundle, onOriginal }: any) {
  const [view, setView] = useState("body"),
    [sex, setSex] = useState(() => referenceSex(bundle));
  const [selected, setSelected] = useState<string[]>(
    measureMetrics.map((m) => m.key),
  );
  const records = bundle.records || [],
    plans = bundle.plans || [];
  const collection =
    view === "body"
      ? bodyMetrics
      : view === "measures"
        ? measureMetrics.filter((m) => selected.includes(m.key))
        : [
            {
              key: "waistHipRatio",
              label: "Índice cintura/cadera",
              unit: "",
              color: "#881b3a",
              soft: "#f7e5eb",
            },
            {
              key: "waistHeightRatio",
              label: "Índice cintura/estatura",
              unit: "",
              color: "#287565",
              soft: "#e3f3ec",
            },
          ];
  return (
    <section className="bce" aria-label="Composición corporal y medidas">
      <header className="bce-heading">
        <div>
          <span className="bce-eyebrow">EVOLUCIÓN DEL PACIENTE</span>
          <h3>Los cambios, más claros</h3>
          <p>
            Compara cada parámetro con sus propias unidades y fechas de
            medición.
          </p>
        </div>
      </header>
      <nav className="bce-tabs" aria-label="Vistas de antropometría">
        {[
          ["body", "Composición corporal"],
          ["measures", "Peso y medidas"],
          ["ratios", "Índices y referencias"],
        ].map(([id, label]) => (
          <button
            key={id}
            aria-pressed={view === id}
            onClick={() => setView(id)}
          >
            {label}
          </button>
        ))}
      </nav>
      {view === "body" && (
        <p className="bce-note">
          Datos de InBody. Amarillo: masa grasa; rosa: masa muscular. El
          porcentaje de grasa y el nivel visceral se muestran por separado.
        </p>
      )}
      {view === "measures" && (
        <div
          className="bce-filters"
          role="group"
          aria-label="Medidas para comparar"
        >
          {measureMetrics.map((m) => (
            <label key={m.key}>
              <input
                type="checkbox"
                checked={selected.includes(m.key)}
                onChange={() =>
                  setSelected((old) =>
                    old.includes(m.key)
                      ? old.filter((k) => k !== m.key)
                      : [...old, m.key],
                  )
                }
              />
              <span>{m.label}</span>
            </label>
          ))}
        </div>
      )}
      {view === "ratios" && (
        <>
          <label className="bce-sex">
            Sexo para referencia cintura/cadera
            <select value={sex} onChange={(e) => setSex(e.target.value)}>
              <option value="">Sin sexo registrado / sin referencia</option>
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
            </select>
          </label>
          <p className="bce-note">
            Calculados con cintura OMS y medidas del mismo registro.
            Cintura/cadera: OMS 0,90 en hombres y 0,85 en mujeres.
            Cintura/estatura: 0,50 en ambos sexos (NICE; adultos con IMC menor
            de 35). Son umbrales de orientación clínica, no un diagnóstico.
          </p>
        </>
      )}
      <div className="bce-grid">
        {collection.map((m) => (
          <Plot
            key={m.key}
            metric={m}
            points={seriesFor(
              records,
              view === "body" ? "inbody" : "anthropometry",
              m.key,
              plans,
            )}
            reference={view === "ratios" ? ratioReference(m.key, sex) : null}
          />
        ))}
      </div>
      {view === "measures" && !collection.length && (
        <p className="bce-note">
          Selecciona al menos una medida para comparar.
        </p>
      )}
      {view === "ratios" && !sex && (
        <p className="bce-note">
          Selecciona un sexo para mostrar el umbral de cintura/cadera. No se
          deduce a partir del nombre.
        </p>
      )}
      <p className="bce-note">
        Las barras están ordenadas por fecha; su separación no representa el
        tiempo transcurrido. Los registros del mismo día se conservan por
        separado.
      </p>
      <details className="bce-data">
        <summary>Ver valores y tratamiento asociado</summary>
        <div className="bce-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Parámetro</th>
                <th>Medición</th>
                <th>Resultado</th>
                <th>Atención</th>
                <th>Tratamiento registrado</th>
              </tr>
            </thead>
            <tbody>
              {collection.flatMap((m) =>
                seriesFor(
                  records,
                  view === "body" ? "inbody" : "anthropometry",
                  m.key,
                  plans,
                ).map((p: any) => (
                  <tr key={m.key + p.id}>
                    <th>{m.label}</th>
                    <td>{display(p.date)}</td>
                    <td>
                      {valueFormat(p.value, m)} {m.unit}
                    </td>
                    <td>
                      {p.attention ? display(p.attention) : "No asociada"}
                    </td>
                    <td>{p.treatment}</td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      </details>
      {onOriginal && (
        <button className="bce-original" onClick={onOriginal}>
          Mostrar / ocultar tabla editable original
        </button>
      )}
    </section>
  );
}
