import { spawnSync } from "node:child_process";
const args = process.argv.slice(2),
  env = {
    ...process.env,
    WRANGLER_SEND_METRICS: "false",
    XDG_CONFIG_HOME: "/workspace/.config",
  };
delete env.CLOUDFLARE_API_TOKEN;
const cli = (a) =>
  spawnSync("node_modules/.bin/wrangler", a, { env, stdio: "inherit" });
// Only development storage. Existing production resources are never initialized by this script.
const p = cli([
  "d1",
  "execute",
  "DB",
  "--local",
  ...args,
  "--command",
  "SELECT id FROM patients LIMIT 0;",
]);
if (p.status !== 0) {
  const init = cli([
    "d1",
    "execute",
    "DB",
    "--local",
    ...args,
    "--file",
    "legacy/current-schema.sql",
  ]);
  if (init.status !== 0) process.exit(init.status ?? 1);
}
const migrate = cli(["d1", "migrations", "apply", "DB", "--local", ...args]);
process.exit(migrate.status ?? 1);
