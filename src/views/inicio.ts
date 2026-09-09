import { el } from "../lib/dom";
import { daysBetween, formatDayMonth, todayISO, weekNumber } from "../lib/dates";
import { latestSessionDate, listPhotos, loadProfile, photosByPoseOnDate, type Photo } from "../db/store";
import {
  dayMarks,
  enabledHygieneItems,
  hygieneLabel,
  hygieneStreak,
  isDayComplete,
  toggleHygiene,
  type HygieneItem,
} from "../db/hygiene";
import { icon } from "../lib/icons";
import { linkCard } from "../lib/nav";
import { isKidsTheme } from "../theme";

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
  const kids = isKidsTheme(profile.theme);
  const days = daysBetween(profile.placementDate);
  const week = weekNumber(days);
  const total = profile.treatmentWeeks || 14;
  const photos = await listPhotos();
  const latest = photosByPoseOnDate(photos, latestSessionDate(photos) ?? todayISO());
  const items = enabledHygieneItems(profile);
  const streak = hygieneStreak(items);
  const doneToday = isDayComplete(todayISO(), items);
  const marks = dayMarks(todayISO());
  const pct = Math.min(100, Math.round((week / total) * 100));

  const settings = el("a", { class: "icon-btn settings-btn", href: "#/definicoes", "aria-label": "Definições" });
  settings.innerHTML = icon("settings");

  const badge = kids
    ? streakBadge(streak)
    : el("span", { class: "chip" }, `Semana ${week}`);

  const cta = el("a", { class: "cta", href: "#/captura" }, "Tirar fotos de hoje");
  const thumbs = el("div", { class: "thumbs" });
  for (let i = 0; i < 3; i++) thumbs.append(thumb(latest[i]));

  const checkList = el("div", { class: "check-list" });
  for (const item of items) {
    checkList.append(
      hygieneRow(item, Boolean(marks[item]), async () => {
        toggleHygiene(item);
        await renderInicio(root);
      }),
    );
  }

  const hygieneHint = kids
    ? kidsHygieneHint(doneToday, streak)
    : doneToday
      ? "Hoje está feito."
      : "Marca o que já fizeste. Fica só neste telemóvel.";

  const progressLabel = kids
    ? `${week} de ${total} semanas · continua assim`
    : `${week} de ${total} semanas`;

  const children: Array<Node | string> = [
    el(
      "div",
      { class: "top-row" },
      el(
        "div",
        {},
        el("h1", { class: "title" }, "BraceFrame"),
        el("p", { class: "tagline" }, "o teu sorriso em curso"),
      ),
      el("div", { class: "top-actions" }, badge, settings),
    ),
    el("p", { class: "hero-stat" }, `${days} dias com aparelho`),
    kids
      ? el("p", { class: "next-line" }, nextAppointmentLine(profile.nextAppointmentDate))
      : appointmentRow(profile.nextAppointmentDate),
    cta,
  ];

  if (kids) children.push(nudgeCard(photos.length > 0, streak));

  children.push(
    el("h2", { class: "section-label" }, "Higiene de hoje"),
    el("p", { class: "hint" }, hygieneHint),
    checkList,
    el("h2", { class: "section-label" }, "Conselhos"),
    el(
      "div",
      { class: "cards" },
      linkCard("#/conselhos", "Conselhos", "Vídeos locais de higiene, limpeza e material."),
      linkCard("#/urgencia", "Urgência", "Fio preso, afta ou bracket solto."),
      linkCard("#/comida", "Comida semáforo", "Verde, amarelo e vermelho — o que mastigar."),
    ),
    el("h2", { class: "section-label" }, "Últimas"),
    thumbs,
    el(
      "div",
      { class: "progress-wrap" },
      el("div", { class: "progress-bar" }, el("span", { style: `width:${pct}%` })),
      el("p", { class: "progress-label" }, progressLabel),
    ),
  );

  root.replaceChildren(el("section", { class: "screen" }, ...children));
}

function streakBadge(streak: number): HTMLElement {
  const chip = el("span", { class: "chip streak" });
  chip.innerHTML = `${icon("star")} Streak · ${streak} ${streak === 1 ? "dia" : "dias"}`;
  return chip;
}

function nudgeCard(hasPhotos: boolean, streak: number): HTMLElement {
  const card = el("div", { class: "nudge-card" });
  card.append(
    el("span", { class: "spark a" }),
    el("span", { class: "spark b" }),
    el("span", { class: "spark c" }),
    el("h3", {}, hasPhotos ? "Já tiraste a foto?" : "Tira a foto de hoje"),
    el(
      "p",
      {},
      streak
        ? `Continua o streak · ${streak} ${streak === 1 ? "dia seguido" : "dias seguidos"}`
        : "Continua o streak · começa hoje",
    ),
  );
  return card;
}

function kidsHygieneHint(doneToday: boolean, streak: number): string {
  if (doneToday) {
    return streak
      ? `Hoje está feito · streak de ${streak} ${streak === 1 ? "dia" : "dias"}`
      : "Hoje está feito";
  }
  return streak
    ? `Continua o streak · falta um passo`
    : "Marca os passos de hoje e começa o streak";
}

function hygieneRow(item: HygieneItem, checked: boolean, onToggle: () => void): HTMLElement {
  const box = el("input", { type: "checkbox" }) as HTMLInputElement;
  box.checked = checked;
  box.addEventListener("change", onToggle);
  return el("label", { class: "check-row" }, box, el("span", {}, hygieneLabel(item)));
}

function nextAppointmentLine(iso?: string): string {
  if (!iso || iso < todayISO()) return "Próxima consulta · por marcar";
  return `Próxima consulta · ${formatDayMonth(iso)}`;
}

function appointmentRow(iso?: string): HTMLElement {
  const date = !iso || iso < todayISO() ? "por marcar" : formatDayMonth(iso);
  return el("div", { class: "appt-row" }, el("span", {}, "Próxima consulta"), el("strong", {}, date));
}
