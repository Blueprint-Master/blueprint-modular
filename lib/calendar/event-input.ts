import { z } from "zod";

// Accept ISO calendar dates and timestamps, including numeric timezone offsets.
// Date.parse alone would silently turn 30 February into a day in March.
const isoDate = /^\d{4}-\d{2}-\d{2}(?:T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?(?:Z|[+-](?:[01]\d|2[0-3]):?[0-5]\d)?)?$/i;

export function parseCalendarDate(value: string): Date | null {
  if (!isoDate.test(value)) return null;
  const day = value.slice(0, 10);
  const midnight = new Date(day);
  if (!Number.isFinite(midnight.getTime()) || midnight.toISOString().slice(0, 10) !== day) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

const timestamp = z.string().transform((value, ctx) => {
  const date = parseCalendarDate(value);
  if (date) return date;
  ctx.addIssue({ code: "custom", message: "Invalid ISO date" });
  return z.NEVER;
});

const optionalText = z.string().trim().nullable().transform(value => value || null).optional();
export const calendarEventInput = z.object({
  title: z.string().trim().min(1),
  startAt: timestamp,
  endAt: timestamp,
  allDay: z.boolean().optional(),
  description: optionalText,
  color: optionalText,
});

export const calendarEventPatch = calendarEventInput.partial().refine(
  value => Object.keys(value).length > 0, "Provide at least one event field"
);

export const eventFields = {
  id: true, title: true, startAt: true, endAt: true, allDay: true, description: true, color: true,
} as const;
