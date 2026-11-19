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
const fields = z.object({
  title: text, description: text, impact: text, rollbackPlan: text,
  type: z.enum(["standard", "normal", "emergency"]).default("normal"),
  riskLevel: z.enum(["low", "medium", "high", "critical"]),
  plannedStart: date, plannedEnd: date, assetsImpacted: links, ticketsLinked: links,
});
export const changeInput = fields.extend({ domainId: text }).refine(data => !data.plannedStart || !data.plannedEnd || data.plannedStart <= data.plannedEnd, {
  message: "La fin prévue précède le début.",
});


export const changeEdit = fields.partial().extend({
  status: text.optional(), expectedUpdatedAt: z.string().datetime().optional(),
  actualStart: date, actualEnd: date, implementationNotes: z.string().trim().nullish(),
  success: z.boolean().nullish(), postImplementationReview: z.string().trim().nullish(),
}).refine(data => Object.keys(data).some(key => key !== "expectedUpdatedAt"), { message: "Aucune modification." });
