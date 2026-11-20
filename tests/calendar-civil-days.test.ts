import { describe, expect, it } from "vitest";
import { addMonths, eventDates, formatDateKey, getISOWeekNumber } from "@/lib/calendar/civil-days";

describe("calendar civil days", () => {
  it.each([
    [2024, 12, 30, 1], [2021, 1, 1, 53], [2026, 7, 13, 29], [2026, 10, 26, 44],
  ])("uses the ISO week for %i-%i-%i", (y, m, d, expected) => {
    expect(getISOWeekNumber(new Date(y, m - 1, d))).toBe(expected);
  });
  it("keeps a civil day at midnight and clamps navigation at month end", () => {
    const jan = new Date(2024, 0, 31);
    expect(formatDateKey(addMonths(jan, 1))).toBe("2024-02-29");
    expect(formatDateKey(jan)).toBe("2024-01-31");
  });
  it("anchors each monthly occurrence to the original day and respects the inclusive end", () => {
    expect(eventDates("2025-01-31", "2025-04-30", "monthly")).toEqual([
      "2025-01-31", "2025-02-28", "2025-03-31", "2025-04-30",
    ]);
  });
  it("crosses summer time in civil days", () => {
    expect(eventDates("2026-03-28", "2026-03-30", "")).toEqual(["2026-03-28", "2026-03-29", "2026-03-30"]);
    expect(eventDates("2026-03-22", "2026-04-01", "weekly")).toEqual(["2026-03-22", "2026-03-29"]);
  });
  it("rejects impossible or reversed ranges and excessive expansions", () => {
    expect(eventDates("2026-02-29", "", "")).toBeNull();
    expect(eventDates("2026-06-02", "2026-06-01", "")).toBeNull();
    expect(eventDates("2026-01-01", "9999-12-31", "")).toBeNull();
  });
});
