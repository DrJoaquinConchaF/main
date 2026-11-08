import {
  referencePens,
  referenceFile,
  automateClicks,
  calculateClicks,
  milligrams,
} from "./automatic-clicks.mjs";
import {
  PreviousContext,
  PreviousHint,
  previousRow,
} from "../consultation/previous";
import { ClickOptionsEditor } from "./ClickOptionsEditor";
import {
  choicesForPen,
  applyClickChoice,
  clickChartSource,
} from "./click-options.mjs";
import { readDevice, writeDevice } from "./device.mjs";
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  validateCatalog,
  selectedProduct,
  toggleProduct,
  hasClicks,
  setClicks,
} from "./catalog.mjs";
import "./style.css";
async function api(method = "GET", body?: any) {
  const r = await fetch("/api/clinical/treatment-catalog", {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const d: any = await r.json();
  if (!r.ok) throw Error(d.error || "No se pudo cargar el catálogo.");
  return d;
}
export function TreatmentPicker({ title, values, onChange, onConfigure }: any) {
  const [items, setItems] = useState<any[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [query, setQuery] = useState("");
  const previousSnapshot = React.useContext(PreviousContext);
  const kind = title.includes("Medicamentos") ? "medication" : "supplement";
  useEffect(() => {
    let active = true;
    const load = () => {
      setLoading(true);
      api()
        .then((d) => {
          if (active) {
            setItems(d.items);
            setError("");
          }
        })
        .catch((e) => {
          if (active) setError(e.message);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    };
    load();
    window.addEventListener("treatment-catalog-updated", load);
    return () => {
      active = false;
      window.removeEventListener("treatment-catalog-updated", load);
    };
  }, []);
  const available = items.filter((e) => e.kind === kind);
  const edit = (i: number, key: string, value: any) => {
    const next = structuredClone(values);
    next[i][key] = value;
    onChange(next);
  };
  return (
    <div className="cw-treatment treatment-picker">
      <h3>{title}</h3>
      <details className="treatment-selector">
        <summary>
          Seleccionar {kind === "medication" ? "medicamentos" : "suplementos"}{" "}
          <span>{values.filter((v: any) => v.name).length} en uso</span>
        </summary>
        {loading && <p className="cw-muted">Cargando catálogo…</p>}
        {error && (
          <p role="alert">{error} Puedes continuar con el registro manual.</p>
        )}
        <label className="cw-field">
          Buscar en {title.toLowerCase()}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nombre del producto"
          />
        </label>
        <div className="treatment-options">
          {available
            .filter((e) =>
              e.name
                .toLocaleLowerCase("es")
                .includes(query.toLocaleLowerCase("es")),
            )
            .map((e) => (
              <label key={e.id}>
                <input
                  type="checkbox"
                  checked={selectedProduct(values, e.name)}
                  onChange={(event) =>
                    onChange(toggleProduct(values, e, event.target.checked))
                  }
                />
                <span>
                  <strong>{e.name}</strong>
                  <small>
                    {e.doses.length
                      ? `${e.doses.length} ${e.clickCounting ? "presentaciones" : "dosis"} disponibles`
                      : "Dosis personalizada"}
                  </small>
                </span>
              </label>
            ))}
        </div>
        {!available.length && !error && !loading && (
          <p className="cw-muted">
            Sin productos en esta categoría. Puedes agregarlos en Configuración.
          </p>
        )}
        <button onClick={onConfigure}>Configurar catálogo y dosis</button>
      </details>
      {!!values.length && (
        <p className="cw-muted">
          Completa la dosis y frecuencia reales antes de guardar. Las opciones
          del catálogo son editables; no constituyen una pauta.
        </p>
      )}
      {values.map((m: any, i: number) => {
        const entry = available.find((e) => selectedProduct([m], e.name));
        const device = readDevice(m);
        const previousTreatment = previousRow(
          previousSnapshot,
          kind === "medication" ? "medications" : "supplements",
          m,
        );
        const automatic = calculateClicks(device.pen, device.dose);
        const models = /^(wegovy)$/i.test(m.name.trim()) ? referencePens : [];
        const model = models.find((model) => model.pen === device.pen);
        const doseOptions = model
          ? [
              ...new Set([
                ...(entry?.doses || []),
                "0.75 mg",
                "1.2 mg",
                "1.5 mg",
                "2 mg",
              ]),
            ]
              .filter((dose) => (milligrams(dose) ?? Infinity) <= model.mg)
              .sort((a, b) => (milligrams(a) ?? 0) - (milligrams(b) ?? 0))
          : entry?.doses || [];
        const clickChoices = choicesForPen(entry, device.pen);
        const reviewedPens = [
          ...new Set(
            (entry?.clickOptions || [])
              .filter(
                (r: any) => r.verified && choicesForPen(entry, r.pen).length,
              )
              .map((r: any) => r.pen),
          ),
        ] as string[];
        const penProduct =
          !!entry?.clickCounting || hasClicks(m.notes) || !!device.pen;
        const updateDevice = (patch: any) => {
          const next = structuredClone(values);
          next[i] =
            patch.clicks !== undefined
              ? writeDevice(m, patch)
              : automateClicks(writeDevice(m, patch), entry);
          onChange(next);
        };

        return (
          <details className="cw-repeater treatment-selected" key={i} open>
            <summary>
              {m.name || "Nuevo producto"}
              {m.dose ? " · " + m.dose : ""}
            </summary>
            <div className="cw-grid">
              <label className="cw-field">
                {title + " " + (i + 1) + ": Nombre"}
                <input
                  aria-label={title + " " + (i + 1) + ": Nombre"}
                  value={m.name}
                  onChange={(e) => edit(i, "name", e.target.value)}
                />
              </label>
              {penProduct && (
                <fieldset className="dose-options">
                  <legend>{"Elegir lápiz o pluma de " + m.name}</legend>
                  <div className="dose-chips">
                    {reviewedPens.map((pen) => (
                      <button
                        type="button"
                        key={pen}
                        aria-pressed={device.pen === pen}
                        onClick={() => updateDevice({ pen })}
                      >
                        {pen}
                      </button>
                    ))}
                    {models.map((model) => (
                      <button
                        type="button"
                        key={model.pen}
                        aria-pressed={device.pen === model.pen}
                        onClick={() => updateDevice({ pen: model.pen })}
                      >
                        {model.mg} mg/dosis · {model.clicks} clics · {model.ml}{" "}
                        mL
                      </button>
                    ))}
                    {entry?.doses
                      .filter(
                        (dose: string) =>
                          !models.some((model) => dose === model.mg + " mg"),
                      )
                      .map((dose: string) => (
                        <button
                          type="button"
                          key={dose}
                          aria-pressed={
                            device.pen === m.name + " " + dose + "/dosis"
                          }
                          onClick={() =>
                            updateDevice({
                              pen: m.name + " " + dose + "/dosis",
                            })
                          }
                        >
                          {dose}/dosis
                        </button>
                      ))}
                  </div>
                  <small>
                    La presentación no modifica la dosis administrada.
                  </small>
                </fieldset>
              )}
              {penProduct && (
                <label className="cw-field">
                  {"Presentación exacta de " + m.name}
                  <input
                    aria-label={"Presentación exacta de " + m.name}
                    value={device.pen}
                    placeholder="Modelo, país, mg/dosis y concentración si corresponde"
                    onChange={(e) => updateDevice({ pen: e.target.value })}
                  />
                </label>
              )}
              {!!doseOptions.length && (
                <fieldset className="dose-options">
                  <legend>{"Elegir dosis de " + m.name}</legend>
                  <div className="dose-chips">
                    {doseOptions.map((dose: string) => (
                      <button
                        type="button"
                        key={dose}
                        aria-pressed={
                          (penProduct ? device.dose : m.dose) === dose
                        }
                        onClick={() =>
                          penProduct
                            ? updateDevice({ dose })
                            : edit(i, "dose", dose)
                        }
                      >
                        {dose}
                      </button>
                    ))}
                  </div>
                  <small>Puedes escribir una dosis personalizada debajo.</small>
                </fieldset>
              )}
              <label className="cw-field">
                {penProduct
                  ? "Dosis administrada de " + m.name
                  : title + " " + (i + 1) + ": Dosis"}
                <input
                  aria-label={
                    penProduct
                      ? "Dosis administrada de " + m.name
                      : title + " " + (i + 1) + ": Dosis"
                  }
                  value={penProduct ? device.dose : m.dose}
                  placeholder={
                    penProduct
                      ? "Dosis administrada en mg (puede diferir de la pluma)"
                      : "Cantidad, unidad y presentación"
                  }
                  onChange={(e) =>
                    penProduct
                      ? updateDevice({ dose: e.target.value })
                      : edit(i, "dose", e.target.value)
                  }
                />
                <PreviousHint value={previousTreatment.dose} />
                {/hierro/i.test(m.name) && (
                  <small>
                    Especifica formulación y cantidad de hierro elemental cuando
                    corresponda.
                  </small>
                )}
                {/gotas/i.test(m.name) && (
                  <small>Registra gotas y concentración (UI por gota).</small>
                )}
              </label>
              <label className="cw-field">
                {title + " " + (i + 1) + ": Frecuencia"}
                <input
                  aria-label={title + " " + (i + 1) + ": Frecuencia"}
                  value={m.frequency}
                  list={"treatment-frequency-" + kind}
                  placeholder={
                    /orlistat/i.test(m.name)
                      ? "Cápsulas al día y distribución"
                      : "Veces al día, intervalo o días de uso"
                  }
                  onChange={(e) => edit(i, "frequency", e.target.value)}
                />
                <PreviousHint value={previousTreatment.frequency} />
              </label>
            </div>
            {(entry?.clickCounting || hasClicks(m.notes)) && (
              <div className="treatment-clicks">
                <label className="cw-check">
                  <input
                    type="checkbox"
                    checked={hasClicks(m.notes) || !!device.clicks}
                    onChange={(e) => {
                      const next = structuredClone(values);
                      next[i] = e.target.checked
                        ? automateClicks(
                            { ...m, notes: setClicks(m.notes, true) },
                            entry,
                          )
                        : writeDevice(
                            { ...m, notes: setClicks(m.notes, false) },
                            { clicks: "" },
                          );
                      onChange(next);
                    }}
                  />
                  Con conteo de clics
                </label>
                {(hasClicks(m.notes) || !!device.clicks) && (
                  <>
                    <fieldset className="dose-options">
                      <legend>Seleccionar dosis y clics para esta pluma</legend>
                      <div className="dose-chips">
                        {clickChoices.map((choice: any) => (
                          <button
                            type="button"
                            key={choice.dose}
                            aria-pressed={
                              device.dose === choice.dose &&
                              device.clicks === choice.clicks
                            }
                            onClick={() => {
                              const next = structuredClone(values);
                              next[i] = applyClickChoice(m, choice);
                              onChange(next);
                            }}
                          >
                            {choice.dose} ({choice.clicks} clics)
                          </button>
                        ))}
                      </div>
                      {!clickChoices.length && !automatic && (
                        <p className="cw-muted">
                          Selecciona la pluma multidosis de la tabla para
                          calcular automáticamente. Otra presentación requiere
                          su propia referencia. Puedes registrar una combinación
                          revisada en Configuración.
                        </p>
                      )}
                      <a href={referenceFile} target="_blank" rel="noreferrer">
                        Abrir tabla de referencia (PDF) ↗
                      </a>
                    </fieldset>
                    {automatic && (
                      <p className="cw-muted" aria-live="polite">
                        Según tabla aportada:{" "}
                        {automatic.theoretical.toLocaleString("es-CL", {
                          maximumFractionDigits: 3,
                        })}{" "}
                        clics teóricos
                        {automatic.rounded
                          ? ` → ${automatic.clicks} clics, redondeado; ≈ ${automatic.deliveredMg.toLocaleString("es-CL", { maximumFractionDigits: 3 })} mg`
                          : ""}
                        {device.clicks &&
                        device.clicks !== String(automatic.clicks)
                          ? `; valor registrado: ${device.clicks} clics (manual o tabla revisada)`
                          : ""}
                        . Revisa que la pluma coincida; no aplica a monodosis.
                      </p>
                    )}
                    <label className="cw-field">
                      {"Clics indicados de " + m.name}
                      <input
                        aria-label={"Clics indicados de " + m.name}
                        value={device.clicks}
                        placeholder="Número o rango verificado por ti"
                        onChange={(e) =>
                          updateDevice({ clicks: e.target.value })
                        }
                      />
                      <small>
                        Se recalcula al cambiar pluma o dosis cuando corresponde
                        a la tabla. Puedes corregirlo manualmente; se conservará
                        tu valor hasta el siguiente cambio de pluma o dosis.
                      </small>
                    </label>
                    <p className="treatment-dose-preview">
                      Dosis que quedará registrada:{" "}
                      <strong>{m.dose || "Por completar"}</strong>
                    </p>
                  </>
                )}
              </div>
            )}
            <label className="cw-field">
              {title + " " + (i + 1) + ": Notas"}
              <textarea
                rows={3}
                aria-label={title + " " + (i + 1) + ": Notas"}
                value={m.notes}
                placeholder="Presentación, vía, tolerancia y efectos adversos"
                onChange={(e) => edit(i, "notes", e.target.value)}
              />
              <PreviousHint value={previousTreatment.notes} />
            </label>
            <button
              onClick={() =>
                onChange(values.filter((_: any, j: number) => j !== i))
              }
            >
              Quitar de esta atención
            </button>
          </details>
        );
      })}
      <datalist id={"treatment-frequency-" + kind}>
        {[
          "Cada 7 días",
          "1 vez al día",
          "2 veces al día",
          "3 veces al día",
          "Cada 24 horas",
          "Según esquema registrado en notas",
        ].map((f) => (
          <option key={f} value={f} />
        ))}
      </datalist>
      <button
        onClick={() =>
          onChange([
            ...values,
            { name: "", dose: "", frequency: "", notes: "" },
          ])
        }
      >
        Agregar {kind === "medication" ? "medicamento" : "suplemento"}
      </button>
    </div>
  );
}
export function CatalogEditor({ onDirty, onBusy }: any) {
  const [doseText, setDoseText] = useState<Record<string, string>>({});
  const [items, setItems] = useState<any[]>([]),
    [version, setVersion] = useState<number | null>(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [kind, setKind] = useState("medication"),
    [selected, setSelected] = useState(""),
    [busy, setBusy] = useState(false),
    [dirty, setDirty] = useState(false);
  useEffect(() => {
    let active = true;
    api()
      .then((d) => {
        if (active) {
          setItems(d.items);
          setVersion(d.version);
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, []);
  const change = (next: any[]) => {
    setItems(next);
    setDirty(true);
    onDirty?.(true);
    setNotice("");
  };
  const current = items.find((e) => e.id === selected);
  const field = (key: string, value: any) =>
    change(
      items.map((e) =>
        e.id === selected
          ? {
              ...e,
              [key]: value,
              ...(["name", "doses", "clickCounting"].includes(key) &&
              e.clickOptions
                ? {
                    clickOptions: e.clickOptions.map((row: any) => ({
                      ...row,
                      verified: false,
                    })),
                  }
                : {}),
            }
          : e,
      ),
    );
  const save = async () => {
    const problem = validateCatalog(items);
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    onBusy?.(true);
    setError("");
    try {
      const d = await api("PUT", { items, expectedVersion: version });
      setVersion(d.version);
      window.dispatchEvent(new Event("treatment-catalog-updated"));
      setDirty(false);
      onDirty?.(false);
      setNotice(
        "Catálogo guardado. Disponible para todos los pacientes; los tratamientos ya registrados no cambian.",
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
      onBusy?.(false);
    }
  };
  return (
    <section
      className="treatment-settings"
      aria-label="Medicamentos y suplementos"
    >
      <h2>Medicamentos y suplementos</h2>
      <p className="cw-muted">
        Define aquí tus productos y las dosis disponibles. La dosis, frecuencia,
        presentación y tolerancia reales se registran en cada control.
      </p>
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
      {version === null ? (
        <p>Cargando catálogo…</p>
      ) : (
        <fieldset disabled={busy}>
          <div className="cw-pills">
            {[
              ["medication", "Medicamentos"],
              ["supplement", "Suplementos"],
            ].map(([id, label]) => (
              <button
                key={id}
                aria-pressed={kind === id}
                onClick={() => {
                  setKind(id);
                  setSelected("");
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="catalog-layout">
            <div className="catalog-list">
              {items
                .filter((e) => e.kind === kind)
                .map((e) => (
                  <button
                    key={e.id}
                    aria-pressed={selected === e.id}
                    onClick={() => setSelected(e.id)}
                  >
                    <strong>{e.name}</strong>
                    <small>
                      {e.doses.length
                        ? `${e.doses.length} ${e.clickCounting ? "presentaciones" : "dosis"} configuradas`
                        : "Dosis personalizada"}
                    </small>
                  </button>
                ))}
              <button
                className="cw-primary"
                onClick={() => {
                  const id = crypto.randomUUID();
                  change([
                    ...items,
                    {
                      id,
                      kind,
                      name: "Nuevo producto",
                      doses: [],
                      clickCounting: false,
                    },
                  ]);
                  setSelected(id);
                }}
              >
                Agregar producto al catálogo
              </button>
            </div>
            <div>
              {current ? (
                <div className="catalog-form">
                  <label className="cw-field">
                    Nombre del producto
                    <input
                      value={current.name}
                      maxLength={100}
                      onChange={(e) => field("name", e.target.value)}
                    />
                  </label>
                  <label className="cw-field">
                    {current.clickCounting
                      ? "Presentaciones de pluma (mg por dosis, separadas por punto y coma)"
                      : "Dosis disponibles (separadas por punto y coma)"}
                    <textarea
                      rows={4}
                      aria-label={
                        current.clickCounting
                          ? "Presentaciones de pluma (mg por dosis, separadas por punto y coma)"
                          : "Dosis disponibles (separadas por punto y coma)"
                      }
                      value={doseText[selected] ?? current.doses.join("; ")}
                      onChange={(e) => {
                        setDoseText((old) => ({
                          ...old,
                          [selected]: e.target.value,
                        }));
                        field(
                          "doses",
                          e.target.value
                            .split(";")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        );
                      }}
                    />
                    <small>
                      Incluye unidad y, si corresponde, concentración. Ejemplo:
                      0.25 mg; 0.5 mg; 1 mg. Puedes dejarlo vacío para dosis
                      personalizadas.
                    </small>
                  </label>
                  <label className="cw-check">
                    <input
                      type="checkbox"
                      checked={current.clickCounting}
                      onChange={(e) => field("clickCounting", e.target.checked)}
                    />
                    Permitir registrar conteo de clics
                  </label>
                  {current.clickCounting && (
                    <ClickOptionsEditor
                      entry={current}
                      onChange={(rows: any[]) => field("clickOptions", rows)}
                    />
                  )}
                  <button
                    onClick={() => {
                      change(items.filter((e) => e.id !== selected));
                      setSelected("");
                    }}
                  >
                    Quitar producto del catálogo
                  </button>
                  <p className="cw-muted">
                    Quitar o renombrar un producto no modifica los controles ya
                    guardados.
                  </p>
                </div>
              ) : (
                <p className="cw-muted">
                  Selecciona un producto para editar sus dosis o agrega uno
                  nuevo.
                </p>
              )}
            </div>
          </div>
          <div className="catalog-save">
            <span>
              {dirty
                ? "Cambios del catálogo sin guardar"
                : "Catálogo disponible"}
            </span>
            <button
              className="cw-primary"
              disabled={busy || !dirty}
              onClick={save}
            >
              {busy ? "Guardando catálogo…" : "Guardar catálogo"}
            </button>
          </div>
        </fieldset>
      )}
    </section>
  );
}
let catalogOpen = false;
export function openCatalogSettings() {
  if (catalogOpen) return;
  catalogOpen = true;
  const host = document.createElement("dialog");
  host.className = "catalog-dialog";
  host.setAttribute("aria-label", "Configuración de tratamientos");
  document.body.appendChild(host);
  const root = createRoot(host);
  let dirty = false,
    busy = false;
  const previous = document.activeElement as HTMLElement | null;
  const close = () => {
    if (busy) return;
    if (
      dirty &&
      !confirm("Hay cambios del catálogo sin guardar. ¿Descartarlos?")
    )
      return;
    window.removeEventListener("beforeunload", guard);
    host.close();
    root.unmount();
    host.remove();
    catalogOpen = false;
    previous?.focus();
  };
  const guard = (e: BeforeUnloadEvent) => {
    if (dirty) {
      e.preventDefault();
      e.returnValue = "";
    }
  };
  window.addEventListener("beforeunload", guard);
  host.addEventListener("cancel", (e) => {
    e.preventDefault();
    close();
  });
  root.render(
    <div className="catalog-overlay cw">
      <div className="catalog-modal">
        <header>
          <div>
            <span className="cw-eyebrow">CONFIGURACIÓN</span>
            <h1>Catálogo de tratamientos</h1>
          </div>
          <button className="catalog-close" onClick={close} autoFocus>
            Cerrar configuración
          </button>
        </header>
        <CatalogEditor
          onBusy={(value: boolean) => {
            busy = value;
            const button =
              host.querySelector<HTMLButtonElement>(".catalog-close");
            if (button) button.disabled = value;
          }}
          onDirty={(value: boolean) => {
            dirty = value;
          }}
        />
      </div>
    </div>,
  );
  host.showModal();
}
