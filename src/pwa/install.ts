import { el } from "../lib/dom";
import { loadProfile, patchProfile } from "../db/store";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

let deferred: BIPEvent | null = null;

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

export function listenInstallPrompt(): void {
  window.addEventListener("beforeinstallprompt", (ev) => {
    ev.preventDefault();
    deferred = ev as BIPEvent;
    maybeShowInstallBanner();
  });
}

export function maybeShowInstallBanner(): void {
  if (isStandalone()) return;
  const profile = loadProfile();
  if (!profile?.onboarded || profile.a2hsDismissed) return;
  if (document.querySelector("[data-banner=install]")) return;

  const ios = isIos();
  if (!ios && !deferred) return;

  const banner = el("div", { class: "banner", "data-banner": "install" });
  const text = el("div");
  text.append(
    el("strong", {}, "Adiciona ao ecrã inicial"),
    el(
      "span",
      {},
      ios
        ? "No Safari: Partilhar → Adicionar ao ecrã de início."
        : "Instala o BraceFrame para abrir como uma app.",
    ),
  );
  const actions = el("div");
  if (!ios && deferred) {
    const install = el("button", { class: "chip", type: "button" }, "Instalar");
    install.addEventListener("click", async () => {
      await deferred?.prompt();
      deferred = null;
      banner.remove();
    });
    actions.append(install);
  }
  const close = el("button", { class: "x", type: "button", "aria-label": "Fechar" }, "✕");
  close.addEventListener("click", () => {
    patchProfile({ a2hsDismissed: true });
    banner.remove();
  });
  banner.append(text, actions, close);
  document.body.append(banner);
}
