import { el } from "./dom";

export function backLink(href = "#/", label = "Voltar"): HTMLAnchorElement {
  return el("a", { class: "back-link", href }, label);
}

export function linkCard(href: string, title: string, body: string): HTMLAnchorElement {
  const a = el("a", { class: "card card-link", href });
  a.append(el("span", { class: "dot accent" }), el("div", {}, el("h3", {}, title), el("p", {}, body)));
  return a;
}
