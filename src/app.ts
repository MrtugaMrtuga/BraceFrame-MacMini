import { el } from "./lib/dom";
import { loadProfile } from "./db/store";
import { icon, type IconName } from "./lib/icons";
import { renderOnboarding } from "./views/onboarding";
import { renderInicio } from "./views/inicio";
import { renderCaptura } from "./views/captura";
import { renderGaleria } from "./views/galeria";
import { renderConsultas } from "./views/consultas";
import { renderReveal } from "./views/reveal";
import { listenInstallPrompt, maybeShowInstallBanner } from "./pwa/install";
import { checkReminders } from "./pwa/reminders";

export type Tab = "inicio" | "captura" | "galeria" | "consultas" | "reveal";

const TABS: Array<{ id: Tab; href: string; label: string; glyph: IconName }> = [
  { id: "inicio", href: "#/", label: "Início", glyph: "home" },
  { id: "captura", href: "#/captura", label: "Captura", glyph: "capture" },
  { id: "galeria", href: "#/galeria", label: "Galeria", glyph: "gallery" },
  { id: "consultas", href: "#/consultas", label: "Consultas", glyph: "calendar" },
  { id: "reveal", href: "#/reveal", label: "Reveal", glyph: "reveal" },
];

function tabFromHash(): Tab {
  const h = location.hash.replace(/^#\/?/, "");
  if (h === "captura" || h === "galeria" || h === "consultas" || h === "reveal") return h;
  return "inicio";
}

export function mountApp(root: HTMLElement): void {
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
    const tab = tabFromHash();
    for (const a of nav.querySelectorAll("a")) {
      a.classList.toggle("active", a.getAttribute("data-tab") === tab);
    }
    if (tab === "captura") await renderCaptura(view);
    else if (tab === "galeria") await renderGaleria(view);
    else if (tab === "consultas") await renderConsultas(view);
    else if (tab === "reveal") await renderReveal(view);
    else await renderInicio(view);
    maybeShowInstallBanner();
    void checkReminders();
  };

  window.addEventListener("hashchange", () => void paint());
  void paint();
}
