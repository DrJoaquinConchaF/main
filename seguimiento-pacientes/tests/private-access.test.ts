import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import worker from "../worker/index";
import { tokenHash } from "../worker/private-access";
function fixture() {
  const db = new DatabaseSync(":memory:");
  db.exec(readFileSync("migrations/0013_private_access.sql", "utf8"));
  const prepare = (sql: string, args: any[] = []): any => ({
    bind: (...values: any[]) => prepare(sql, values),
    first: async () => db.prepare(sql).get(...args) || null,
    run: async () => ({
      meta: { changes: Number(db.prepare(sql).run(...args).changes) },
    }),
  });
  const env = {
    ADMIN_PASSWORD: "original-test-password",
    SESSION_SECRET: "synthetic-session-secret-of-at-least-32-characters",
    DB: { prepare },
  };
  const call = (
    path: string,
    input?: any,
    origin = "https://clinic.example",
    cookie = "",
  ) =>
    worker.fetch(
      new Request("https://clinic.example" + path, {
        method: input ? "POST" : "GET",
        headers: {
          Origin: origin,
          Cookie: cookie,
          "Content-Type": "application/json",
        },
        body: input ? JSON.stringify(input) : undefined,
      }),
      env,
      {} as any,
    );
  const issue = async (token: string, expires = Date.now() + 60000) =>
    db
      .prepare(
        "INSERT INTO private_access(id,recovery_hash,recovery_expires) VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET recovery_hash=excluded.recovery_hash,recovery_expires=excluded.recovery_expires",
      )
      .run(await tokenHash(token), expires);
  return { db, call, issue };
}
test("Acceso privado: token de un uso, contraseña elegida, sesión privada y rechazo de contraseña anterior", async () => {
  const { db, call, issue } = fixture();
  const token = "a".repeat(64),
    password = "Nueva prueba privada 2026";
  await issue(token);
  assert.equal(
    (
      await call(
        "/api/private-access",
        { token, password },
        "https://evil.example",
      )
    ).status,
    403,
  );
  assert.equal(
    (await call("/api/private-access", { token: "b".repeat(64), password }))
      .status,
    401,
  );
  assert.equal(
    (await call("/api/private-access", { token, password: "corta" })).status,
    400,
  );
  assert.equal((await call("/api/session")).status, 401);
  const results = await Promise.all([
    call("/api/private-access", { token, password }),
    call("/api/private-access", { token, password }),
  ]);
  assert.deepEqual(results.map((r) => r.status).sort(), [200, 401]);
  const response = results.find((r) => r.status === 200)!;
  const cookie = response.headers.get("set-cookie")!;
  assert.match(cookie, /HttpOnly; Secure; SameSite=Strict/);
  assert.equal(
    (await call("/api/session", undefined, undefined, cookie.split(";")[0]))
      .status,
    200,
  );
  const stored = db.prepare("SELECT * FROM private_access").get()!;
  assert.notEqual(stored.password_hash, password);
  assert.equal(stored.recovery_hash, null);
  assert.equal(
    (await call("/api/private-access", { token, password })).status,
    401,
  );
  assert.equal(
    (await call("/api/login", { password: "original-test-password" })).status,
    401,
  );
  assert.equal((await call("/api/login", { password })).status, 200);
  await issue("c".repeat(64), Date.now() - 1);
  assert.equal(
    (await call("/api/private-access", { token: "c".repeat(64), password }))
      .status,
    401,
  );
  assert.equal((await call("/api/login", { password })).status, 200);
  db.close();
});
test("Enlace privado: página sin terceros ni caché, token en fragmento y sesión anterior compatible", async () => {
  const { db, call } = fixture();
  const page = await call("/acceso");
  assert.equal(page.headers.get("cache-control"), "no-store");
  assert.equal(page.headers.get("referrer-policy"), "no-referrer");
  assert.match(
    page.headers.get("content-security-policy")!,
    /frame-ancestors 'none'/,
  );
  assert.match(await page.text(), /history.replaceState/);
  assert.equal(
    (await call("/api/login", { password: "original-test-password" })).status,
    200,
  );
  assert.equal(
    (await call("/api/login", { password: "incorrecta" })).status,
    401,
  );
  db.close();
});

test("Acceso móvil: fragmento oculto, elección de contraseña y entrada tras guardar", async () => {
  const { chromium, expect } = await import("@playwright/test");
  const { call, db } = fixture();
  const html = await (await call("/acceso")).text();
  const browser = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  try {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
    });
    const token = "d".repeat(64);
    await page.route("https://clinic.example/**", async (route) => {
      const req = route.request();
      if (req.url().endsWith("/api/private-access")) {
        assert.deepEqual(req.postDataJSON(), {
          token,
          password: "Contraseña de prueba 2026",
        });
        await route.fulfill({ json: { ok: true } });
      } else if (req.url().endsWith("/acceso"))
        await route.fulfill({ contentType: "text/html", body: html });
      else
        await route.fulfill({
          contentType: "text/html",
          body: "<p>Aplicación privada</p>",
        });
    });
    await page.goto("https://clinic.example/acceso#" + token);
    await expect(page).toHaveURL("https://clinic.example/acceso");
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    await page
      .getByLabel("Nueva contraseña", { exact: true })
      .fill("Contraseña de prueba 2026");
    await page
      .getByLabel("Repite tu contraseña", { exact: true })
      .fill("Otra contraseña diferente");
    await page
      .getByRole("button", { name: "Guardar contraseña y entrar" })
      .click();
    await expect(page.getByRole("status")).toHaveText(
      "Las contraseñas no coinciden.",
    );
    await page
      .getByLabel("Repite tu contraseña", { exact: true })
      .fill("Contraseña de prueba 2026");
    await page.getByRole("checkbox").check();
    await expect(
      page.getByLabel("Nueva contraseña", { exact: true }),
    ).toHaveAttribute("type", "text");
    await page
      .getByRole("button", { name: "Guardar contraseña y entrar" })
      .click();
    await expect(page).toHaveURL("https://clinic.example/");
  } finally {
    await browser.close();
    db.close();
  }
});
