import { el } from "./lib/dom";
import { loadProfile } from "./db/store";
import { icon, type IconName } from "./lib/icons";
import { clearTicks } from "./lib/ticks";
import { renderOnboarding } from "./views/onboarding";
import { renderHoje } from "./views/hoje";
import { renderInicio } from "./views/inicio";
import { renderCaptura } from "./views/captura";
import { renderGaleria } from "./views/galeria";
import { renderConsultas } from "./views/consultas";
import { renderReveal } from "./views/reveal";
import { renderConselhos } from "./views/conselhos";
import { renderUrgencia } from "./views/urgencia";
import { renderComida } from "./views/comida";
import { renderDefinicoes } from "./views/definicoes";
import { renderElasticos } from "./views/elasticos";
import { renderAlinhadores } from "./views/alinhadores";
import { renderOfm } from "./views/ofm";
import { listenInstallPrompt, maybeShowInstallBanner } from "./pwa/install";
import { checkReminders } from "./pwa/reminders";
import { initTheme } from "./theme";

export type Tab = "hoje" | "captura" | "galeria" | "consultas" | "reveal";
export type Route =
  | Tab
  | "conselhos"
  | "urgencia"
  | "comida"
  | "definicoes"
  | "diario"
  | "elasticos"
  | "alinhadores"
  | "ofm";

const TABS: Array<{ id: Tab; href: string; label: string; glyph: IconName }> = [
  { id: "hoje", href: "#/", label: "Hoje", glyph: "hoje" },
  { id: "captura", href: "#/captura", label: "Captura", glyph: "capture" },
  { id: "galeria", href: "#/galeria", label: "Galeria", glyph: "gallery" },
  { id: "consultas", href: "#/consultas", label: "Consultas", glyph: "calendar" },
  { id: "reveal", href: "#/reveal", label: "Reveal", glyph: "reveal" },
];

const EXTRA: Route[] = [
  "conselhos",
  "urgencia",
  "comida",
  "definicoes",
  "diario",
  "elasticos",
  "alinhadores",
  "ofm",
];

function routeFromHash(): Route {
  const h = location.hash.replace(/^#\/?/, "").split("?")[0];
  if (h === "inicio") return "hoje";
  if (
    h === "captura" ||
    h === "galeria" ||
    h === "consultas" ||
    h === "reveal" ||
    EXTRA.includes(h as Route)
  ) {
    return h as Route;
  }
  return "hoje";
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
    clearTicks();
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
    const tab = TABS.some((t) => t.id === route) ? route : null;
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
    else if (route === "diario") await renderInicio(view);
    else if (route === "elasticos") await renderElasticos(view);
    else if (route === "alinhadores") await renderAlinhadores(view);
    else if (route === "ofm") await renderOfm(view);
    else await renderHoje(view);
    maybeShowInstallBanner();
    void checkReminders();
  };

  window.addEventListener("hashchange", () => void paint());
  void paint();
}
