import React from "react";
import { clickChartSource } from "./click-options.mjs";
export function ClickOptionsEditor({ entry, onChange }: any) {
  const rows = entry.clickOptions || [];
  const edit = (i: number, key: string, value: any) => {
    const next = structuredClone(rows);
    next[i][key] = value;
    if (key !== "verified") next[i].verified = false;
    onChange(next);
  };
  return (
    <details className="click-options-editor">
      <summary>Tabla de dosis y clics por pluma exacta ({rows.length})</summary>
      <p className="cw-muted">
        Copia filas de la fuente y comprueba modelo, país, concentración y
        presentación. Solo las filas marcadas como revisadas se ofrecen al
        registrar el control. No se calculan valores intermedios.
      </p>
      <a href={clickChartSource} target="_blank" rel="noreferrer">
        Abrir la tabla indicada por el profesional ↗
      </a>
      {rows.map((row: any, i: number) => (
        <article className="click-option-row" key={i}>
          <h3>Combinación {i + 1}</h3>
          <label className="cw-field">
            Pluma exacta
            <input
              aria-label={"Pluma exacta de combinación " + (i + 1)}
              value={row.pen}
              onChange={(e) => edit(i, "pen", e.target.value)}
              placeholder="Modelo, país, mg/dosis, concentración o volumen"
            />
          </label>
          <div className="cw-grid">
            <label className="cw-field">
              Dosis administrada
              <input
                aria-label={"Dosis de combinación " + (i + 1)}
                value={row.dose}
                onChange={(e) => edit(i, "dose", e.target.value)}
              />
            </label>
            <label className="cw-field">
              Clics o rango
              <input
                aria-label={"Clics de combinación " + (i + 1)}
                value={row.clicks}
                onChange={(e) => edit(i, "clicks", e.target.value)}
              />
            </label>
          </div>
          <label className="cw-field">
            Fuente de esta fila
            <input
              aria-label={"Fuente de combinación " + (i + 1)}
              type="url"
              value={row.source}
              onChange={(e) => edit(i, "source", e.target.value)}
            />
          </label>
          <label className="cw-check">
            <input
              type="checkbox"
              checked={row.verified}
              onChange={(e) => edit(i, "verified", e.target.checked)}
            />
            He cotejado esta fila con la fuente y la presentación exacta
          </label>
          <button
            type="button"
            onClick={() =>
              onChange(rows.filter((_: any, j: number) => j !== i))
            }
          >
            Quitar combinación {i + 1}
          </button>
        </article>
      ))}
      <button
        type="button"
        onClick={() =>
          onChange([
            ...rows,
            {
              pen: "",
              dose: "",
              clicks: "",
              source: clickChartSource,
              verified: false,
            },
          ])
        }
      >
        Agregar combinación de dosis y clics
      </button>
    </details>
  );
}
