export const rooms = ["hugo", "colette", "rimbaud"] as const;
export const hours = Array.from({ length: 9 }, (_, index) => 9 + index);
export const timeZone = "Europe/Paris";

export function parisClock(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23",
  }).formatToParts(now);
  const part = (key: Intl.DateTimeFormatPartTypes) => parts.find(({ type }) => type === key)!.value;
  return { day: [part("year"), part("month"), part("day")].join("-"), hour: Number(part("hour")) };
}

export function isWorkingDay(day: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  const date = new Date(day + "T12:00:00Z");
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === day
    && date.getUTCDay() > 0 && date.getUTCDay() < 6;
}

export function firstPlanningDay(now = new Date()) {
  const clock = parisClock(now);
  const date = new Date(clock.day + "T12:00:00Z");
  if (clock.hour >= 17) date.setUTCDate(date.getUTCDate() + 1);
  while (!isWorkingDay(date.toISOString().slice(0, 10))) date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

export function canStart(day: string, hour: number, now = new Date()) {
  const clock = parisClock(now);
  return day > clock.day || (day === clock.day && hour > clock.hour);
}

export interface Booking {
  id: string | null;
  room: string;
  startHour: number;
  duration: number;
  title: string | null;
}
