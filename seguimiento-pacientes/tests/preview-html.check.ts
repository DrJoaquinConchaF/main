import test from "node:test";
import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
const path =
  process.env.TEST_PREVIEW_HTML || "/workspace/seguimiento-pacientes-demo.html";
for (const width of [1280, 390])
  test(
    "HTML autónomo " +
      width +
      "px: mismo flujo, guardado temporal y cero conexiones a Internet",
    { timeout: 45000 },
    async () => {
      const html = readFileSync(path);
      const hits: string[] = [];
      const server = createServer((req, res) => {
        hits.push(req.url || "");
        if (req.url !== "/") {
          res.writeHead(404);
          res.end();
          return;
        }
        res.writeHead(200, {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        });
        res.end(html);
      });
      await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
      const address = server.address() as any;
      const base = "http://127.0.0.1:" + address.port;
      const browser = await chromium.launch({
        executablePath: "/usr/bin/chromium",
        args: ["--no-sandbox"],
      });
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      if (width === 390)
        await page.addInitScript(() => {
          Object.defineProperty(crypto, "randomUUID", {
            value: undefined,
            writable: true,
            configurable: true,
          });
        });
      page.setDefaultTimeout(10000);
      const errors: string[] = [],
        requests: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("request", (r) => {
        if (/^https?:/.test(r.url()) && !r.url().startsWith(base))
          requests.push(r.url());
      });
      try {
        await page.goto(base);
        let dialog = page.getByRole("dialog", {
          name: "Consulta clínica",
          exact: true,
        });
        await expect(dialog).toBeVisible();
        await expect(page.getByLabel("Modo de prueba")).toContainText(
          "DEMO HTML",
        );
        await expect(
          dialog.getByLabel("Fecha de atención", { exact: true }),
        ).toHaveValue("2026-10-10");
        const section = (name: string) =>
          dialog
            .getByRole("navigation", { name: "Secciones de la consulta" })
            .getByRole("button", { name, exact: true })
            .click();
        await section("Consulta");
        await dialog
          .getByText("Seleccionar medicamentos", { exact: false })
          .first()
          .click();
        await dialog.getByRole("checkbox", { name: /^Ozempic/ }).check();
        await dialog
          .getByLabel("Elegir lápiz o pluma de Ozempic", { exact: true })
          .selectOption("Ozempic 1 mg/dosis");
        const ozempic = dialog
          .locator("details.treatment-selected")
          .filter({ hasText: "Ozempic" });
        await ozempic
          .getByLabel("Dosis administrada de Ozempic", { exact: true })
          .fill("0.5 mg");
        await ozempic.getByLabel(/: Frecuencia$/).fill("Cada 7 días");
        await ozempic
          .getByRole("checkbox", { name: "Con conteo de clics", exact: true })
          .check();
        await expect(ozempic.getByLabel(/: Notas$/)).toHaveValue(
          /Con conteo de clics/,
        );
        await ozempic
          .getByRole("button", { name: "Quitar de esta atención", exact: true })
          .click();
        await section("Configuración");
        await dialog.getByRole("button", { name: /^Wegovy/ }).click();
        await dialog
          .getByLabel(
            "Presentaciones de pluma (mg por dosis, separadas por punto y coma)",
            {
              exact: true,
            },
          )
          .fill(
            "0.25 mg; 0.5 mg; 1 mg; 1.7 mg; 2.4 mg; Personalizada según registro",
          );
        await dialog
          .getByRole("button", { name: "Guardar catálogo", exact: true })
          .click();
        await expect(dialog.getByRole("status")).toContainText(
          "Catálogo guardado",
        );
        await section("Consulta");
        // Visual shortcuts must show measured values and keep the consultation draft.
        await expect(
          dialog.getByRole("region", { name: "Resumen de esta atención" }),
        ).toContainText("83");
        await dialog.getByRole("button", { name: /^Peso: 83 kg/ }).click();

        await expect(
          dialog.getByLabel("Peso (kg)", { exact: true }),
        ).toHaveValue("83");
        await dialog.getByLabel("Peso (kg)", { exact: true }).fill("82");
        await section("Consulta");
        await expect(
          dialog.getByRole("button", { name: /^Peso: 82 kg/ }),
        ).toBeVisible();
        if (width === 390) {
          await dialog
            .getByLabel("Ir a sección", { exact: true })
            .selectOption("Mediciones");
          await expect(
            dialog.getByLabel("Peso (kg)", { exact: true }),
          ).toHaveValue("82");
        }
        await dialog
          .getByRole("button", { name: "Guardar consulta", exact: true })
          .click();
        await expect(dialog.getByRole("status")).toContainText(
          "Consulta guardada",
        );
        await section("Evolución");
        await dialog
          .getByRole("button", { name: "Peso y medidas", exact: true })
          .click();
        await expect(dialog.locator("tbody").first()).toContainText("82");
        await dialog
          .getByRole("button", { name: "Índices y referencias", exact: true })
          .click();
        await expect(
          dialog.getByLabel("Sexo para referencia cintura/cadera"),
        ).toHaveValue("male");
        await expect(dialog.getByText(/Referencia 0,90/)).toBeVisible();
        await dialog
          .getByLabel("Sexo para referencia cintura/cadera")
          .selectOption("female");
        await expect(dialog.getByText(/Referencia 0,85/)).toBeVisible();
        assert.equal(
          await dialog.evaluate((e) => e.scrollWidth <= e.clientWidth),
          true,
        );
        await section("Plantillas");
        await dialog
          .getByLabel("Importar texto desde PDF o TXT", { exact: true })
          .setInputFiles({
            name: "Plantilla de demostración.txt",
            mimeType: "text/plain",
            buffer: Buffer.from(
              "Texto ficticio para {{paciente}}. Fecha {{fecha}}.",
            ),
          });
        await expect(
          dialog.getByLabel("Texto de la plantilla", { exact: true }),
        ).toHaveValue(/Texto ficticio/);
        await dialog
          .getByRole("button", { name: "Guardar plantilla", exact: true })
          .click();
        await expect(dialog.locator(".cw-template-list")).toContainText(
          "Plantilla de demostración",
        );
        await dialog
          .getByRole("button", {
            name: "Cambiar paciente / volver",
            exact: true,
          })
          .click();
        await page.getByRole("button", { name: /Control 4/ }).click();
        dialog = page.getByRole("dialog", {
          name: "Consulta clínica",
          exact: true,
        });
        await section("Mediciones");
        await expect(
          dialog.getByLabel("Peso (kg)", { exact: true }),
        ).toHaveValue("82");
        await page.reload();
        dialog = page.getByRole("dialog", {
          name: "Consulta clínica",
          exact: true,
        });
        await section("Mediciones");
        await expect(
          dialog.getByLabel("Peso (kg)", { exact: true }),
        ).toHaveValue("83");
        await dialog
          .getByLabel("Fecha de atención", { exact: true })
          .fill("2026-12-01");
        await section("Consulta");
        await expect(
          dialog.getByRole("button", { name: /^Peso: Por registrar/ }),
        ).toBeVisible();
        await expect(
          dialog.getByRole("button", {
            name: /^Sueño promedio: Por registrar/,
          }),
        ).toBeVisible();
        assert.deepEqual(errors, []);
        assert.deepEqual(requests, []);
        assert.ok(hits.every((p) => p === "/" || p === "/favicon.ico"));
      } finally {
        await browser.close();
        await new Promise<void>((r) => server.close(() => r()));
      }
    },
  );
