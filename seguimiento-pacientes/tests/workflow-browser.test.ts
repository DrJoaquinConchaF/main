import test from "node:test";
import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const base = process.env.TEST_BASE_URL;
for (const config of [
  { width: 1280, height: 900, colorScheme: "light" as const },
  { width: 390, height: 844, colorScheme: "light" as const },
  { width: 360, height: 740, colorScheme: "dark" as const },
])
  test(
    "Consulta integrada " +
      config.width +
      "px " +
      config.colorScheme +
      ": captura, persistencia, cierre, archivos y conservación de evolución",
    { skip: !base, timeout: 90000 },
    async () => {
      const p = await fetch(base + "/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: base! },
        body: JSON.stringify({
          name: "TEST flujo " + config.width,
          email: "test" + config.width + "@example.invalid",
        }),
      });
      assert.equal(p.status, 201);
      const patient: any = await p.json();
      const browser = await chromium.launch({
        executablePath: "/usr/bin/chromium",
        args: ["--no-sandbox"],
      });
      const page = await browser.newPage({
        viewport: { width: config.width, height: config.height },
        colorScheme: config.colorScheme,
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
        await section("Antecedentes");
        await dialog
          .getByLabel("Detalle: Enfermedades crónicas", { exact: true })
          .fill("Antecedente ficticio");
        await expect(
          dialog.getByLabel("Resumen de antecedentes para Reservo", {
            exact: true,
          }),
        ).toHaveValue("AM: Antecedente ficticio");
        await dialog
          .getByLabel("Resumen de antecedentes para Reservo", { exact: true })
          .fill("AM: ejemplo abreviado");
        await expect(
          dialog.getByLabel("Detalle: Enfermedades crónicas", { exact: true }),
        ).toHaveValue("Antecedente ficticio");
        await section("Consulta");
        await dialog
          .getByLabel("Objetivo de consulta / contexto actual", { exact: true })
          .fill("Mejorar hábitos, caso aislado de prueba");
        await dialog
          .getByLabel("Adherencia autoinformada (%)", { exact: true })
          .fill("90");
        await dialog
          .getByLabel("Cambios corporales notados", { exact: true })
          .fill("Cambios favorables simulados");
        await section("Mediciones");
        await dialog.getByLabel("Peso (kg)", { exact: true }).fill("80");
        await dialog.getByLabel("Estatura (cm)", { exact: true }).fill("175");
        await section("Hábitos y alimentación");
        await dialog
          .getByLabel("Pasos promedio diarios del último mes (pasos/día)", {
            exact: true,
          })
          .fill("8000");
        await dialog
          .getByLabel("Estrés de vida (1–10)", { exact: true })
          .fill("4");
        await dialog
          .getByRole("button", {
            name: "Agregar actividad semanal",
            exact: true,
          })
          .click();
        await dialog
          .getByLabel("Actividad 1: disciplina", { exact: true })
          .fill("Fuerza de prueba");
        await dialog
          .getByLabel("Actividad 1: Sesiones/semana", { exact: true })
          .fill("3");
        await dialog
          .getByLabel("Actividad 1: Minutos/sesión", { exact: true })
          .fill("45");
        await dialog.getByLabel("Actividad 1: MET", { exact: true }).fill("4");
        await dialog
          .getByRole("button", {
            name: "Agregar bebida / recipiente",
            exact: true,
          })
          .click();
        await dialog.getByLabel("Cantidad diaria 1", { exact: true }).fill("4");
        await expect(dialog).toContainText("1 L/día");
        await dialog
          .getByLabel("Desayuno: alimentos y bebidas", { exact: true })
          .fill("Ejemplo ficticio de desayuno");
        await section("Energía y pauta");
        await dialog
          .getByLabel("Método elegido para el plan", { exact: true })
          .selectOption("manual");
        await dialog
          .getByLabel("Gasto estimado manual (kcal/día)", { exact: true })
          .fill("2000");
        await dialog
          .getByLabel("Ajuste energético (kcal/día)", { exact: true })
          .fill("-500");
        await expect(
          dialog.locator(".cw-stat").filter({ hasText: "Ingesta objetivo" }),
        ).toContainText("1.500");
        await expect(
          dialog.locator(".cw-stat").filter({ hasText: "Carbohidratos" }),
        ).toContainText("157");
        await dialog
          .getByLabel("Actividad 1: método de estimación", { exact: true })
          .selectOption("manual");
        await dialog
          .getByLabel("Actividad 1: gasto manual neto (kcal/semana)", {
            exact: true,
          })
          .fill("700");
        await expect(
          dialog
            .locator(".cw-stat")
            .filter({ hasText: "Ejercicio neto diario promedio" }),
        ).toContainText("100");
        await section("Cierre");
        await dialog
          .getByLabel("Evaluación / problemas identificados", { exact: true })
          .fill("Evaluación ficticia para validar el flujo");
        await dialog
          .getByRole("button", {
            name: "Sugerir control en 6 semanas",
            exact: true,
          })
          .click();
        await expect(
          dialog.getByLabel("Próximo control recomendado", { exact: true }),
        ).toHaveValue("2026-12-06");
        await expect(
          dialog.getByLabel("Resumen clínico para copiar", { exact: true }),
        ).toContainText("Mejorar hábitos");
        const response = page.waitForResponse(
          (r) =>
            r
              .url()
              .includes(
                "/api/clinical/patients/" + patient.id + "/visits/2026-10-25",
              ) && r.request().method() === "PUT",
        );
        await dialog
          .getByRole("button", { name: "Guardar consulta", exact: true })
          .click();
        const saved = await response;
        assert.equal(saved.status(), 200, await saved.text());
        await expect(dialog.getByRole("status")).toContainText(
          "Consulta guardada",
        );
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          true,
        );
        assert.equal(
          await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth),
          true,
        );
        await mkdir("test-results", { recursive: true });
        await dialog.evaluate((el) => {
          el.scrollTop = 0;
        });
        await page.screenshot({
          path: "test-results/consulta-" + config.width + ".png",
          fullPage: false,
        });
        await section("Evolución");
        await dialog
          .getByRole("button", { name: "Hábitos", exact: true })
          .click();
        await dialog
          .getByLabel("Variable", { exact: true })
          .selectOption("strengthMinutes");
        await expect(dialog.locator("tbody").first()).toContainText("135");
        await section("Cierre");
        const again = page.waitForResponse(
          (r) =>
            r
              .url()
              .includes(
                "/api/clinical/patients/" + patient.id + "/visits/2026-10-25",
              ) && r.request().method() === "PUT",
        );
        await dialog
          .getByRole("button", { name: "Guardar consulta", exact: true })
          .click();
        assert.equal((await again).status(), 200);
        await expect(dialog.getByRole("status")).toContainText(
          "Consulta guardada",
        );
        const get = await fetch(base + "/api/clinical/patients/" + patient.id);
        const bundle: any = await get.json();
        assert.equal(bundle.visits.length, 1);
        assert.equal(bundle.records.length, 3);
        assert.equal(
          bundle.history.data.conditions.text,
          "Antecedente ficticio",
        );
        assert.equal(bundle.plans[0].data.nextVisit, "2026-12-06");
        await dialog
          .getByLabel("Fecha de atención", { exact: true })
          .fill("2026-12-06");
        await section("Mediciones");
        await expect(
          dialog.getByLabel("Peso (kg)", { exact: true }),
        ).toHaveValue("");
        await expect(
          dialog.getByLabel("Tipo de atención", { exact: true }),
        ).toHaveValue("control");
        await section("Antecedentes");
        await expect(
          dialog.getByLabel("Detalle: Enfermedades crónicas", { exact: true }),
        ).toHaveValue("Antecedente ficticio");
        await section("Plantillas");
        await dialog
          .getByLabel("Importar texto desde PDF o TXT", { exact: true })
          .setInputFiles({
            name: "TEST plantilla " + config.width + ".txt",
            mimeType: "text/plain",
            buffer: Buffer.from(
              "Paciente {{paciente}}. Texto ficticio para prueba, sin dosis ni indicaciones reales.",
            ),
          });
        await expect(
          dialog.getByLabel("Texto de la plantilla", { exact: true }),
        ).toHaveValue(/Texto ficticio/);
        await dialog
          .getByRole("button", { name: "Guardar plantilla", exact: true })
          .click();
        await expect(dialog.locator(".cw-template-list")).toContainText(
          "TEST plantilla " + config.width,
        );
        await dialog
          .getByRole("button", {
            name: "PDFs, fotografías y gráficos",
            exact: true,
          })
          .click();
        await expect(dialog).toHaveCount(0);
        await expect(
          page.getByRole("button", {
            name: "Seguimiento Fotográfico",
            exact: true,
          }),
        ).toBeVisible();
        assert.deepEqual(errors, []);
      } finally {
        await browser.close();
      }
    },
  );

test(
  "PDF de plantilla: extracción local de texto y OCR de un escaneo sin proveedores externos",
  { skip: !base, timeout: 120000 },
  async () => {
    const p = await fetch(base + "/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: base! },
      body: JSON.stringify({
        name: "TEST importación PDF",
        email: "pdf@example.invalid",
      }),
    });
    const patient: any = await p.json();
    const browser = await chromium.launch({
      executablePath: "/usr/bin/chromium",
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage({
      viewport: { width: 1280, height: 900 },
    });
    page.setDefaultTimeout(30000);
    const external: string[] = [];
    page.on("request", (r) => {
      if (r.url().startsWith("http") && !r.url().startsWith(base!))
        external.push(r.url());
    });
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
      await dialog
        .getByRole("navigation", { name: "Secciones de la consulta" })
        .getByRole("button", { name: "Plantillas", exact: true })
        .click();
      const build = (objs: Buffer[]) => {
        const chunks = [Buffer.from("%PDF-1.4\n")];
        const offsets = [0];
        let size = chunks[0].length;
        for (let i = 0; i < objs.length; i++) {
          offsets.push(size);
          const x = Buffer.concat([
            Buffer.from(`${i + 1} 0 obj\n`),
            objs[i],
            Buffer.from("\nendobj\n"),
          ]);
          chunks.push(x);
          size += x.length;
        }
        const tail = Buffer.from(
          "xref\n0 " +
            (objs.length + 1) +
            "\n0000000000 65535 f \n" +
            offsets
              .slice(1)
              .map((n) => String(n).padStart(10, "0") + " 00000 n \n")
              .join("") +
            "trailer\n<< /Size " +
            (objs.length + 1) +
            " /Root 1 0 R >>\nstartxref\n" +
            size +
            "\n%%EOF",
        );
        return Buffer.concat([...chunks, tail]);
      };
      const text =
        "TEST PLANTILLA DIGITAL DE EXAMENES. GLUCOSA 105 mg/dL. Texto ficticio para verificar lectura local.";
      const stream = Buffer.from("BT /F1 14 Tf 40 750 Td (" + text + ") Tj ET");
      const digital = build([
        Buffer.from("<< /Type /Catalog /Pages 2 0 R >>"),
        Buffer.from("<< /Type /Pages /Kids [3 0 R] /Count 1 >>"),
        Buffer.from(
          "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        ),
        Buffer.from("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"),
        Buffer.concat([
          Buffer.from("<< /Length " + stream.length + " >>\nstream\n"),
          stream,
          Buffer.from("\nendstream"),
        ]),
      ]);
      await dialog
        .getByLabel("Importar texto desde PDF o TXT", { exact: true })
        .setInputFiles({
          name: "TEST digital.pdf",
          mimeType: "application/pdf",
          buffer: digital,
        });
      await expect(
        dialog.getByLabel("Texto de la plantilla", { exact: true }),
      ).toHaveValue(/GLUCOSA 105/);
      const image = Buffer.from(
        await page.evaluate(() => {
          const c = document.createElement("canvas");
          c.width = 1400;
          c.height = 700;
          const x = c.getContext("2d")!;
          x.fillStyle = "white";
          x.fillRect(0, 0, 1400, 700);
          x.fillStyle = "black";
          x.font = "44px Arial";
          x.fillText("LABORATORIO DE PRUEBA", 70, 130);
          x.fillText("GLUCOSA 105 mg/dL", 70, 240);
          x.fillText("Documento ficticio sin datos personales.", 70, 350);
          return c.toDataURL("image/jpeg", 0.95).split(",")[1];
        }),
        "base64",
      );
      const paint = Buffer.from("q 600 0 0 300 0 400 cm /Im0 Do Q");
      const scanned = build([
        Buffer.from("<< /Type /Catalog /Pages 2 0 R >>"),
        Buffer.from("<< /Type /Pages /Kids [3 0 R] /Count 1 >>"),
        Buffer.from(
          "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>",
        ),
        Buffer.concat([
          Buffer.from(
            "<< /Type /XObject /Subtype /Image /Width 1400 /Height 700 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " +
              image.length +
              " >>\nstream\n",
          ),
          image,
          Buffer.from("\nendstream"),
        ]),
        Buffer.concat([
          Buffer.from("<< /Length " + paint.length + " >>\nstream\n"),
          paint,
          Buffer.from("\nendstream"),
        ]),
      ]);
      await dialog
        .getByLabel("Importar texto desde PDF o TXT", { exact: true })
        .setInputFiles({
          name: "TEST escaneado.pdf",
          mimeType: "application/pdf",
          buffer: scanned,
        });
      await expect(
        dialog.getByLabel("Texto de la plantilla", { exact: true }),
      ).toHaveValue(/LABORATORIO DE PRUEBA/, { timeout: 90000 });
      assert.deepEqual(external, []);
    } finally {
      await browser.close();
    }
  },
);
