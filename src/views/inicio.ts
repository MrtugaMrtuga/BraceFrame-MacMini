import { el } from "../lib/dom";
import { daysBetween, formatDayMonth, todayISO, weekNumber } from "../lib/dates";
import { listPhotos, loadProfile, type Photo } from "../db/store";

function thumb(photo?: Photo): HTMLElement {
  const box = el("div", { class: "frame-ph frame-marks" });
  if (photo) {
    const img = el("img", { alt: "" });
    img.src = URL.createObjectURL(photo.blob);
    box.append(img);
  }
  return box;
}

export async function renderInicio(root: HTMLElement): Promise<void> {
  const profile = loadProfile();
  if (!profile) return;
  const days = daysBetween(profile.placementDate);
  const week = weekNumber(days);
  const total = profile.treatmentWeeks || 14;
  const photos = await listPhotos();
  const latest = uniqueLatest(photos, 3);

  const cta = el("a", { class: "cta", href: "#/captura" }, "Tirar fotos de hoje");
  const thumbs = el("div", { class: "thumbs" });
  for (let i = 0; i < 3; i++) thumbs.append(thumb(latest[i]));

  const next = nextAppointmentLabel(profile.nextAppointmentDate);
  const pct = Math.min(100, Math.round((week / total) * 100));

  root.replaceChildren(
    el(
      "section",
      { class: "screen" },
      el(
        "div",
        { class: "top-row" },
        el(
          "div",
          {},
          el("h1", { class: "title" }, "BraceFrame"),
          el("p", { class: "tagline" }, "o teu sorriso em curso"),
        ),
        el("span", { class: "chip" }, `Semana ${week}`),
      ),
      el("p", { class: "hero-stat" }, `${days} dias com aparelho`),
      el("p", { class: "next-line" }, next),
      cta,
      el("h2", { class: "section-label" }, "Últimas"),
      thumbs,
      el(
        "div",
        { class: "progress-wrap" },
        el("div", { class: "progress-bar" }, el("span", { style: `width:${pct}%` })),
        el("p", { class: "progress-label" }, `${week} de ${total} semanas · continua assim`),
      ),
    ),
  );
}

function uniqueLatest(photos: Photo[], n: number): Photo[] {
  const seen = new Set<string>();
  const out: Photo[] = [];
  for (const p of photos) {
    if (seen.has(p.date)) continue;
    seen.add(p.date);
    out.push(p);
    if (out.length >= n) break;
  }
  return out;
}

function nextAppointmentLabel(iso?: string): string {
  if (!iso) return "Próxima consulta · por marcar";
  if (iso < todayISO()) return "Próxima consulta · por marcar";
  return `Próxima consulta · ${formatDayMonth(iso)}`;
}
