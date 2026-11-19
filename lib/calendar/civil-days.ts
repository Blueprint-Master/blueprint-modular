/** Calendar navigation uses the user's civil day, even when local midnight is yesterday in UTC. */
export function formatDateKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return [String(date.getFullYear()).padStart(4, "0"), pad(date.getMonth() + 1), pad(date.getDate())].join("-");
}

export function getISOWeekNumber(date: Date): number {
  const thursday = new Date(formatDateKey(date) + "T00:00:00Z");
  thursday.setUTCDate(thursday.getUTCDate() + 3 - ((thursday.getUTCDay() + 6) % 7));
  const firstDay = new Date(thursday);
  firstDay.setUTCMonth(0, 1);
  return 1 + Math.floor((thursday.getTime() - firstDay.getTime()) / (7 * 86_400_000));
}

export function addMonths(anchor: Date, months: number): Date {
  const next = new Date(anchor);
  next.setDate(1);
  next.setMonth(next.getMonth() + months + 1, 0);
  next.setDate(Math.min(anchor.getDate(), next.getDate()));
  return next;
}

export type Frequency = "daily" | "weekly" | "monthly";

/** Materialized by the simulator in memory. An oversized request is rejected as a whole. */
export const MAX_OCCURRENCES = 3660;

export function eventDates(start: string, until: string, frequency: Frequency | ""): string[] | null {
  const anchor = new Date(start + "T12:00:00");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || formatDateKey(anchor) !== start) return null;
  if (until && (!/^\d{4}-\d{2}-\d{2}$/.test(until) || formatDateKey(new Date(until + "T12:00:00")) !== until || until < start)) return null;
  const count = until ? MAX_OCCURRENCES + 1 : frequency === "daily" ? 60 : frequency ? 12 : 1;
  const dates: string[] = [];
  for (let index = 0; index < count; index++) {
    const day = frequency === "monthly" ? addMonths(anchor, index) : new Date(anchor);
    if (frequency !== "monthly") day.setDate(anchor.getDate() + index * (frequency === "weekly" ? 7 : 1));
    if (day.getFullYear() > 9999) return until ? dates : null;
    const key = formatDateKey(day);
    if (until && key > until) break;
    if (dates.length === MAX_OCCURRENCES) return null;
    dates.push(key);
  }
  return dates;
}
