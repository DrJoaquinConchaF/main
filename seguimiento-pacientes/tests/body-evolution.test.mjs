import test from "node:test";
import assert from "node:assert/strict";
import {
  seriesFor,
  ratioReference,
  referenceSex,
} from "../src/evolution/model.mjs";
test("Evolución: fecha real de InBody, duplicados del mismo día y tratamiento del control asociado", () => {
  const records = [
    {
      id: "b",
      kind: "inbody",
      date: "2026-02-03",
      attention_date: "2026-02-10",
      data: { weight: 89 },
    },
    {
      id: "a",
      kind: "inbody",
      date: "2026-02-03",
      attention_date: "2026-02-10",
      data: { weight: 90 },
    },
    {
      id: "c",
      kind: "anthropometry",
      date: "2026-02-10",
      data: { weight: 92 },
    },
  ];
  const plans = [
    {
      date: "2026-02-10",
      data: {
        medications: [{ name: "Fármaco registrado", dose: "dosis registrada" }],
      },
    },
  ];
  const rows = seriesFor(records, "inbody", "weight", plans);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].date, "2026-02-03");
  assert.equal(rows[0].attention, "2026-02-10");
  assert.match(rows[0].treatment, /dosis registrada/);
  assert.equal(
    seriesFor(
      [{ ...records[0], attention_date: null }],
      "inbody",
      "weight",
      plans,
    )[0].attention,
    null,
  );
});
test("Índices: cintura OMS del mismo registro, sin mezclar estaturas históricas ni aceptar ratios obsoletos", () => {
  const records = [
    {
      id: "a",
      kind: "anthropometry",
      date: "2026-01-01",
      data: {
        weight: 80,
        height: 200,
        waistWHO: 90,
        waistNavel: 100,
        hip: 100,
        bmi: 1,
        waistHipRatio: 3,
      },
    },
    {
      id: "b",
      kind: "anthropometry",
      date: "2026-02-01",
      data: { weight: 78, waistWHO: 85, hip: 100, waistHeightRatio: 9 },
    },
  ];
  assert.equal(
    seriesFor(records, "anthropometry", "waistHipRatio")[0].value,
    0.9,
  );
  assert.equal(
    seriesFor(records, "anthropometry", "waistHeightRatio").length,
    1,
  );
  assert.equal(
    seriesFor(records, "anthropometry", "waistHeightRatio")[0].value,
    0.45,
  );
  assert.equal(seriesFor(records, "anthropometry", "bmi")[0].value, 20);
  assert.equal(
    seriesFor(
      [
        {
          id: "x",
          kind: "inbody",
          date: "2026-01-01",
          data: { fat: 0, muscle: null },
        },
      ],
      "inbody",
      "fat",
    )[0].value,
    0,
  );
});
test("Referencias: sexo explícito para ICC, cintura/estatura común y ausencia de suposiciones", () => {
  assert.equal(ratioReference("waistHipRatio", "male").limit, 0.9);
  assert.equal(ratioReference("waistHipRatio", "female").limit, 0.85);
  assert.equal(ratioReference("waistHipRatio", ""), null);
  assert.equal(ratioReference("waistHeightRatio", "female").limit, 0.5);
  assert.equal(ratioReference("waistHeightRatio", "male").limit, 0.5);
  assert.equal(referenceSex({ visits: [], plans: [] }), "");
});
