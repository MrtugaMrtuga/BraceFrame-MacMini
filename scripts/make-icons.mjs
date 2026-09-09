import { existsSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const svgPath = path.join(root, "public/icons/icon.svg");
const outDir = path.join(root, "public/icons");

const sizes = [
  ["icon-1024.png", 1024],
  ["icon-512.png", 512],
  ["icon-192.png", 192],
  ["apple-touch-icon.png", 180],
  ["favicon-32.png", 32],
];

/** Locked Home header marks — same coral frame + smile as the app icon. */
const markSizes = [40, 44, 52, 64, 88, 128];

const svg = await readFile(svgPath);
await mkdir(outDir, { recursive: true });

for (const [name, size] of sizes) {
  const dest = path.join(outDir, name);
  if (existsSync(dest)) continue;
  await sharp(svg)
    .resize(size, size, { fit: "fill" })
    .png({ compressionLevel: 9 })
    .toFile(dest);
}

const markSourcePath = path.join(outDir, "icon-1024.png");
const markSource = existsSync(markSourcePath) ? await readFile(markSourcePath) : svg;

for (const size of markSizes) {
  const dest = path.join(outDir, `mark-${size}.png`);
  if (existsSync(dest)) continue;
  await sharp(markSource)
    .resize(size, size, { fit: "fill" })
    .png({ compressionLevel: 9 })
    .toFile(dest);
}

console.log("icons ok");
