import test from "node:test";
import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
const base = process.env.TEST_BASE_URL;
test(
  "Tratamientos: selección, dosis, conteo de clics, persistencia y configuración sin alterar controles previos",
  { skip: !base, timeout: 60000 },
  async () => {
    const response = await fetch(base + "/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: base! },
      body: JSON.stringify({
        name: "TEST catálogo y tratamiento",
        email: "catalogo@example.invalid",
      }),
    });
    assert.equal(response.status, 201);
    const patient: any = await response.json();
    const browser = await chromium.launch({
      executablePath: "/usr/bin/chromium",
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
    });
    page.setDefaultTimeout(12000);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    try {
      await page.goto(base!);
      await page
        .locator("button.patient")
        .filter({ hasText: patient.name })
        .click();
      let dialog = page.getByRole("dialog", {
        name: "Consulta clínica",
        exact: true,
      });
      await expect(dialog).toBeVisible();
      const section = (name: string) =>
        dialog
          .getByRole("navigation", { name: "Secciones de la consulta" })
          .getByRole("button", { name, exact: true })
          .click();
      await dialog
        .getByLabel("Fecha de atención", { exact: true })
        .fill("2026-10-25");
      await section("Consulta");
      await dialog
        .locator("details.treatment-selector")
        .first()
        .locator("summary")
        .click();
      await dialog.getByRole("checkbox", { name: /^Wegovy/ }).check();
      await dialog
        .getByLabel("Elegir lápiz o pluma de Wegovy", { exact: true })
        .selectOption("Wegovy 2.4 mg/dosis");
      await dialog
        .getByLabel("Dosis administrada de Wegovy", { exact: true })
        .fill("1.2 mg");
      await dialog
        .getByLabel("Medicamentos en uso 1: Frecuencia", { exact: true })
        .fill("Cada 7 días");
      await dialog
        .getByRole("checkbox", { name: "Con conteo de clics", exact: true })
        .check();
      await dialog
        .getByLabel("Clics indicados de Wegovy", { exact: true })
        .fill("37–38");
      await expect(
        dialog.getByLabel("Medicamentos en uso 1: Notas", { exact: true }),
      ).toHaveValue(/Pluma utilizada: Wegovy 2.4 mg\/dosis/);

      await dialog
        .locator("details.treatment-selector")
        .nth(1)
        .locator("summary")
        .click();
      await dialog.getByRole("checkbox", { name: /^Creatina/ }).check();
      await dialog
        .getByLabel("Elegir dosis de Creatina", { exact: true })
        .selectOption("5 g");
      await dialog
        .getByLabel("Suplementos en uso 1: Frecuencia", { exact: true })
        .fill("1 vez al día");
      await dialog
        .getByRole("button", { name: "Guardar consulta", exact: true })
        .click();
      await expect(dialog.getByRole("status")).toContainText(
        "Consulta guardada",
      );
      await section("Cierre");
      await dialog
        .getByRole("checkbox", {
          name: "Incluir NovoCare Beneficios Chile",
          exact: true,
        })
        .check();
      await dialog
        .getByRole("checkbox", {
          name: "Incluir este esquema revisado en el resumen del paciente",
          exact: true,
        })
        .check();
      await expect(
        dialog.getByLabel("Texto de Wegovy para receta", { exact: true }),
      ).toHaveValue(/1.2 mg \(37–38 clics\)/);
      await expect(
        dialog.getByLabel("Resumen para el paciente", { exact: true }),
      ).toHaveValue(/novocarebeneficios.cl/);
      await expect(
        dialog.getByLabel("Resumen para el paciente", { exact: true }),
      ).toHaveValue(/1.2 mg \(37–38 clics\)/);
      await dialog
        .getByRole("button", { name: "Guardar consulta", exact: true })
        .click();
      await expect(dialog.getByRole("status")).toContainText(
        "Consulta guardada",
      );
      const before: any = await (
        await fetch(base + `/api/clinical/patients/${patient.id}`)
      ).json();
      assert.equal(
        before.plans[0].data.medications[0].dose,
        "1.2 mg (37–38 clics)",
      );
      assert.match(
        before.plans[0].data.medications[0].notes,
        /conteo de clics/,
      );
      await section("Configuración");
      await dialog
        .getByRole("button", { name: "Suplementos", exact: true })
        .click();
      await dialog.getByRole("button", { name: /^Hierro oral/ }).click();
      await dialog
        .getByLabel("Dosis disponibles (separadas por punto y coma)", {
          exact: true,
        })
        .fill("60 mg de hierro elemental; Dosis personalizada");
      await dialog
        .getByRole("button", { name: "Guardar catálogo", exact: true })
        .click();
      await expect(dialog.getByRole("status")).toContainText(
        "Catálogo guardado",
      );
      const after: any = await (
        await fetch(base + `/api/clinical/patients/${patient.id}`)
      ).json();
      assert.deepEqual(after.plans, before.plans);
      await section("Consulta");
      await dialog
        .locator("details.treatment-selector")
        .nth(1)
        .locator("summary")
        .click();
      await expect(
        dialog.getByRole("checkbox", { name: /^Hierro oral/ }),
      ).toHaveAccessibleName(/60 mg de hierro elemental/);
      await dialog
        .getByRole("button", { name: "Cambiar paciente / volver", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Configuración", exact: true })
        .click();
      await page
        .getByRole("button", {
          name: "Medicamentos y suplementos",
          exact: true,
        })
        .click();
      const config = page.getByRole("dialog", {
        name: "Configuración de tratamientos",
        exact: true,
      });
      await expect(config).toBeVisible();
      await expect(
        config.getByRole("heading", {
          name: "Medicamentos y suplementos",
          exact: true,
        }),
      ).toBeVisible();
      await config
        .getByRole("button", { name: "Cerrar configuración", exact: true })
        .click();
      assert.deepEqual(errors, []);
    } finally {
      await browser.close();
    }
  },
);
