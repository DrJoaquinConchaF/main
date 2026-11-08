import test from "node:test";
import assert from "node:assert/strict";
import {
  referencePens,
  calculateClicks,
  automateClicks,
  referenceFile,
} from "../src/treatments/automatic-clicks.mjs";
import { readDevice, writeDevice } from "../src/treatments/device.mjs";
import { currentCatalog, defaultCatalog } from "../src/treatments/catalog.mjs";
test("Clics automáticos: modelo exacto, redondeo explícito y límites, sin extrapolar otra pluma", () => {
  const pen = referencePens.find((p) => p.mg === 2.4).pen;
  const result = calculateClicks(pen, "1,2 mg");
  assert.equal(result.theoretical, 37.5);
  assert.equal(result.clicks, 38);
  assert.ok(Math.abs(result.deliveredMg - 1.216) < 1e-9);
  for (const [p, d] of [
    [pen, "3 mg"],
    [pen, "-1 mg"],
    [pen, "0 mg"],
    [pen, "0.001 mg"],
    [pen, "1.2 g"],
    ["Wegovy 2.4 mg/dosis", "1.2 mg"],
    ["Wegovy monodosis 2.4 mg", "1.2 mg"],
  ])
    assert.equal(calculateClicks(p, d), null);
  const initial = {
    name: "Wegovy",
    dose: "1.2 mg",
    frequency: "Semanal",
    notes:
      "Con conteo de clics\nPluma utilizada: " + pen + "\nTolerancia buena",
  };
  const next = automateClicks(initial, {});
  assert.equal(readDevice(next).clicks, "38");
  assert.match(next.notes, /Cálculo de clics:/);
  assert.match(next.notes, /Tolerancia buena/);
  assert.equal(next.frequency, "Semanal");
  const changed = automateClicks(writeDevice(next, { dose: "0.8 mg" }), {});
  assert.equal(readDevice(changed).clicks, "25");
  const manual = writeDevice(next, { clicks: "37" });
  assert.equal(readDevice(manual).clicks, "37");
  assert.doesNotMatch(manual.notes, /Cálculo de clics:/);
  const override = {
    clickOptions: [
      {
        pen,
        dose: "1.20 mg",
        clicks: "37–38",
        source: "https://example.invalid/reviewed",
        verified: true,
      },
    ],
  };
  assert.equal(readDevice(automateClicks(initial, override)).clicks, "37–38");
  assert.equal(
    automateClicks({ ...initial, notes: "Pluma utilizada: " + pen }, {}).dose,
    "1.2 mg",
  );
  assert.equal(referenceFile, "/referencias/wegovy-tabla-clics.pdf");
});
test("Suplementos: nuevos accesos rápidos sin reescribir dosis históricas ni opciones personalizadas", () => {
  assert.deepEqual(defaultCatalog.find((e) => e.id === "creatina").doses, [
    "3 g",
    "5 g",
    "7.5 g",
    "10 g",
  ]);
  const protein = [
    "1/2 scoop",
    "1 scoop",
    "1 1/2 scoop",
    "2 scoop",
    "2 1/2 scoop",
    "3 scoop",
  ];
  assert.deepEqual(defaultCatalog.find((e) => e.id === "whey").doses, protein);
  const stock = [
    { id: "whey", doses: ["20 g", "25 g", "30 g"] },
    { id: "creatina", doses: ["3 g", "5 g"] },
    { id: "vegetal", doses: ["Medida personalizada"] },
  ];
  const upgraded = currentCatalog(stock);
  assert.deepEqual(upgraded[0].doses, protein);
  assert.equal(upgraded[1].doses.length, 4);
  assert.deepEqual(upgraded[2], stock[2]);
  assert.deepEqual(stock[0].doses, ["20 g", "25 g", "30 g"]);
});
