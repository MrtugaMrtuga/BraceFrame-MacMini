import { el } from "../lib/dom";
import { todayISO } from "../lib/dates";
import { addAppointment, patchProfile } from "../db/store";

export function renderOnboarding(root: HTMLElement, onDone: () => void): void {
  const mark = el("div", { class: "mark", "aria-hidden": "true" });
  mark.innerHTML = `<svg width="40" height="40" viewBox="0 0 1024 1024"><g fill="none" stroke="#ff5a4a" stroke-width="48" stroke-linecap="round"><path d="M268 318h118M268 318v118M756 318H638M756 318v118M268 706h118M268 706V588M756 706H638M756 706V588"/><path d="M352 790c48 78 272 78 320 0" stroke-width="36"/><path d="M392 828c36 48 204 48 240 0" stroke-width="24"/></g></svg>`;

  const place = el("input", {
    type: "date",
    value: todayISO(),
    required: "",
    "aria-label": "Data de colocação",
  });
  const next = el("input", {
    type: "date",
    "aria-label": "Próxima consulta",
  });

  const start = el("button", { class: "cta", type: "button" }, "Começar o diário");
  start.addEventListener("click", async () => {
    const placementDate = place.value || todayISO();
    patchProfile({
      placementDate,
      nextAppointmentDate: next.value || undefined,
      treatmentWeeks: 14,
      onboarded: true,
    });
    if (next.value) {
      await addAppointment({ title: "Consulta", date: next.value, period: "manha" });
    }
    onDone();
  });

  root.replaceChildren(
    el(
      "section",
      { class: "onboarding" },
      mark,
      el("h1", { class: "title" }, "Olá"),
      el("p", { class: "tagline" }, "BraceFrame · o teu sorriso em curso"),
      el(
        "p",
        { class: "sub" },
        "Diz-me o dia em que te colocaram o aparelho. Depois é só ir registando o sorriso.",
      ),
      el("div", { class: "field" }, el("label", {}, "Dia da colocação"), place),
      el("div", { class: "field" }, el("label", {}, "Próxima consulta (se já tiveres)"), next),
      start,
    ),
  );
}
