import { openDb, reqTo, txDone } from "./idb";

export type Pose = "frente" | "sorriso" | "oclusao";
export type Period = "manha" | "tarde";
export type ThemeId = "kids" | "adults";

export interface Photo {
  id: string;
  pose: Pose;
  date: string;
  blob: Blob;
  createdAt: number;
}

export interface Appointment {
  id: string;
  title: string;
  date: string;
  period: Period;
  createdAt: number;
}

export interface Profile {
  placementDate: string;
  nextAppointmentDate?: string;
  treatmentWeeks: number;
  onboarded: boolean;
  a2hsDismissed?: boolean;
  lastCaptureDate?: string;
  weeklyBannerDismissedOn?: string;
  theme?: ThemeId;
  hygieneFio?: boolean;
  hygieneElasticos?: boolean;
  hygieneBannerDismissedOn?: string;
  hygieneNotifiedOn?: string;
  patientId?: string;
  adesaoElasticos?: boolean;
  adesaoAlinhadores?: boolean;
  adesaoOfm?: boolean;
}

const PROFILE_KEY = "braceframe-profile";

export function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile: Profile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function patchProfile(partial: Partial<Profile>): Profile {
  const current = loadProfile() ?? {
    placementDate: new Date().toISOString().slice(0, 10),
    treatmentWeeks: 14,
    onboarded: false,
  };
  const next = { ...current, ...partial };
  saveProfile(next);
  return next;
}

export function ensurePatientId(): string {
  const profile = loadProfile();
  if (profile?.patientId) return profile.patientId;
  const patientId = crypto.randomUUID();
  patchProfile({ patientId });
  return patientId;
}

/** One slot per pose per day — Frente / Sorriso / Oclusão never share a key. */
export function photoRecordId(pose: Pose, date: string): string {
  return `${date}:${pose}`;
}

export function photosByPoseOnDate(photos: Photo[], date: string): Photo[] {
  const day = photos.filter((p) => p.date === date);
  return (["frente", "sorriso", "oclusao"] as const)
    .map((pose) => day.find((p) => p.pose === pose))
    .filter((p): p is Photo => Boolean(p));
}

export function latestSessionDate(photos: Photo[]): string | undefined {
  if (!photos.length) return undefined;
  return photos.reduce((best, p) => (p.date > best ? p.date : best), photos[0].date);
}

export async function addPhoto(photo: Omit<Photo, "id" | "createdAt">): Promise<Photo> {
  const id = photoRecordId(photo.pose, photo.date);
  const db = await openDb();
  const tx = db.transaction("photos", "readwrite");
  const store = tx.objectStore("photos");
  const existing = await reqTo<Photo | undefined>(store.get(id));
  const record: Photo = {
    ...photo,
    id,
    createdAt: existing?.createdAt ?? Date.now(),
  };
  store.put(record);
  await txDone(tx);
  db.close();
  patchProfile({ lastCaptureDate: photo.date });
  return record;
}

export async function listPhotos(): Promise<Photo[]> {
  const db = await openDb();
  const tx = db.transaction("photos", "readonly");
  const rows = await reqTo(tx.objectStore("photos").getAll());
  await txDone(tx);
  db.close();
  return rows.sort((a, b) => b.createdAt - a.createdAt);
}

export async function photosOnDate(date: string): Promise<Photo[]> {
  const all = await listPhotos();
  return all.filter((p) => p.date === date);
}

export async function latestByPose(pose: Pose): Promise<Photo | undefined> {
  const all = await listPhotos();
  return all.find((p) => p.pose === pose);
}

export async function firstByPose(pose: Pose): Promise<Photo | undefined> {
  const all = await listPhotos();
  return all.filter((p) => p.pose === pose).at(-1);
}

export async function addAppointment(
  input: Omit<Appointment, "id" | "createdAt">,
): Promise<Appointment> {
  const record: Appointment = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  const db = await openDb();
  const tx = db.transaction("appointments", "readwrite");
  tx.objectStore("appointments").put(record);
  await txDone(tx);
  db.close();
  return record;
}

export async function listAppointments(): Promise<Appointment[]> {
  const db = await openDb();
  const tx = db.transaction("appointments", "readonly");
  const rows = await reqTo(tx.objectStore("appointments").getAll());
  await txDone(tx);
  db.close();
  return rows.sort((a, b) => a.date.localeCompare(b.date) || a.period.localeCompare(b.period));
}

export async function deleteAppointment(id: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction("appointments", "readwrite");
  tx.objectStore("appointments").delete(id);
  await txDone(tx);
  db.close();
}

export async function upcomingAppointments(fromISO: string): Promise<Appointment[]> {
  const all = await listAppointments();
  return all.filter((a) => a.date >= fromISO);
}
