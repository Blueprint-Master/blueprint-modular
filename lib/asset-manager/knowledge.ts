import { z } from "zod";
import { hasWriteRole } from "@/lib/auth";

export function knowledgeVisibility(user: { role?: string }) {
  return hasWriteRole(user) ? {} : { visibility: "public" };
}
const text = z.string().trim().min(1);
const optionalId = text.nullish();
export const knowledgeInput = z.object({
  domainId: text, title: text, content: text, categoryId: text, assetTypeId: optionalId,
  tags: z.array(text).optional(), visibility: z.enum(["technicians_only", "public"]).optional(), sourceTicketId: optionalId,
});
export const knowledgeEdit = knowledgeInput.omit({ domainId: true, sourceTicketId: true }).partial().extend({
  expectedUpdatedAt: z.string().datetime().optional(), validatedById: optionalId,
  publishedAt: z.string().datetime({ offset: true }).nullable().optional(),
});
