import test from "node:test";
import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
const base = process.env.TEST_BASE_URL;
function pdf(lines: string[]) {
  const stream = [
    "BT /F1 10 Tf",
    ...lines.flatMap((line, i) => [
      `1 0 0 1 30 ${770 - i * 22} Tm`,
      `(${line.replace(/[()\\]/g, "\\$&")}) Tj`,
    ]),
    "ET",
  ].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
  ];
  const chunks = [Buffer.from("%PDF-1.4\n")],
    offsets = [0];
  let size = chunks[0].length;
  objects.forEach((obj, i) => {
    offsets.push(size);
    const b = Buffer.from(`${i + 1} 0 obj\n${obj}\nendobj\n`);
    chunks.push(b);
    size += b.length;
  });
  chunks.push(
    Buffer.from(
      `xref\n0 6\n0000000000 65535 f \n${offsets
        .slice(1)
        .map((n) => String(n).padStart(10, "0") + " 00000 n ")
        .join(
          "\n",
        )}\ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${size}\n%%EOF`,
    ),
  );
  return Buffer.concat(chunks);
}
test(
  "Resumen único, pasos mensuales, adherencia porcentual, hidratación y PDF compacto",
  { skip: !base, timeout: 90000 },
  async () => {
    const created = await fetch(base + "/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: base! },
      body: JSON.stringify({
        name: "TEST consulta única",
        email: "unica@example.invalid",
      }),
    });
    assert.equal(created.status, 201);
    const patient: any = await created.json();
    const browser = await chromium.launch({
      executablePath: "/usr/bin/chromium",
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage({
      viewport: { width: 1280, height: 900 },
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
      const summary = page.getByRole("region", {
        name: "Resumen del último control",
        exact: true,
      });
      await expect(summary).toBeVisible();
      await expect(summary.locator("input,textarea,select")).toHaveCount(0);
      await expect(
        page.getByRole("button", { name: "Atención actual", exact: true }),
      ).toHaveCount(0);
      await page.locator("[data-clinical-launch]").click();
      let visit = page.getByRole("dialog", {
        name: "Consulta clínica",
        exact: true,
      });
      const section = (name: string) =>
        visit
          .getByRole("navigation", { name: "Secciones de la consulta" })
          .getByRole("button", { name, exact: true })
          .click();
      await visit
        .getByLabel("Fecha de atención", { exact: true })
        .fill("2026-10-25");
      await section("Consulta");
      await visit
        .getByLabel("Adherencia autoinformada (%)", { exact: true })
        .fill("30");
      await visit
        .getByLabel("Fecha de nacimiento para historia de peso", {
          exact: true,
        })
        .fill("1988-06-15");
      await visit
        .getByRole("button", { name: "Agregar etapa / evento", exact: true })
        .click();
      await visit
        .getByLabel("Edad aproximada 1", { exact: true })
        .fill("27 años");
      await visit
        .getByLabel("Peso aproximado (kg) 1", { exact: true })
        .fill("68,4 kg");
      await expect(
        visit.getByLabel("Año calculado 1", { exact: true }),
      ).toHaveValue("2015");
      await expect(visit.locator(".recharts-line-dot")).toHaveCount(1);
      await section("Hábitos y alimentación");
      await expect(visit.getByLabel(/pasos.*semana/i)).toHaveCount(0);
      await visit
        .getByLabel("Pasos promedio diarios del último mes (pasos/día)", {
          exact: true,
        })
        .fill("5000");
      for (let i = 1; i <= 2; i++) {
        await visit
          .getByRole("button", {
            name: "Agregar actividad semanal",
            exact: true,
          })
          .click();
        await visit
          .getByLabel(`Actividad ${i}: disciplina`, { exact: true })
          .fill(i === 1 ? "HYROX" : "Fuerza");
        await visit
          .getByLabel(`Actividad ${i}: Sesiones/semana`, { exact: true })
          .fill("1.5");
        await visit
          .getByLabel(`Actividad ${i}: Minutos/sesión`, { exact: true })
          .fill("60");
      }
      await expect(
        visit.getByLabel("Actividad 1: disciplina", { exact: true }),
      ).toBeVisible();
      await expect(
        visit.getByLabel("Actividad 2: disciplina", { exact: true }),
      ).toBeVisible();
      for (const [i, name] of ["Leche", "Bebida vegetal", "Otra"].entries()) {
        await visit
          .getByRole("button", {
            name: "Agregar bebida / recipiente",
            exact: true,
          })
          .click();
        await visit
          .getByLabel(`Bebida ${i + 1}`, { exact: true })
          .selectOption(name);
        await visit
          .getByLabel(`Cantidad diaria ${i + 1}`, { exact: true })
          .fill("1");
      }
      await visit
        .getByLabel("Especifica otra bebida 3", { exact: true })
        .fill("Kombucha");
      await visit
        .getByRole("button", { name: "Guardar consulta", exact: true })
        .click();
      await expect(visit.getByRole("status")).toContainText(
        "Consulta guardada",
      );
      await section("Mediciones");
      await visit
        .getByRole("button", {
          name: "Abrir carga de PDF y resultados",
          exact: true,
        })
        .click();
      const date = page.locator(".attention-bar input[type=date]");
      await expect(date).toHaveValue("2026-10-25");
      await page
        .getByRole("button", { name: "+ Subir PDF", exact: true })
        .click();
      const modal = page.getByRole("dialog", {
        name: "Leer y registrar PDF",
        exact: true,
      });
      await modal.locator("input[type=file]").setInputFiles({
        name: "laboratorio-prueba.pdf",
        mimeType: "application/pdf",
        buffer: pdf([
          "Fecha de toma de muestra: 20/10/2026",
          "Glucosa mg/dL 87 70 - 99",
          ". mmol/L 4.82 3.89 - 5.49",
          "Trigliceridos mg/dL 190 0 - 150",
          "Hemoglobina g/dL 10.8 12 - 16",
        ]),
      });
      await expect(modal.locator(".compact-import-table tbody tr")).toHaveCount(
        4,
      );
      await expect(
        modal.getByRole("checkbox", {
          name: "Incluir resultado 2",
          exact: true,
        }),
      ).not.toBeChecked();
      await expect(modal.locator(".compact-import-table strong")).toContainText(
        ["190", "10,8"],
      );
      await modal
        .getByRole("button", { name: "Guardar PDF y resultados", exact: true })
        .click();
      await expect(modal).toHaveCount(0);
      const records: any[] = await (
        await fetch(base + `/api/patients/${patient.id}/records`)
      ).json();
      const labs = records.filter((r) => r.kind === "lab");
      assert.equal(labs.length, 3);
      assert.equal(labs[0].attention_date, "2026-10-25");
      assert.equal(labs[0].date, "2026-10-20");
      assert.ok(
        labs.some(
          (r) =>
            r.data.name === "Glucosa" &&
            r.data.unit === "mg/dL" &&
            r.data.value === 87,
        ),
      );
      assert.ok(!labs.some((r) => r.data.value === 4.82));
      await page.locator("[data-clinical-launch]").click();
      visit = page.getByRole("dialog", {
        name: "Consulta clínica",
        exact: true,
      });
      await visit
        .getByLabel("Fecha de atención", { exact: true })
        .fill("2026-10-25");
      await section("Consulta");
      await expect(
        visit.getByLabel("Edad aproximada 1", { exact: true }),
      ).toHaveValue("27 años");
      await expect(
        visit.getByLabel("Año calculado 1", { exact: true }),
      ).toHaveValue("2015");

      await section("Hábitos y alimentación");
      await expect(
        visit.getByLabel("Especifica otra bebida 3", { exact: true }),
      ).toHaveValue("Kombucha");
      await section("Mediciones");
      await expect(
        visit.getByRole("region", {
          name: "Exámenes de esta atención",
          exact: true,
        }),
      ).toContainText("190 ↑");
      await visit
        .getByRole("button", { name: "Cambiar paciente / volver", exact: true })
        .click();
      await expect(summary).toContainText("30 %");
      await expect(summary).toContainText("5.000");
      await expect(summary).toContainText("HYROX");
      await page.screenshot({ path: "test-results/resumen-unico-1280.png" });
      assert.deepEqual(errors, []);
    } finally {
      await browser.close();
    }
  },
);
