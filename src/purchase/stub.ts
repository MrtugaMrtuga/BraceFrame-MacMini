import { el } from "../lib/dom";

export function openProStub(): void {
  const existing = document.querySelector(".overlay");
  existing?.remove();

  const overlay = el("div", { class: "overlay", role: "dialog", "aria-modal": "true" });
  const sheet = el("div", { class: "sheet" });
  sheet.append(
    el("h2", {}, "Pro em breve"),
    el(
      "p",
      {},
      "A versão limpa do Reveal — moldura coral, sem marca de água — chega já a seguir. Nesta v1 não há pagamentos.",
    ),
    el("button", { class: "cta", type: "button" }, "Percebi"),
  );
  overlay.append(sheet);
  overlay.addEventListener("click", (ev) => {
    if (ev.target === overlay) overlay.remove();
  });
  sheet.querySelector("button")?.addEventListener("click", () => overlay.remove());
  document.body.append(overlay);
}

export const PRO_AVAILABLE = false;
