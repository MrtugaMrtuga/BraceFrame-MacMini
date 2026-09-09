import { el } from "../lib/dom";
import { backLink } from "../lib/nav";

const LANES = [
  {
    tone: "verde",
    title: "Verde · vai à vontade",
    items: [
      "Iogurte, queijo fresco, ovos",
      "Banana madura, melão, morangos",
      "Massa, arroz, puré, sopa",
      "Peixe e carne tenra aos pedaços",
      "Smoothies e sumos sem palhinha dura",
    ],
  },
  {
    tone: "amarelo",
    title: "Amarelo · com jeito",
    items: [
      "Maçã e cenoura aos cubos ou raladas",
      "Pão sem crosta muito dura",
      "Chocolate sem frutos secos",
      "Pizza cortada pequena",
      "Milho doce",
    ],
  },
  {
    tone: "vermelho",
    title: "Vermelho · evita",
    items: [
      "Caramelos, rebuçados, pastilha",
      "Pipocas e gelo para triturar",
      "Nozes, amendoins e frutos secos duros",
      "Tostas e pão muito crocante",
      "Carne fibrosa às dentadas grandes",
    ],
  },
] as const;

export function renderComida(root: HTMLElement): void {
  const list = el("div", { class: "food-list" });
  for (const lane of LANES) {
    const ul = el("ul", { class: "food-items" });
    for (const item of lane.items) ul.append(el("li", {}, item));
    list.append(
      el("article", { class: `food-card ${lane.tone}` }, el("h3", {}, lane.title), ul),
    );
  }

  root.replaceChildren(
    el(
      "section",
      { class: "screen" },
      backLink("#/conselhos"),
      el("h1", { class: "title" }, "Comida semáforo"),
      el("p", { class: "tagline" }, "Para o aparelho durar e o sorriso não protestar."),
      list,
      el(
        "div",
        { class: "soft-box" },
        "Se o teu ortodontista pediu outra lista, segue a dele. Esta é só um lembrete local.",
      ),
    ),
  );
}
