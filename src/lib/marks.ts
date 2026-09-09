/** Vite `public/` is served from BASE_URL (`.` in this app). */
export function iconsBase(base: string = import.meta.env.BASE_URL || "./"): string {
  return base.endsWith("/") ? `${base}icons/` : `${base}/icons/`;
}

/** Locked Home header mark. Kids 52×52, Adultos 44×44 — same coral frame + smile. */
export function homeMarkSrc(
  kids: boolean,
  base: string = import.meta.env.BASE_URL || "./",
): string {
  return `${iconsBase(base)}${kids ? "mark-52.png" : "mark-44.png"}`;
}

export function homeMarkSize(kids: boolean): 52 | 44 {
  return kids ? 52 : 44;
}
