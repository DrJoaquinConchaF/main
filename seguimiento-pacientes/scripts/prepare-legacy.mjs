import { mkdir, cp, readFile, writeFile } from "node:fs/promises";
import { patchLegacy, patchPdfReader } from "./patch-legacy.mjs";
await mkdir("public", { recursive: true });
await cp("legacy/assets", "public/assets", { recursive: true });
await cp("legacy/ocr", "public/ocr", { recursive: true });

await writeFile(
  "public/assets/index-CHFu2iim.js",
  patchLegacy(await readFile("legacy/assets/index-CHFu2iim.js", "utf8")),
);
await writeFile(
  "public/assets/read-pdf-1cBH5bjo.js",
  patchPdfReader(await readFile("legacy/assets/read-pdf-1cBH5bjo.js", "utf8")),
);
await mkdir("public/referencias", { recursive: true });
await cp(
  "reference-assets/wegovy-tabla-clics.pdf",
  "public/referencias/wegovy-tabla-clics.pdf",
);
