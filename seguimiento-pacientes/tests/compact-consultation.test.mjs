import test from "node:test";
import assert from "node:assert/strict";
import {
  parseLabText,
  buildLabResults,
  layoutPdfItems,
  labDirection,
  labReference,
  labNumber,
} from "../src/consultation/labs.mjs";
test("PDF: unidades antes del resultado y resultado alternativo sin nombre quedan separados y revisables", () => {
  const out = parseLabText(
    "Glucosa mg/dL 87 70 - 99\n. mmol/L 4.82 3.89 - 5.49",
    { date: "2026-10-20" },
  );
  assert.equal(out.rows.length, 2);
  assert.equal(out.rows[0].name, "Glucosa");
  assert.equal(out.rows[0].unit, "mg/dL");
  assert.equal(out.rows[0].value, "87");
  assert.equal(out.rows[1].name, "Glucosa");
  assert.equal(out.rows[1].unit, "mmol/L");
  assert.equal(out.rows[1].selected, false);
  assert.equal(buildLabResults(out.rows).length, 1);
  assert.throws(() =>
    buildLabResults([
      { name: ". mmol/L", value: "4.82", unit: "", selected: true },
    ]),
  );
});
test("Laboratorio: conservar micro-unidades y precisión, referencias y flechas sin inventar normalidad", () => {
  const out = parseLabText(
    "TSH µUI/mL 0.004 0.4 - 4.0\nVitamina D 25 OH 30 ng/mL 20 - 60",
  );
  assert.equal(out.rows[0].unit, "µUI/mL");
  assert.equal(out.rows[0].value, "0.004");
  assert.equal(out.rows[1].name, "Vitamina D 25-OH");
  assert.equal(
    labDirection({ value: 0.004, referenceLow: 0.4, referenceHigh: 4 }),
    "low",
  );
  assert.equal(
    labDirection({ value: 190, referenceLow: 0, referenceHigh: 150 }),
    "high",
  );
  assert.equal(
    labDirection({ value: 87, referenceLow: 70, referenceHigh: 99 }),
    null,
  );
  assert.equal(labDirection({ value: 190 }), null);
  assert.equal(labReference({}), "(sin referencia)");
  assert.equal(labNumber(0.004), "0,004");
  assert.throws(() =>
    buildLabResults([
      {
        name: "Prueba",
        value: "12",
        unit: "mg/L",
        referenceLow: "20",
        referenceHigh: "10",
        selected: true,
      },
    ]),
  );
});
test("PDF: orden visual por coordenadas, encabezados y separadores ambiguos no se aceptan a ciegas", () => {
  const item = (str, x, y, width) => ({
    str,
    transform: [1, 0, 0, 1, x, y],
    width,
  });
  const text = layoutPdfItems([
    item("87", 250, 700, 20),
    item("Glucosa", 30, 700, 60),
    item("mg/dL", 150, 700, 40),
    item("70 - 99", 320, 700, 60),
  ]);
  assert.equal(parseLabText(text).rows[0].name, "Glucosa");
  assert.equal(parseLabText(text).rows[0].unit, "mg/dL");
  const out = parseLabText(
    "Paciente 12345\nPlaquetas 250.000 cel/mm3 150.000 - 400.000",
  );
  assert.equal(out.rows.length, 1);
  assert.equal(out.rows[0].selected, false);
});
