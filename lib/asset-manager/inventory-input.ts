import { z } from "zod";
import { parseCalendarDate } from "@/lib/calendar/event-input";

const text = z.string().trim().nullish().transform(value => value || null);
const date = text.transform((value, ctx) => {
  if (!value) return null;
  const parsed = parseCalendarDate(value);
  if (parsed) return parsed;
  ctx.addIssue({ code: "custom", message: "Date invalide" });
  return z.NEVER;
});
const attribute = z.object({
  key: z.string().trim().min(1), valueText: z.string().nullish(),
  valueNumber: z.number().finite().nullish(), valueDate: date, valueBool: z.boolean().nullish(),
});
export const inventoryInput = z.object({
  domainId: z.string(), assetTypeId: z.string(), label: z.string().trim().min(1), reference: text,
  brand: text, model: text, serialNumber: text, statusId: text, locationId: text, ownerUserId: text,
  purchaseDate: date, warrantyEndDate: date, supplierId: text, purchasePrice: z.number().finite().nullish(),
  notes: text, attributes: z.array(attribute).default([]),
});

export const inventoryEdit = inventoryInput.omit({ domainId: true, assetTypeId: true, reference: true }).partial().extend({
  lifecycleStage: text.optional(), expectedUpdatedAt: z.string().datetime().optional(),
});
export const inventoryDetails = { attributes: true, createdBy: { select: { id: true, name: true, email: true } } };
