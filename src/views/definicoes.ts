import { el } from "../lib/dom";
import { backLink } from "../lib/nav";
import { loadProfile, patchProfile, type ThemeId } from "../db/store";
import { applyTheme } from "../theme";

export function renderDefinicoes(root: HTMLElement): void {
  if (!loadProfile()) return;

  let theme: ThemeId = loadProfile()?.theme ?? "adults";
  const status = el("p", { class: "status" }, "");

  const paint = () => {
    const profile = loadProfile();
    if (!profile) return;
    const kids = el("button", { class: `seg-btn${theme === "kids" ? " on" : ""}`, type: "button" }, "Kids");
    const adults = el(
      "button",
      { class: `seg-btn${theme === "adults" ? " on" : ""}`, type: "button" },
      "Adultos",
    );
    kids.addEventListener("click", () => setTheme("kids"));
    adults.addEventListener("click", () => setTheme("adults"));

    const fio = toggleRow(
      "Fio no checklist",
      profile.hygieneFio !== false,
      (on) => patchProfile({ hygieneFio: on }),
    );
    const elasticos = toggleRow(
      "Elásticos no checklist",
      Boolean(profile.hygieneElasticos),
      (on) => patchProfile({ hygieneElasticos: on }),
    );

    const notify = el("button", { class: "cta ghost", type: "button" }, "Pedir lembrete no telemóvel");
    notify.addEventListener("click", async () => {
      if (!("Notification" in window)) {
        status.textContent = "Este browser não tem notificações.";
        return;
      }
      try {
        const perm = await Notification.requestPermission();
        status.textContent =
          perm === "granted"
            ? "Se faltar a higiene de hoje, tentamos um aviso."
            : "Sem permissão — o aviso fica só dentro da app.";
      } catch {
        status.textContent = "Não deu para pedir permissão.";
      }
    });

    root.replaceChildren(
      el(
        "section",
        { class: "screen" },
        backLink(),
        el("h1", { class: "title" }, "Definições"),
        el("p", { class: "tagline" }, "Tudo fica neste telemóvel. Sem conta."),
        el("h2", { class: "section-label" }, "Ecrã"),
        el("div", { class: "seg" }, kids, adults),
        el(
          "p",
          { class: "hint" },
          "Duas peles. Kids tem streak dourado; Adultos é calmo, com CTA preto.",
        ),
        el("h2", { class: "section-label" }, "Higiene"),
        fio,
        elasticos,
        el("h2", { class: "section-label" }, "Avisos"),
        notify,
        status,
      ),
    );
  };

  const setTheme = (next: ThemeId) => {
    theme = next;
    patchProfile({ theme: next });
    applyTheme(next);
    paint();
  };

  paint();
}

function toggleRow(label: string, on: boolean, onChange: (value: boolean) => void): HTMLElement {
  const box = el("input", { type: "checkbox" }) as HTMLInputElement;
  box.checked = on;
  box.addEventListener("change", () => onChange(box.checked));
  return el("label", { class: "check-row" }, box, el("span", {}, label));
}
