import React, { useEffect, useState } from "react";
import {
  wegovyResources,
  benefitsExplanation,
  resourceText,
  devicePrescription,
  validateDevice,
  readDevice,
  canUseDevicePrescription,
} from "./device.mjs";
export function WegovySupport({ medications, settings = {}, onChange }: any) {
  const [copied, setCopied] = useState(false),
    [copyError, setCopyError] = useState("");
  const drugs = medications.filter((m: any) => /\bwegovy\b/i.test(m.name));
  const rx = devicePrescription(drugs);
  const ready = canUseDevicePrescription(medications);
  const materials = resourceText(settings),
    text = [rx, materials].filter(Boolean).join("\n\n");
  useEffect(() => {
    setCopied(false);
    setCopyError("");
  }, [text]);
  return (
    <section
      className="wegovy-support"
      aria-label="Wegovy: receta y material de apoyo"
    >
      <p className="cw-muted">
        Selecciona solo el material que has revisado para la presentación del
        paciente. Los enlaces fueron aportados por el profesional y no se han
        verificado desde este entorno.
      </p>
      <div className="wegovy-resources">
        {wegovyResources.map((r) => (
          <article key={r.id}>
            <label className="cw-check">
              <input
                type="checkbox"
                checked={settings[r.id] === true}
                onChange={(e) =>
                  onChange({ ...settings, [r.id]: e.target.checked })
                }
              />
              {"Incluir " + r.title}
            </label>
            <a href={r.url} target="_blank" rel="noreferrer">
              Abrir material ↗
            </a>
            <p className="cw-muted">{r.note}</p>
          </article>
        ))}
      </div>
      {settings.benefits && (
        <label className="cw-field">
          Explicación de beneficios para el paciente
          <textarea
            aria-label="Explicación de beneficios para el paciente"
            value={settings.benefitsExplanation ?? benefitsExplanation}
            rows={4}
            maxLength={1500}
            onChange={(e) =>
              onChange({ ...settings, benefitsExplanation: e.target.value })
            }
          />
        </label>
      )}
      <p className="cw-muted">
        Los recursos seleccionados se añaden al resumen del paciente. El texto
        de receta se prepara con el tratamiento en uso registrado; revísalo
        antes de copiarlo a Reservo.
      </p>
      <label className="cw-check">
        <input
          type="checkbox"
          disabled={!ready && !settings.includeRegimen}
          checked={settings.includeRegimen === true}
          onChange={(e) =>
            onChange({ ...settings, includeRegimen: e.target.checked })
          }
        />
        Incluir este esquema revisado en el resumen del paciente
      </label>
      <label className="cw-field">
        Texto de Wegovy para receta
        <textarea
          aria-label="Texto de Wegovy para receta"
          readOnly
          rows={12}
          value={
            text ||
            "Registra la pluma, dosis y frecuencia de Wegovy en Consulta para preparar el texto."
          }
        />
      </label>
      <button
        disabled={!ready}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setCopyError("");
          } catch {
            setCopyError("Selecciona el texto para copiarlo manualmente.");
          }
        }}
      >
        {copied
          ? "Texto de Wegovy copiado"
          : "Copiar texto de Wegovy para receta"}
      </button>
      {!ready && (
        <p className="cw-muted">
          Para copiar la receta, completa y revisa pluma, dosis, frecuencia y
          clics, si corresponden.
        </p>
      )}
      {copyError && <p role="status">{copyError}</p>}
    </section>
  );
}
