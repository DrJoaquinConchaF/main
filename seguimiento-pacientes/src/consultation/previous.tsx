import React, { createContext, useContext } from "react";
export const PreviousContext = createContext<any>(null);
export function PreviousHint({ path, value, options }: any) {
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
