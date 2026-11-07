import test from "node:test";
import assert from "node:assert/strict";
import {
  validateClickOptions,
  choicesForPen,
  applyClickChoice,
} from "../src/treatments/click-options.mjs";
import { readDevice, writeDevice } from "../src/treatments/device.mjs";
const row = {
  pen: "Wegovy · dispositivo ficticio A",
  dose: "1.2 mg",
  clicks: "37–38",
  source: "https://example.invalid/tabla-prueba",
  verified: true,
};
test("Clics: solo filas revisadas y de la pluma exacta, sin interpolar dosis", () => {
  const entry = {
    clickOptions: [
      row,
      { ...row, dose: "1 mg", clicks: "valor pendiente", verified: false },
    ],
  };
  assert.equal(validateClickOptions(entry.clickOptions), null);
  assert.equal(choicesForPen(entry, row.pen).length, 1);
  assert.equal(choicesForPen(entry, "Otra pluma").length, 0);
  const current = {
    name: "Wegovy",
    dose: "0.5 mg",
    frequency: "Cada 7 días",
    notes: "Pluma utilizada: " + row.pen + "\nTolerancia estable",
  };
  const chosen = applyClickChoice(current, row);
  assert.equal(chosen.dose, "1.2 mg (37–38 clics)");
  assert.equal(chosen.frequency, current.frequency);
  assert.match(chosen.notes, /Tolerancia estable/);
  assert.match(chosen.notes, /Fuente de dosis\/clics:/);
  assert.throws(() =>
    applyClickChoice({ ...current, notes: "Pluma utilizada: Otra" }, row),
  );
  assert.throws(() => applyClickChoice(current, { ...row, verified: false }));
  const changed = writeDevice(chosen, { dose: "1.3 mg" });
  assert.equal(readDevice(changed).clicks, "");
  assert.doesNotMatch(changed.notes, /Fuente de dosis\/clics:/);
});
test("Clics: rechazo de tablas incompletas, rangos invertidos y dosis duplicadas", () => {
  assert.ok(validateClickOptions([{ ...row, pen: "" }]));
  assert.ok(validateClickOptions([{ ...row, source: "javascript:alert(1)" }]));
  assert.ok(validateClickOptions([{ ...row, clicks: "38–37" }]));
  assert.ok(validateClickOptions([row, row]));
  assert.equal(
    validateClickOptions([
      { pen: "", dose: "", clicks: "", source: "", verified: false },
    ]),
    null,
  );
});
