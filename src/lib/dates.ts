const MONTHS_SHORT = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
] as const;

const MONTHS_LONG = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

const WEEKDAYS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
] as const;

export function todayISO(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function daysBetween(fromISO: string, to = new Date()): number {
  const start = parseISO(fromISO);
  start.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 86_400_000));
}

export function weekNumber(days: number): number {
  if (days <= 0) return 1;
  return Math.max(1, Math.ceil(days / 7));
}

export function formatDayMonth(iso: string): string {
  const d = parseISO(iso);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

export function formatMonthLong(d = new Date()): string {
  return MONTHS_LONG[d.getMonth()];
}

export function formatMonthShort(iso: string): string {
  return MONTHS_SHORT[parseISO(iso).getMonth()];
}

export function weekdayName(iso: string): string {
  return WEEKDAYS[parseISO(iso).getDay()];
}

export function periodLabel(period: "manha" | "tarde"): string {
  return period === "manha" ? "manhã" : "tarde";
}

export function formatDateRange(fromISO?: string, toISO?: string): string {
  if (!fromISO && !toISO) return "";
  if (!fromISO) return formatDayMonth(toISO!);
  if (!toISO || fromISO === toISO) return formatDayMonth(fromISO);
  return `${formatDayMonth(fromISO)} — ${formatDayMonth(toISO)}`;
}

export function monthRangeLabel(fromISO?: string, toISO?: string): string {
  if (!fromISO || !toISO) return "—";
  const a = formatMonthShort(fromISO);
  const b = formatMonthShort(toISO);
  const A = a.charAt(0).toUpperCase() + a.slice(1);
  const B = b.charAt(0).toUpperCase() + b.slice(1);
  return A === B ? A : `${A} — ${B}`;
}

export function addDaysISO(iso: string, days: number): string {
  const d = parseISO(iso);
  d.setDate(d.getDate() + days);
  return todayISO(d);
}
