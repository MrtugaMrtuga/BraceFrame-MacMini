import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const app = readFileSync(path.join(root, "src/app.ts"), "utf8");
assert.match(app, /label: "Hoje"/);
assert.match(app, /href: "#\/"/);
assert.match(app, /renderCaptura/);
assert.match(app, /renderHoje/);
assert.doesNotMatch(app, /label: "Início"/);

const adherence = readFileSync(path.join(root, "src/db/adherence.ts"), "utf8");
assert.match(adherence, /manha.*tarde.*merenda.*noite/);
assert.match(adherence, /ALIGNER_TARGET_HOURS = 22/);
assert.match(adherence, /elásticos conta como 1 tarefa/);
assert.doesNotMatch(adherence, /compliance/i);

const hoje = readFileSync(path.join(root, "src/views/hoje.ts"), "utf8");
assert.match(hoje, /"Hoje"/);
assert.match(hoje, /"Adesão"/);
assert.match(hoje, /Cumpri o que faltava/);
assert.match(hoje, /Marcar OFM como cumprido/);
assert.doesNotMatch(hoje, /compliance/i);
assert.doesNotMatch(hoje, /GoSmile/i);

const store = readFileSync(path.join(root, "src/db/idb.ts"), "utf8");
assert.match(store, /"adherence"/);
assert.match(store, /DB_VERSION = 2/);

function usagePercent(done, active) {
  if (!active) return 0;
  return Math.round((done / active) * 100);
}

assert.equal(usagePercent(0, 3), 0);
assert.equal(usagePercent(2, 3), 67);
assert.equal(usagePercent(3, 3), 100);
assert.equal(usagePercent(1, 1), 100);

console.log("adesao ok");
