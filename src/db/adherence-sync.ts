import type { AdherenceDay } from "./adherence";

/** Remote diary sink. Fatia 8 (Sheets / Apps Script) will implement this. */
export interface AdherenceRemoteSink {
  readonly id: "local-stub" | "sheets";
  readonly enabled: boolean;
  push(patientId: string, days: AdherenceDay[]): Promise<{ ok: true } | { ok: false; reason: string }>;
  pull(patientId: string, from: string, to: string): Promise<AdherenceDay[]>;
}

/** Local-only until Fatia 8. No GCP, no paid Google APIs. */
export const adherenceSink: AdherenceRemoteSink = {
  id: "local-stub",
  enabled: false,
  async push() {
    return { ok: false, reason: "Fatia 8 — Sheets ainda não ligado." };
  },
  async pull() {
    return [];
  },
};
