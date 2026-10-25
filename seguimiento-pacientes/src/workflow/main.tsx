import React from "react";
import { createRoot } from "react-dom/client";
import { Workspace } from "./workspace";
import "./style.css";
import "./design.css";
const host = document.getElementById("clinical-root")!;
const root = createRoot(host);
let current: any = null,
  dismissed = "";
function close(destination?: string) {
  root.render(null);
  document.getElementById("root")?.removeAttribute("inert");
  document.body.classList.remove("clinical-open");
  if (current) dismissed = current.id;
  if (destination) {
    const nav = document.querySelector("nav");
    const button = Array.from(nav?.querySelectorAll("button") || []).find(
      (b) => b.textContent?.trim() === destination,
    );
    (button as HTMLButtonElement | undefined)?.click();
  }
}
function open(patient: any) {
  current = patient;
  document.getElementById("root")?.setAttribute("inert", "");
  document.body.classList.add("clinical-open");
  root.render(<Workspace key={patient.id} patient={patient} onClose={close} />);
}
let resolving = false;
async function observe() {
  for (const mark of document.querySelectorAll<HTMLElement>(".brand-mark")) {
    if (mark.dataset.monogram === "jc") continue;
    mark.dataset.monogram = "jc";
    mark.textContent = "JC";
    mark.setAttribute("role", "img");
    mark.setAttribute("aria-label", "JC · Dr. Joaquín Concha");
  }
  const header = document.querySelector(".patient-header"),
    name = header?.querySelector("h1")?.textContent?.trim();
  if (!header || !name) return;
  let launch = header.querySelector<HTMLButtonElement>(
    "[data-clinical-launch]",
  );
  if (!launch) {
    launch = document.createElement("button");
    launch.dataset.clinicalLaunch = "true";
    launch.className = "primary";
    launch.textContent = "Abrir consulta clínica";
    header.appendChild(launch);
  }
  launch.onclick = () => void resolve(name, true);
  if (
    !resolving &&
    (current?.name !== name ||
      (current?.rut && !header.textContent?.includes(current.rut)))
  )
    await resolve(name, false);
}
async function resolve(name: string, forced: boolean) {
  resolving = true;
  try {
    const r = await fetch("/api/patients?q=" + encodeURIComponent(name));
    if (!r.ok) return;
    const all: any = await r.json();
    const matches = all.filter((p: any) => p.name === name);
    const rut = document
      .querySelector(".patient.active small")
      ?.textContent?.trim();
    const headerText =
      document.querySelector(".patient-header")?.textContent || "";
    const patient =
      matches.find((p: any) => p.rut && p.rut === rut) ||
      matches.find((p: any) => p.email && headerText.includes(p.email)) ||
      (matches.length === 1 ? matches[0] : null);
    if (patient) {
      current = patient;
      if (forced || dismissed !== patient.id) open(patient);
    } else if (forced)
      window.alert(
        "Hay fichas con el mismo nombre. Agrega RUT o correo a esta ficha para identificarla antes de abrir la consulta.",
      );
  } finally {
    resolving = false;
  }
}
new MutationObserver(() => void observe()).observe(
  document.getElementById("root")!,
  { subtree: true, childList: true },
);
void observe();
