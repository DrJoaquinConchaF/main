import test from "node:test";
import assert from "node:assert/strict";
import activities from "../src/clinical-workflow/activities.json" with { type: "json" };
import exchanges from "../src/clinical-workflow/exchanges.json" with { type: "json" };
import {
  restingEstimates,
  weeklyExercise,
  componentEstimate,
  macroTargets,
  exchangeTotals,
  portionAllocation,
} from "../src/clinical-workflow/calculations.mjs";
import {
  historyForReservo,
  recommendedNextVisit,
  validateVisit,
  composeTemplates,
} from "../src/clinical-workflow/consultation.mjs";
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);

test("Catálogos del Excel: actividades válidas sin datos personales y grupos de intercambio completos", () => {
  assert.equal(activities.activities.length, 140);
  assert.equal(new Set(activities.activities.map((a) => a.id)).size, 140);
  assert.ok(
    activities.activities.every(
      (a) => a.met > 0 && Number.isFinite(a.met) && a.name && a.group,
    ),
  );
  assert.equal(exchanges.foods.length, 12);
});
test("Ecuaciones: distinguir Mifflin de Harris y usar masa libre de grasa en Katch", () => {
  const e = restingEstimates({
    weight: 80,
    height: 175,
    age: 40,
    sex: "male",
    fatPercent: 25,
  });
  assert.equal(e.mifflinStJeor, 1698.75);
  close(e.harrisBenedictOriginal, 1771.9785);
  assert.equal(e.leanMass, 60);
  assert.equal(e.katchMcArdle, 1666);
  assert.equal(e.cunningham1980, 1820);
  assert.equal(restingEstimates({}).mifflinStJeor, null);
  assert.equal(
    restingEstimates({ weight: 80, fatPercent: null }).katchMcArdle,
    null,
  );
});
test("Actividad semanal: sesiones o minutos totales equivalentes; kcal manuales netas no suman dos métodos", () => {
  const a = weeklyExercise(80, [
    { id: "strength", met: 4, sessionsPerWeek: 3, minutesPerSession: 45 },
  ]);
  const b = weeklyExercise(80, [
    { id: "strength", met: 4, weeklyMinutes: 135 },
  ]);
  assert.deepEqual(a, b);
  assert.equal(a.rows[0].grossKcal, 720);
  assert.equal(a.netWeekly, 540);
  close(a.netDaily, 540 / 7);
  const manual = weeklyExercise(80, [
    {
      id: "manual",
      method: "manual_net_weekly",
      netKcalWeekly: 700,
      met: 20,
      weeklyMinutes: 135,
    },
  ]);
  assert.equal(manual.netDaily, 100);
  assert.equal(manual.rows[0].grossKcal, null);
  assert.throws(() => weeklyExercise(80, [{ met: 4, weeklyMinutes: -1 }]));
});
test("Estimación por componentes: revisar solapamiento y declarar la base de la termogénesis", () => {
  const input = {
    restingKcal: 1500,
    neatNetDaily: 100,
    exerciseNetWeekly: 1400,
    tefFraction: 0.1,
  };
  assert.equal(componentEstimate(input).totalDaily, null);
  const r = componentEstimate({ ...input, overlapReviewed: true });
  close(r.totalDaily, 2000);
  close(r.thermogenesisDaily, 200);
});
test("Déficit en kcal/día, peso de referencia independiente y carbohidratos remanentes", () => {
  const input = {
    expenditure: 2000,
    adjustment: -500,
    referenceWeight: 80,
    protein: { unit: "g_per_kg", value: 1.6 },
    fat: { unit: "g_day", value: 40 },
  };
  const r = macroTargets(input);
  assert.equal(r.target, 1500);
  assert.equal(r.proteinG, 128);
  assert.equal(r.fatG, 40);
  assert.equal(r.carbohydrateG, 157);
  close(r.proteinPercent + r.fatPercent + r.carbohydratePercent, 100);
  const impossible = macroTargets({
    ...input,
    protein: { unit: "g_day", value: 400 },
  });
  assert.equal(impossible.carbohydrateG, null);
  assert.ok(impossible.error);
  assert.equal(macroTargets({ ...input, expenditure: null }), null);
});
test("Intercambios: reproducir el ejemplo de 1885 kcal y separar la distribución pendiente/excedida", () => {
  const portions = {
    "exchange-47": 2.5,
    "exchange-50": 12,
    "exchange-53": 2,
    "exchange-54": 3.25,
    "exchange-55": 2,
    "exchange-56": 3,
    "exchange-58": 5,
  };
  const r = exchangeTotals(exchanges, portions, { kcal: 2000 });
  assert.deepEqual(r.totals, {
    kcal: 1885,
    protein: 163.25,
    fat: 52.25,
    carbohydrate: 194.5,
  });
  close(r.adequacy.kcal, 94.25);
  assert.equal(r.adequacy.protein, null);
  const p = portionAllocation({ "exchange-47": 2.5 }, [
    { "exchange-47": 1 },
    { "exchange-47": 1.5 },
  ]);
  assert.equal(p["exchange-47"].status, "complete");
  assert.equal(
    portionAllocation({ "exchange-47": 2.5 }, [{ "exchange-47": 3 }])[
      "exchange-47"
    ].status,
    "excess",
  );
  assert.throws(() => exchangeTotals(exchanges, { unknown: 1 }));
});
test("Antecedentes: no transformar no preguntado en niega ni truncar el texto que supera 400 caracteres", () => {
  const r = historyForReservo({
    allergies: { status: "none" },
    conditions: { status: "not_asked" },
  });
  assert.equal(r.text, "Alerg: Niega");
  assert.equal(r.fits, true);
  const long = "Información clínica relevante. ".repeat(30);
  const over = historyForReservo({
    conditions: { status: "reported", text: long },
  });
  assert.equal(over.fits, false);
  assert.ok(over.text.includes(long.trim()));
  assert.ok(over.remaining < 0);
});
test("Próximo control: seis semanas, fecha recomendada sin inventar reserva; fechas inexistentes rechazadas", () => {
  assert.equal(recommendedNextVisit("2026-10-25"), "2026-12-06");
  assert.equal(recommendedNextVisit("2026-12-20"), "2027-01-31");
  assert.throws(() => recommendedNextVisit("2026-02-30"));
  const v = {
    date: "2026-10-25",
    type: "control",
    modality: "online",
    adherencePercent: 0,
    stress1to10: 1,
  };
  assert.equal(validateVisit(v), null);
  assert.ok(validateVisit({ ...v, adherencePercent: 101 }));
  assert.ok(validateVisit({ ...v, recommendedNextVisit: "2026-10-20" }));
});
test("Recetas: combinar solo textos guardados, separar exámenes, numerar y no duplicar plantillas", () => {
  const templates = [
    {
      id: "p",
      category: "prescription",
      text: "Paciente {{paciente}}. Texto literal autorizado, sin inferir dosis.",
    },
    {
      id: "e",
      category: "exam_order",
      text: "1. Glicemia\n2. Perfil lipídico",
    },
    {
      id: "e2",
      category: "exam_order",
      text: "1. glicemia\n2. Hemoglobina glicosilada",
    },
  ];
  const r = composeTemplates(templates, ["p", "p", "e", "e2"], {
    paciente: "TEST ficticio",
  });
  assert.equal(
    r.prescription,
    "Paciente TEST ficticio. Texto literal autorizado, sin inferir dosis.",
  );
  assert.equal(
    r.examOrder,
    "1. Glicemia\n2. Perfil lipídico\n3. Hemoglobina glicosilada",
  );
  assert.equal(r.sourceTemplateIds.length, 3);
  assert.throws(() => composeTemplates(templates, ["missing"], {}));
});
