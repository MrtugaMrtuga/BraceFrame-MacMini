import { addDaysISO, todayISO } from "../lib/dates";
import { loadProfile, type Profile } from "./store";

export type HygieneItem = "manha" | "noite" | "fio" | "elasticos";

export interface HygieneState {
  completions: Record<string, Partial<Record<HygieneItem, boolean>>>;
}

const KEY = "braceframe-hygiene";

const LABELS: Record<HygieneItem, string> = {
  manha: "Escovar de manhã",
  noite: "Escovar à noite",
  fio: "Fio",
  elasticos: "Elásticos",
};

export function hygieneLabel(item: HygieneItem): string {
  return LABELS[item];
}

export function loadHygiene(): HygieneState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { completions: {} };
    const parsed = JSON.parse(raw) as HygieneState;
    return { completions: parsed.completions ?? {} };
  } catch {
    return { completions: {} };
  }
}

export function saveHygiene(state: HygieneState): void {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function enabledHygieneItems(profile: Profile | null = loadProfile()): HygieneItem[] {
  const items: HygieneItem[] = ["manha", "noite"];
  if (profile?.hygieneFio !== false) items.push("fio");
  if (profile?.hygieneElasticos) items.push("elasticos");
  return items;
}

export function dayMarks(date: string): Partial<Record<HygieneItem, boolean>> {
  return loadHygiene().completions[date] ?? {};
}

export function isDayComplete(
  date: string = todayISO(),
  items: HygieneItem[] = enabledHygieneItems(),
): boolean {
  if (!items.length) return true;
  const marks = dayMarks(date);
  return items.every((item) => Boolean(marks[item]));
}

export function toggleHygiene(item: HygieneItem, date: string = todayISO()): HygieneState {
  const state = loadHygiene();
  const day = { ...(state.completions[date] ?? {}) };
  day[item] = !day[item];
  state.completions[date] = day;
  saveHygiene(state);
  return state;
}

export function hygieneStreak(
  items: HygieneItem[] = enabledHygieneItems(),
  from: string = todayISO(),
): number {
  if (!items.length) return 0;
  let cursor = from;
  if (!isDayComplete(cursor, items)) cursor = addDaysISO(cursor, -1);
  let streak = 0;
  while (isDayComplete(cursor, items)) {
    streak += 1;
    cursor = addDaysISO(cursor, -1);
    if (streak > 400) break;
  }
  return streak;
}

export function pendingHygieneCount(
  date: string = todayISO(),
  items: HygieneItem[] = enabledHygieneItems(),
): number {
  const marks = dayMarks(date);
  return items.filter((item) => !marks[item]).length;
}
