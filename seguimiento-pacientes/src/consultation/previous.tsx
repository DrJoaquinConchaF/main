import React, { createContext, useContext } from "react";
export const PreviousContext = createContext<any>(null);
export function PreviousHint({ path, value, options, type }: any) {
  const previous = useContext(PreviousContext);
  if (!previous?.date || (!path && value === undefined)) return null;
  let result =
    value === undefined
      ? path?.reduce((v: any, k: any) => v?.[k], previous.data)
      : value;
  if (options) {
    const option = options.find(
      (o: any) => Array.isArray(o) && o[0] === result,
    );
    if (option) result = option[1];
  }
  if (
    type === "date" &&
    typeof result === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(result)
  )
    result = result.split("-").reverse().join("-");
  const text =
    result === undefined || result === null || result === ""
      ? "Sin registro"
      : typeof result === "boolean"
        ? result
          ? "Sí"
          : "No"
        : String(result);
  return (
    <small className="cw-previous" title={text}>
      Anterior ({previous.date.split("-").reverse().join("-")}): {text}
    </small>
  );
}
export function previousRow(previous: any, group: string, row: any) {
  const entries = previous?.data?.[group] || [];
  const exact = entries.find((v: any) => v.key && v.key === row.key);
  if (exact) return exact;
  const matching = entries.filter(
    (v: any) =>
      v.name?.trim().toLocaleLowerCase("es") ===
        row.name?.trim().toLocaleLowerCase("es") &&
      (group !== "drinks" || (v.otherName || "") === (row.otherName || "")),
  );
  return matching.length === 1 ? matching[0] : {};
}

// Keep the previous list visible even before a new row has been added.
export function PreviousList({ group }: { group: "activities" | "drinks" }) {
  const previous = useContext(PreviousContext);
  if (!previous?.date) return null;
  const present = (value: any) =>
    value !== undefined && value !== null && String(value).trim() !== "";
  const number = (value: any) =>
    present(value) && Number.isFinite(Number(String(value).replace(",", ".")))
      ? Number(String(value).replace(",", "."))
      : null;
  const entries = (previous.data?.[group] || []).filter((row: any) =>
    row.name?.trim(),
  );
  const lines = entries.map((row: any) =>
    group === "activities"
      ? [
          row.name,
          present(row.sessions) ? `${row.sessions} sesiones/semana` : "",
          present(row.minutes) ? `${row.minutes} min/sesión` : "",
          row.intensity,
        ]
          .filter(Boolean)
          .join(" · ")
      : [
          row.name === "Otra" ? row.otherName || "Otra bebida" : row.name,
          present(row.volume) ? `${row.volume} ml/recipiente` : "",
          present(row.count) ? `${row.count} al día` : "",
        ]
          .filter(Boolean)
          .join(" · "),
  );
  if (group === "drinks") {
    const measured = entries.filter(
      (row: any) => number(row.volume) !== null && number(row.count) !== null,
    );
    const total = measured.length
      ? measured.reduce(
          (sum: number, row: any) =>
            sum + (number(row.volume)! * number(row.count)!) / 1000,
          0,
        )
      : number(previous.data?.habits?.liquids);
    if (total !== null)
      lines.push(
        `Total cuantificado: ${total.toLocaleString("es-CL", { maximumFractionDigits: 2 })} L/día`,
      );
    const water = number(previous.data?.habits?.water);
    if (!measured.length && water !== null)
      lines.push(
        `Agua: ${water.toLocaleString("es-CL", { maximumFractionDigits: 2 })} L/día`,
      );
  }
  return (
    <div
      className="cw-previous-list"
      aria-label={
        group === "activities"
          ? "Ejercicio del control anterior"
          : "Hidratación del control anterior"
      }
    >
      <small>Anterior ({previous.date.split("-").reverse().join("-")}):</small>
      {(lines.length ? lines : ["Sin registro"]).map(
        (line: string, index: number) => (
          <small key={index} title={line}>
            {line}
          </small>
        ),
      )}
    </div>
  );
}
