/** Clinical calculation helpers. No storage, network, clinical dosing or defaults for treatment. */
const finite = (v) => typeof v === "number" && Number.isFinite(v);
const positive = (v) => finite(v) && v > 0;
const nonnegative = (v) => finite(v) && v >= 0;

export function restingEstimates({
  weight,
  height,
  age,
  sex,
  fatPercent,
  leanMass,
}) {
  const lean = positive(leanMass)
    ? leanMass
    : positive(weight) &&
        finite(fatPercent) &&
        fatPercent >= 0 &&
        fatPercent < 100
      ? weight * (1 - fatPercent / 100)
      : null;
  const complete =
    positive(weight) &&
    positive(height) &&
    positive(age) &&
    ["male", "female"].includes(sex);
  return {
    mifflinStJeor: complete
      ? 10 * weight + 6.25 * height - 5 * age + (sex === "male" ? 5 : -161)
      : null,
    harrisBenedictOriginal: complete
      ? sex === "male"
        ? 66.473 + 13.7516 * weight + 5.0033 * height - 6.755 * age
        : 655.0955 + 9.5634 * weight + 1.8496 * height - 4.6756 * age
      : null,
    katchMcArdle: positive(lean) ? 370 + 21.6 * lean : null,
    cunningham1980: positive(lean) ? 500 + 22 * lean : null,
    leanMass: lean,
  };
}

/** Minutes are weekly activity volume, never calendar-day labels. Manual kcal are explicitly NET per week. */
export function weeklyExercise(weight, activities) {
  if (!positive(weight)) return null;
  if (!Array.isArray(activities))
    throw new Error("Se necesita una lista de actividades.");
  const rows = activities.map((a) => {
    if (a.method === "manual_net_weekly") {
      if (!nonnegative(a.netKcalWeekly))
        throw new Error("El gasto manual debe indicar kcal netas semanales.");
      return {
        id: a.id,
        weeklyMinutes: null,
        grossKcal: null,
        netKcal: a.netKcalWeekly,
        method: a.method,
      };
    }
    const minutes =
      a.weeklyMinutes ??
      (nonnegative(a.sessionsPerWeek) && nonnegative(a.minutesPerSession)
        ? a.sessionsPerWeek * a.minutesPerSession
        : null);
    if (!nonnegative(minutes) || !positive(a.met))
      throw new Error("Completa minutos semanales y MET de cada actividad.");
    const grossKcal = (a.met * weight * minutes) / 60;
    // Subtract 1 MET of rest from gross expenditure. A separately chosen method must be versioned.
    const netKcal = (Math.max(0, a.met - 1) * weight * minutes) / 60;
    return {
      id: a.id,
      weeklyMinutes: minutes,
      grossKcal,
      netKcal,
      method: "met_minus_1",
    };
  });
  const netWeekly = rows.reduce((s, r) => s + r.netKcal, 0);
  return {
    rows,
    netWeekly,
    netDaily: netWeekly / 7,
    methodVersion: "met-net-1-v1",
  };
}

/** NEAT must be a separate net estimate; step/exercise overlap must be reviewed explicitly. */
export function componentEstimate({
  restingKcal,
  neatNetDaily,
  exerciseNetWeekly,
  tefFraction,
  overlapReviewed,
}) {
  if (
    !positive(restingKcal) ||
    !nonnegative(neatNetDaily) ||
    !nonnegative(exerciseNetWeekly) ||
    !nonnegative(tefFraction) ||
    tefFraction >= 1
  )
    return null;
  const base = restingKcal + neatNetDaily + exerciseNetWeekly / 7;
  return {
    restingKcal,
    neatNetDaily,
    exerciseNetDaily: exerciseNetWeekly / 7,
    totalDaily: overlapReviewed === true ? base / (1 - tefFraction) : null,
    thermogenesisDaily:
      overlapReviewed === true
        ? (base * tefFraction) / (1 - tefFraction)
        : null,
    needsOverlapReview: overlapReviewed !== true,
    methodVersion: "net-components-tef-share-v1",
  };
}

/** Adjustment is signed kcal/day: deficit negative, surplus positive. Reference weight is explicit. */
export function macroTargets({
  expenditure,
  adjustment,
  referenceWeight,
  protein,
  fat,
}) {
  if (
    !positive(expenditure) ||
    !finite(adjustment) ||
    !positive(referenceWeight)
  )
    return null;
  const resolve = (entry) =>
    entry?.unit === "g_per_kg" && nonnegative(entry.value)
      ? entry.value * referenceWeight
      : entry?.unit === "g_day" && nonnegative(entry.value)
        ? entry.value
        : null;
  const proteinG = resolve(protein),
    fatG = resolve(fat),
    target = expenditure + adjustment;
  if (proteinG === null || fatG === null || target <= 0) return null;
  const remaining = target - proteinG * 4 - fatG * 9;
  if (remaining < 0)
    return {
      target,
      proteinG,
      fatG,
      carbohydrateG: null,
      error: "Proteínas y grasas superan el objetivo energético.",
    };
  return {
    target,
    referenceWeight,
    proteinG,
    fatG,
    carbohydrateG: remaining / 4,
    proteinPercent: (proteinG * 400) / target,
    fatPercent: (fatG * 900) / target,
    carbohydratePercent: (remaining * 100) / target,
  };
}

export function exchangeTotals(catalog, portions, targets = {}) {
  const totals = { kcal: 0, protein: 0, fat: 0, carbohydrate: 0 };
  const byId = new Map(catalog.foods.map((f) => [f.id, f]));
  for (const [id, count] of Object.entries(portions)) {
    if (!byId.has(id)) throw new Error("Grupo de intercambio desconocido.");
    if (!nonnegative(count))
      throw new Error(
        "Las porciones deben ser cantidades válidas no negativas.",
      );
    for (const nutrient of Object.keys(totals))
      totals[nutrient] += byId.get(id)[nutrient] * count;
  }
  return {
    totals,
    adequacy: Object.fromEntries(
      Object.keys(totals).map((k) => [
        k,
        positive(targets[k]) ? (100 * totals[k]) / targets[k] : null,
      ]),
    ),
    catalogVersion: catalog.version,
  };
}

export function portionAllocation(portions, meals) {
  const result = {};
  for (const [id, prescribed] of Object.entries(portions)) {
    if (!nonnegative(prescribed)) throw new Error("Porciones inválidas.");
    const allocated = meals.reduce((sum, meal) => {
      const n = meal[id] ?? 0;
      if (!nonnegative(n)) throw new Error("Distribución inválida.");
      return sum + n;
    }, 0);
    const remaining = prescribed - allocated;
    result[id] = {
      prescribed,
      allocated,
      remaining,
      status:
        Math.abs(remaining) < 1e-8
          ? "complete"
          : remaining > 0
            ? "pending"
            : "excess",
    };
  }
  for (const meal of meals)
    for (const id of Object.keys(meal))
      if (!(id in portions))
        throw new Error("Distribución con un grupo no prescrito.");
  return result;
}
