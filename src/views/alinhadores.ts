import {
  ALIGNER_TARGET_HOURS,
  currentAlignerHours,
  displayHours,
  getDay,
  hoursLeft,
  isDayLocked,
  planFromProfile,
  setAlignerWearing,
  settleAlignerClock,
  taskProgress,
} from "../db/adherence";
import { ensurePatientId, loadProfile } from "../db/store";
import { todayISO } from "../lib/dates";
import { el } from "../lib/dom";
import { backLink } from "../lib/nav";
import { trackInterval } from "../lib/ticks";
import { isKidsTheme } from "../theme";
import { setRingPercent, usageRing } from "../ui/ring";

export async function renderAlinhadores(root: HTMLElement): Promise<void> {
  const profile = loadProfile();
  if (!profile) return;
  if (!planFromProfile(profile).alinhadores) {
    location.hash = "#/";
    return;
  }
  const kids = isKidsTheme(profile.theme);
  const patientId = ensurePatientId();
  await settleAlignerClock(patientId);
  const date = todayISO();
  const day = await getDay(patientId, date);
  const locked = isDayLocked(date);
  const wearing = day.alinhadoresRunningSince != null;
  const hours = currentAlignerHours(day);
  const shown = displayHours(hours);
  const left = hoursLeft(hours);
  const pct = Math.round(taskProgress(day, "alinhadores") * 100);

  const center = el(
    "div",
    { class: "adesao-ring-center adesao-ring-hours" },
    el("strong", {}, `${shown} h`),
    el("span", {}, `de ${ALIGNER_TARGET_HOURS} h`),
  );
  const ring = usageRing(pct, center, 168);

  const onBtn = el(
    "button",
    { class: `cta adesao-split${wearing ? "" : " ghost"}`, type: "button" },
    kids ? "Estão postos" : "Em uso",
  );
  const offBtn = el(
    "button",
    { class: `cta adesao-split${wearing ? " ghost" : ""}`, type: "button" },
    kids ? "Tirei agora" : "Retirados",
  );
  if (!locked) {
    onBtn.addEventListener("click", async () => {
      await setAlignerWearing(true, date, patientId);
      await renderAlinhadores(root);
    });
    offBtn.addEventListener("click", async () => {
      await setAlignerWearing(false, date, patientId);
      await renderAlinhadores(root);
    });
  } else {
    onBtn.disabled = true;
    offBtn.disabled = true;
  }

  const meta = kids
    ? `Meta ${ALIGNER_TARGET_HOURS} horas · faltam ${left} h`
    : left
      ? `Faltam ${left} horas para a meta de hoje`
      : "Meta de hoje feita.";

  root.replaceChildren(
    el(
      "section",
      { class: "screen screen-adesao" },
      backLink("#/", "Hoje"),
      el("h1", { class: "title" }, "Alinhadores"),
      el("p", { class: "tagline" }, kids ? "Horas com o alinhador hoje" : "Horas de uso · meta 22 h"),
      el("div", { class: "adesao-panel card adesao-clock" }, ring, el("p", { class: "hint" }, meta)),
      el("div", { class: "adesao-pair" }, onBtn, offBtn),
      el("p", { class: "hint adesao-lock-hint" }, kids ? "O relógio corre só com «postos»." : "O relógio conta só em uso."),
    ),
  );

  if (wearing && !locked) {
    const hoursEl = center.querySelector("strong");
    trackInterval(
      window.setInterval(() => {
        const live = currentAlignerHours(day);
        if (hoursEl) hoursEl.textContent = `${displayHours(live)} h`;
        setRingPercent(ring, Math.round(Math.min(1, live / ALIGNER_TARGET_HOURS) * 100));
      }, 1000),
    );
  }
}

