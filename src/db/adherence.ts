import { addDaysISO, endOfDayMs, isPastDay, startOfDayMs, todayISO } from "../lib/dates";
import { adherenceSink } from "./adherence-sync";
import { openDb, reqTo, txDone } from "./idb";
import { ensurePatientId, loadProfile, type Profile } from "./store";

export type ElasticSlot = "manha" | "tarde" | "merenda" | "noite";
export type AdherenceTask = "elasticos" | "alinhadores" | "ofm";

export const ELASTIC_SLOTS: ElasticSlot[] = ["manha", "tarde", "merenda", "noite"];
export const ALIGNER_TARGET_HOURS = 22;

export interface AdherenceDay {
  id: string;
  patientId: string;
  date: string;
  elasticos: Partial<Record<ElasticSlot, boolean>>;
  alinhadoresMs: number;
  alinhadoresRunningSince: number | null;
  ofmDone: boolean;
  updatedAt: number;
}

export interface AdherencePlan {
  elasticos: boolean;
  alinhadores: boolean;
  ofm: boolean;
}

export function adherenceRecordId(patientId: string, date: string): string {
  return `${patientId}:${date}`;
}

export function emptyDay(patientId: string, date: string): AdherenceDay {
  return {
    id: adherenceRecordId(patientId, date),
    patientId,
    date,
    elasticos: {},
    alinhadoresMs: 0,
    alinhadoresRunningSince: null,
    ofmDone: false,
    updatedAt: 0,
  };
}

export function planFromProfile(profile: Profile | null = loadProfile()): AdherencePlan {
  return {
    elasticos: profile?.adesaoElasticos !== false,
    alinhadores: profile?.adesaoAlinhadores !== false,
    ofm: profile?.adesaoOfm !== false,
  };
}

export function activeTasks(plan: AdherencePlan): AdherenceTask[] {
  const tasks: AdherenceTask[] = [];
  if (plan.elasticos) tasks.push("elasticos");
  if (plan.alinhadores) tasks.push("alinhadores");
  if (plan.ofm) tasks.push("ofm");
  return tasks;
}

export function slotsDone(day: AdherenceDay): number {
  return ELASTIC_SLOTS.filter((slot) => Boolean(day.elasticos[slot])).length;
}

export function nextOpenSlot(day: AdherenceDay): ElasticSlot | undefined {
  return ELASTIC_SLOTS.find((slot) => !day.elasticos[slot]);
}

export function currentAlignerHours(day: AdherenceDay, now = Date.now()): number {
  let ms = day.alinhadoresMs;
  if (day.alinhadoresRunningSince != null) {
    ms += Math.max(0, now - day.alinhadoresRunningSince);
  }
  return Math.min(24, ms / 3_600_000);
}

export function displayHours(hours: number): number {
  return Math.min(24, Math.floor(hours + 1e-6));
}

export function hoursLeft(hours: number, target = ALIGNER_TARGET_HOURS): number {
  return Math.max(0, Math.ceil(target - hours));
}

export function taskProgress(day: AdherenceDay, task: AdherenceTask, now = Date.now()): number {
  if (task === "elasticos") return slotsDone(day) / ELASTIC_SLOTS.length;
  if (task === "alinhadores") return Math.min(1, currentAlignerHours(day, now) / ALIGNER_TARGET_HOURS);
  return day.ofmDone ? 1 : 0;
}

export function taskComplete(day: AdherenceDay, task: AdherenceTask, now = Date.now()): boolean {
  return taskProgress(day, task, now) >= 1;
}

export function taskStarted(day: AdherenceDay, task: AdherenceTask, now = Date.now()): boolean {
  return taskProgress(day, task, now) > 0;
}

/** feito / tarefas activas hoje — elásticos conta como 1 tarefa, não 4. */
export function usagePercent(day: AdherenceDay, plan: AdherencePlan, now = Date.now()): number {
  const tasks = activeTasks(plan);
  if (!tasks.length) return 0;
  const done = tasks.filter((task) => taskComplete(day, task, now)).length;
  return Math.round((done / tasks.length) * 100);
}

export function firstIncompleteTask(day: AdherenceDay, plan: AdherencePlan, now = Date.now()): AdherenceTask | undefined {
  return activeTasks(plan).find((task) => !taskComplete(day, task, now));
}

export function firstCheckableMissing(day: AdherenceDay, plan: AdherencePlan): "elasticos" | "ofm" | undefined {
  if (plan.elasticos && nextOpenSlot(day)) return "elasticos";
  if (plan.ofm && !day.ofmDone) return "ofm";
  return undefined;
}

export function dayFullyDone(day: AdherenceDay, plan: AdherencePlan, now = Date.now()): boolean {
  const tasks = activeTasks(plan);
  return tasks.length > 0 && tasks.every((task) => taskComplete(day, task, now));
}

export function isDayLocked(date: string, now = new Date()): boolean {
  return isPastDay(date, now);
}

async function persist(day: AdherenceDay): Promise<AdherenceDay> {
  const record = { ...day, updatedAt: Date.now() };
  const db = await openDb();
  const tx = db.transaction("adherence", "readwrite");
  tx.objectStore("adherence").put(record);
  await txDone(tx);
  db.close();
  if (adherenceSink.enabled) {
    void adherenceSink.push(record.patientId, [record]);
  }
  return record;
}

export async function getDay(patientId: string, date: string): Promise<AdherenceDay> {
  const db = await openDb();
  const tx = db.transaction("adherence", "readonly");
  const row = await reqTo<AdherenceDay | undefined>(
    tx.objectStore("adherence").get(adherenceRecordId(patientId, date)),
  );
  await txDone(tx);
  db.close();
  return row ?? emptyDay(patientId, date);
}

export async function listDays(patientId: string): Promise<AdherenceDay[]> {
  const db = await openDb();
  const tx = db.transaction("adherence", "readonly");
  const index = tx.objectStore("adherence").index("byPatient");
  const rows = await reqTo<AdherenceDay[]>(index.getAll(patientId));
  await txDone(tx);
  db.close();
  return rows.sort((a, b) => a.date.localeCompare(b.date));
}

export async function settleAlignerClock(
  patientId: string = ensurePatientId(),
  now = Date.now(),
): Promise<AdherenceDay> {
  const today = todayISO(new Date(now));
  const days = await listDays(patientId);
  let stillWearing = false;
  for (const day of days) {
    if (day.date >= today || day.alinhadoresRunningSince == null) continue;
    const end = endOfDayMs(day.date);
    const started = day.alinhadoresRunningSince;
    if (started < end) day.alinhadoresMs += end - started;
    day.alinhadoresRunningSince = null;
    await persist(day);
    stillWearing = true;
  }
  const todayDay = await getDay(patientId, today);
  if (stillWearing && todayDay.alinhadoresRunningSince == null) {
    todayDay.alinhadoresRunningSince = startOfDayMs(today);
    return persist(todayDay);
  }
  return todayDay;
}

export async function markElasticSlot(
  slot: ElasticSlot,
  date: string = todayISO(),
  patientId: string = ensurePatientId(),
): Promise<AdherenceDay> {
  const day = await getDay(patientId, date);
  if (isDayLocked(date) || day.elasticos[slot]) return day;
  day.elasticos = { ...day.elasticos, [slot]: true };
  return persist(day);
}

export async function markOfm(
  date: string = todayISO(),
  patientId: string = ensurePatientId(),
): Promise<AdherenceDay> {
  const day = await getDay(patientId, date);
  if (isDayLocked(date) || day.ofmDone) return day;
  day.ofmDone = true;
  return persist(day);
}

export async function setAlignerWearing(
  wearing: boolean,
  date: string = todayISO(),
  patientId: string = ensurePatientId(),
  now = Date.now(),
): Promise<AdherenceDay> {
  const day = await getDay(patientId, date);
  if (isDayLocked(date)) return day;
  if (wearing && day.alinhadoresRunningSince == null) {
    day.alinhadoresRunningSince = now;
  } else if (!wearing && day.alinhadoresRunningSince != null) {
    day.alinhadoresMs += Math.max(0, now - day.alinhadoresRunningSince);
    day.alinhadoresRunningSince = null;
  }
  return persist(day);
}

export async function markFirstMissing(
  plan: AdherencePlan,
  date: string = todayISO(),
  patientId: string = ensurePatientId(),
): Promise<AdherenceDay> {
  const day = await getDay(patientId, date);
  const missing = firstCheckableMissing(day, plan);
  if (missing === "elasticos") {
    const slot = nextOpenSlot(day);
    if (slot) return markElasticSlot(slot, date, patientId);
  }
  if (missing === "ofm") return markOfm(date, patientId);
  return day;
}

export function adherenceStreak(
  days: AdherenceDay[],
  plan: AdherencePlan,
  from: string = todayISO(),
): number {
  const byDate = new Map(days.map((day) => [day.date, day]));
  let cursor = from;
  const today = byDate.get(cursor) ?? emptyDay("", cursor);
  if (!dayFullyDone(today, plan)) cursor = addDaysISO(cursor, -1);
  let streak = 0;
  while (streak < 400) {
    const day = byDate.get(cursor) ?? emptyDay("", cursor);
    if (!dayFullyDone(day, plan)) break;
    streak += 1;
    cursor = addDaysISO(cursor, -1);
  }
  return streak;
}
