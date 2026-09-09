import { el } from "../lib/dom";
import { backLink } from "../lib/nav";

const CARDS = [
  {
    title: "Fio preso",
    body: "Não puxes com força. Corta só a ponta que está a picar, com uma tesoura pequena e limpa, ou empurra o fio para um sítio que não magoe. Se continuar a incomodar, cobre com cera e avisa na próxima consulta.",
  },
  {
    title: "Afta",
    body: "É chato e passa. Evita cítricos, picante e snacks muito salgados nesse dia. Um gel calmante da farmácia ajuda. Se a afta for enorme ou durar mais de uma semana, pergunta ao teu ortodontista.",
  },
  {
    title: "Bracket solto",
    body: "Não o deites fora. Se estiver a picar, cobre com cera e mastiga do outro lado. Guarda a peça e liga para o consultório — eles dizem se precisas de ir mais cedo.",
  },
] as const;

export function renderUrgencia(root: HTMLElement): void {
  const cards = el("div", { class: "cards" });
  for (const item of CARDS) {
    cards.append(
      el(
        "article",
        { class: "card stack-card" },
        el("span", { class: "dot accent" }),
        el("div", {}, el("h3", {}, item.title), el("p", {}, item.body)),
      ),
    );
  }

  root.replaceChildren(
    el(
      "section",
      { class: "screen" },
      backLink("#/conselhos"),
      el("h1", { class: "title" }, "Urgência"),
      el("p", { class: "tagline" }, "Calma. A maior parte das coisas espera até à consulta."),
      cards,
      el(
        "div",
        { class: "soft-box" },
        "Isto não é um diagnóstico. Se doer muito, sangrar sem parar ou tiveres dúvida, fala com o teu ortodontista.",
      ),
    ),
  );
}
