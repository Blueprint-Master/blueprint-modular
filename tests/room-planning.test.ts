import { describe, expect, it } from "vitest";
import { canStart, firstPlanningDay, isWorkingDay } from "@/lib/reservations/planning";

describe("Paris room hours", () => {
  it("opens the following Monday at the weekend across the autumn clock change", () => {
    expect(firstPlanningDay(new Date("2026-10-23T15:00:00Z"))).toBe("2026-10-26");
    expect(canStart("2026-10-26", 9, new Date("2026-10-26T07:59:00Z"))).toBe(true);
    expect(canStart("2026-10-26", 9, new Date("2026-10-26T08:01:00Z"))).toBe(false);
    expect(firstPlanningDay(new Date("2026-10-26T16:00:00Z"))).toBe("2026-10-27");
  });
  it("rejects missing dates, calendar rollover and weekends", () => {
    for (const day of ["", "2026-02-30", "2026-11-21", "2026-11-22"]) expect(isWorkingDay(day)).toBe(false);
  });
});
