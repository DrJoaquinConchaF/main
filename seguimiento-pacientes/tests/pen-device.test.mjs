import test from "node:test";
import assert from "node:assert/strict";
import {
  readDevice,
  writeDevice,
  validateDevice,
  resourceText,
  canUseDevicePrescription,
} from "../src/treatments/device.mjs";
const actual = {
  name: "Wegovy",
  dose: "1.2 mg",
  frequency: "Cada 7 días",
  notes: "Tolerancia registrada",
};
test("Pluma y dosis son independientes; clics manuales se invalidan al cambiar presentación o dosis", () => {
  const pen = writeDevice(actual, { pen: "Wegovy 2.4 mg/dosis" });
  assert.equal(pen.dose, "1.2 mg");
  const counted = writeDevice(pen, { clicks: "37–38" });
  assert.equal(counted.dose, "1.2 mg (37–38 clics)");
  assert.deepEqual(readDevice(counted), {
    pen: "Wegovy 2.4 mg/dosis",
    dose: "1.2 mg",
    clicks: "37–38",
  });
  assert.equal(validateDevice(counted), null);
  const other = writeDevice(counted, { pen: "Otra presentación exacta" });
  assert.equal(other.dose, "1.2 mg");
  assert.equal(readDevice(other).clicks, "");
  assert.match(other.notes, /Tolerancia registrada/);
  const newDose = writeDevice(counted, { dose: "1.3 mg" });
  assert.equal(newDose.dose, "1.3 mg");
  assert.equal(readDevice(newDose).clicks, "");
  assert.equal(readDevice(actual).pen, "");
  assert.equal(readDevice(actual).dose, "1.2 mg");
});
test("No se exporta esquema sin pluma o con clics ambiguos; material solo tras selección", () => {
  assert.equal(canUseDevicePrescription([actual]), false);
  assert.equal(
    canUseDevicePrescription([{ ...actual, notes: "Pluma utilizada:   " }]),
    false,
  );
  assert.equal(
    resourceText({ benefits: true, benefitsExplanation: "" }).trim(),
    "https://www.novocarebeneficios.cl",
  );
  assert.ok(validateDevice({ ...actual, dose: "1.2 mg (37–38 clics)" }));
  assert.ok(
    validateDevice({
      ...writeDevice(actual, { pen: "Wegovy registrada" }),
      dose: "1.2 mg (38–37 clics)",
    }),
  );
  assert.equal(resourceText({}), "");
  assert.match(resourceText({ benefits: true }), /novocarebeneficios.cl/);
  assert.doesNotMatch(resourceText({ benefits: true }), /wegovy.com/);
  const text = resourceText({ video: true });
  assert.match(text, /P272OrKhqvk/);
  assert.doesNotMatch(text, /novocarebeneficios.cl/);
});
