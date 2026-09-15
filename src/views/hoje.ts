import {
  activeTasks,
  adherenceStreak,
  currentAlignerHours,
  displayHours,
  firstCheckableMissing,
  firstIncompleteTask,
  getDay,
  hoursLeft,
  listDays,
  markFirstMissing,
  markOfm,
  nextOpenSlot,
  planFromProfile,
  settleAlignerClock,
  slotsDone,
  taskComplete,
  taskProgress,
  taskStarted,
  usagePercent,
  type AdherenceDay,
  type AdherenceTask,
} from "../db/adherence";
import { ensurePatientId, loadProfile } from "../db/store";
import { formatDayMonth, todayISO } from "../lib/dates";
import { el } from "../lib/dom";
import { icon } from "../lib/icons";
import { trackInterval } from "../lib/ticks";
import { isKidsTheme } from "../theme";
import { usageRing } from "../ui/ring";
import { kidsHeadline, missingLine, SLOT_LABEL } from "./adesao-copy";

export async function renderHoje(root: HTMLElement): Promise<void> {
  const profile = loadProfile();
  if (!profile) return;
  const kids = isKidsTheme(profile.theme);
  const patientId = ensurePatientId();
  await settleAlignerClock(patientId);
  const date = todayISO();
  const day = await getDay(patientId, date);
  const days = await listDays(patientId);
  const plan = planFromProfile(profile);
  const tasks = activeTasks(plan);
  const now = Date.now();
  const pct = usagePercent(day, plan, now);
  const streak = adherenceStreak(days, plan, date);
  const incomplete = firstIncompleteTask(day, plan, now);
  const checkable = firstCheckableMissing(day, plan);
  const slot = nextOpenSlot(day);
  const hours = currentAlignerHours(day, now);
  const doneCount = tasks.filter((task) => taskComplete(day, task, now)).length;

  const settings = el("a", { class: "icon-btn settings-btn", href: "#/definicoes", "aria-label": "Definições" });
  settings.innerHTML = icon("settings");

  const header = kids
    ? kidsHeader(streak, settings)
    : adultsHeader(settings);

  const hero = kids
    ? kidsHero(pct, doneCount, tasks.length, incomplete, slot, hours)
    : adultsHero(pct, incomplete, slot, hours);

  const list = el("div", { class: "adesao-tasks" });
  for (const task of tasks) {
    list.append(taskRow(kids, day, task, now));
  }
  if (!tasks.length) {
    list.append(
      el(
        "div",
        { class: "soft-box" },
        kids
          ? "O teu plano ainda não tem tarefas. Liga-as em Definições."
          : "Sem tarefas no plano. Activa-as em Definições.",
      ),
    );
  }

  const cta = hubCta(kids, checkable, slot, async () => {
    if (checkable === "ofm") await markOfm(date, patientId);
    else await markFirstMissing(plan, date, patientId);
    await renderHoje(root);
  });

  const children: Array<Node | string> = [header, hero, list];
  if (cta) children.push(cta);

  root.replaceChildren(el("section", { class: "screen screen-adesao" }, ...children));

  if (day.alinhadoresRunningSince != null) {
    trackInterval(
      window.setInterval(() => {
        void renderHoje(root);
      }, 30_000),
    );
  }
}

function kidsHeader(streak: number, settings: HTMLElement): HTMLElement {
  const chip = el("span", { class: "chip streak" });
  chip.innerHTML = `${icon("star")} ${streak} ${streak === 1 ? "dia" : "dias"}`;
  return el(
    "header",
    { class: "adesao-header" },
    el(
      "div",
      { class: "adesao-heading" },
      el("h1", { class: "title" }, "Hoje"),
      el("p", { class: "tagline" }, "o teu sorriso em curso"),
    ),
    el("div", { class: "adesao-header-tools" }, chip, settings),
  );
}

function adultsHeader(settings: HTMLElement): HTMLElement {
  return el(
    "header",
    { class: "adesao-header" },
    el(
      "div",
      { class: "adesao-heading" },
      el("h1", { class: "title" }, "Adesão"),
      el("p", { class: "tagline" }, `Hoje · ${formatDayMonth(todayISO())}`),
    ),
    settings,
  );
}

function kidsHero(
  pct: number,
  done: number,
  active: number,
  incomplete: ReturnType<typeof firstIncompleteTask>,
  slot: ReturnType<typeof nextOpenSlot>,
  hours: number,
): HTMLElement {
  const center = el("div", { class: "adesao-ring-center" }, el("strong", {}, `${pct}%`));
  return el(
    "div",
    { class: "adesao-hero card" },
    usageRing(pct, center, 88),
    el(
      "div",
      { class: "adesao-hero-copy" },
      el("p", { class: "adesao-kicker" }, "Uso de hoje"),
      el("h2", { class: "adesao-hero-title" }, kidsHeadline(done, active)),
      el("p", { class: "hint" }, missingLine(true, incomplete, slot, hoursLeft(hours))),
    ),
  );
}

function adultsHero(
  pct: number,
  incomplete: ReturnType<typeof firstIncompleteTask>,
  slot: ReturnType<typeof nextOpenSlot>,
  hours: number,
): HTMLElement {
  const center = el("div", { class: "adesao-ring-center" }, el("strong", {}, `${pct}%`));
  return el(
    "div",
    { class: "adesao-hero card" },
    usageRing(pct, center, 88),
    el(
      "div",
      { class: "adesao-hero-copy" },
      el("p", { class: "adesao-kicker" }, "Uso de hoje"),
      el("h2", { class: "adesao-hero-title" }, missingLine(false, incomplete, slot, hoursLeft(hours))),
    ),
  );
}

function taskRow(kids: boolean, day: AdherenceDay, task: AdherenceTask, now: number): HTMLElement {
  const href =
    task === "elasticos" ? "#/elasticos" : task === "alinhadores" ? "#/alinhadores" : "#/ofm";
  const started = taskStarted(day, task, now);
  const done = taskComplete(day, task, now);
  const progress = taskProgress(day, task, now);
  const a = el("a", {
    class: `adesao-task${done ? " is-done" : started ? " is-on" : ""}`,
    href,
  });

  if (kids) {
    const mark = el("span", { class: `adesao-check${started ? " on" : ""}` });
    if (started) mark.innerHTML = icon("check");
    a.append(
      mark,
      el("div", { class: "adesao-task-copy" }, el("h3", {}, taskTitle(task)), el("p", {}, taskMeta(kids, day, task, now))),
      miniBar(progress),
    );
    return a;
  }

  a.append(
    el("span", { class: `adesao-rail${started ? " on" : ""}` }),
    el("div", { class: "adesao-task-copy" }, el("h3", {}, taskTitle(task)), el("p", {}, taskMeta(kids, day, task, now))),
    el("span", { class: "adesao-task-action" }, started ? "feito" : "marcar"),
  );
  return a;
}

function taskTitle(task: AdherenceTask): string {
  if (task === "elasticos") return "Elásticos";
  if (task === "alinhadores") return "Alinhadores";
  return "OFM / removível";
}

function taskMeta(kids: boolean, day: AdherenceDay, task: AdherenceTask, now: number): string {
  if (task === "elasticos") {
    const n = slotsDone(day);
    return kids ? `${n} de 4 já` : `${n} / 4 trocas`;
  }
  if (task === "alinhadores") {
    const h = displayHours(currentAlignerHours(day, now));
    return kids ? `${h} h · meta 22 h` : `${h} h de 22 h`;
  }
  if (day.ofmDone) return kids ? "noite feita" : "Noite cumprida";
  return kids ? "ainda não" : "Por cumprir";
}

function miniBar(progress: number): HTMLElement {
  const bar = el("span", { class: "adesao-mini" });
  bar.append(el("span", { style: `width:${Math.round(Math.min(1, progress) * 100)}%` }));
  return bar;
}

function hubCta(
  kids: boolean,
  checkable: "elasticos" | "ofm" | undefined,
  slot: ReturnType<typeof nextOpenSlot>,
  onClick: () => void,
): HTMLElement | null {
  if (!checkable) return null;
  const label = kids
    ? "Cumpri o que faltava"
    : checkable === "ofm"
      ? "Marcar OFM como cumprido"
      : `Marcar ${slot ? SLOT_LABEL[slot] : "troca"} como cumprida`;
  const btn = el("button", { class: "cta", type: "button" }, label);
  btn.addEventListener("click", onClick);
  return btn;
}

