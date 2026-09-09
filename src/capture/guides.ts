import { el } from "../lib/dom";
import { loadProfile, type Pose } from "../db/store";
import { POSES, type PoseConfig } from "./poses";
import { GUIDE_HOOKS, guideAssetCandidates, resolveGuideSkin, type GuideSkin } from "./guide-assets";

export { GUIDE_HOOKS, guideAssetCandidates, resolveGuideSkin } from "./guide-assets";

function paintedSkin(): GuideSkin {
  const root = document.documentElement;
  return resolveGuideSkin({
    className: root.className,
    dataTheme: root.getAttribute("data-theme"),
    profileTheme: loadProfile()?.theme,
  });
}

const FALLBACK: Record<Pose, string> = {
  frente: `<svg class="vf-guide-svg" viewBox="0 0 780 980" fill="none" aria-hidden="true"><ellipse cx="390" cy="500" rx="215" ry="325" stroke="currentColor" stroke-width="2.4"/><line x1="390" y1="175" x2="390" y2="825" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 6" opacity=".5"/><line x1="230" y1="400" x2="550" y2="400" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 6" opacity=".55"/><circle cx="390" cy="400" r="4.2" fill="currentColor" opacity=".85"/><path d="M318 628 C358 608, 422 608, 462 628 C422 648, 358 648, 318 628 Z" stroke="currentColor" stroke-width="2.2"/><path d="M292 768 Q390 808 488 768" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`,
  sorriso: `<svg class="vf-guide-svg" viewBox="0 0 780 980" fill="none" aria-hidden="true"><path d="M155 395 C230 325, 310 300, 390 308 C470 300, 550 325, 625 395" stroke="currentColor" stroke-width="3.24" stroke-linecap="round"/><path d="M160 615 C245 710, 325 745, 390 748 C455 745, 535 710, 620 615" stroke="currentColor" stroke-width="3.24" stroke-linecap="round"/><path d="M155 395 C138 455, 138 545, 160 615" stroke="currentColor" stroke-width="2.7" stroke-linecap="round"/><path d="M625 395 C642 455, 642 545, 620 615" stroke="currentColor" stroke-width="2.7" stroke-linecap="round"/><line x1="390" y1="290" x2="390" y2="770" stroke="currentColor" stroke-width="1.89" stroke-dasharray="5 6" opacity=".55"/><line x1="200" y1="510" x2="580" y2="510" stroke="currentColor" stroke-width="1.89" opacity=".4"/></svg>`,
  oclusao: `<svg class="vf-guide-svg" viewBox="0 0 780 980" fill="none" aria-hidden="true"><path d="M200 400 C290 340, 490 340, 580 400" stroke="currentColor" stroke-width="2.7" stroke-linecap="round"/><path d="M200 580 C290 640, 490 640, 580 580" stroke="currentColor" stroke-width="2.7" stroke-linecap="round"/><line x1="200" y1="490" x2="580" y2="490" stroke="currentColor" stroke-width="2.2"/><line x1="390" y1="320" x2="390" y2="660" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 6" opacity=".5"/></svg>`,
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
    const skin = paintedSkin();
    frame.dataset.skin = skin;
    const urls = guideAssetCandidates(pose, skin);
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
