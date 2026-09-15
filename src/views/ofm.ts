import {
  adherenceStreak,
  getDay,
  isDayLocked,
  listDays,
  markOfm,
  planFromProfile,
  settleAlignerClock,
} from "../db/adherence";
import { ensurePatientId, loadProfile } from "../db/store";
import { todayISO } from "../lib/dates";
import { el } from "../lib/dom";
import { backLink } from "../lib/nav";
import { isKidsTheme } from "../theme";

export async function renderOfm(root: HTMLElement): Promise<void> {
  const profile = loadProfile();
  if (!profile) return;
  if (!planFromProfile(profile).ofm) {
    location.hash = "#/";
    return;
  }
  const kids = isKidsTheme(profile.theme);
  const patientId = ensurePatientId();
  await settleAlignerClock(patientId);
  const date = todayISO();
  const day = await getDay(patientId, date);
  const days = await listDays(patientId);
  const plan = planFromProfile(profile);
  const locked = isDayLocked(date);
  const streak = adherenceStreak(days, plan, date);

  const cta = !day.ofmDone && !locked
    ? (() => {
        const btn = el(
          "button",
          { class: "cta", type: "button" },
          kids ? "Cumpri · OFM noite" : "Marcar OFM como cumprido",
        );
        btn.addEventListener("click", async () => {
          await markOfm(date, patientId);
          await renderOfm(root);
        });
        return btn;
      })()
    : null;

  const wash = kids
    ? el(
        "div",
        { class: "soft-box" },
        el("h3", {}, day.ofmDone ? "Continua o streak" : "Streak em risco"),
        el(
          "p",
          {},
          day.ofmDone
            ? "Noite feita. O ouro continua."
            : `Sem o OFM, o ouro de ${streak || 1} ${streak === 1 ? "dia" : "dias"} pára.`,
        ),
      )
    : null;

  const children: Array<Node | string | null> = [
    backLink("#/", "Hoje"),
    el("h1", { class: "title" }, "OFM"),
    el("p", { class: "tagline" }, "Removível / aparelho extra"),
    el(
      "div",
      { class: "adesao-panel card" },
      el("p", { class: "adesao-kicker" }, "Noite de hoje"),
      el("p", { class: "adesao-hero-stat" }, day.ofmDone ? (kids ? "Feito" : "Cumprido") : "Ainda não"),
      el("p", { class: "hint" }, kids ? "Põe antes de dormir · 1 check" : "Um check para a noite."),
    ),
    cta,
    wash,
  ];

  root.replaceChildren(
    el("section", { class: "screen screen-adesao" }, ...children.filter((node): node is Node | string => node != null)),
  );
}
