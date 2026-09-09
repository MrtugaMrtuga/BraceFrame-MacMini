import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

for (const size of [40, 44, 52, 64, 88, 128]) {
  const file = path.join(root, "public/icons", `mark-${size}.png`);
  assert.ok(existsSync(file), `missing ${file}`);
}

const inicio = readFileSync(path.join(root, "src/views/inicio.ts"), "utf8");
assert.match(inicio, /class: "home-header"/);
assert.match(inicio, /"BraceFrame"/);
assert.match(inicio, /"o teu sorriso em curso"/);
assert.match(inicio, /homeMarkSrc/);
assert.match(inicio, /screen-home/);

const marks = readFileSync(path.join(root, "src/lib/marks.ts"), "utf8");
assert.match(marks, /mark-52\.png/);
assert.match(marks, /mark-44\.png/);

const kids = readFileSync(path.join(root, "src/styles/tokens-kids.css"), "utf8");
assert.match(kids, /--header-mark-size:\s*52px/);
assert.match(kids, /--header-title-size:\s*34px/);
assert.match(kids, /--header-gap:\s*14px/);
assert.match(kids, /--header-space-under:\s*20px/);
assert.match(kids, /--header-line:\s*#f0e4e0/);

const adults = readFileSync(path.join(root, "src/styles/tokens-adultos.css"), "utf8");
assert.match(adults, /--header-mark-size:\s*44px/);
assert.match(adults, /--header-title-size:\s*28px/);
assert.match(adults, /--header-gap:\s*12px/);
assert.match(adults, /--header-space-under:\s*16px/);
assert.match(adults, /--header-line:\s*#d2d2d7/);

const svg = readFileSync(path.join(root, "public/icons/icon.svg"), "utf8");
assert.match(svg, /#ff5a4a/);
assert.doesNotMatch(svg, /GoSmile/i);

console.log("header ok");
