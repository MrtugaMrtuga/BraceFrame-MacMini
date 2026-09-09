import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const poses = ["frente", "sorriso", "oclusao"];
const variants = ["", "-adultos", "-kids"];

for (const pose of poses) {
  for (const variant of variants) {
    for (const ext of [".svg", ".png"]) {
      const file = path.join(root, "public/guides", `${pose}${variant}${ext}`);
      assert.ok(existsSync(file), `missing ${file}`);
    }
  }
}

function resolveGuideSkin({ className = "", dataTheme = "", profileTheme = "" } = {}) {
  const theme = (dataTheme ?? "").trim().toLowerCase();
  const profile = (profileTheme ?? "").trim().toLowerCase();
  if (/\bskin-kids\b/.test(className)) return "kids";
  if (/\bskin-adultos\b/.test(className)) return "adultos";
  if (theme === "kids") return "kids";
  if (theme === "adultos" || theme === "adults") return "adultos";
  if (profile === "kids") return "kids";
  return "adultos";
}

function guideAssetCandidates(pose, skin, base = "./") {
  const rootUrl = base.endsWith("/") ? `${base}guides/` : `${base}/guides/`;
  const files =
    skin === "kids"
      ? [`${pose}-kids.svg`, `guide-${pose}-kids.svg`, `${pose}-kids.png`, `guide-${pose}-kids.png`]
      : [
          `${pose}-adultos.svg`,
          `guide-${pose}-adultos.svg`,
          `${pose}.svg`,
          `guide-${pose}.svg`,
          `${pose}-adultos.png`,
          `${pose}.png`,
        ];
  return files.map((file) => `${rootUrl}${file}`);
}

assert.equal(resolveGuideSkin({}), "adultos");
assert.equal(resolveGuideSkin({ profileTheme: "adults" }), "adultos");
assert.equal(resolveGuideSkin({ dataTheme: "adultos" }), "adultos");
assert.equal(resolveGuideSkin({ className: "skin-adultos", profileTheme: "kids" }), "adultos");
assert.equal(resolveGuideSkin({ className: "skin-kids" }), "kids");
assert.equal(resolveGuideSkin({ dataTheme: "kids" }), "kids");

const adults = guideAssetCandidates("sorriso", "adultos");
assert.equal(adults[0], "./guides/sorriso-adultos.svg");
assert.ok(adults.includes("./guides/sorriso.svg"));
assert.ok(adults.every((url) => !url.includes("kids")));

const kids = guideAssetCandidates("sorriso", "kids");
assert.equal(kids[0], "./guides/sorriso-kids.svg");
assert.ok(kids.every((url) => url.includes("-kids.")));

function shouldMirrorPreview(facingMode) {
  if (facingMode === "environment") return false;
  return true;
}

assert.equal(shouldMirrorPreview("user"), true);
assert.equal(shouldMirrorPreview(undefined), true);
assert.equal(shouldMirrorPreview("environment"), false);

function photoRecordId(pose, date) {
  return `${date}:${pose}`;
}

function photosByPoseOnDate(photos, date) {
  const day = photos.filter((p) => p.date === date);
  return poses.map((pose) => day.find((p) => p.pose === pose)).filter(Boolean);
}

const day = "2026-09-09";
const frente = photoRecordId("frente", day);
const sorriso = photoRecordId("sorriso", day);
const oclusao = photoRecordId("oclusao", day);
assert.notEqual(frente, sorriso);
assert.notEqual(sorriso, oclusao);
assert.equal(frente, "2026-09-09:frente");
assert.deepEqual(
  photosByPoseOnDate(
    [
      { pose: "oclusao", date: day },
      { pose: "frente", date: day },
      { pose: "sorriso", date: "2026-09-08" },
    ],
    day,
  ).map((p) => p.pose),
  ["frente", "oclusao"],
);

console.log("captura checks ok");
