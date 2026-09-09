import type { Pose } from "../db/store";

export type GuideSkin = "kids" | "adultos";

export const GUIDE_HOOKS = ["guide-frente", "guide-sorriso", "guide-oclusao"] as const;
export type GuideHook = (typeof GUIDE_HOOKS)[number];

/** Vite `public/` is served from BASE_URL (`.` in this app). */
export function guidesBase(base: string = import.meta.env.BASE_URL || "./"): string {
  return base.endsWith("/") ? `${base}guides/` : `${base}/guides/`;
}

/**
 * Painted skin wins: `html.skin-*` then `data-theme` then profile.
 * Default is Adultos — never kids-only.
 */
export function resolveGuideSkin(input: {
  className?: string;
  dataTheme?: string | null;
  profileTheme?: string | null;
} = {}): GuideSkin {
  const cls = input.className ?? "";
  const dataTheme = (input.dataTheme ?? "").trim().toLowerCase();
  const profile = (input.profileTheme ?? "").trim().toLowerCase();

  if (/\bskin-kids\b/.test(cls)) return "kids";
  if (/\bskin-adultos\b/.test(cls)) return "adultos";
  if (dataTheme === "kids") return "kids";
  if (dataTheme === "adultos" || dataTheme === "adults") return "adultos";
  if (profile === "kids") return "kids";
  return "adultos";
}

/**
 * Adultos: `*-adultos.svg` then unsuffixed defaults, then PNG.
 * Kids: `*-kids.svg` / `*-kids.png` only (no silent adultos swap).
 * `guide-${pose}-*` aliases stay ready for Marahas drops.
 */
export function guideAssetCandidates(
  pose: Pose,
  skin: GuideSkin,
  base: string = import.meta.env.BASE_URL || "./",
): string[] {
  const root = guidesBase(base);
  const files =
    skin === "kids"
      ? [`${pose}-kids.svg`, `guide-${pose}-kids.svg`, `${pose}-kids.png`, `guide-${pose}-kids.png`]
      : [
          `${pose}-adultos.svg`,
          `guide-${pose}-adultos.svg`,
          `${pose}.svg`,
          `guide-${pose}.svg`,
          `${pose}-adultos.png`,
          `${pose}.png`,
        ];
  return files.map((file) => `${root}${file}`);
}
