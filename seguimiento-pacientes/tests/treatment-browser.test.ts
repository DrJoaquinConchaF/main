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
      await page.locator("[data-clinical-launch]").click();
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
        .getByRole("group", {
          name: "Elegir lápiz o pluma de Wegovy",
          exact: true,
        })
        .getByRole("button", {
          name: "2.4 mg/dosis · 75 clics · 3 mL",
          exact: true,
        })
        .click();
      await dialog
        .getByLabel("Dosis administrada de Wegovy", { exact: true })
        .fill("1.2 mg");
      await dialog
        .getByLabel("Medicamentos en uso 1: Frecuencia", { exact: true })
        .fill("Cada 7 días");
      await dialog
        .getByRole("checkbox", { name: "Con conteo de clics", exact: true })
        .check();
      await expect(
        dialog.getByLabel("Clics indicados de Wegovy", { exact: true }),
      ).toHaveValue("38");
      await dialog
        .getByRole("group", { name: "Elegir dosis de Wegovy", exact: true })
        .getByRole("button", { name: "1.5 mg", exact: true })
        .click();
      await expect(
        dialog.getByLabel("Clics indicados de Wegovy", { exact: true }),
      ).toHaveValue("47");
      await dialog
        .getByRole("group", { name: "Elegir dosis de Wegovy", exact: true })
        .getByRole("button", { name: "1.2 mg", exact: true })
        .click();
      await expect(
        dialog.getByLabel("Clics indicados de Wegovy", { exact: true }),
      ).toHaveValue("38");
      await dialog
        .getByLabel("Clics indicados de Wegovy", { exact: true })
        .fill("37–38");
      await expect(
        dialog.getByLabel("Medicamentos en uso 1: Notas", { exact: true }),
      ).toHaveValue(/Pluma utilizada: Wegovy multidosis 2.4 mg\/dosis/);

      await dialog
        .locator("details.treatment-selector")
        .nth(1)
        .locator("summary")
        .click();
      await dialog.getByRole("checkbox", { name: /^Creatina/ }).check();
      await dialog
        .getByRole("group", { name: "Elegir dosis de Creatina", exact: true })
        .getByRole("button", { name: "5 g", exact: true })
        .click();
      const creatine = dialog.getByRole("group", {
        name: "Elegir dosis de Creatina",
        exact: true,
      });
      await creatine
        .getByRole("button", { name: "7.5 g", exact: true })
        .click();
      await expect(
        dialog.getByLabel("Suplementos en uso 1: Dosis", { exact: true }),
      ).toHaveValue("7.5 g");
      await creatine.getByRole("button", { name: "10 g", exact: true }).click();
      await expect(
        dialog.getByLabel("Suplementos en uso 1: Dosis", { exact: true }),
      ).toHaveValue("10 g");
      await dialog.getByRole("checkbox", { name: /^Whey protein/ }).check();
      const protein = dialog.getByRole("group", {
        name: "Elegir dosis de Whey protein",
        exact: true,
      });
      for (const dose of [
        "1/2 scoop",
        "1 scoop",
        "1 1/2 scoop",
        "2 scoop",
        "2 1/2 scoop",
        "3 scoop",
      ])
        await expect(
          protein.getByRole("button", { name: dose, exact: true }),
        ).toBeVisible();
      await protein
        .getByRole("button", { name: "1 1/2 scoop", exact: true })
        .click();
      await dialog
        .getByLabel("Suplementos en uso 2: Frecuencia", { exact: true })
        .fill("Según entrenamiento");
      const table = dialog.getByRole("link", {
        name: "Abrir tabla de referencia (PDF) ↗",
        exact: true,
      });
      await expect(table).toHaveAttribute(
        "href",
        "/referencias/wegovy-tabla-clics.pdf",
      );
      const pdfResponse = await fetch(
        base + "/referencias/wegovy-tabla-clics.pdf",
      );
      assert.equal(pdfResponse.status, 200);
      assert.match(pdfResponse.headers.get("content-type") || "", /pdf/);
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
      await dialog
        .getByRole("button", { name: "Medicamentos", exact: true })
        .click();
      await dialog.getByRole("button", { name: /^Wegovy/ }).click();
      await dialog.locator("details.click-options-editor > summary").click();
      await dialog
        .getByRole("button", {
          name: "Agregar combinación de dosis y clics",
          exact: true,
        })
        .click();
      await dialog
        .getByLabel("Pluma exacta de combinación 1", { exact: true })
        .fill("Wegovy · dispositivo ficticio A");
      await dialog
        .getByLabel("Dosis de combinación 1", { exact: true })
        .fill("1.2 mg");
      await dialog
        .getByLabel("Clics de combinación 1", { exact: true })
        .fill("37–38");
      await dialog
        .getByLabel("Fuente de combinación 1", { exact: true })
        .fill("https://example.invalid/tabla-prueba");
      await dialog
        .getByRole("checkbox", {
          name: "He cotejado esta fila con la fuente y la presentación exacta",
          exact: true,
        })
        .check();
      await dialog
        .getByRole("button", { name: "Guardar catálogo", exact: true })
        .click();
      await expect(
        dialog.locator(".treatment-settings").getByRole("status"),
      ).toContainText("Catálogo guardado");
      await section("Consulta");
      await dialog
        .getByRole("group", {
          name: "Elegir lápiz o pluma de Wegovy",
          exact: true,
        })
        .getByRole("button", {
          name: "Wegovy · dispositivo ficticio A",
          exact: true,
        })
        .click();
      await expect(
        dialog.getByLabel("Clics indicados de Wegovy", { exact: true }),
      ).toHaveValue("37–38");
      await dialog
        .getByRole("group", {
          name: "Seleccionar dosis y clics para esta pluma",
          exact: true,
        })
        .getByRole("button", { name: "1.2 mg (37–38 clics)", exact: true })
        .click();
      await expect(
        dialog.getByLabel("Clics indicados de Wegovy", { exact: true }),
      ).toHaveValue("37–38");
      await dialog
        .getByRole("button", { name: "Guardar consulta", exact: true })
        .click();
      await expect(dialog.getByRole("status")).toContainText(
        "Consulta guardada",
      );
      await section("Configuración");
      await section("Consulta");
      await dialog
        .locator("details.treatment-selector")
        .nth(1)
        .locator("summary")
        .click();
      await expect(
        dialog.getByRole("checkbox", { name: /^Hierro oral/ }),
      ).toHaveAccessibleName(/2 dosis disponibles/);
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
