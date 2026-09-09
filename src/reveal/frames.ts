import type { Photo } from "../db/store";

const MAX_FRAMES = 8;

export function pickTimelineFrames(photos: Photo[], max = MAX_FRAMES): Photo[] {
  const frente = photos
    .filter((p) => p.pose === "frente")
    .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt - b.createdAt);
  const pool =
    frente.length >= 2
      ? frente
      : [...photos].sort((a, b) => a.date.localeCompare(b.date) || a.createdAt - b.createdAt);

  const byDate = new Map<string, Photo>();
  for (const photo of pool) byDate.set(photo.date, photo);
  const frames = [...byDate.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, photo]) => photo);

  if (frames.length <= max) return frames;
  if (max < 2) return [frames[0]];

  const out: Photo[] = [frames[0]];
  const inner = max - 2;
  for (let i = 1; i <= inner; i++) {
    const idx = Math.round((i * (frames.length - 1)) / (inner + 1));
    const next = frames[idx];
    if (next && next.id !== out[out.length - 1]?.id) out.push(next);
  }
  const last = frames[frames.length - 1];
  if (last && out[out.length - 1]?.id !== last.id) out.push(last);
  return out;
}
