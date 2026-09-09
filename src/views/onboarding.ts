import { el } from "../lib/dom";
import { todayISO } from "../lib/dates";
import { addAppointment, patchProfile } from "../db/store";

export function renderOnboarding(root: HTMLElement, onDone: () => void): void {
  const mark = el("div", { class: "mark" });
  mark.append(el("img", { src: "/icons/icon-192.png", alt: "BraceFrame", width: "56", height: "56" }));

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
