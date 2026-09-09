import { el } from "../lib/dom";
import { monthRangeLabel, todayISO } from "../lib/dates";
import { listPhotos, type Photo } from "../db/store";

function urlOf(photo?: Photo): string {
  return photo ? URL.createObjectURL(photo.blob) : "";
}

export async function renderGaleria(root: HTMLElement): Promise<void> {
  const photos = await listPhotos();
  const dates = [...new Set(photos.map((p) => p.date))].sort();
  const first = dates[0];
  const last = dates.at(-1);
  let afterDate = last ?? todayISO();
  let split = 50;

  const before = photos.filter((p) => p.pose === "frente").at(-1) ?? photos.at(-1);
  const afterPhoto = (): Photo | undefined => {
    const day = photos.filter((p) => p.date === afterDate);
    const newer = day.filter((p) => p.id !== before?.id);
    for (const pose of ["sorriso", "oclusao", "frente"] as const) {
      const hit = newer.find((p) => p.pose === pose);
      if (hit) return hit;
    }
    return newer[0] ?? day[0];
  };

  const beforeLayer = el("div", { class: "gallery-layer frame-marks" });
  const afterLayer = el("div", { class: "gallery-layer after frame-marks" });
  const line = el("div", { class: "slider-line" }, el("div", { class: "slider-knob" }, "Antes / Agora"));
  const stage = el(
    "div",
    { class: "gallery-stage frame-marks", style: "--split:50%" },
    beforeLayer,
    afterLayer,
    line,
    el("span", { class: "float-tag top" }, "Antes"),
    el("span", { class: "float-tag bottom" }, "Agora"),
  );

  const applyLayers = () => {
    const a = afterPhoto();
    const bu = urlOf(before);
    const au = urlOf(a);
    beforeLayer.style.backgroundImage = bu ? `url("${bu}")` : "";
    afterLayer.style.backgroundImage = au ? `url("${au}")` : "";
    stage.style.setProperty("--split", `${split}%`);
  };

  const setSplitFromEvent = (clientY: number) => {
    const rect = stage.getBoundingClientRect();
    split = Math.min(92, Math.max(8, ((clientY - rect.top) / rect.height) * 100));
    stage.style.setProperty("--split", `${split}%`);
  };

  stage.addEventListener("pointerdown", (ev) => {
    stage.setPointerCapture(ev.pointerId);
    setSplitFromEvent(ev.clientY);
  });
  stage.addEventListener("pointermove", (ev) => {
    if (ev.buttons) setSplitFromEvent(ev.clientY);
  });

  const row = el("div", { class: "date-row" });
  if (dates.length === 0) {
    row.append(el("span", { class: "date-pill active" }, "ainda sem fotos"));
  } else {
    for (const d of dates) {
      const b = el("button", { class: `date-pill${d === afterDate ? " active" : ""}`, type: "button" }, d.slice(5));
      b.addEventListener("click", () => {
        afterDate = d;
        for (const n of row.children) n.classList.toggle("active", n === b);
        applyLayers();
      });
      row.append(b);
    }
  }

  applyLayers();

  root.replaceChildren(
    el(
      "section",
      { class: "screen" },
      el(
        "div",
        { class: "top-row" },
        el("h1", { class: "title" }, "Galeria"),
        el("span", { class: "chip range-chip" }, monthRangeLabel(first, last)),
      ),
      row,
      stage,
    ),
  );
}
