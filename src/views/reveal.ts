import { el } from "../lib/dom";
import { daysBetween, weekNumber } from "../lib/dates";
import { listPhotos, loadProfile, type Photo } from "../db/store";
import { exportReveal, shareReveal } from "../reveal/exporter";
import { openProStub } from "../purchase/stub";
import { icon } from "../lib/icons";

export async function renderReveal(root: HTMLElement): Promise<void> {
  const profile = loadProfile();
  const photos = await listPhotos();
  const week = profile ? weekNumber(daysBetween(profile.placementDate)) : 1;
  const before = photos.filter((p) => p.pose === "frente").at(-1) ?? photos.at(-1);
  const after =
    photos.find((p) => p.id !== before?.id) ??
    photos.find((p) => p.pose === "frente") ??
    photos[0];

  const stage = el("div", { class: "reveal-stage frame-marks" });
  if (after) {
    const img = el("img", { alt: "Reveal" });
    img.src = URL.createObjectURL(after.blob);
    stage.append(img);
  }
  const play = el("button", { class: "play-btn", type: "button", "aria-label": "Gerar reveal" });
  play.innerHTML = icon("play");
  const pro = el("button", { class: "chip ink", type: "button" }, "PRO");
  pro.addEventListener("click", openProStub);
  stage.append(
    el(
      "div",
      { class: "reveal-top" },
      el("span", {}, `Reveal · Semana ${week}`),
      pro,
    ),
    play,
  );

  const share = el("button", { class: "share-btn", type: "button" });
  share.append(el("span", { class: "live" }), document.createTextNode("Partilhar no Reels"));
  const status = el("p", { class: "status" }, "");

  let last: { blob: Blob; mime: string } | null = null;

  const generate = async (kind: "free" | "pro") => {
    if (kind === "pro") {
      openProStub();
      return;
    }
    if (!before || !after) {
      status.textContent = "Precisas de pelo menos uma foto para o reveal.";
      return;
    }
    status.textContent = "A montar o 9:16…";
    try {
      const out = await exportReveal({ before, after, week, kind });
      last = { blob: out.blob, mime: out.mime };
      const url = URL.createObjectURL(out.blob);
      stage.querySelector("video")?.remove();
      stage.querySelector("img")?.remove();
      if (out.mime.startsWith("video/")) {
        const v = el("video", { controls: "", playsinline: "" });
        v.src = url;
        v.setAttribute("playsinline", "");
        stage.prepend(v);
        void v.play();
      } else {
        const img = el("img", { alt: "Reveal" });
        img.src = url;
        stage.prepend(img);
      }
      play.classList.add("hidden");
      status.textContent = out.mime.startsWith("video/")
        ? "Pronto · com marca de água BraceFrame."
        : "Vídeo não disponível neste browser · partilha o cartaz 9:16.";
    } catch {
      status.textContent = "Não deu para gerar. Tenta outra vez.";
    }
  };

  play.addEventListener("click", () => generate("free"));
  share.addEventListener("click", async () => {
    if (!last) await generate("free");
    if (!last) return;
    try {
      await shareReveal(last.blob, last.mime);
    } catch {
      status.textContent = "Partilha cancelada.";
    }
  });

  const pickRow = datePills(photos, after, (photo) => {
    stage.querySelector("img")?.remove();
    const img = el("img", { alt: "Reveal" });
    img.src = URL.createObjectURL(photo.blob);
    stage.prepend(img);
  });

  root.replaceChildren(
    el(
      "section",
      { class: "screen" },
      el("h1", { class: "title" }, "Reveal"),
      pickRow,
      stage,
      share,
      el("button", { class: "cta ghost", type: "button" }, "Pro em breve"),
      status,
    ),
  );
  root.querySelector(".cta.ghost")?.addEventListener("click", openProStub);
}

function datePills(photos: Photo[], current: Photo | undefined, onPick: (p: Photo) => void): HTMLElement {
  const row = el("div", { class: "date-row" });
  const seen = new Set<string>();
  for (const p of photos) {
    if (seen.has(p.date)) continue;
    seen.add(p.date);
    const b = el("button", { class: `date-pill${p.id === current?.id ? " active" : ""}`, type: "button" }, p.date.slice(5));
    b.addEventListener("click", () => {
      for (const n of row.children) n.classList.toggle("active", n === b);
      onPick(p);
    });
    row.append(b);
  }
  if (!seen.size) row.append(el("span", { class: "date-pill" }, "dia 0 → agora"));
  return row;
}
