import React from "react";
import { createRoot, Root } from "react-dom/client";
import { BodyEvolution } from "./BodyEvolution";
let state: {
  host: HTMLElement;
  parent: HTMLElement;
  root: Root;
  patient: string;
  signature: string;
} | null = null;
let pending = "",
  sequence = 0;
export async function enhanceLegacyEvolution(patient: any) {
  const title = document.querySelector<HTMLElement>("#root .evolution-title");
  const parent = title?.parentElement;
  const active = document.querySelector(
    '#root [aria-label="Categorías de evolución"] [aria-pressed="true"]',
  )?.textContent;
  if (!parent || active !== "Antropometría" || !patient) {
    sequence++;
    pending = "";
    if (state) {
      const old = state;
      state = null;
      old.parent.removeAttribute("data-body-enhanced");
      old.parent.classList.remove("show-original");
      old.root.unmount();
      old.host.remove();
    }
    return;
  }
  // Only legacy table changes trigger a refresh, never mutations within the new chart root.
  const signature =
    parent.querySelector(":scope > .table-wrap")?.textContent || "";
  if (
    state?.host.isConnected &&
    state?.parent === parent &&
    state.patient === patient.id &&
    state.signature === signature
  )
    return;
  const key = patient.id + "|" + signature;
  if (pending === key) return;
  pending = key;
  const request = ++sequence;
  try {
    const response = await fetch(
      "/api/clinical/patients/" + encodeURIComponent(patient.id),
    );
    if (!response.ok) throw Error("No se pudo cargar la evolución");
    const bundle = await response.json();
    if (sequence !== request || !parent.isConnected) return;
    if (
      !state ||
      !state.host.isConnected ||
      state.parent !== parent ||
      state.patient !== patient.id
    ) {
      if (state) {
        state.root.unmount();
        state.host.remove();
        state.parent.removeAttribute("data-body-enhanced");
      }
      const host = document.createElement("div");
      host.className = "body-evolution-host";
      parent.insertBefore(host, parent.firstChild);
      state = {
        host,
        parent,
        root: createRoot(host),
        patient: patient.id,
        signature,
      };
    }
    state.signature = signature;
    parent.dataset.bodyEnhanced = "true";
    state.root.render(
      <BodyEvolution
        key={patient.id}
        bundle={bundle}
        onOriginal={() => parent.classList.toggle("show-original")}
      />,
    );
  } catch {
    /* Keep the complete original view usable if the enhanced view cannot load. */
  } finally {
    if (sequence === request) pending = "";
  }
}
