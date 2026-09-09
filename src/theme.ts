import { loadProfile, type ThemeId } from "./db/store";

export function skinClass(theme: ThemeId = "adults"): "skin-kids" | "skin-adultos" {
  return theme === "kids" ? "skin-kids" : "skin-adultos";
}

export function themeAttr(theme: ThemeId = "adults"): "kids" | "adultos" {
  return theme === "kids" ? "kids" : "adultos";
}

export function applyTheme(theme: ThemeId = "adults"): void {
  const root = document.documentElement;
  root.classList.remove("skin-kids", "skin-adultos");
  root.classList.add(skinClass(theme));
  root.setAttribute("data-theme", themeAttr(theme));
  const meta = document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute("content", theme === "kids" ? "#fff8f6" : "#f5f5f7");
}

export function initTheme(): ThemeId {
  const theme = loadProfile()?.theme ?? "adults";
  applyTheme(theme);
  return theme;
}

export function isKidsTheme(theme: ThemeId | undefined = loadProfile()?.theme): boolean {
  return theme === "kids";
}
