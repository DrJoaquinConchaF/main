// Explicit owner CLI operation: creates a single-use recovery link, never public access.
import { randomBytes, createHash } from "node:crypto";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
if (process.argv[2] !== "--remote")
  throw new Error(
    "Use --remote only for the existing configured Worker account.",
  );
const token = randomBytes(32).toString("hex");
const hash = createHash("sha256").update(token).digest("hex");
const expires = Date.now() + 24 * 60 * 60 * 1000;
const dir = mkdtempSync(join(tmpdir(), "clinic-access-"));
const sql = join(dir, "recovery.sql");
writeFileSync(
  sql,
  `INSERT INTO private_access(id,recovery_hash,recovery_expires) VALUES(1,'${hash}',${expires}) ON CONFLICT(id) DO UPDATE SET recovery_hash=excluded.recovery_hash,recovery_expires=excluded.recovery_expires;`,
  { mode: 0o600 },
);
const env = {
  ...process.env,
  XDG_CONFIG_HOME: "/workspace/.config",
  WRANGLER_SEND_METRICS: "false",
};
delete env.CLOUDFLARE_API_TOKEN;
try {
  const result = spawnSync(
    "node_modules/.bin/wrangler",
    ["d1", "execute", "DB", "--remote", "--file", sql],
    { env, stdio: "inherit" },
  );
  if (result.status !== 0) throw new Error("No se emitió el enlace.");
  const destination = "/tmp/clinic-private-link.txt";
  writeFileSync(
    destination,
    `https://seguimiento-prueba-36658619bab1.seguimiento-pacientes.workers.dev/acceso#${token}\n`,
    { mode: 0o600 },
  );
  console.log(
    `Enlace privado guardado en ${destination}; vence ${new Date(expires).toISOString()}. No lo incluyas en Git.`,
  );
} finally {
  rmSync(dir, { recursive: true, force: true });
}
