import {
  ELASTIC_SLOTS,
  getDay,
  isDayLocked,
  markElasticSlot,
  nextOpenSlot,
  planFromProfile,
  settleAlignerClock,
  slotsDone,
  type ElasticSlot,
} from "../db/adherence";
import { ensurePatientId, loadProfile } from "../db/store";
import { todayISO } from "../lib/dates";
import { el } from "../lib/dom";
import { backLink } from "../lib/nav";
import { isKidsTheme } from "../theme";
import { SLOT_LABEL, SLOT_LABEL_TITLE } from "./adesao-copy";

export async function renderElasticos(root: HTMLElement): Promise<void> {
  const profile = loadProfile();
  if (!profile) return;
  if (!planFromProfile(profile).elasticos) {
    location.hash = "#/";
    return;
  }
  const kids = isKidsTheme(profile.theme);
  const patientId = ensurePatientId();
  await settleAlignerClock(patientId);
  const date = todayISO();
  const day = await getDay(patientId, date);
  const locked = isDayLocked(date);
  const done = slotsDone(day);
  const next = nextOpenSlot(day);

  const dots = el("div", { class: kids ? "adesao-dots" : "adesao-chips" });
  for (const slot of ELASTIC_SLOTS) {
    const on = Boolean(day.elasticos[slot]);
    const btn = el(
      "button",
      {
        class: kids ? `adesao-dot${on ? " on" : ""}` : `adesao-chip${on ? " on" : ""}`,
        type: "button",
        disabled: on || locked ? "" : undefined,
        "aria-label": SLOT_LABEL_TITLE[slot],
      },
      kids ? "" : SLOT_LABEL_TITLE[slot],
    );
    if (kids) {
      const wrap = el("div", { class: "adesao-dot-wrap" }, btn, el("span", {}, SLOT_LABEL[slot]));
      if (!on && !locked) {
        btn.addEventListener("click", async () => {
          await markElasticSlot(slot, date, patientId);
          await renderElasticos(root);
        });
      }
      dots.append(wrap);
    } else {
      if (!on && !locked) {
        btn.addEventListener("click", async () => {
          await markElasticSlot(slot, date, patientId);
          await renderElasticos(root);
        });
      }
      dots.append(btn);
    }
  }

  const cta = next && !locked
    ? cumpriButton(kids, next, async () => {
        await markElasticSlot(next, date, patientId);
        await renderElasticos(root);
      })
    : null;

  const wash = kids
    ? el(
        "div",
        { class: "soft-box" },
        el("h3", {}, next ? "Continua o streak" : "Hoje está feito"),
        el("p", {}, next ? `Falta o da ${SLOT_LABEL[next]} — 1 toque` : "As 4 trocas de hoje estão feitas."),
      )
    : null;

  const children: Array<Node | string | null> = [
    backLink("#/", "Hoje"),
    el("h1", { class: "title" }, "Elásticos"),
    el("p", { class: "tagline" }, kids ? "Troca de manhã · tarde · noite" : "Plano: 4 trocas / dia"),
    el(
      "div",
      { class: "adesao-panel card" },
      el("p", { class: "adesao-kicker" }, kids ? "hoje" : "cumprido"),
      el("p", { class: "adesao-hero-stat" }, `${done} / 4`),
      dots,
    ),
    wash,
    cta,
    el(
      "p",
      { class: "hint adesao-lock-hint" },
      kids ? "Não podes desfazer depois das 23:59." : "Registo até 23:59. Sem undo no dia seguinte.",
    ),
  ];

  root.replaceChildren(
    el("section", { class: "screen screen-adesao" }, ...children.filter((node): node is Node | string => node != null)),
  );
}

function cumpriButton(kids: boolean, slot: ElasticSlot, onClick: () => void): HTMLElement {
  const label = kids ? `Cumpri · ${SLOT_LABEL[slot]}` : `Marcar ${SLOT_LABEL[slot]} como cumprida`;
  const btn = el("button", { class: "cta", type: "button" }, label);
  btn.addEventListener("click", onClick);
  return btn;
}
