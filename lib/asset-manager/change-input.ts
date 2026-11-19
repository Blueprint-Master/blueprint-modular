import { z } from "zod";
import { parseCalendarDate } from "@/lib/calendar/event-input";

const text = z.string().trim().min(1);
const date = z.string().transform((value, ctx) => {
  const parsed = parseCalendarDate(value);
  if (parsed) return parsed;
  ctx.addIssue({ code: "custom", message: "Date invalide." });
  return z.NEVER;
}).nullish();
const links = z.array(text).nullish().transform(ids => ids ? [...new Set(ids)] : []);
export const changeInput = z.object({
  domainId: text, title: text, description: text, impact: text, rollbackPlan: text,
  type: z.enum(["standard", "normal", "emergency"]).default("normal"),
  riskLevel: z.enum(["low", "medium", "high", "critical"]),
  plannedStart: date, plannedEnd: date, assetsImpacted: links, ticketsLinked: links,
}).refine(data => !data.plannedStart || !data.plannedEnd || data.plannedStart <= data.plannedEnd, {
  message: "La fin prévue précède le début.",
});
