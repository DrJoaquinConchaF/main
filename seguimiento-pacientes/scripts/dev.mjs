import { spawnSync, spawn } from "node:child_process";
const env = {
  ...process.env,
  XDG_CONFIG_HOME: "/workspace/.config",
  WRANGLER_SEND_METRICS: "false",
};
delete env.CLOUDFLARE_API_TOKEN;
const build = spawnSync("npm", ["run", "build"], { env, stdio: "inherit" });
if (build.status !== 0) process.exit(build.status ?? 1);
const server = spawn(
  "node_modules/.bin/wrangler",
  [
    "dev",
    "--local",
    "--ip",
    "127.0.0.1",
    "--port",
    "8787",
    "--var",
    "DEV_MODE:local",
  ],
  { env, stdio: "inherit" },
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => server.kill(signal));
server.on("exit", (code) => process.exit(code ?? 1));
