import { el } from "../lib/dom";
import { daysBetween, formatDayMonth, todayISO } from "../lib/dates";
import {
  listAppointments,
  loadProfile,
  patchProfile,
  type Appointment,
} from "../db/store";

function showBanner(id: string, title: string, body: string): void {
  if (document.querySelector(`[data-banner="${id}"]`)) return;
  const banner = el("div", { class: "banner", "data-banner": id });
  const text = el("div");
  text.append(el("strong", {}, title), el("span", {}, body));
  const close = el("button", { class: "x", type: "button", "aria-label": "Fechar" }, "✕");
  close.addEventListener("click", () => banner.remove());
  banner.append(text, close);
  document.body.append(banner);
}

async function notify(title: string, body: string): Promise<boolean> {
  if (!("Notification" in window)) return false;
  let perm = Notification.permission;
  if (perm === "default") {
    try {
      perm = await Notification.requestPermission();
    } catch {
      return false;
    }
  }
  if (perm !== "granted") return false;
  try {
    if (navigator.serviceWorker?.ready) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, { body, icon: "./icons/icon-192.png" });
    } else {
      new Notification(title, { body });
    }
    return true;
  } catch {
    return false;
  }
}

function hoursUntil(appt: Appointment): number {
  const [y, m, d] = appt.date.split("-").map(Number);
  const hour = appt.period === "manha" ? 9 : 15;
  const when = new Date(y, (m ?? 1) - 1, d ?? 1, hour, 0, 0);
  return (when.getTime() - Date.now()) / 3_600_000;
}

export async function checkReminders(): Promise<void> {
  const profile = loadProfile();
  if (!profile?.onboarded) return;

  const today = todayISO();
  if (profile.lastCaptureDate) {
    const gap = daysBetween(profile.lastCaptureDate);
    if (gap >= 7 && profile.weeklyBannerDismissedOn !== today) {
      showBanner(
        "weekly",
        "Fotos da semana",
        "Já passou uma semana. Quando quiseres, tira as de hoje.",
      );
      const banner = document.querySelector('[data-banner="weekly"] .x');
      banner?.addEventListener("click", () => patchProfile({ weeklyBannerDismissedOn: today }));
      void notify("BraceFrame", "Já passou uma semana. Fotos de hoje?");
    }
  }

  const appts = await listAppointments();
  for (const appt of appts) {
    const h = hoursUntil(appt);
    if (h <= 24 && h > 2) {
      showBanner(
        `appt-24-${appt.id}`,
        `${appt.title} · ${formatDayMonth(appt.date)}`,
        "É amanhã. Leva o sorriso descansado.",
      );
      void notify("BraceFrame", `${appt.title} amanhã · ${formatDayMonth(appt.date)}`);
    } else if (h <= 2 && h > -2) {
      showBanner(
        `appt-2-${appt.id}`,
        `${appt.title} · hoje`,
        "Daqui a pouco. Se quiseres, exporta um .ics para o calendário.",
      );
      void notify("BraceFrame", `${appt.title} é já a seguir.`);
    }
  }
}

export function appointmentIcs(appt: Appointment): string {
  const hour = appt.period === "manha" ? "090000" : "150000";
  const ymd = appt.date.replaceAll("-", "");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BraceFrame//PT-PT//PT",
    "BEGIN:VEVENT",
    `DTSTART:${ymd}T${hour}`,
    `SUMMARY:${appt.title} · BraceFrame`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

export function downloadIcs(appt: Appointment): void {
  const blob = new Blob([appointmentIcs(appt)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `braceframe-${appt.date}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
