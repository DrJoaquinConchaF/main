import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import definitions from "../clinical-workflow/fields.json";
import activityCatalog from "../clinical-workflow/activities.json";
import exchanges from "../clinical-workflow/exchanges.json";
import {
  restingEstimates,
  weeklyExercise,
  componentEstimate,
  macroTargets,
  exchangeTotals,
  portionAllocation,
} from "../clinical-workflow/calculations.mjs";
import {
  historyForReservo,
  recommendedNextVisit,
  validateVisit,
  validateWorkspace,
} from "../clinical-workflow/consultation.mjs";
import {
  num,
  today,
  display,
  format,
  seedVisit,
  buildSave,
  visitTexts,
  historyFields,
  measureFields,
  habitFields,
  foodFields,
  textHabits,
  newActivity,
  newTreatment,
} from "./model";
async function api(path: string, method = "GET", body?: any) {
  const r = await fetch("/api" + path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const d: any = await r.json();
  if (!r.ok) throw Error(d.error || "No se pudo completar la operación.");
  return d;
}
const uid = () => crypto.randomUUID();
const ageAt = (birth: string, date: string) => {
  if (!birth || birth > date) return null;
  const a = new Date(date + "T12:00:00Z"),
    b = new Date(birth + "T12:00:00Z");
  return (
    a.getUTCFullYear() -
    b.getUTCFullYear() -
    (a.getUTCMonth() < b.getUTCMonth() ||
    (a.getUTCMonth() === b.getUTCMonth() && a.getUTCDate() < b.getUTCDate())
      ? 1
      : 0)
  );
};
function Field({
  label,
  value,
  onChange,
  type = "text",
  hint,
  options,
  rows = 3,
  ...rest
}: any) {
  const hintId = React.useId();
  return (
    <label className="cw-field">
      <span>{label}</span>
      {options ? (
        <select
          aria-label={label}
          aria-describedby={hint ? hintId : undefined}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          {...rest}
        >
          {options.map((o: any) => (
            <option
              key={typeof o === "string" ? o : o[0]}
              value={typeof o === "string" ? o : o[0]}
            >
              {typeof o === "string" ? o : o[1]}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          rows={rows}
          aria-label={label}
          aria-describedby={hint ? hintId : undefined}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          {...rest}
        />
      ) : (
        <input
          aria-label={label}
          aria-describedby={hint ? hintId : undefined}
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          {...rest}
        />
      )}{" "}
      {hint && <small id={hintId}>{hint}</small>}
    </label>
  );
}
function Card({ title, subtitle, children, action }: any) {
  return (
    <section className="cw-card">
      <div className="cw-card-head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
function Copy({ text, label = "Copiar", onDone }: any) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      disabled={!text}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          onDone?.();
          setTimeout(() => setCopied(false), 2500);
        } catch {
          window.alert("Selecciona el texto y cópialo manualmente.");
        }
      }}
    >
      {copied ? "Copiado ✓" : label}
    </button>
  );
}
const tabs = [
  "Antecedentes",
  "Consulta",
  "Hábitos y alimentación",
  "Mediciones",
  "Energía y pauta",
  "Cierre",
  "Evolución",
  "Plantillas",
];
export function Workspace({ patient, onClose }: any) {
  const [libraryDirty, setLibraryDirty] = useState(false);
  const [bundle, setBundle] = useState<any>(null),
    [date, setDate] = useState(today()),
    [data, setData] = useState<any>(null),
    [version, setVersion] = useState(0),
    [tab, setTab] = useState("Consulta"),
    [dirty, setDirty] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const path = "/clinical/patients/" + patient.id;
  const apply = (b: any, d = date) => {
    setBundle(b);
    const v = seedVisit(d, b);
    setData(v.data);
    setVersion(v.version);
    setDirty(false);
  };
  useEffect(() => {
    let active = true;
    api(path)
      .then((b) => {
        if (active) {
          apply(b);
          if (!b.history && !b.records.length) setTab("Antecedentes");
        }
      })
      .catch((e) => setError(e.message));
    return () => {
      active = false;
    };
  }, [patient.id]);
  useEffect(() => {
    const before = (e: BeforeUnloadEvent) => {
      if (dirty || libraryDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", before);
    return () => window.removeEventListener("beforeunload", before);
  }, [dirty, libraryDirty]);
  const change = (fn: (draft: any) => void) => {
    setData((old: any) => {
      const d = structuredClone(old);
      fn(d);
      return d;
    });
    setDirty(true);
    setNotice("");
  };
  const set = (group: string, key: string, value: any) =>
    change((d) => {
      if (group) d[group][key] = value;
      else d[key] = value;
    });
  const leave = async (destination?: string) => {
    if (
      libraryDirty &&
      !window.confirm("Hay una plantilla sin guardar. ¿Descartarla?")
    )
      return;
    if (destination && dirty) {
      if (await save()) onClose(destination);
      return;
    }
    if (
      !dirty ||
      window.confirm("Hay cambios sin guardar en esta consulta. ¿Descartarlos?")
    )
      onClose(destination);
  };
  const choose = (next: string) => {
    if (next === date) return true;
    if (
      dirty &&
      !window.confirm(
        "Hay cambios sin guardar. ¿Cambiar de fecha y descartarlos?",
      )
    )
      return false;
    setDate(next);
    apply(bundle, next);
    setNotice("");
    setError("");
    return true;
  };
  const save = async (): Promise<boolean> => {
    setError("");
    let dto: any;
    try {
      dto = buildSave(data, bundle, version);
    } catch (e: any) {
      setError(e.message);
      return false;
    }
    dto.data.calculations = {
      rest,
      training,
      components,
      estimated,
      macro,
      exchange,
      computedAt: new Date().toISOString(),
    };
    if (macro && !macro.error && weight && dto.plan) {
      const e = dto.plan.data.energy;
      e.target = String(macro.target);
      e.weight = String(weight);
      e.proteinFactor = String(macro.proteinG / weight);
      e.fatFactor = String(macro.fatG / weight);
      e.adjustment = String(num(energy.adjustment) ?? 0);
      if (height) e.height = String(height);
      if (age !== null) e.age = String(age);
      if (data.demographics.sex)
        e.sex = data.demographics.sex === "male" ? "Masculino" : "Femenino";
    }
    const e = validateWorkspace(dto.data);
    if (e) {
      setError(e);
      return false;
    }
    if (
      dto.records.some((r: any) => r.kind === "anthropometry") &&
      !data.measurementSource
    ) {
      setError("Indica cómo se obtuvieron las mediciones.");
      return false;
    }
    setBusy(true);
    try {
      await api(path + "/visits/" + date, "PUT", dto);
      apply(await api(path));
      setNotice(
        "Consulta guardada. Los datos están disponibles para el seguimiento.",
      );
      return true;
    } catch (e: any) {
      setError(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  };
  const allDates = bundle
    ? ([
        ...new Set([
          ...bundle.records
            .filter(
              (r: any) =>
                r.attention_date || !["lab", "inbody"].includes(r.kind),
            )
            .map((r: any) => r.attention_date || r.date),
          ...bundle.plans.map((p: any) => p.date),
          ...bundle.visits.map((v: any) => v.date),
        ]),
      ].sort() as string[])
    : [];
  const previous = allDates.filter((d) => d < date).at(-1);
  const currentInBody = bundle?.records
    .filter(
      (r: any) => r.kind === "inbody" && (r.attention_date || r.date) === date,
    )
    .at(-1);
  const currentPlan = bundle?.plans.find((p: any) => p.date === date);
  const previousPlan = bundle?.plans.filter((p: any) => p.date < date).at(-1);
  const previousAnthro = bundle?.records
    .filter(
      (r: any) =>
        r.kind === "anthropometry" && (r.attention_date || r.date) < date,
    )
    .at(-1);
  const energy = data?.energy || {};
  const weight =
      num(energy.referenceWeight) ??
      num(data?.measurements?.weight) ??
      currentInBody?.data.weight,
    height =
      num(energy.referenceHeight) ??
      num(data?.measurements?.height) ??
      currentInBody?.data.height;
  const age =
    ageAt(data?.demographics?.birthDate, date) ?? num(data?.demographics?.age);
  const fatPercent = num(energy.fatPercent) ?? currentInBody?.data.fatPercent;
  const rest = restingEstimates({
    weight,
    height,
    age,
    sex: data?.demographics?.sex,
    fatPercent,
    leanMass: num(energy.leanMass),
  });
  let training: any = null;
  try {
    const included = (data?.activities || []).filter(
      (a: any) => a.included !== false && a.name,
    );
    if (
      (included.length &&
        included.every((a: any) =>
          a.method === "manual"
            ? num(a.manualCalories) !== null && num(a.manualCalories)! >= 0
            : num(a.met)! > 0 &&
              num(a.sessions) !== null &&
              num(a.minutes) !== null,
        )) ||
      (energy.noExercise === true && !included.length)
    )
      training = weeklyExercise(
        weight,
        included.map((a: any) =>
          a.method === "manual"
            ? {
                id: a.key,
                method: "manual_net_weekly",
                netKcalWeekly: num(a.manualCalories),
              }
            : {
                id: a.key,
                met: num(a.met),
                sessionsPerWeek: num(a.sessions),
                minutesPerSession: num(a.minutes),
              },
        ),
      );
  } catch {}
  const rmr = (rest as any)[energy.restMethod || "mifflinStJeor"];
  const stepsOutside = num(energy.stepsOutside),
    neat =
      weight && stepsOutside !== null
        ? (((stepsOutside / 83.33) * 2) / 60) * weight
        : null;
  const components = componentEstimate({
    restingKcal: rmr,
    neatNetDaily: neat,
    exerciseNetWeekly: training?.netWeekly,
    tefFraction: (num(energy.tef) ?? 10) / 100,
    overlapReviewed: energy.overlapReviewed === true,
  });
  const factor = num(energy.factor);
  const estimated =
    energy.method === "components"
      ? components?.totalDaily
      : energy.method === "manual"
        ? num(energy.manualTotal)
        : factor !== null &&
            factor >= 1 &&
            factor <= 3 &&
            (rest as any)[energy.method] !== null
          ? (rest as any)[energy.method] * factor
          : null;
  const macro = macroTargets({
    expenditure: estimated,
    adjustment: num(energy.adjustment),
    referenceWeight: num(energy.macroWeight) ?? weight,
    protein: { unit: energy.proteinUnit, value: num(energy.proteinValue) },
    fat: { unit: energy.fatUnit, value: num(energy.fatValue) },
  });
  const targets =
    macro && !macro.error
      ? {
          kcal: macro.target,
          protein: macro.proteinG,
          fat: macro.fatG,
          carbohydrate: macro.carbohydrateG,
        }
      : {};
  let exchange: any = null;
  try {
    exchange = exchangeTotals(
      exchanges,
      Object.fromEntries(
        Object.entries(data?.portions || {}).map(([k, v]) => [k, num(v) ?? 0]),
      ),
      targets,
    );
  } catch {}
  const text = data
    ? visitTexts(data, patient, macro)
    : { clinical: "", patientText: "" };
  return (
    <div
      className="cw"
      role="dialog"
      aria-modal="true"
      aria-label="Consulta clínica"
    >
      <header className="cw-top">
        <div>
          <span className="cw-eyebrow">CONSULTA Y SEGUIMIENTO</span>
          <h1>{patient.name}</h1>
          <p>
            {patient.rut || "Sin RUT"} ·{" "}
            {patient.is_demo ? "Paciente de demostración" : "Ficha privada"}
            {previous ? " · Atención anterior: " + display(previous) : ""}
          </p>
        </div>
        <div className="cw-top-actions">
          <button onClick={() => leave()}>Cambiar paciente / volver</button>
          <button onClick={() => leave("Evolución")}>
            PDFs, fotografías y gráficos
          </button>
        </div>
      </header>
      <main className="cw-main">
        {error && (
          <p className="cw-alert" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="cw-success" role="status">
            {notice}
          </p>
        )}
        {!data ? (
          <p role="status">
            {error
              ? "No se pudo abrir la consulta. Puedes volver a la ficha."
              : "Cargando consulta…"}
          </p>
        ) : (
          <>
            <section className="cw-datebar" aria-label="Datos de esta atención">
              <Field
                label="Fecha de atención"
                type="date"
                value={date}
                onChange={choose}
              />
              <Field
                label="Tipo de atención"
                value={data.type}
                options={[
                  ["initial", "Evaluación inicial"],
                  ["control", "Control"],
                ]}
                onChange={(v: string) => set("", "type", v)}
              />
              <Field
                label="Modalidad"
                value={data.modality}
                options={[
                  ["in_person", "Presencial"],
                  ["online", "Online"],
                ]}
                onChange={(v: string) =>
                  change((d) => {
                    d.modality = v;
                    d.measurementSource = v === "online" ? "" : "clinic";
                  })
                }
              />
              <div className="cw-save-state">
                <strong>
                  {dirty
                    ? "Cambios sin guardar"
                    : version
                      ? "Consulta guardada"
                      : "Nueva atención"}
                </strong>
                <small>
                  Completa solo lo evaluado. Vacío no significa cero.
                </small>
              </div>
            </section>
            <nav className="cw-nav" aria-label="Secciones de la consulta">
              {tabs.map((t) => (
                <button
                  key={t}
                  aria-current={tab === t ? "page" : undefined}
                  onClick={() => {
                    if (
                      tab === "Plantillas" &&
                      libraryDirty &&
                      !window.confirm(
                        "Hay una plantilla sin guardar. ¿Descartarla?",
                      )
                    )
                      return;
                    setLibraryDirty(false);
                    setTab(t);
                  }}
                >
                  {t}
                </button>
              ))}
            </nav>
            {tab === "Antecedentes" && (
              <>
                <Card
                  title="Antecedentes personales"
                  subtitle="Se conservan en la ficha del paciente. Revísalos y actualiza lo que cambió."
                >
                  <div className="cw-grid">
                    {historyFields.map((f) => {
                      const h = data.history[f.id] || {
                        status: "not_asked",
                        text: "",
                      };
                      return (
                        <div className="cw-history" key={f.id}>
                          <Field
                            label={f.title + " (" + f.abbreviation + ")"}
                            value={h.status}
                            options={[
                              ["not_asked", "No preguntado"],
                              ["reported", "Informado"],
                              ["none", "Niega / no presenta"],
                              ["unknown", "No sabe"],
                              ["prefers_discussion", "Pendiente de conversar"],
                            ]}
                            onChange={(v: string) =>
                              change((d) => {
                                d.history[f.id] = { ...h, status: v };
                              })
                            }
                          />
                          <Field
                            label={"Detalle: " + f.title}
                            type="textarea"
                            value={h.text}
                            onChange={(v: string) =>
                              change((d) => {
                                d.history[f.id] = {
                                  status: v ? "reported" : h.status,
                                  text: v,
                                };
                              })
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                </Card>
                <HistorySummary
                  history={data.history}
                  override={data.historySummaryOverride}
                  onChange={(v: any) => set("", "historySummaryOverride", v)}
                />
              </>
            )}
            {tab === "Consulta" && (
              <>
                <Card
                  title={
                    data.type === "initial"
                      ? "Motivo, objetivos y contexto"
                      : "Cómo fue desde la última consulta"
                  }
                  subtitle="La información de esta atención se guarda por separado de los controles anteriores."
                >
                  <Field
                    label="Objetivo de consulta / contexto actual"
                    type="textarea"
                    value={data.context}
                    onChange={(v: string) => set("", "context", v)}
                  />
                  <div className="cw-grid">
                    <Field
                      label="¿Entendió el método?"
                      value={data.general.understanding}
                      options={[
                        ["", "No evaluado"],
                        ["Sí", "Sí"],
                        ["Parcialmente", "Parcialmente"],
                        ["No", "No"],
                      ]}
                      onChange={(v: string) =>
                        set("general", "understanding", v)
                      }
                    />
                    <Field
                      label="Adherencia autoinformada (%)"
                      inputMode="decimal"
                      value={data.general.adherencePercent}
                      hint="0 a 100 · desde el control anterior"
                      onChange={(v: string) =>
                        set("general", "adherencePercent", v)
                      }
                    />
                    <Field
                      label="Dificultades, dudas y barreras"
                      type="textarea"
                      value={data.general.barriers}
                      onChange={(v: string) => set("general", "barriers", v)}
                    />
                    <Field
                      label="Cambios corporales notados"
                      type="textarea"
                      value={data.general.bodyChanges}
                      onChange={(v: string) => set("general", "bodyChanges", v)}
                    />
                  </div>
                  <Field
                    label="Rendimiento y recuperación"
                    type="textarea"
                    hint="Cargas, fuerza, capacidad aeróbica, sensaciones y recuperación."
                    value={data.general.performance}
                    onChange={(v: string) => set("general", "performance", v)}
                  />
                </Card>
                <Card
                  title="Tratamiento que está utilizando"
                  subtitle="Registra el uso real y la tolerancia. Las nuevas indicaciones se redactan al cerrar la consulta."
                  action={
                    previousPlan && (
                      <button
                        onClick={() =>
                          change((d) => {
                            d.medications = structuredClone(
                              previousPlan.data.medications,
                            );
                            d.supplements = structuredClone(
                              previousPlan.data.supplements,
                            );
                          })
                        }
                      >
                        Traer tratamiento anterior para revisar
                      </button>
                    )
                  }
                >
                  <TreatmentList
                    title="Medicamentos en uso"
                    values={data.medications}
                    onChange={(v: any) => set("", "medications", v)}
                  />
                  <TreatmentList
                    title="Suplementos en uso"
                    values={data.supplements}
                    onChange={(v: any) => set("", "supplements", v)}
                  />
                  <Field
                    label="Cambios, tolerancia o efectos adversos"
                    type="textarea"
                    value={data.general.tolerance}
                    onChange={(v: string) => set("general", "tolerance", v)}
                  />
                </Card>
                <WeightHistory
                  values={data.weightHistory}
                  onChange={(v: any) => set("", "weightHistory", v)}
                />
              </>
            )}
            {tab === "Hábitos y alimentación" && (
              <>
                <Card title="Movimiento, estrés y sueño">
                  <div className="cw-grid">
                    {habitFields.map(([k, l, u]) => (
                      <Field
                        key={k}
                        label={l + " (" + u + ")"}
                        inputMode="decimal"
                        value={data.habits[k]}
                        onChange={(v: string) => set("habits", k, v)}
                      />
                    ))}
                    {textHabits.map(([k, l]) => (
                      <Field
                        key={k}
                        label={l}
                        value={data.habits[k]}
                        onChange={(v: string) => set("habits", k, v)}
                      />
                    ))}
                    {[
                      [
                        "stressEating",
                        "Relación del estrés con comida o actividad",
                      ],
                      ["support", "Psicoterapia u otros apoyos"],
                    ].map(([k, l]) => (
                      <Field
                        key={k}
                        label={l}
                        value={data.general[k]}
                        onChange={(v: string) => set("general", k, v)}
                      />
                    ))}
                    {[
                      ["snoring", "Ronquidos"],
                      ["breathingPauses", "Pausas respiratorias observadas"],
                      ["restorative", "Sueño reparador"],
                    ].map(([k, l]) => (
                      <Field
                        key={k}
                        label={l}
                        options={[
                          ["", "No preguntado"],
                          ["Sí", "Sí"],
                          ["No", "No"],
                          ["No sabe", "No sabe"],
                        ]}
                        value={data.general[k]}
                        onChange={(v: string) => set("general", k, v)}
                      />
                    ))}
                  </div>
                </Card>
                <Activities
                  values={data.activities}
                  onChange={(v: any) => set("", "activities", v)}
                />
                <Drinks
                  values={data.drinks}
                  onChange={(
                    values: any,
                    total: number | null,
                    water: number | null,
                  ) =>
                    change((d) => {
                      d.drinks = values;
                      d.habits.liquids = total ?? "";
                      d.habits.water = water ?? "";
                    })
                  }
                />
                <Card title="Patrón de alimentación">
                  <div className="cw-grid">
                    {foodFields.map(([k, l, u]) => (
                      <Field
                        key={k}
                        label={l + " (" + u + ")"}
                        inputMode="decimal"
                        value={data.habits[k]}
                        onChange={(v: string) => set("habits", k, v)}
                      />
                    ))}
                    {[
                      [
                        "portions",
                        "Porciones aumentadas o fuera de lo acordado",
                      ],
                      ["sugars", "Azúcares simples y bebidas azucaradas"],
                      ["social", "Eventos sociales y alcohol"],
                      ["notes", "Otras dificultades alimentarias"],
                    ].map(([k, l]) => (
                      <Field
                        key={k}
                        label={l}
                        type="textarea"
                        value={data.foodNotes[k]}
                        onChange={(v: string) => set("foodNotes", k, v)}
                      />
                    ))}
                  </div>
                </Card>
                <Card
                  title="Recordatorio de 24 horas"
                  subtitle="Registra un día específico. El patrón habitual se describe por separado."
                >
                  <div className="cw-grid">
                    <Field
                      label="Día recordado"
                      type="date"
                      value={data.recall.date}
                      onChange={(v: string) => set("recall", "date", v)}
                    />
                    <Field
                      label="Contexto del día"
                      value={data.recall.context}
                      hint="Oficina, teletrabajo, fin de semana, día de entrenamiento…"
                      onChange={(v: string) => set("recall", "context", v)}
                    />
                  </div>
                  {data.recall.meals.map((m: any, i: number) => (
                    <div className="cw-meal" key={m.name}>
                      <h3>{m.name}</h3>
                      <div className="cw-grid">
                        <Field
                          label={m.name + ": hora"}
                          type="time"
                          value={m.time}
                          onChange={(v: string) =>
                            change((d) => {
                              d.recall.meals[i].time = v;
                            })
                          }
                        />
                        <Field
                          label={m.name + ": alimentos y bebidas"}
                          value={m.food}
                          onChange={(v: string) =>
                            change((d) => {
                              d.recall.meals[i].food = v;
                            })
                          }
                        />
                        <Field
                          label={m.name + ": cantidad / medida casera"}
                          value={m.amount}
                          onChange={(v: string) =>
                            change((d) => {
                              d.recall.meals[i].amount = v;
                            })
                          }
                        />
                        <Field
                          label={m.name + ": preparación y agregados"}
                          value={m.preparation}
                          onChange={(v: string) =>
                            change((d) => {
                              d.recall.meals[i].preparation = v;
                            })
                          }
                        />
                      </div>
                    </div>
                  ))}
                  <Field
                    label="¿Fue un día habitual? Diferencias entre semana y fin de semana"
                    type="textarea"
                    value={data.recall.typical}
                    onChange={(v: string) => set("recall", "typical", v)}
                  />
                </Card>
              </>
            )}
            {tab === "Mediciones" && (
              <>
                <Card
                  title="Mediciones de esta atención"
                  subtitle="En online puedes registrar solo lo disponible; las cifras anteriores no se copian como mediciones nuevas."
                >
                  <Field
                    label="Procedencia de las mediciones"
                    value={data.measurementSource}
                    options={[
                      ["", "Seleccionar"],
                      ["clinic", "Medidas en consulta"],
                      ["home_measured", "Medidas en casa con instrucciones"],
                      ["self_reported", "Informadas por el paciente"],
                      ["device_estimate", "Estimación de dispositivo"],
                    ]}
                    onChange={(v: string) => set("", "measurementSource", v)}
                  />
                  <div className="cw-grid">
                    {measureFields.map(([k, l, u]) => (
                      <Field
                        key={k}
                        label={l + " (" + u + ")"}
                        inputMode="decimal"
                        value={data.measurements[k]}
                        onChange={(v: string) => set("measurements", k, v)}
                      />
                    ))}
                  </div>
                  <div className="cw-stat-row">
                    <Stat
                      label="IMC"
                      value={
                        num(data.measurements.weight)! > 0 &&
                        num(data.measurements.height)! > 0
                          ? num(data.measurements.weight)! /
                            (num(data.measurements.height)! / 100) ** 2
                          : null
                      }
                    />
                    <Stat
                      label="Cintura / cadera"
                      value={
                        num(data.measurements.waistWHO)! > 0 &&
                        num(data.measurements.hip)! > 0
                          ? num(data.measurements.waistWHO)! /
                            num(data.measurements.hip)!
                          : null
                      }
                    />
                    <Stat
                      label="Cintura / estatura"
                      value={
                        num(data.measurements.waistWHO)! > 0 &&
                        num(data.measurements.height)! > 0
                          ? num(data.measurements.waistWHO)! /
                            num(data.measurements.height)!
                          : null
                      }
                    />
                  </div>
                </Card>
                <Card
                  title="InBody, laboratorio y fotografías"
                  subtitle="Se conservan la lectura de PDF con revisión, las fechas de muestra y los archivos privados."
                >
                  <p>
                    Los resultados ya cargados se incluyen en la evolución. Para
                    agregar o revisar un PDF, abre la ficha de seguimiento.
                  </p>
                  <button onClick={() => leave("Atención actual")}>
                    Abrir carga de PDF y resultados
                  </button>
                  <button onClick={() => leave("Evolución")}>
                    Ver gráficos y seguimiento fotográfico
                  </button>
                  {currentInBody && (
                    <p>
                      InBody de esta atención: medición{" "}
                      {display(currentInBody.date)} · grasa{" "}
                      {format(currentInBody.data.fatPercent)} % · masa muscular{" "}
                      {format(currentInBody.data.muscle)} kg.
                    </p>
                  )}
                </Card>
              </>
            )}
            {tab === "Energía y pauta" && (
              <>
                <Card
                  title="Estimación energética"
                  subtitle="Compara métodos y elige la referencia del plan. Los resultados son estimaciones."
                >
                  <div className="cw-grid">
                    <Field
                      label="Fecha de nacimiento"
                      type="date"
                      value={data.demographics.birthDate}
                      onChange={(v: string) =>
                        set("demographics", "birthDate", v)
                      }
                    />
                    <Field
                      label="Edad (si no hay fecha de nacimiento)"
                      value={data.demographics.age}
                      inputMode="numeric"
                      onChange={(v: string) => set("demographics", "age", v)}
                    />
                    <Field
                      label="Sexo para la ecuación"
                      value={data.demographics.sex}
                      options={[
                        ["", "Seleccionar"],
                        ["female", "Femenino"],
                        ["male", "Masculino"],
                      ]}
                      onChange={(v: string) => set("demographics", "sex", v)}
                    />
                    <Field
                      label="Peso de referencia para cálculo (kg)"
                      value={
                        energy.referenceWeight ??
                        data.measurements.weight ??
                        currentInBody?.data.weight
                      }
                      inputMode="decimal"
                      onChange={(v: string) =>
                        set("energy", "referenceWeight", v)
                      }
                    />
                    <Field
                      label="Estatura de referencia para cálculo (cm)"
                      value={
                        energy.referenceHeight ??
                        data.measurements.height ??
                        currentInBody?.data.height
                      }
                      inputMode="decimal"
                      onChange={(v: string) =>
                        set("energy", "referenceHeight", v)
                      }
                    />
                    <Field
                      label="Grasa corporal para cálculo (%)"
                      value={
                        energy.fatPercent ?? currentInBody?.data.fatPercent
                      }
                      inputMode="decimal"
                      onChange={(v: string) => set("energy", "fatPercent", v)}
                    />
                    <Field
                      label="Masa libre de grasa medida (kg, opcional)"
                      value={energy.leanMass}
                      inputMode="decimal"
                      onChange={(v: string) => set("energy", "leanMass", v)}
                    />
                    <Field
                      label="Factor de actividad (1–3)"
                      value={energy.factor}
                      inputMode="decimal"
                      onChange={(v: string) => set("energy", "factor", v)}
                    />
                  </div>
                  <div className="cw-table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Ecuación</th>
                          <th>Reposo (kcal/día)</th>
                          <th>Con factor de actividad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["mifflinStJeor", "Mifflin–St Jeor"],
                          [
                            "harrisBenedictOriginal",
                            "Harris–Benedict original",
                          ],
                          ["katchMcArdle", "Katch–McArdle"],
                          ["cunningham1980", "Cunningham (1980)"],
                        ].map(([key, label]) => (
                          <tr key={key}>
                            <th>{label}</th>
                            <td>{format((rest as any)[key])}</td>
                            <td>
                              {format(
                                (rest as any)[key] !== null &&
                                  factor &&
                                  factor >= 1 &&
                                  factor <= 3
                                  ? (rest as any)[key] * factor
                                  : null,
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
                <Card
                  title="Gasto por actividades semanales"
                  subtitle="Usa actividades, no nombres de días. El total semanal se distribuye entre siete para obtener el promedio diario."
                >
                  <Activities
                    values={data.activities}
                    nested
                    onChange={(v: any) => set("", "activities", v)}
                  />
                  <label className="cw-check">
                    <input
                      type="checkbox"
                      checked={energy.noExercise === true}
                      onChange={(e) =>
                        set("energy", "noExercise", e.target.checked)
                      }
                    />
                    Paciente informa que no realiza ejercicio planificado.
                  </label>
                  <p className="cw-muted">
                    Para calcular, completa los MET y la frecuencia de todas las
                    actividades incluidas.
                  </p>
                  <div className="cw-stat-row">
                    <Stat
                      label="Ejercicio neto semanal"
                      value={training?.netWeekly}
                      unit="kcal/semana"
                    />
                    <Stat
                      label="Ejercicio neto diario promedio"
                      value={training?.netDaily}
                      unit="kcal/día"
                    />
                  </div>
                  <div className="cw-grid">
                    <Field
                      label="Ecuación de reposo para componentes"
                      value={energy.restMethod || "mifflinStJeor"}
                      options={[
                        ["mifflinStJeor", "Mifflin–St Jeor"],
                        ["harrisBenedictOriginal", "Harris–Benedict"],
                        ["katchMcArdle", "Katch–McArdle"],
                        ["cunningham1980", "Cunningham"],
                      ]}
                      onChange={(v: string) => set("energy", "restMethod", v)}
                    />
                    <Field
                      label="Pasos diarios fuera del ejercicio"
                      value={energy.stepsOutside}
                      inputMode="decimal"
                      hint="Descuenta los pasos del entrenamiento que ya estimaste como ejercicio."
                      onChange={(v: string) => set("energy", "stepsOutside", v)}
                    />
                    <Field
                      label="Termogénesis (% del gasto total)"
                      value={energy.tef}
                      inputMode="decimal"
                      onChange={(v: string) => set("energy", "tef", v)}
                    />
                  </div>
                  <label className="cw-check">
                    <input
                      type="checkbox"
                      checked={energy.overlapReviewed === true}
                      onChange={(e) =>
                        set("energy", "overlapReviewed", e.target.checked)
                      }
                    />
                    Revisé que los pasos y el ejercicio no estén contados dos
                    veces.
                  </label>
                  <p className="cw-muted">
                    NEAT aproximado: {format(neat)} kcal/día. Supuesto de
                    caminata: 83 pasos/min y 2 MET netos. Ejercicio: MET menos 1
                    MET de reposo. Termogénesis aplicada al total.
                  </p>
                  <Stat
                    label="Gasto total por componentes"
                    value={components?.totalDaily}
                    unit="kcal/día"
                  />
                </Card>
                <Card title="Objetivo calórico y macronutrientes">
                  <div className="cw-grid">
                    <Field
                      label="Método elegido para el plan"
                      value={energy.method}
                      options={[
                        ["mifflinStJeor", "Mifflin × factor"],
                        ["harrisBenedictOriginal", "Harris–Benedict × factor"],
                        ["katchMcArdle", "Katch–McArdle × factor"],
                        ["cunningham1980", "Cunningham × factor"],
                        ["components", "Cálculo por componentes"],
                        ["manual", "Estimación definida en consulta"],
                      ]}
                      onChange={(v: string) => set("energy", "method", v)}
                    />
                    {energy.method === "manual" && (
                      <Field
                        label="Gasto estimado manual (kcal/día)"
                        value={energy.manualTotal}
                        inputMode="decimal"
                        onChange={(v: string) =>
                          set("energy", "manualTotal", v)
                        }
                      />
                    )}
                    <Field
                      label="Ajuste energético (kcal/día)"
                      value={energy.adjustment}
                      inputMode="decimal"
                      hint="Déficit negativo, superávit positivo, mantenimiento 0. Ej.: −500."
                      onChange={(v: string) => set("energy", "adjustment", v)}
                    />
                    <Field
                      label="Peso de referencia para macros (kg)"
                      value={energy.macroWeight ?? weight}
                      inputMode="decimal"
                      onChange={(v: string) => set("energy", "macroWeight", v)}
                    />
                    <Field
                      label="Proteínas: cantidad"
                      value={energy.proteinValue}
                      inputMode="decimal"
                      onChange={(v: string) => set("energy", "proteinValue", v)}
                    />
                    <Field
                      label="Proteínas: unidad"
                      value={energy.proteinUnit}
                      options={[
                        ["g_per_kg", "g/kg/día"],
                        ["g_day", "g/día"],
                      ]}
                      onChange={(v: string) => set("energy", "proteinUnit", v)}
                    />
                    <Field
                      label="Grasas: cantidad"
                      value={energy.fatValue}
                      inputMode="decimal"
                      onChange={(v: string) => set("energy", "fatValue", v)}
                    />
                    <Field
                      label="Grasas: unidad"
                      value={energy.fatUnit}
                      options={[
                        ["g_per_kg", "g/kg/día"],
                        ["g_day", "g/día"],
                      ]}
                      onChange={(v: string) => set("energy", "fatUnit", v)}
                    />
                  </div>
                  <div className="cw-stat-row">
                    <Stat
                      label="Gasto elegido"
                      value={estimated}
                      unit="kcal/día"
                    />
                    <Stat
                      label="Ingesta objetivo"
                      value={macro?.target}
                      unit="kcal/día"
                    />
                    <Stat
                      label="Proteínas"
                      value={macro?.proteinG}
                      unit="g/día"
                    />
                    <Stat label="Grasas" value={macro?.fatG} unit="g/día" />
                    <Stat
                      label="Carbohidratos"
                      value={macro?.carbohydrateG}
                      unit="g/día"
                    />
                  </div>
                  {macro?.error && <p className="cw-alert">{macro.error}</p>}
                </Card>
                <Portions
                  data={data}
                  totals={exchange}
                  targets={targets}
                  change={change}
                />
              </>
            )}
            {tab === "Cierre" && (
              <>
                <Card title="Evaluación e indicaciones acordadas">
                  <Field
                    label="Evaluación / problemas identificados"
                    type="textarea"
                    value={data.closing.assessment}
                    onChange={(v: string) => set("closing", "assessment", v)}
                  />
                  <div className="cw-grid">
                    <Field
                      label="Estrategia alimentaria"
                      value={data.closing.dietStrategy}
                      options={[
                        ["", "Seleccionar"],
                        ...definitions.dietStrategies,
                      ]}
                      onChange={(v: string) =>
                        set("closing", "dietStrategy", v)
                      }
                    />
                    <Field
                      label="Derivación a nutricionista u otro profesional"
                      value={data.closing.referral}
                      onChange={(v: string) => set("closing", "referral", v)}
                    />
                    <Field
                      label="Orientaciones alimentarias / material compartido"
                      type="textarea"
                      value={data.closing.dietNotes}
                      onChange={(v: string) => set("closing", "dietNotes", v)}
                    />
                    <Field
                      label="Nuevas indicaciones de tratamiento"
                      type="textarea"
                      hint="Distingue cambios o nuevas prescripciones de los medicamentos en uso."
                      value={data.closing.treatmentInstructions}
                      onChange={(v: string) =>
                        set("closing", "treatmentInstructions", v)
                      }
                    />
                    <Field
                      label="Meta mínima de pasos (pasos/día)"
                      inputMode="numeric"
                      value={data.closing.stepsMin}
                      onChange={(v: string) => set("closing", "stepsMin", v)}
                    />
                    <Field
                      label="Meta ideal de pasos (pasos/día)"
                      inputMode="numeric"
                      value={data.closing.stepsIdeal}
                      onChange={(v: string) => set("closing", "stepsIdeal", v)}
                    />
                    <Field
                      label="Meta fuerza (sesiones/semana)"
                      inputMode="decimal"
                      value={data.closing.strength}
                      onChange={(v: string) => set("closing", "strength", v)}
                    />
                    <Field
                      label="Meta cardio (minutos/semana)"
                      inputMode="numeric"
                      value={data.closing.cardio}
                      onChange={(v: string) => set("closing", "cardio", v)}
                    />
                    <Field
                      label="Exámenes solicitados / pendientes"
                      type="textarea"
                      value={data.closing.exams}
                      onChange={(v: string) => set("closing", "exams", v)}
                    />
                    <Field
                      label="Otras indicaciones"
                      type="textarea"
                      value={data.closing.notes}
                      onChange={(v: string) => set("closing", "notes", v)}
                    />
                    <Field
                      label="Próximo control recomendado"
                      type="date"
                      value={data.closing.nextVisit}
                      onChange={(v: string) => set("closing", "nextVisit", v)}
                    />
                    <Field
                      label="Cita agendada en Reservo (si ya existe)"
                      type="date"
                      value={data.closing.bookedVisit}
                      onChange={(v: string) => set("closing", "bookedVisit", v)}
                    />
                  </div>
                  <button
                    onClick={() =>
                      set("closing", "nextVisit", recommendedNextVisit(date))
                    }
                  >
                    Sugerir control en 6 semanas
                  </button>
                </Card>
                <div className="cw-grid">
                  <Card
                    title="Texto para la ficha de Reservo"
                    action={<Copy text={text.clinical} />}
                  >
                    <textarea
                      aria-label="Resumen clínico para copiar"
                      readOnly
                      rows={16}
                      value={text.clinical}
                    />
                  </Card>
                  <Card
                    title="Resumen para el paciente"
                    subtitle="Revisa el contenido antes de compartirlo."
                    action={<Copy text={text.patientText} />}
                  >
                    <textarea
                      aria-label="Resumen para el paciente"
                      readOnly
                      rows={16}
                      value={text.patientText}
                    />
                    {patient.phone && (
                      <a
                        className="cw-button"
                        href={
                          "https://wa.me/" +
                          patient.phone.replace(/\D/g, "") +
                          "?text=" +
                          encodeURIComponent(text.patientText)
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        Preparar WhatsApp
                      </a>
                    )}
                    <p className="cw-muted">
                      Abrir WhatsApp prepara el mensaje; tú decides cuándo
                      enviarlo.
                    </p>
                  </Card>
                </div>
              </>
            )}
            {tab === "Evolución" && (
              <Evolution
                bundle={bundle}
                date={date}
                choose={(d: string) => {
                  if (choose(d) !== false) setTab("Consulta");
                }}
                onLegacy={() => leave("Evolución")}
              />
            )}
            {tab === "Plantillas" && (
              <Library patient={patient} onDirty={setLibraryDirty} />
            )}
            <details className="cw-card cw-history-list">
              <summary>Registros previos ({allDates.length})</summary>
              <div className="cw-date-list">
                {allDates.map((d, i) => (
                  <button
                    key={d}
                    aria-pressed={date === d}
                    onClick={() => choose(d)}
                  >
                    {i === 0 ? "Atención inicial" : "Control " + i} ·{" "}
                    {display(d)}
                  </button>
                ))}
              </div>
            </details>
            <footer className="cw-footer">
              <span>
                {dirty
                  ? "Cambios sin guardar"
                  : version
                    ? "Guardado"
                    : "Sin registro guardado"}{" "}
                · {display(date)}
              </span>
              <button className="cw-primary" disabled={busy} onClick={save}>
                {busy ? "Guardando…" : "Guardar consulta"}
              </button>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}
function Stat({ label, value, unit = "" }: any) {
  return (
    <div className="cw-stat">
      <span>{label}</span>
      <strong>
        {format(value)}
        {typeof value === "number" ? " " + unit : ""}
      </strong>
    </div>
  );
}
function HistorySummary({ history, override, onChange }: any) {
  let r: any;
  try {
    r = historyForReservo(history);
  } catch (e: any) {
    return (
      <Card title="Resumen para Reservo">
        <p>{e.message}</p>
      </Card>
    );
  }
  if (override !== undefined) {
    r = {
      text: override,
      count: override.length,
      fits: override.length <= 400,
      remaining: 400 - override.length,
    };
  }
  return (
    <Card
      title="Resumen de antecedentes para Reservo"
      subtitle={
        r.count +
        "/400 caracteres · " +
        (r.fits
          ? "Dentro del límite"
          : "Abrevia este resumen; los antecedentes completos se conservan.")
      }
      action={<Copy text={r.fits ? r.text : ""} />}
    >
      <textarea
        aria-label="Resumen de antecedentes para Reservo"
        rows={5}
        value={r.text}
        onChange={(e) => onChange(e.target.value)}
      />
      {override !== undefined && (
        <>
          <p className="cw-muted">
            Resumen editado manualmente. Revisa que corresponda a los
            antecedentes actuales.
          </p>
          <button onClick={() => onChange(undefined)}>
            Regenerar desde antecedentes completos
          </button>
        </>
      )}
      {!r.fits && (
        <p className="cw-alert">
          Supera el límite por {-r.remaining} caracteres. No se ha recortado ni
          perdido información.
        </p>
      )}
    </Card>
  );
}
function TreatmentList({ title, values, onChange }: any) {
  return (
    <div className="cw-treatment">
      <h3>{title}</h3>
      {values.map((m: any, i: number) => (
        <div className="cw-repeater" key={i}>
          <div className="cw-grid">
            {[
              ["name", "Nombre"],
              ["dose", "Dosis"],
              ["frequency", "Frecuencia"],
              ["notes", "Notas"],
            ].map(([k, l]) => (
              <Field
                key={k}
                label={title + " " + (i + 1) + ": " + l}
                value={m[k]}
                onChange={(v: string) => {
                  const list = structuredClone(values);
                  list[i][k] = v;
                  onChange(list);
                }}
              />
            ))}
          </div>
          <button
            onClick={() =>
              onChange(values.filter((_: any, j: number) => j !== i))
            }
          >
            Quitar de esta atención
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...values, newTreatment()])}>
        Agregar{" "}
        {title.toLowerCase().includes("medicamentos")
          ? "medicamento"
          : "suplemento"}
      </button>
    </div>
  );
}
function WeightHistory({ values, onChange }: any) {
  const plot = values
    .map((v: any) => ({
      age: num(v.age),
      weight: num(v.weight),
      event: v.event,
    }))
    .filter((v: any) => v.age !== null && v.weight !== null)
    .sort((a: any, b: any) => a.age - b.age);
  return (
    <Card
      title="Historia del peso"
      subtitle="Pesos recordados y eventos de vida. No se mezclan con las mediciones clínicas."
    >
      {values.map((v: any, i: number) => (
        <div className="cw-repeater" key={v.key}>
          <div className="cw-grid">
            {[
              ["stage", "Etapa de vida"],
              ["age", "Edad aproximada"],
              ["year", "Año aproximado"],
              ["weight", "Peso aproximado (kg)"],
              ["event", "Evento / contexto"],
            ].map(([k, l]) => (
              <Field
                key={k}
                label={l + " " + (i + 1)}
                value={v[k]}
                onChange={(s: string) => {
                  const next = structuredClone(values);
                  next[i][k] = s;
                  onChange(next);
                }}
              />
            ))}
          </div>
          <button
            onClick={() =>
              onChange(values.filter((_: any, j: number) => i !== j))
            }
          >
            Quitar punto
          </button>
        </div>
      ))}
      <button
        onClick={() =>
          onChange([
            ...values,
            { key: uid(), stage: "", age: "", year: "", weight: "", event: "" },
          ])
        }
      >
        Agregar etapa / evento
      </button>
      {plot.length > 1 && (
        <div className="cw-chart">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={plot}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="age"
                domain={["dataMin", "dataMax"]}
                label={{
                  value: "Edad aproximada",
                  position: "insideBottom",
                  offset: -3,
                }}
              />
              <YAxis unit=" kg" />
              <Tooltip
                formatter={(v: any) => [format(v) + " kg", "Peso recordado"]}
                labelFormatter={(age: any, p: any) =>
                  "Edad " + age + " · " + (p[0]?.payload?.event || "")
                }
              />
              <Line dataKey="weight" stroke="#07849c" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
function Activities({ values, onChange, nested = false }: any) {
  const content = (
    <>
      {values.map((a: any, i: number) => (
        <div className="cw-repeater" key={a.key}>
          <h3>Actividad {i + 1}</h3>
          <div className="cw-grid">
            <Field
              label={"Actividad " + (i + 1) + ": disciplina"}
              value={a.name}
              list={"sports-" + a.key}
              onChange={(v: string) => {
                const next = structuredClone(values);
                next[i].name = v;
                const selected = activityCatalog.activities.find(
                  (a) => a.name === v,
                );
                if (selected) next[i].met = String(selected.met);
                onChange(next);
              }}
            />
            <datalist id={"sports-" + a.key}>
              {activityCatalog.activities.map((m) => (
                <option key={m.id} value={m.name} />
              ))}
            </datalist>
            <Field
              label={"Actividad " + (i + 1) + ": categoría"}
              value={a.category}
              options={[
                ["fuerza", "Fuerza"],
                ["cardiovascular", "Cardiovascular"],
              ]}
              onChange={(v: string) => {
                const next = structuredClone(values);
                next[i].category = v;
                onChange(next);
              }}
            />
            <Field
              label={"Actividad " + (i + 1) + ": método de estimación"}
              value={a.method || "met"}
              options={[
                ["met", "MET × tiempo"],
                ["manual", "Dato manual neto semanal"],
              ]}
              onChange={(v: string) => {
                const next = structuredClone(values);
                next[i].method = v;
                onChange(next);
              }}
            />
            {a.method === "manual" && (
              <Field
                label={
                  "Actividad " + (i + 1) + ": gasto manual neto (kcal/semana)"
                }
                value={a.manualCalories}
                inputMode="decimal"
                hint="Sustituye el cálculo por MET. Usa gasto neto, descontado el reposo."
                onChange={(v: string) => {
                  const next = structuredClone(values);
                  next[i].manualCalories = v;
                  onChange(next);
                }}
              />
            )}
            {[
              ["sessions", "Sesiones/semana"],
              ["minutes", "Minutos/sesión"],
              ["met", "MET"],
              ["intensity", "Intensidad / notas"],
            ].map(([k, l]) => (
              <Field
                key={k}
                label={"Actividad " + (i + 1) + ": " + l}
                value={a[k]}
                onChange={(v: string) => {
                  const next = structuredClone(values);
                  next[i][k] = v;
                  onChange(next);
                }}
              />
            ))}
          </div>
          <p className="cw-muted">
            Total semanal:{" "}
            {format(
              num(a.sessions)! >= 0 &&
                num(a.minutes)! >= 0 &&
                num(a.sessions) !== null &&
                num(a.minutes) !== null
                ? num(a.sessions)! * num(a.minutes)!
                : null,
            )}{" "}
            minutos.
          </p>
          <label className="cw-check">
            <input
              type="checkbox"
              checked={a.included !== false}
              onChange={(e) => {
                const next = structuredClone(values);
                next[i].included = e.target.checked;
                onChange(next);
              }}
            />
            Incluir en estimación energética
          </label>
        </div>
      ))}
      <button onClick={() => onChange([...values, newActivity()])}>
        Agregar actividad semanal
      </button>
    </>
  );
  return nested ? (
    content
  ) : (
    <Card
      title="Ejercicio habitual"
      subtitle="Registra cada actividad con su frecuencia semanal, sin asignarla a un día específico."
    >
      {content}
    </Card>
  );
}
function Drinks({ values, onChange }: any) {
  const update = (list: any[]) => {
    const filled = list.filter(
      (d) => num(d.volume) !== null && num(d.count) !== null,
    );
    const sum = (items: any[]) =>
      items.reduce((s, d) => s + (num(d.volume)! * num(d.count)!) / 1000, 0);
    onChange(
      list,
      filled.length ? sum(filled) : null,
      filled.length ? sum(filled.filter((d) => d.name === "Agua")) : null,
    );
  };
  return (
    <Card
      title="Hidratación"
      subtitle="Usa el tamaño real del vaso, taza o botella. Se suman mililitros × cantidad para obtener litros diarios."
    >
      {values.map((d: any, i: number) => (
        <div className="cw-grid cw-repeater" key={d.key}>
          <Field
            label={"Bebida " + (i + 1)}
            value={d.name}
            options={[
              "Agua",
              "Té",
              "Café",
              "Infusión",
              "Jugo",
              "Bebida sin azúcar",
              "Bebida azucarada",
              "Otra",
            ]}
            onChange={(v: string) => {
              const n = structuredClone(values);
              n[i].name = v;
              update(n);
            }}
          />
          <Field
            label={"Volumen por recipiente " + (i + 1) + " (ml)"}
            value={d.volume}
            inputMode="decimal"
            onChange={(v: string) => {
              const n = structuredClone(values);
              n[i].volume = v;
              update(n);
            }}
          />
          <Field
            label={"Cantidad diaria " + (i + 1)}
            value={d.count}
            inputMode="decimal"
            onChange={(v: string) => {
              const n = structuredClone(values);
              n[i].count = v;
              update(n);
            }}
          />
          <button
            onClick={() =>
              update(values.filter((_: any, j: number) => i !== j))
            }
          >
            Quitar bebida
          </button>
        </div>
      ))}
      <button
        onClick={() =>
          update([
            ...values,
            { key: uid(), name: "Agua", volume: "250", count: "" },
          ])
        }
      >
        Agregar bebida / recipiente
      </button>
      <p>
        Total cuantificado:{" "}
        <strong>
          {format(
            values.some(
              (d: any) => num(d.volume) !== null && num(d.count) !== null,
            )
              ? values.reduce(
                  (s: number, d: any) =>
                    s + ((num(d.volume) ?? 0) * (num(d.count) ?? 0)) / 1000,
                  0,
                )
              : null,
          )}{" "}
          L/día
        </strong>
      </p>
    </Card>
  );
}
function Portions({ data, totals, targets, change }: any) {
  const portions = Object.fromEntries(
    Object.entries(data.portions).map(([k, v]) => [k, num(v) ?? 0]),
  );
  const meals = [
    "Desayuno",
    "Colación AM",
    "Almuerzo",
    "Colación PM",
    "Once / cena",
  ];
  const allocations = meals.map((m) =>
    Object.fromEntries(
      Object.entries(data.allocations[m] || {}).map(([k, v]) => [
        k,
        num(v) ?? 0,
      ]),
    ),
  );
  let distribution: any = {};
  try {
    distribution = portionAllocation(portions, allocations);
  } catch {}
  return (
    <Card
      title="Porciones de intercambio"
      subtitle="Valores del Excel aportado (referencia UDD 2019). Los totales y la adecuación se calculan al editar."
    >
      <div className="cw-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Grupo</th>
              <th>Porciones/día</th>
              <th>kcal</th>
              <th>Proteínas</th>
              <th>Grasas</th>
              <th>Carbohidratos</th>
            </tr>
          </thead>
          <tbody>
            {exchanges.foods.map((f) => (
              <tr key={f.id}>
                <th>{f.name}</th>
                <td>
                  <input
                    aria-label={"Porciones de " + f.name}
                    inputMode="decimal"
                    value={data.portions[f.id] ?? ""}
                    onChange={(e) =>
                      change((d: any) => {
                        d.portions[f.id] = e.target.value;
                      })
                    }
                  />
                </td>
                {["kcal", "protein", "fat", "carbohydrate"].map((k) => (
                  <td key={k}>
                    {format((f as any)[k] * (num(data.portions[f.id]) ?? 0))}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <th>Total</th>
              <td></td>
              {["kcal", "protein", "fat", "carbohydrate"].map((k) => (
                <td key={k}>{format(totals?.totals[k])}</td>
              ))}
            </tr>
            <tr>
              <th>Adecuación</th>
              <td></td>
              {["kcal", "protein", "fat", "carbohydrate"].map((k) => (
                <td key={k}>
                  {format(totals?.adequacy[k])}
                  {totals?.adequacy[k] !== null ? " %" : ""}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <details>
        <summary>Distribuir porciones entre comidas</summary>
        <div className="cw-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Grupo</th>
                {meals.map((m) => (
                  <th key={m}>{m}</th>
                ))}
                <th>Pendiente</th>
              </tr>
            </thead>
            <tbody>
              {exchanges.foods
                .filter((f) => (num(data.portions[f.id]) ?? 0) > 0)
                .map((f) => (
                  <tr key={f.id}>
                    <th>{f.name}</th>
                    {meals.map((m) => (
                      <td key={m}>
                        <input
                          aria-label={m + ": " + f.name}
                          inputMode="decimal"
                          value={data.allocations[m]?.[f.id] ?? ""}
                          onChange={(e) =>
                            change((d: any) => {
                              d.allocations[m] ??= {};
                              d.allocations[m][f.id] = e.target.value;
                            })
                          }
                        />
                      </td>
                    ))}
                    <td
                      className={
                        distribution[f.id]?.status === "excess"
                          ? "cw-danger"
                          : ""
                      }
                    >
                      {format(distribution[f.id]?.remaining)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </details>
    </Card>
  );
}
function Evolution({ bundle, date, choose, onLegacy }: any) {
  const [category, setCategory] = useState("anthropometry"),
    [metric, setMetric] = useState("weight");
  const categories: any = {
    anthropometry: ["Antropometría", measureFields],
    habits: [
      "Hábitos",
      [
        ...habitFields,
        ["liquids", "Líquidos", "L/día"],
        ["strengthSessions", "Entrenamientos de fuerza", "sesiones/semana"],
        ["strengthMinutes", "Fuerza total", "min/semana"],
        [
          "cardioSessions",
          "Entrenamientos cardiovasculares",
          "sesiones/semana",
        ],
        ["cardioMinutes", "Cardio total", "min/semana"],
        ["adherencePercent", "Adherencia autoinformada", "%"],
      ],
    ],
    food: ["Alimentación", foodFields],
    lab: ["Laboratorio", []],
  };
  const metrics = categories[category][1];
  const records = bundle.records
    .filter((r: any) => r.kind === (category === "food" ? "habits" : category))
    .map((r: any) => ({ ...r, data: { ...r.data } }));
  if (category === "habits") {
    const exerciseByDate = new Map<string, any>();
    for (const r of bundle.records.filter((r: any) => r.kind === "exercise")) {
      const d = r.attention_date || r.date;
      let entry = exerciseByDate.get(d);
      if (!entry) {
        entry = { kind: "habits", date: d, data: {} };
        exerciseByDate.set(d, entry);
      }
      const prefix = r.data.category === "fuerza" ? "strength" : "cardio";
      entry.data[prefix + "Sessions"] =
        (entry.data[prefix + "Sessions"] || 0) + (r.data.sessions || 0);
      entry.data[prefix + "Minutes"] =
        (entry.data[prefix + "Minutes"] || 0) +
        (r.data.minutes || 0) * (r.data.sessions || 0);
    }
    records.push(...exerciseByDate.values());
    for (const r of records)
      if (typeof r.data.adherence === "number")
        r.data = { ...r.data, adherencePercent: r.data.adherence * 10 };
  }
  const labs = [...new Set(records.map((r: any) => r.data.name))] as string[];
  const [lab, setLab] = useState("");
  const selectedLab = lab || labs[0];
  const chart = records
    .filter((r: any) =>
      category === "lab"
        ? r.data.name === selectedLab
        : typeof r.data[metric] === "number",
    )
    .map((r: any) => ({
      date: r.date,
      time: Date.parse(r.date + "T12:00:00Z"),
      value: category === "lab" ? r.data.value : r.data[metric],
      unit:
        category === "lab"
          ? r.data.unit
          : metrics.find((m: any) => m[0] === metric)?.[2],
      source: r.attention_date || r.date,
      qualitative: r.data.qualitative,
    }))
    .sort((a: any, b: any) => a.time - b.time);
  const comparable =
    category === "lab"
      ? chart.filter(
          (r: any) =>
            typeof r.value === "number" &&
            r.unit ===
              chart.filter((p: any) => typeof p.value === "number").at(-1)
                ?.unit,
        )
      : chart;
  return (
    <>
      <Card
        title="Evolución"
        subtitle="Las mediciones mantienen su fecha y los controles, su contexto de tratamiento."
      >
        <div className="cw-pills">
          {Object.entries(categories).map(([key, v]: any) => (
            <button
              key={key}
              aria-pressed={category === key}
              onClick={() => {
                setCategory(key);
                setMetric(v[1][0]?.[0] || "");
              }}
            >
              {v[0]}
            </button>
          ))}
          <button onClick={onLegacy}>Fotografías / InBody completo</button>
        </div>
        {category === "lab" ? (
          <Field
            label="Examen para comparar"
            value={selectedLab || ""}
            options={labs.length ? labs : [["", "Sin resultados"]]}
            onChange={setLab}
          />
        ) : (
          <Field
            label="Variable"
            value={metric}
            options={metrics.map((m: any) => [m[0], m[1] + " (" + m[2] + ")"])}
            onChange={setMetric}
          />
        )}
        {comparable.length ? (
          <div className="cw-chart">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={comparable}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={(v) =>
                    display(new Date(v).toISOString().slice(0, 10))
                  }
                />
                <YAxis width={55} />
                <Tooltip
                  labelFormatter={(v: any) =>
                    display(new Date(Number(v)).toISOString().slice(0, 10))
                  }
                  formatter={(v: any, _, p: any) => [
                    format(v) + " " + (p.payload.unit || ""),
                    "Resultado",
                  ]}
                />
                <Line
                  dataKey="value"
                  stroke="#07849c"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p>No hay mediciones numéricas comparables para esta selección.</p>
        )}
        {category === "lab" && (
          <p className="cw-muted">
            Solo se grafican juntos los resultados con la misma unidad. Las
            referencias pertenecen a cada informe.
          </p>
        )}
        <div className="cw-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha medición</th>
                <th>Resultado</th>
                <th>Unidad</th>
              </tr>
            </thead>
            <tbody>
              {chart.map((r: any, i: number) => (
                <tr key={i}>
                  <td>{display(r.date)}</td>
                  <td>{r.qualitative || format(r.value)}</td>
                  <td>{r.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card title="Resumen de controles">
        <div className="cw-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Atención</th>
                <th>Adherencia</th>
                <th>Cambios / dificultades</th>
                <th>Tratamiento en uso</th>
                <th>Próximo control</th>
              </tr>
            </thead>
            <tbody>
              {bundle.visits.map((v: any) => (
                <tr key={v.date}>
                  <td>
                    <button onClick={() => choose(v.date)}>
                      {display(v.date)}
                    </button>
                  </td>
                  <td>
                    {v.data.general?.adherencePercent !== undefined
                      ? v.data.general.adherencePercent + " %"
                      : "No registrado"}
                  </td>
                  <td>
                    {v.data.general?.bodyChanges ||
                      v.data.general?.barriers ||
                      "—"}
                  </td>
                  <td>
                    {v.data.medications
                      ?.map((m: any) => m.name + " " + m.dose)
                      .join("; ") || "Sin registro"}
                  </td>
                  <td>{display(v.data.closing?.nextVisit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
function Library({ patient, onDirty }: any) {
  const [items, setItems] = useState<any[]>([]),
    [draft, setDraft] = useState<any>({
      kind: "prescription",
      title: "",
      content: "",
    }),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  const load = () => api("/document-templates").then(setItems);
  useEffect(() => {
    void load().catch((e) => setError(e.message));
  }, []);
  const save = async () => {
    setError("");
    setBusy(true);
    try {
      await api(
        "/document-templates" + (draft.id ? "/" + draft.id : ""),
        draft.id ? "PATCH" : "POST",
        {
          kind: draft.kind,
          title: draft.title,
          content: draft.content,
          ...(draft.id ? { expectedVersion: draft.version } : {}),
        },
      );
      await load();
      setDraft({ kind: "prescription", title: "", content: "" });
      onDirty(false);
      setNotice("Plantilla guardada. No modifica documentos ya emitidos.");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const importFile = async (file: File) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError("El archivo supera 8 MB.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      let text;
      if (file.name.toLowerCase().endsWith(".pdf")) {
        const readerPath = "/assets/read-pdf-1cBH5bjo.js";
        const mod = await import(/* @vite-ignore */ readerPath);
        text = (
          await mod.readPdf(file, setNotice, new AbortController().signal)
        ).text;
      } else if (file.name.toLowerCase().endsWith(".txt"))
        text = await file.text();
      else throw Error("Usa un archivo PDF o TXT.");
      onDirty(true);
      setDraft((d: any) => ({
        ...d,
        title: d.title || file.name.replace(/\.[^.]+$/, ""),
        content: text,
      }));
      setNotice(
        "Texto importado para revisar. Aún no se ha guardado ni enviado.",
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card
      title="Biblioteca de recetas y órdenes"
      subtitle="Puedes cargarlas más adelante. Guarda tus textos habituales y edítalos cuando necesites; no se envían automáticamente."
    >
      {error && (
        <p className="cw-alert" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="cw-success" role="status">
          {notice}
        </p>
      )}
      <div className="cw-grid">
        <Field
          label="Tipo de plantilla"
          value={draft.kind}
          options={[
            ["prescription", "Receta"],
            ["exam_order", "Orden de exámenes"],
          ]}
          onChange={(v: string) => {
            onDirty(true);
            setDraft({ ...draft, kind: v });
          }}
        />
        <Field
          label="Título de la plantilla"
          value={draft.title}
          onChange={(v: string) => {
            onDirty(true);
            setDraft({ ...draft, title: v });
          }}
        />
      </div>
      <Field
        label="Importar texto desde PDF o TXT"
        type="file"
        accept=".pdf,.txt"
        value={undefined}
        onChange={() => {}}
        onInput={(e: any) => {
          void importFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <Field
        label="Texto de la plantilla"
        type="textarea"
        rows={10}
        value={draft.content}
        hint="Campos opcionales: {{paciente}}, {{rut}}, {{fecha}}. Revisa el texto extraído antes de guardarlo."
        onChange={(v: string) => {
          onDirty(true);
          setDraft({ ...draft, content: v });
        }}
      />
      <button
        className="cw-primary"
        disabled={busy || !draft.title.trim() || !draft.content.trim()}
        onClick={save}
      >
        {busy
          ? "Procesando…"
          : draft.id
            ? "Guardar cambios de plantilla"
            : "Guardar plantilla"}
      </button>
      {draft.id && (
        <button
          onClick={() =>
            setDraft({ kind: "prescription", title: "", content: "" })
          }
        >
          Cancelar edición
        </button>
      )}
      <div className="cw-template-list">
        {items.length ? (
          items.map((t) => (
            <article key={t.id}>
              <div>
                <strong>{t.title}</strong>
                <p>
                  {t.kind === "prescription" ? "Receta" : "Orden de exámenes"}
                </p>
              </div>
              <button onClick={() => setDraft(t)}>Editar</button>
              <Copy
                label="Copiar para paciente"
                text={t.content
                  .replace(/\{\{paciente\}\}/g, patient.name)
                  .replace(/\{\{rut\}\}/g, patient.rut || "")
                  .replace(/\{\{fecha\}\}/g, display(today()))}
              />
            </article>
          ))
        ) : (
          <p>
            No hay plantillas guardadas. Este espacio está listo para cargarlas
            cuando quieras.
          </p>
        )}
      </div>
    </Card>
  );
}
