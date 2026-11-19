import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseCalendarDate } from "@/lib/calendar/event-input";
import { contractDocumentHref } from "./contract-terms";
import { getDomainConfig } from "./get-domain-config";

const text = z.string().trim().min(1);
const optional = z.string().trim().nullish().transform(x => x || null);
const day = z.string().transform((value, ctx) => {
  if (parseCalendarDate(value)) return new Date(value.slice(0, 10));
  ctx.addIssue({ code: "custom", message: "Date de contrat invalide." });
  return z.NEVER;
});
const days = z.number().int().min(0).max(2147483647);
const fields = z.object({
  reference: text, label: text, type: z.enum(["garantie", "maintenance", "leasing", "credit_bail", "licence"]),
  supplier: optional, startDate: day, endDate: day, amount: z.number().finite().nonnegative().nullish(),
  autoRenewal: z.boolean().optional(), noticeDays: days.optional(), alertDaysBefore: days.optional(),
  assetIds: z.array(text).nullish().transform(ids => [...new Set(ids ?? [])]),
  notes: optional, documentUrl: optional.refine(url => !url || !!contractDocumentHref(url), "Adresse de document invalide."),
});
export const contractCreate = fields.extend({ domainId: text });
export const contractEdit = fields.partial().extend({ expectedUpdatedAt: z.string().datetime().optional() });
const failed = (error: string, status: number) => Response.json({ error }, { status });
type Tx = Prisma.TransactionClient;

async function reserveReference(tx: Tx, domainId: string, reference: string, except?: string) {
  const key = JSON.stringify(["asset_contract", domainId, reference]);
  await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtextextended(${key}, 0))`;
  const existing = await tx.assetContract.count({ where: { domainId, reference, id: except ? { not: except } : undefined } });
  return existing ? failed("Cette référence de contrat existe déjà dans ce domaine.", 409) : null;
}

async function checkAssets(tx: Tx, domainId: string, ids: string[] | undefined) {
  if (!ids?.length) return null;
  const count = await tx.asset.count({ where: { domainId, id: { in: ids } } });
  return count === ids.length ? null : failed("Un équipement couvert est introuvable dans ce domaine.", 400);
}

async function journal(tx: Tx, domainId: string, userId: string, resourceId: string, action: string, before?: unknown, after?: unknown) {
  await tx.auditLog.create({ data: {
    domainId, userId, resourceId, resourceType: "contract", action,
    beforeState: before && JSON.stringify(before), afterState: after && JSON.stringify(after),
  } });
}

export function createContract(actor: string, data: z.infer<typeof contractCreate>) {
  if (!getDomainConfig(data.domainId)) return failed("Domaine invalide.", 400);
  if (data.startDate > data.endDate) return failed("La fin du contrat précède son début.", 400);
  return prisma.$transaction(async tx => {
    const invalid = await checkAssets(tx, data.domainId, data.assetIds) ?? await reserveReference(tx, data.domainId, data.reference);
    if (invalid) return invalid;
    const row = await tx.assetContract.create({ data: {
      ...data, domainId: data.domainId, reference: data.reference, type: data.type, label: data.label,
      startDate: data.startDate, endDate: data.endDate, noticeDays: data.noticeDays ?? 30,
      assetIds: data.assetIds.length ? JSON.stringify(data.assetIds) : null,
    } });
    await journal(tx, row.domainId, actor, row.id, "create", null, row);
    return Response.json(row);
  });
}

export function reviseContract(id: string, actor: string, version?: string, body?: z.infer<typeof contractEdit>) {
  return prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT id FROM "AssetContract" WHERE id = ${id} FOR UPDATE`;
    const row = await tx.assetContract.findUnique({ where: { id } });
    if (!row) return failed("Contrat introuvable.", 404);
    if (version && row.updatedAt.toISOString() !== version) return failed("Ce contrat a été modifié. Rechargez sa fiche.", 409);
    if (!body) {
      await tx.assetContract.delete({ where: { id } });
      await journal(tx, row.domainId, actor, id, "delete", row);
      return Response.json({ ok: true });
    }
    const { expectedUpdatedAt, assetIds, ...patch } = body;
    if ((patch.startDate ?? row.startDate) > (patch.endDate ?? row.endDate)) return failed("La fin du contrat précède son début.", 400);
    const invalid = await checkAssets(tx, row.domainId, assetIds) ?? (patch.reference && patch.reference !== row.reference
      ? await reserveReference(tx, row.domainId, patch.reference, id) : null);
    if (invalid) return invalid;
    const updated = await tx.assetContract.update({ where: { id }, data: {
      ...patch, updatedAt: new Date(Math.max(Date.now(), row.updatedAt.getTime() + 1)),
      assetIds: assetIds === undefined ? undefined : assetIds.length ? JSON.stringify(assetIds) : null,
    } });
    await journal(tx, row.domainId, actor, id, "update", row, updated);
    return Response.json(updated);
  });
}
