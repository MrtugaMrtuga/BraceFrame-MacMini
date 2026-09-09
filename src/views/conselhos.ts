import { el } from "../lib/dom";
import { backLink, linkCard } from "../lib/nav";

interface AdviceVideo {
  id: string;
  title: string;
  blurb: string;
  poster: string;
  src?: string;
}

const VIDEOS: AdviceVideo[] = [
  {
    id: "higiene",
    title: "Higiene",
    blurb: "Escovar com aparelho, sem pressa e sem drama.",
    poster: "./conselhos/higiene.svg",
    src: "./conselhos/higiene.mp4",
  },
  {
    id: "limpeza",
    title: "Limpeza",
    blurb: "Fio, escovilhão e os cantos que o espelho esconde.",
    poster: "./conselhos/limpeza.svg",
  },
  {
    id: "material",
    title: "Material",
    blurb: "Cera, elásticos e o kit que vale a pena ter à mão.",
    poster: "./conselhos/material.svg",
  },
];

export function renderConselhos(root: HTMLElement): void {
  const list = el("div", { class: "video-list" });
  for (const item of VIDEOS) list.append(videoCard(item));

  root.replaceChildren(
    el(
      "section",
      { class: "screen" },
      backLink(),
      el("h1", { class: "title" }, "Conselhos"),
      el("p", { class: "tagline" }, "Dicas locais · ficam neste telemóvel"),
      list,
      el("h2", { class: "section-label" }, "Se precisares agora"),
      el(
        "div",
        { class: "cards" },
        linkCard("#/urgencia", "Urgência", "Fio preso, afta ou bracket solto — o que fazer com calma."),
        linkCard("#/comida", "Comida semáforo", "Verde, amarelo e vermelho para o dia a dia."),
      ),
    ),
  );
}

function videoCard(item: AdviceVideo): HTMLElement {
  const card = el("article", { class: "video-card" });
  const stage = el("div", { class: "video-stage" });
  const poster = el("img", { class: "video-poster", src: item.poster, alt: "" });
  const badge = el("span", { class: "video-badge" }, "vídeo em breve");
  stage.append(poster, badge);

  if (item.src) {
    const video = el("video", {
      class: "hidden",
      controls: "",
      playsinline: "",
      preload: "metadata",
    });
    video.setAttribute("playsinline", "");
    video.src = item.src;
    video.poster = item.poster;
    video.addEventListener("loadeddata", () => {
      badge.remove();
      poster.classList.add("hidden");
      video.classList.remove("hidden");
    });
    video.addEventListener("error", () => {
      video.remove();
    });
    stage.append(video);
  }

  card.append(
    stage,
    el("h3", {}, item.title),
    el("p", {}, item.blurb),
  );
  return card;
}
