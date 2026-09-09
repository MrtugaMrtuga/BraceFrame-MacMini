import { el } from "./lib/dom";
import { loadProfile } from "./db/store";
import { icon, type IconName } from "./lib/icons";
import { renderOnboarding } from "./views/onboarding";
import { renderInicio } from "./views/inicio";
import { renderCaptura } from "./views/captura";
import { renderGaleria } from "./views/galeria";
import { renderConsultas } from "./views/consultas";
import { renderReveal } from "./views/reveal";
import { renderConselhos } from "./views/conselhos";
import { renderUrgencia } from "./views/urgencia";
import { renderComida } from "./views/comida";
import { renderDefinicoes } from "./views/definicoes";
import { listenInstallPrompt, maybeShowInstallBanner } from "./pwa/install";
import { checkReminders } from "./pwa/reminders";
import { initTheme } from "./theme";

export type Tab = "inicio" | "captura" | "galeria" | "consultas" | "reveal";
export type Route = Tab | "conselhos" | "urgencia" | "comida" | "definicoes";

const TABS: Array<{ id: Tab; href: string; label: string; glyph: IconName }> = [
  { id: "inicio", href: "#/", label: "Início", glyph: "home" },
  { id: "captura", href: "#/captura", label: "Captura", glyph: "capture" },
  { id: "galeria", href: "#/galeria", label: "Galeria", glyph: "gallery" },
  { id: "consultas", href: "#/consultas", label: "Consultas", glyph: "calendar" },
  { id: "reveal", href: "#/reveal", label: "Reveal", glyph: "reveal" },
];

function routeFromHash(): Route {
  const h = location.hash.replace(/^#\/?/, "").split("?")[0];
  if (
    h === "captura" ||
    h === "galeria" ||
    h === "consultas" ||
    h === "reveal" ||
    h === "conselhos" ||
    h === "urgencia" ||
    h === "comida" ||
    h === "definicoes"
  ) {
    return h;
  }
  return "inicio";
}

export function mountApp(root: HTMLElement): void {
  initTheme();
  const view = el("div", { id: "view" });
  const nav = el("nav", { class: "tabs", "aria-label": "Secções" });
  for (const t of TABS) {
    const a = el("a", { href: t.href, "data-tab": t.id });
    a.innerHTML = `${icon(t.glyph)}<span>${t.label}</span>`;
    nav.append(a);
  }
  root.replaceChildren(view, nav);

  listenInstallPrompt();

  const paint = async () => {
    const profile = loadProfile();
    if (!profile?.onboarded) {
      nav.classList.add("hidden");
      renderOnboarding(view, () => {
        nav.classList.remove("hidden");
        location.hash = "#/";
        void paint();
      });
      return;
    }
    nav.classList.remove("hidden");
    const route = routeFromHash();
    const tab = route === "conselhos" || route === "urgencia" || route === "comida" || route === "definicoes"
      ? null
      : route;
    for (const a of nav.querySelectorAll("a")) {
      a.classList.toggle("active", a.getAttribute("data-tab") === tab);
    }
    if (route === "captura") await renderCaptura(view);
    else if (route === "galeria") await renderGaleria(view);
    else if (route === "consultas") await renderConsultas(view);
    else if (route === "reveal") await renderReveal(view);
    else if (route === "conselhos") renderConselhos(view);
    else if (route === "urgencia") renderUrgencia(view);
    else if (route === "comida") renderComida(view);
    else if (route === "definicoes") renderDefinicoes(view);
    else await renderInicio(view);
    maybeShowInstallBanner();
    void checkReminders();
  };

  window.addEventListener("hashchange", () => void paint());
  void paint();
}
