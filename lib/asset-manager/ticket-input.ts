import { z } from "zod";
import { getDomainConfig } from "./get-domain-config";

const text = z.string().trim().min(1);
const optionalText = z.string().trim().nullish().transform(value => value || null).optional();
const fields = z.object({
  title: text, description: text, typeId: text.optional(), priorityId: text.optional(), categoryId: text.optional(),
  subcategory: optionalText, assetId: optionalText,
});
export const ticketInput = fields.extend({ domainId: text });
export const ticketEdit = fields.partial().extend({
  status: z.enum(["new", "open", "assigned", "pending", "in_progress", "on_hold", "resolved", "closed"]).optional(),
  assigneeId: optionalText, solution: optionalText, expectedUpdatedAt: z.string().datetime().optional(),
});

export function ticketOptions(domain: string, data: { typeId?: string; priorityId?: string; categoryId?: string; subcategory?: string | null }) {
  const config = getDomainConfig(domain);
  if (!config) return null;
  const typeId = data.typeId ?? config.ticket_types[0];
  const priority = config.priorities.find(item => item.id === (data.priorityId ?? config.priorities[0]?.id));
  const category = config.ticket_categories.find(item => item.id === (data.categoryId ?? config.ticket_categories[0]?.id));
  if (!priority || !category || !config.ticket_types.includes(typeId) || (data.subcategory && !category.subcategories.includes(data.subcategory))) return null;
  return { typeId, priority, categoryId: category.id, prefix: config.numbering?.ticket.split("-")[0] ?? "TK" };
}

export const ticketDetails = {
  requester: { select: { id: true, name: true, email: true } },
  assignee: { select: { id: true, name: true, email: true } },
  asset: { select: { id: true, reference: true, label: true } },
};
