import test from "node:test";
import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
import { seedVisit, buildSave, newActivity } from "../src/workflow/model";
const base = process.env.TEST_BASE_URL;
test(
  "Orientación anterior por campo: fecha previa, sin copiar respuestas ni mostrar controles futuros",
  { skip: !base, timeout: 45000 },
  async () => {
    const api = async (path: string, method = "GET", body?: any) => {
      const r = await fetch(base + "/api" + path, {
        method,
        headers: { "Content-Type": "application/json", Origin: base! },
        body: body ? JSON.stringify(body) : undefined,
      });
      assert.ok(r.ok, await r.clone().text());
      return r.json() as any;
    };
    const patient = await api("/patients", "POST", {
      name: "TEST orientación previa",
      email: "prior@example.invalid",
    });
    const path = "/clinical/patients/" + patient.id;
    for (const date of ["2026-10-01", "2026-12-01"]) {
      const bundle = await api(path);
      const { data } = seedVisit(date, bundle);
      data.context =
        date === "2026-10-01"
          ? "Objetivo previo registrado"
          : "CONTEXTO FUTURO";
      data.general = {
        barriers: "Falta de tiempo",
        adherencePercent: "45",
        performance: "Mejor recuperación",
      };
      data.habits = { stepsMonthly: "4000", sleep: "6" };
      data.measurements = { weight: "72" };
      data.activities = [
        {
          ...newActivity(),
          name: "HYROX",
          minutes: "60",
          sessions: "2",
          met: "5",
        },
      ];
      data.supplements = [
        {
          name: "Whey protein",
          dose: "20 g",
          frequency: "Diario",
          notes: "Registro histórico",
        },
      ];
      await api(path + "/visits/" + date, "PUT", buildSave(data, bundle, 0));
    }
    const browser = await chromium.launch({
      executablePath: "/usr/bin/chromium",
      args: ["--no-sandbox"],
    });
    try {
      const page = await browser.newPage({
        viewport: { width: 390, height: 844 },
      });
      await page.goto(base!);
      await page
        .locator("button.patient")
        .filter({ hasText: patient.name })
        .click();
      await page.locator("[data-clinical-launch]").click();
      const dialog = page.getByRole("dialog", {
        name: "Consulta clínica",
        exact: true,
      });
      await dialog
        .getByLabel("Fecha de atención", { exact: true })
        .fill("2026-11-01");
      const section = (name: string) =>
        dialog
          .getByRole("navigation", { name: "Secciones de la consulta" })
          .getByRole("button", { name, exact: true })
          .click();
      await section("Consulta");
      const context = dialog.getByLabel(
        "Objetivo de consulta / contexto actual",
        { exact: true },
      );
      await expect(context).toHaveValue("");
      await expect(context.locator("..").locator(".cw-previous")).toHaveText(
        "Anterior (01-10-2026): Objetivo previo registrado",
      );
      const adherence = dialog.getByLabel("Adherencia autoinformada (%)", {
        exact: true,
      });
      await expect(adherence).toHaveValue("");
      await expect(
        adherence.locator("..").locator(".cw-previous"),
      ).toContainText("45");
      await context.fill("Respuesta nueva");
      await expect(context.locator("..").locator(".cw-previous")).toContainText(
        "Objetivo previo",
      );
      await section("Hábitos y alimentación");
      const steps = dialog.getByLabel(
        "Pasos promedio diarios del último mes (pasos/día)",
        { exact: true },
      );
      await expect(steps).toHaveValue("");
      await expect(steps.locator("..").locator(".cw-previous")).toContainText(
        "4000",
      );
      await section("Mediciones");
      const weight = dialog.getByLabel("Peso (kg)", { exact: true });
      await expect(weight).toHaveValue("");
      await expect(weight.locator("..").locator(".cw-previous")).toContainText(
        "72",
      );
      assert.equal(
        await dialog
          .locator(".cw-previous")
          .filter({ hasText: "FUTURO" })
          .count(),
        0,
      );
      await page.screenshot({
        path: "test-results/orientacion-anterior-390.png",
        fullPage: true,
      });
      await dialog
        .getByRole("button", { name: "Guardar consulta", exact: true })
        .click();
      await expect(dialog.getByRole("status")).toContainText(
        "Consulta guardada",
      );
      const saved = await api(path);
      assert.equal(
        saved.visits.find((v: any) => v.date === "2026-10-01").data.context,
        "Objetivo previo registrado",
      );
      assert.equal(
        saved.visits.find((v: any) => v.date === "2026-11-01").data.context,
        "Respuesta nueva",
      );
    } finally {
      await browser.close();
    }
  },
);
