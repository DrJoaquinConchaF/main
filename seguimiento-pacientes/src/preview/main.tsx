import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Workspace } from "../workflow/workspace";
import { today, display } from "../workflow/model";
import { demoPatient, installPreviewApi } from "./state";
import "../workflow/style.css";
import "./style.css";
import "../workflow/design.css";
// Some mobile file viewers omit randomUUID; the demo still uses cryptographic random values.
if (typeof crypto.randomUUID !== "function") {
  (crypto as any).randomUUID = () => {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
      "",
    );
    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20),
    ].join("-");
  };
}
const preview = installPreviewApi();
document.body.classList.add("preview-mode");
// The file never fetches remote resources. The actual app's PDF/OCR needs its online asset files.
document.addEventListener(
  "input",
  (e: any) => {
    const el = e.target;
    if (
      el?.type === "file" &&
      el.files?.[0]?.name.toLowerCase().endsWith(".pdf")
    ) {
      e.stopImmediatePropagation();
      el.value = "";
      window.alert(
        "La lectura de PDF y las fotografías se prueban en la versión online. En este HTML puedes importar una plantilla TXT; no se sube ningún archivo a Internet.",
      );
    }
  },
  true,
);
function App() {
  const [date, setDate] = useState<string | null>("2026-10-10"),
    [revision, setRevision] = useState(0),
    [message, setMessage] = useState("");
  useEffect(() => {
    document.body.classList.toggle("clinical-open", !!date);
  }, [date]);
  return (
    <>
      <aside className="preview-banner" aria-label="Modo de prueba">
        <strong>DEMO HTML</strong>
        <span>Datos ficticios · guardado temporal · sin conexión</span>
        <button
          onClick={() => {
            if (
              confirm(
                "¿Reiniciar los datos de demostración? Se perderán los cambios de esta prueba.",
              )
            ) {
              preview.reset();
              setRevision((r) => r + 1);
              setMessage("Demostración reiniciada.");
            }
          }}
        >
          Reiniciar
        </button>
      </aside>
      {date ? (
        <Workspace
          key={date + "-" + revision}
          patient={demoPatient}
          initialDate={date}
          onClose={(destination?: string) => {
            setDate(null);
            setMessage(
              destination
                ? "Los PDF, InBody y fotografías requieren la versión online. Los gráficos de esta demo están en la pestaña «Evolución»."
                : "",
            );
          }}
        />
      ) : (
        <main className="preview-home">
          <span className="preview-eyebrow">
            PRUEBA INTERACTIVA · DR. CONCHA
          </span>
          <h1>Prueba tu nueva consulta</h1>
          <p>
            Esta es la misma interfaz preparada para la aplicación. Puedes
            recorrerla con <strong>Juan Prueba</strong>, un paciente ficticio
            con una evaluación inicial y cuatro controles.
          </p>
          {message && (
            <p className="preview-message" role="status">
              {message}
            </p>
          )}
          <div className="preview-cards">
            {[
              ["2026-01-10", "Atención inicial", "104 kg"],
              ["2026-02-10", "Control al mes", "100 kg"],
              ["2026-04-10", "Control 2", "94 kg"],
              ["2026-07-10", "Control 3", "88 kg"],
              ["2026-10-10", "Control 4", "83 kg"],
            ].map(([d, label, w]) => (
              <button key={d} onClick={() => setDate(d)}>
                <strong>{label}</strong>
                <span>
                  {display(d)} · {w}
                </span>
              </button>
            ))}
          </div>
          <button className="preview-new" onClick={() => setDate(today())}>
            Probar una nueva atención
          </button>
          <h2>Qué puedes probar</h2>
          <ol>
            <li>Completar antecedentes, hábitos, alimentación y mediciones.</li>
            <li>
              Comparar gastos energéticos, modificar calorías/macros y
              distribuir intercambios.
            </li>
            <li>Guardar la consulta y volver a abrirla durante esta sesión.</li>
            <li>Revisar los gráficos y preparar los textos de cierre.</li>
            <li>Crear y editar plantillas de texto ficticias.</li>
          </ol>
          <p className="preview-note">
            Los cambios viven solo en esta pestaña y se reinician al recargar o
            cerrar el archivo. Esta prueba no consulta pacientes reales, no
            envía mensajes y no carga archivos a servidores. Los tratamientos
            incluidos son ficticios, no una pauta médica. Para PDF/OCR,
            fotografías, sincronización y datos reales se necesita la versión
            online.
          </p>
        </main>
      )}
    </>
  );
}
createRoot(document.getElementById("preview-root")!).render(<App />);
