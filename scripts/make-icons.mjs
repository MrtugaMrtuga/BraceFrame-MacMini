import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const svgPath = path.join(root, "public/icons/icon.svg");
const iconsDir = path.join(root, "public/icons");
const docsDir = path.join(root, "docs");

await mkdir(iconsDir, { recursive: true });
await mkdir(docsDir, { recursive: true });

const raster = async (size, dest) => {
  await sharp(svgPath)
    .resize(size, size, { fit: "fill" })
    .png({ compressionLevel: 9 })
    .toFile(dest);
};

await raster(1024, path.join(iconsDir, "icon-1024.png"));
await raster(512, path.join(iconsDir, "icon-512.png"));
await raster(192, path.join(iconsDir, "icon-192.png"));
await raster(180, path.join(iconsDir, "apple-touch-icon.png"));
await raster(180, path.join(root, "public/apple-touch-icon.png"));
await raster(32, path.join(iconsDir, "favicon-32.png"));
await copyFile(path.join(iconsDir, "icon-1024.png"), path.join(docsDir, "icon-1024.png"));

console.log("icons ok");
