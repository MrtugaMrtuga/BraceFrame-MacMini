import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "public/guides");
const svgs = (await readdir(dir)).filter((name) => name.endsWith(".svg"));

for (const name of svgs) {
  const svg = await readFile(path.join(dir, name));
  const png = name.replace(/\.svg$/, ".png");
  await sharp(svg, { density: 144 })
    .resize(780, 980, { fit: "fill", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(dir, png));
}

console.log(`guides png ${svgs.length}`);
