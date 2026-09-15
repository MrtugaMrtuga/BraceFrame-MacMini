import { el } from "../lib/dom";

export function usageRing(
  percent: number,
  center: HTMLElement,
  size = 88,
): HTMLElement {
  const p = Math.max(0, Math.min(100, percent));
  const r = 36;
  const c = 2 * Math.PI * r;
  const wrap = el("div", {
    class: "adesao-ring",
    style: `--ring:${size}px`,
  });
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 88 88");
  svg.setAttribute("aria-hidden", "true");
  const track = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  track.setAttribute("class", "adesao-ring-track");
  track.setAttribute("cx", "44");
  track.setAttribute("cy", "44");
  track.setAttribute("r", String(r));
  const fill = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  fill.setAttribute("class", "adesao-ring-fill");
  fill.setAttribute("cx", "44");
  fill.setAttribute("cy", "44");
  fill.setAttribute("r", String(r));
  fill.setAttribute("stroke-dasharray", String(c));
  fill.setAttribute("stroke-dashoffset", String(c * (1 - p / 100)));
  svg.append(track, fill);
  wrap.append(svg, center);
  return wrap;
}

export function setRingPercent(ring: HTMLElement, percent: number): void {
  const fill = ring.querySelector(".adesao-ring-fill");
  if (!fill) return;
  const r = 36;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(100, percent));
  fill.setAttribute("stroke-dashoffset", String(c * (1 - p / 100)));
}
