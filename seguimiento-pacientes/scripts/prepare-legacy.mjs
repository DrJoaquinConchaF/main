import { mkdir, cp } from "node:fs/promises";
await mkdir("public", { recursive: true });
await cp("legacy/assets", "public/assets", { recursive: true });
await cp("legacy/ocr", "public/ocr", { recursive: true });
