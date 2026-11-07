import test from "node:test";
import assert from "node:assert/strict";
import {
  ageValue,
  historyYear,
  historyPlot,
  historyForSave,
} from "../src/consultation/weight-history.mjs";
import { seedVisit } from "../src/workflow/model";
test("Historia: año por nacimiento/edad, rangos conservados y punto a los 27 años", () => {
  const d = { birthDate: "1988-06-15", age: "38" };
  assert.equal(historyYear({ age: "27" }, d, "2026-11-07"), "2015");
  assert.equal(historyYear({ age: "3 a 11" }, d, "2026-11-07"), "1991–1999");
  assert.equal(historyYear({ age: "27" }, { age: "38" }, "2026-11-07"), "2015");
  assert.equal(ageValue("27 años"), 27);
  const data = [
    {
      key: "one",
      age: "3 a 11",
      weight: "No recuerdo; peso normal",
      year: "1991 a 2002",
      event: "",
    },
    {
      key: "two",
      age: "27 años",
      weight: "68,4 kg",
      year: "",
      event: "Cambio de trabajo",
    },
  ];
  const plot = historyPlot(data);
  assert.equal(plot.length, 1);
  assert.equal(plot[0].age, 27);
  assert.equal(plot[0].weight, 68.4);
  assert.equal(data.length, 2);
  const saved = historyForSave(data, d, "2026-11-07");
  assert.equal(saved[0].originalYear, "1991 a 2002");
  assert.equal(saved[0].year, "1991–1999");
  assert.equal(saved[1].year, "2015");
  assert.equal(saved[0].weight, data[0].weight);
});
test("Historia: heredar en nuevo control sin borrar versiones previas ni resucitar una historia vaciada explícitamente", () => {
  const history = [
    {
      key: "one",
      age: "27",
      weight: "68.4",
      year: "2015",
      event: "Relato previo",
    },
  ];
  const bundle: any = {
    records: [],
    plans: [],
    history: null,
    visits: [
      { date: "2026-10-01", version: 1, data: { weightHistory: history } },
    ],
  };
  const next = seedVisit("2026-11-07", bundle).data;
  assert.deepEqual(next.weightHistory, history);
  next.weightHistory[0].weight = "70";
  assert.equal(history[0].weight, "68.4");
  bundle.visits.push({
    date: "2026-11-01",
    version: 1,
    data: { weightHistory: [] },
  });
  assert.deepEqual(seedVisit("2026-11-07", bundle).data.weightHistory, []);
});
