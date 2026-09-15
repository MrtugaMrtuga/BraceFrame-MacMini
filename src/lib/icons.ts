export type IconName =
  | "home"
  | "hoje"
  | "check"
  | "capture"
  | "gallery"
  | "calendar"
  | "reveal"
  | "retake"
  | "flash"
  | "play"
  | "settings"
  | "book"
  | "alert"
  | "food"
  | "star";

export const icons: Record<IconName, string> = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z"/></svg>`,
  hoje: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="7.2"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 12.2 10.2 16 17.5 8"/></svg>`,
  capture: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3.2"/><circle cx="12" cy="12" r="7.2"/><path d="M12 2.8v1.8M12 19.4v1.8M2.8 12h1.8M19.4 12h1.8"/></svg>`,
  gallery: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="14" rx="2.5"/><path d="m7 15 3.2-3.4 2.4 2.5 2.2-2.3L17 15"/><circle cx="8.2" cy="9" r=".8" fill="currentColor" stroke="none"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3.5" y="5" width="17" height="15" rx="2.4"/><path d="M8 3.5v3M16 3.5v3M3.5 10h17"/></svg>`,
  reveal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="2.5" width="10" height="19" rx="2.4"/><circle cx="12" cy="18.2" r=".8" fill="currentColor" stroke="none"/></svg>`,
  retake: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4.5 12a7.5 7.5 0 1 0 2.1-5.2"/><path d="M4.5 5.2V8.8H8"/></svg>`,
  flash: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M13 2 5.4 13.2h5.1L10 22l8.2-12.4h-5.3z"/></svg>`,
  play: `<svg viewBox="0 0 24 24" width="28" height="28" fill="#ff5a4a"><path d="M8 5.8v12.4L19 12z"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6.1 6.1l1.6 1.6M16.3 16.3l1.6 1.6M6.1 17.9l1.6-1.6M16.3 7.7l1.6-1.6"/></svg>`,
  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5.5A3.2 3.2 0 0 1 8.4 4H19v16H8.4A3.2 3.2 0 0 0 5 20.5z"/><path d="M8.4 4A3.2 3.2 0 0 0 5 5.5V20.5"/></svg>`,
  alert: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8.2"/><path d="M12 8v5M12 16.2v.6"/></svg>`,
  food: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M7 4v7a2.4 2.4 0 0 0 2.4 2.4V21M7 8h2.4M15.2 4.5c1.8 1.6 2.6 3.6 2.6 6.4 0 3.4-1.6 5.6-2.6 6.6V21"/></svg>`,
  star: `<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M12 3.2 14.4 9l6.2.4-4.8 3.8 1.6 6-5.4-3.4L6.6 19.2l1.6-6L3.4 9.4 9.6 9z"/></svg>`,
};

export function icon(name: keyof typeof icons): string {
  return icons[name];
}
