import { createHash } from "node:crypto";
import type { AssetMovement, Prisma } from "@prisma/client";
import { z } from "zod";
import { parseCalendarDate } from "@/lib/calendar/event-input";
import { prisma } from "@/lib/prisma";

const field = z.string().trim().nullish().transform(value => value || null);
const day = z.string().transform((value, ctx) => {
  if (parseCalendarDate(value)) return new Date(value.slice(0, 10));
  ctx.addIssue({ code: "custom", message: "Date de mouvement invalide." });
  return z.NEVER;
});
const fields = z.object({
  movementType: z.enum(["reception", "deployment", "transfer", "return", "repair_out", "repair_in", "disposal"]),
  date: day, reason: field, notes: field, fromLocationId: field, toLocationId: field,
  fromUserId: field, toUserId: field, ticketId: field,
});
export const movementCreate = fields.extend({ assetId: z.string().trim().min(1) });
export const movementEdit = fields.partial().extend({ revision: z.number().int().nonnegative().optional() })
  .refine(patch => Object.keys(patch).some(key => key !== "revision"), "Aucun champ à modifier.");
export const movementOrder: Prisma.AssetMovementOrderByWithRelationInput[] = [{ date: "desc" }, { createdAt: "desc" }, { id: "desc" }];
export const movementInclude = { asset: { select: { id: true, reference: true, label: true } } };

type Tx = Prisma.TransactionClient;
const failure = (error: string, status: number) => Response.json({ error }, { status });

function latestDestination(tx: Tx, assetId: string) {
  return tx.assetMovement.findFirst({ where: { assetId, removedAt: null, toLocationId: { not: null } }, orderBy: movementOrder });
}

async function withAsset(assetId: string, work: (tx: Tx, asset: { id: string; domainId: string; locationId: string | null }) => Promise<Response>) {
  return prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT id FROM "Asset" WHERE id = ${assetId} FOR UPDATE`;
    const asset = await tx.asset.findUnique({ where: { id: assetId }, select: { id: true, domainId: true, locationId: true } });
    return asset ? work(tx, asset) : failure("Actif introuvable.", 404);
  });
}

async function validateLinks(tx: Tx, domainId: string, data: { fromUserId?: string; toUserId?: string; ticketId?: string }) {
  const users = [...new Set([data.fromUserId, data.toUserId].filter(Boolean))];
  if (users.length && await tx.user.count({ where: { id: { in: users } } }) !== users.length)
    return failure("Utilisateur introuvable.", 400);
  if (data.ticketId && !await tx.ticket.count({ where: { id: data.ticketId, domainId } }))
    return failure("Ticket introuvable dans ce domaine.", 400);
  return null;
}

async function audit(tx: Tx, domainId: string, actor: string, action: string, before: AssetMovement | null, after: AssetMovement) {
  await tx.auditLog.create({ data: {
    domainId, userId: actor, resourceType: "movement", resourceId: after.id, action,
    beforeState: before ? JSON.stringify(before) : null, afterState: JSON.stringify(after),
  } });
}

export function createMovement(actor: string, requestKey: string | null, data: z.infer<typeof movementCreate>) {
  if (requestKey !== null && (!requestKey.trim() || requestKey.length > 200)) return failure("Clé de saisie invalide.", 400);
  return withAsset(data.assetId, async (tx, asset) => {
    const requestHash = requestKey ? createHash("sha256").update(JSON.stringify([actor, data])).digest("hex") : null;
    if (requestKey) {
      const prior = await tx.assetMovement.findUnique({ where: { assetId_requestKey: { assetId: asset.id, requestKey } } });
      if (prior) {
        if (prior.requestHash !== requestHash) return failure("Cette clé correspond à une autre saisie.", 409);
        return prior.removedAt ? failure("Ce mouvement a été supprimé.", 410) : Response.json(prior);
      }
    }
    const invalid = await validateLinks(tx, asset.domainId, data);
    if (invalid) return invalid;
    const latest = data.toLocationId ? await latestDestination(tx, asset.id) : null;
    const setsLocation = Boolean(data.toLocationId && (!latest || data.date >= latest.date));
    if (setsLocation && data.fromLocationId && asset.locationId && data.fromLocationId !== asset.locationId)
      return failure("Le lieu de départ diffère de l’emplacement actuel.", 409);
    const saved = await tx.assetMovement.create({ data: {
      ...data, assetId: asset.id, movementType: data.movementType, date: data.date, performedById: actor,
      fromLocationId: data.fromLocationId ?? (setsLocation ? asset.locationId : null), requestKey, requestHash,
    } });
    if (setsLocation) await tx.asset.update({ where: { id: asset.id }, data: { locationId: data.toLocationId } });
    await audit(tx, asset.domainId, actor, "create", null, saved);
    return Response.json(saved);
  });
}

export async function reviseMovement(id: string, actor: string, revision: number | undefined, patch?: z.infer<typeof movementEdit>) {
  const key = await prisma.assetMovement.findUnique({ where: { id }, select: { assetId: true } });
  if (!key) return failure("Mouvement introuvable.", 404);
  return withAsset(key.assetId, async (tx, asset) => {
    const row = await tx.assetMovement.findUnique({ where: { id } });
    if (!row || row.removedAt) return failure("Mouvement introuvable.", 404);
    if (revision !== undefined && revision !== row.revision) return failure("Le mouvement a été modifié. Rechargez son historique.", 409);
    if (patch) {
      const invalid = await validateLinks(tx, asset.domainId, patch);
      if (invalid) return invalid;
    }
    const before = await latestDestination(tx, asset.id);
    const updated = await tx.assetMovement.update({ where: { id }, data: {
      ...(patch ?? { removedAt: new Date() }),
      fromLocationId: patch?.toLocationId && !before && !row.fromLocationId ? patch.fromLocationId ?? asset.locationId : patch?.fromLocationId,
      revision: { increment: 1 },
    }, include: movementInclude });
    const after = await latestDestination(tx, asset.id);
    // A separately corrected inventory location supersedes older movement history.
    if ((!before || asset.locationId === before.toLocationId) && (before?.id !== after?.id || before?.toLocationId !== after?.toLocationId)) {
      const locationId = after?.toLocationId ?? before?.fromLocationId ?? null;
      await tx.asset.update({ where: { id: asset.id }, data: { locationId } });
    }
    await audit(tx, asset.domainId, actor, patch ? "update" : "delete", row, updated);
    return Response.json(patch ? updated : { ok: true });
  });
}
