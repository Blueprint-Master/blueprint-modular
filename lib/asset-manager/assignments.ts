import { nextInventoryReference } from "./numbering";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { parseCalendarDate } from "@/lib/calendar/event-input";
import { getDomainConfig } from "./get-domain-config";

const day = z.string().transform((value, ctx) => {
  const parsed = parseCalendarDate(value);
  if (parsed) return new Date(parsed.toISOString().slice(0, 10));
  ctx.addIssue({ code: "custom", message: "Date invalide" });
  return z.NEVER;
});
const text = z.string().trim().nullable().optional();
const common = z.object({
  assignmentType: z.enum(["temporary", "permanent"]).optional(),
  ticketId: text, technicianId: text, reason: text, expectedEndDate: day.nullable().optional(),
});
export const createLoan = common.extend({
  domainId: z.string().min(1), assetId: z.string().min(1), assigneeId: z.string().min(1), startDate: day,
});
export const updateLoan = common.extend({
  status: z.enum(["active", "overdue", "returned", "cancelled"]).optional(),
  actualEndDate: day.nullable().optional(), conditionAtStart: text, conditionAtReturn: text,
  contractSigned: z.boolean().optional(), notes: text, expectedUpdatedAt: z.string().datetime().optional(),
});
export const includeLoan = {
  asset: { select: { id: true, reference: true, label: true } },
  assignee: { select: { id: true, name: true, email: true } },
  technician: { select: { id: true, name: true } },
  ticket: { select: { id: true, reference: true, title: true } },
};
const failure = (error: string, status: number) => Response.json({ error }, { status });
const open = ["active", "overdue"];

async function lockAsset(tx: Prisma.TransactionClient, id: string) {
  await tx.$queryRaw`SELECT id FROM "Asset" WHERE id = ${id} FOR UPDATE`;
  return tx.asset.findUnique({ where: { id } });
}

async function loanTransaction(work: (tx: Prisma.TransactionClient) => Promise<Response>) {
  try { return await prisma.$transaction(work); }
  catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003")
      return failure("Bénéficiaire, technicien ou ticket introuvable.", 400);
    throw error;
  }
}

export function issueLoan(data: z.infer<typeof createLoan>) {
  return loanTransaction(async tx => {
    const config = getDomainConfig(data.domainId);
    if (!config) return failure("Domaine inconnu.", 400);
    const asset = await lockAsset(tx, data.assetId);
    if (asset?.domainId !== data.domainId) return failure("Actif introuvable dans ce domaine.", 404);
    if (config.statuses.some(item => item.id === asset.statusId && item.terminal))
      return failure("Cet actif est retiré du parc.", 409);
    if (data.expectedEndDate && data.expectedEndDate < data.startDate) return failure("Fin prévue antérieure au prêt.", 400);
    if (await tx.assignment.count({ where: { assetId: asset.id, status: { in: open } } }))
      return failure("Cet actif est déjà prêté.", 409);
    if (data.ticketId && !await tx.ticket.count({ where: { id: data.ticketId, domainId: data.domainId } }))
      return failure("Ticket introuvable dans ce domaine.", 400);
    const prefix = (config.numbering?.assignment?.split("-")[0] ?? "MAD") + "-" + new Date().getFullYear() + "-";
    const reference = await nextInventoryReference(tx, "Assignment", prefix);
    const loan = await tx.assignment.create({ data: {
      domainId: data.domainId, assetId: asset.id, assigneeId: data.assigneeId, startDate: data.startDate,
      assignmentType: data.assignmentType ?? "temporary", reason: data.reason, ticketId: data.ticketId || null,
      technicianId: data.technicianId || null, expectedEndDate: data.expectedEndDate, status: "active", reference,
    }, include: includeLoan });
    if (config.statuses.some(s => s.id === "assigned"))
      await tx.asset.update({ where: { id: asset.id }, data: { statusId: "assigned" } });
    return Response.json(loan);
  });
}

export function changeLoan(id: string, patch: z.infer<typeof updateLoan>, returnOnly = false) {
  return loanTransaction(async tx => {
    const target = await tx.assignment.findUnique({ where: { id }, select: { assetId: true } });
    if (!target) return failure("Mise à disposition introuvable.", 404);
    const asset = await lockAsset(tx, target.assetId);
    const loan = await tx.assignment.findUnique({ where: { id }, include: includeLoan });
    if (!loan || !asset) return failure("Mise à disposition introuvable.", 404);
    if (returnOnly && loan.status === "returned") return Response.json(loan);
    const { expectedUpdatedAt, ...data } = patch;
    if (expectedUpdatedAt && expectedUpdatedAt !== loan.updatedAt.toISOString()) return failure("La fiche a été modifiée. Rechargez-la.", 409);
    const status = data.status ?? loan.status;
    if (!open.includes(loan.status) && status !== loan.status) return failure("Ce prêt est clos.", 409);
    if (data.ticketId && !await tx.ticket.count({ where: { id: data.ticketId, domainId: loan.domainId } }))
      return failure("Ticket introuvable dans ce domaine.", 400);
    if (data.expectedEndDate && data.expectedEndDate < loan.startDate) return failure("Fin prévue antérieure au prêt.", 400);
    if (status === "returned") data.actualEndDate ??= loan.actualEndDate ?? new Date();
    if (data.actualEndDate && (data.actualEndDate < loan.startDate || open.includes(status)))
      return failure("Date de restitution incompatible avec le prêt.", 400);
    const updatedAt = new Date(Math.max(Date.now(), loan.updatedAt.getTime() + 1));
    const updated = await tx.assignment.update({ where: { id }, data: { ...data, updatedAt }, include: includeLoan });
    if (open.includes(loan.status) && !open.includes(status) && asset.statusId === "assigned" &&
        getDomainConfig(loan.domainId)?.statuses.some(s => s.id === "in_stock") &&
        !await tx.assignment.count({ where: { assetId: asset.id, status: { in: open } } }))
      await tx.asset.update({ where: { id: asset.id }, data: { statusId: "in_stock" } });
    return Response.json(updated);
  });
}
