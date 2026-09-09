import { el } from "../lib/dom";
import type { Pose } from "../db/store";
import { isKidsTheme } from "../theme";
import { POSES, type PoseConfig } from "./poses";

/** CSS hooks for per-step overlay art (`public/guides/{id}[-kids|-adultos].svg`). */
export const GUIDE_HOOKS = ["guide-frente", "guide-sorriso", "guide-oclusao"] as const;

export function guideAssetCandidates(pose: Pose, kids = isKidsTheme()): string[] {
  if (kids) {
    return [
      `./guides/${pose}-kids.svg`,
      `./guides/${pose}-kids.png`,
      `./guides/${pose}-adultos.svg`,
      `./guides/${pose}.svg`,
      `./guides/${pose}-adultos.png`,
      `./guides/${pose}.png`,
    ];
  }
  return [
    `./guides/${pose}-adultos.svg`,
    `./guides/${pose}.svg`,
    `./guides/${pose}-adultos.png`,
    `./guides/${pose}.png`,
  ];
}

const FALLBACK: Record<Pose, string> = {
  frente: `<svg class="vf-guide-svg" viewBox="0 0 780 980" fill="none" aria-hidden="true"><ellipse cx="390" cy="490" rx="208" ry="318" stroke="currentColor" stroke-width="2.2"/><line x1="390" y1="172" x2="390" y2="808" stroke="currentColor" stroke-width="1.12" stroke-dasharray="4 5" opacity=".45"/><line x1="248" y1="396" x2="532" y2="396" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 5" opacity=".5"/><path d="M318 632 C358 612, 422 612, 462 632 M318 632 C358 652, 422 652, 462 632" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  sorriso: `<svg class="vf-guide-svg" viewBox="0 0 780 980" fill="none" aria-hidden="true"><path d="M170 470 C250 390, 530 390, 610 470 C560 560, 490 610, 390 620 C290 610, 220 560, 170 470 Z" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M210 485 C280 430, 500 430, 570 485 C530 545, 460 575, 390 580 C320 575, 250 545, 210 485 Z" stroke="currentColor" stroke-width="2"/></svg>`,
  oclusao: `<svg class="vf-guide-svg" viewBox="0 0 780 980" fill="none" aria-hidden="true"><path d="M200 428 C290 348, 490 348, 580 428 M200 552 C290 632, 490 632, 580 552" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><line x1="210" y1="490" x2="570" y2="490" stroke="currentColor" stroke-width="2"/></svg>`,
};

export function createGuideOverlay(): {
  frame: HTMLDivElement;
  apply: (pose: PoseConfig) => void;
} {
  const asset = el("img", { class: "vf-guide-asset hidden", alt: "", draggable: "false" });
  const fallback = el("div", { class: "vf-guide-fallback", "aria-hidden": "true" });
  const chip = el("span", { class: "vf-pose" }, POSES[0].label);
  const frame = el(
    "div",
    {
      class: `vf-frame ${POSES[0].guideHook}`,
      "data-pose": POSES[0].id,
      "aria-hidden": "true",
    },
    fallback,
    asset,
    chip,
  );

  let token = 0;

  const bindAsset = (pose: Pose) => {
    const request = ++token;
    const kids = isKidsTheme();
    frame.dataset.skin = kids ? "kids" : "adultos";
    const urls = guideAssetCandidates(pose, kids);
    let i = 0;
    asset.classList.add("hidden");
    fallback.classList.remove("hidden");
    fallback.innerHTML = FALLBACK[pose];

    const tryNext = () => {
      if (request !== token) return;
      if (i >= urls.length) {
        asset.removeAttribute("src");
        asset.classList.add("hidden");
        fallback.classList.remove("hidden");
        return;
      }
      asset.src = urls[i++];
    };

    asset.onload = () => {
      if (request !== token) return;
      asset.classList.remove("hidden");
      fallback.classList.add("hidden");
    };
    asset.onerror = tryNext;
    tryNext();
  };

  const apply = (pose: PoseConfig) => {
    for (const hook of GUIDE_HOOKS) frame.classList.remove(hook);
    frame.classList.add(pose.guideHook);
    frame.dataset.pose = pose.id;
    chip.textContent = pose.label;
    bindAsset(pose.id);
  };

  apply(POSES[0]);
  return { frame, apply };
}
