import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const svgPath = path.join(root, "public/icons/icon.svg");
const outDir = path.join(root, "public/icons");
const docsDir = path.join(root, "docs");

const sizes = [
  ["icon-1024.png", 1024],
  ["icon-512.png", 512],
  ["icon-192.png", 192],
  ["apple-touch-icon.png", 180],
  ["favicon-32.png", 32],
];

const svg = await readFile(svgPath);
await mkdir(outDir, { recursive: true });
await mkdir(docsDir, { recursive: true });

for (const [name, size] of sizes) {
  await sharp(svg)
    .resize(size, size, { fit: "fill" })
    .png({ compressionLevel: 9 })
    .toFile(path.join(outDir, name));
}

await writeFile(path.join(docsDir, "icon-1024.png"), await readFile(path.join(outDir, "icon-1024.png")));
console.log("icons ok");
