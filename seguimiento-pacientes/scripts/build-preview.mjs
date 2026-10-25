import { build } from "vite";
import react from "@vitejs/plugin-react";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
const result = await build({
  configFile: false,
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  publicDir: false,
  plugins: [react()],
  build: {
    write: false,
    minify: true,
    lib: {
      entry: resolve("src/preview/main.tsx"),
      formats: ["iife"],
      name: "ClinicalPreview",
    },
    cssCodeSplit: false,
    assetsInlineLimit: 10000000,
  },
});
const output = (Array.isArray(result) ? result : [result]).flatMap(
  (r) => r.output,
);
const js = output.find((x) => x.type === "chunk").code;
const css = output
  .filter((x) => x.type === "asset" && x.fileName.endsWith(".css"))
  .map((x) => x.source)
  .join("\n");
const html =
  '<!doctype html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><title>Prueba HTML · Seguimiento de pacientes</title><meta name="description" content="Demostración local con datos ficticios. Sin conexión a servidores."><style>' +
  String(css).replace(/<\/style/gi, "<\\/style") +
  '</style></head><body><div id="preview-root"></div><script>' +
  js.replace(/<\/script/gi, "<\\/script") +
  "</script></body></html>";
const path = process.argv[2] || "/workspace/seguimiento-pacientes-demo.html";
await writeFile(path, html);
console.log("HTML autónomo listo:", path, Buffer.byteLength(html), "bytes");
