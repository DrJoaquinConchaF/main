import test from "node:test";
import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
const base = process.env.TEST_BASE_URL;
for (const width of [390, 1280])
  test(
    `Evolución ${width}px: barras nuevas en ficha original, índices y colores claros con sistema oscuro`,
    { skip: !base, timeout: 60000 },
    async () => {
      const create = await fetch(base + "/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: base! },
        body: JSON.stringify({
          name: "TEST barras " + width,
          email: `barras-${width}@example.invalid`,
        }),
      });
      assert.equal(create.status, 201);
      const patient: any = await create.json();
      for (const [i, date] of ["2026-01-11", "2026-02-15"].entries())
        for (const kind of ["inbody", "anthropometry"]) {
          const response = await fetch(
            base + `/api/patients/${patient.id}/records`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json", Origin: base! },
              body: JSON.stringify({
                kind,
                date,
                attention_date: date,
                data:
                  kind === "inbody"
                    ? {
                        weight: 90 - i * 3,
                        fat: 30 - i * 2,
                        muscle: 32 + i,
                        fatPercent: 33 - i,
                        visceralFat: 12 - i,
                      }
                    : {
                        weight: 90 - i * 3,
                        height: 175,
                        waistWHO: 100 - i * 4,
                        waistNavel: 105 - i * 4,
                        waistSmall: 95 - i * 4,
                        hip: 105 - i * 2,
                      },
              }),
            },
          );
          assert.equal(response.status, 201, await response.text());
        }
      const browser = await chromium.launch({
        executablePath: "/usr/bin/chromium",
        args: ["--no-sandbox"],
      });
      const page = await browser.newPage({
        viewport: { width, height: 900 },
        colorScheme: "dark",
      });
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      try {
        await page.goto(base!);
        await page
          .locator("button.patient")
          .filter({ hasText: patient.name })
          .click();
        const dialog = page.getByRole("dialog", {
          name: "Consulta clínica",
          exact: true,
        });
        await expect(dialog).toBeVisible();
        await dialog
          .getByRole("button", {
            name: "PDFs, fotografías y gráficos",
            exact: true,
          })
          .click();
        const body = page.locator("#root .body-evolution-host");
        await expect(body).toBeVisible();
        await expect(
          body.getByLabel("Gráfico de Masa grasa", { exact: true }),
        ).toContainText("28");
        assert.equal(
          await page
            .locator("body")
            .evaluate((e) => getComputedStyle(e).backgroundColor),
          "rgb(254, 248, 248)",
        );
        await expect(
          body.locator(".recharts-bar-rectangle").first(),
        ).toBeVisible();
        await body
          .getByRole("button", { name: "Peso y medidas", exact: true })
          .click();
        await expect(
          body.getByLabel("Gráfico de IMC", { exact: true }),
        ).toBeVisible();
        await body
          .getByRole("button", { name: "Índices y referencias", exact: true })
          .click();
        await body
          .getByLabel("Sexo para referencia cintura/cadera")
          .selectOption("female");
        await expect(body.getByText(/Referencia 0,85/)).toBeVisible();
        await expect(
          body.getByLabel("Gráfico de Índice cintura/estatura", {
            exact: true,
          }),
        ).toContainText("0,549");
        await body
          .getByRole("button", {
            name: "Mostrar / ocultar tabla editable original",
            exact: true,
          })
          .click();
        await expect(page.locator("#root .chart-card")).toBeVisible();
        await page
          .getByRole("button", { name: "Hábitos", exact: true })
          .click();
        await expect(body).toHaveCount(0);
        await page
          .getByRole("button", { name: "Antropometría", exact: true })
          .click();
        await expect(body).toBeVisible();
        await page.screenshot({
          path: `test-results/evolucion-original-${width}.png`,
        });
        assert.equal(
          await page
            .locator("body")
            .evaluate((e) => e.scrollWidth <= innerWidth),
          true,
        );
        assert.deepEqual(errors, []);
      } finally {
        await browser.close();
      }
    },
  );
