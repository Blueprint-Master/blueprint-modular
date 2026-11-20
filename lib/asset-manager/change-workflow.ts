import type { ChangeRequest, Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { changeEdit } from "./change-input";
import { changeSteps, changeApprovals } from "./change-status";
import { getDomainConfig } from "./get-domain-config";

const failure = (error: string, status: number) => Response.json({ error }, { status });
type Tx = Prisma.TransactionClient;

export async function checkChangeLinks(tx: Tx, domainId: string, assets?: string[], tickets?: string[]) {
  if (assets?.length && await tx.asset.count({ where: { domainId, id: { in: assets } } }) !== assets.length)
    return failure("Actif introuvable dans ce domaine.", 400);
  if (tickets?.length && await tx.ticket.count({ where: { domainId, id: { in: tickets } } }) !== tickets.length)
    return failure("Ticket introuvable dans ce domaine.", 400);
  return null;
}

async function withChange(id: string, work: (tx: Tx, row: ChangeRequest) => Promise<Response>) {
  return prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT id FROM "ChangeRequest" WHERE id = ${id} FOR UPDATE`;
    const change = await tx.changeRequest.findUnique({ where: { id } });
    return change ? work(tx, change) : failure("Demande de changement introuvable.", 404);
  });
}

async function electorate(tx: Tx, type: string, domainId: string) {
  const members = await tx.user.findMany({ where: { role: { in: ["ADMIN", "OWNER"] } }, select: { id: true }, orderBy: { id: "asc" } });
  const mode = getDomainConfig(domainId)?.change_management?.approval_mode;
  const votes = type === "emergency" ? 1 : mode === "majority" ? Math.floor(members.length / 2) + 1 : members.length;
  return { cabElectorate: members.map(member => member.id), cabRequiredVotes: votes };
}

async function save(tx: Tx, change: ChangeRequest, actor: string, data: Prisma.ChangeRequestUpdateInput, event: string, comment?: string) {
  const updated = await tx.changeRequest.update({ where: { id: change.id }, data: {
    ...data, updatedAt: new Date(Math.max(Date.now(), change.updatedAt.getTime() + 1)),
  } });
  await tx.auditLog.create({ data: {
    domainId: change.domainId, userId: actor, action: "update", resourceType: "change", resourceId: change.id,
    beforeState: JSON.stringify({ status: change.status, round: change.cabRound }),
    afterState: JSON.stringify({ status: updated.status, round: updated.cabRound, event, comment }),
    changedFields: Object.keys(data),
  } });
  return Response.json(updated);
}

export function editChange(id: string, actor: string, input: z.infer<typeof changeEdit>) {
  return withChange(id, async (tx, row) => {
    const { expectedUpdatedAt, assetsImpacted, ticketsLinked, ...fields } = input;
    if (expectedUpdatedAt && expectedUpdatedAt !== row.updatedAt.toISOString()) return failure("La demande a été modifiée. Rechargez la fiche.", 409);
    const to = fields.status ?? row.status;
    if (to !== row.status && !(changeSteps[row.status] ?? ["draft"]).includes(to))
      return failure("Transition indisponible depuis cet état.", 409);
    const scopeFields = ["type", "riskLevel", "rollbackPlan", "impact", "title", "description", "assetsImpacted", "ticketsLinked"];
    if (!["draft", "submitted"].includes(row.status) && to !== "draft" && scopeFields.some(key => key in input))
      return failure("Repassez en brouillon avant de changer le périmètre soumis au comité.", 409);
    const invalid = await checkChangeLinks(tx, row.domainId, assetsImpacted, ticketsLinked);
    if (invalid) return invalid;
    const data: Prisma.ChangeRequestUpdateInput = { ...fields };
    if (assetsImpacted !== undefined) data.assetsImpacted = assetsImpacted.length ? JSON.stringify(assetsImpacted) : null;
    if (ticketsLinked !== undefined) data.ticketsLinked = ticketsLinked.length ? JSON.stringify(ticketsLinked) : null;
    const next = { ...row, ...fields };
    if (next.plannedStart && next.plannedEnd && next.plannedStart > next.plannedEnd) return failure("La fin prévue précède le début.", 400);
    if (to === "scheduled" && !next.plannedStart) return failure("Une date de début est nécessaire pour planifier.", 400);
    if (to === "in_progress" && to !== row.status) data.actualStart = next.actualStart ?? new Date();
    if (["completed", "failed"].includes(to) && fields.success !== undefined && fields.success !== (to === "completed"))
      return failure("Le résultat doit correspondre au statut final.", 400);
    if (["completed", "failed"].includes(row.status) && to === row.status && (fields.actualStart === null || fields.actualEnd === null))
      return failure("Les dates réelles doivent être conservées.", 400);
    if ((to === "completed" || to === "failed") && to !== row.status) {
      data.actualEnd = next.actualEnd ?? new Date();
      data.success = to === "completed";
    }
    const start = data.actualStart instanceof Date ? data.actualStart : next.actualStart;
    const end = data.actualEnd instanceof Date ? data.actualEnd : next.actualEnd;
    if (start && end && start > end) return failure("La fin réelle précède le début.", 400);
    if (row.status !== to && to === "draft") {
      Object.assign(data, { cabElectorate: [], cabRequiredVotes: null, cabReviewerIds: null, cabRejections: [],
        actualStart: null, actualEnd: null, success: null });
    }
    if (row.status !== to && to === "cab_review") {
      const standard = getDomainConfig(row.domainId)?.change_management?.standard_change_types ?? [];
      if (next.type === "standard" && next.riskLevel === "low" && standard.includes(next.title)) {
        data.status = "approved";
        return save(tx, row, actor, data, "standard_preapproved");
      }
      const review = await electorate(tx, next.type, row.domainId);
      if (!review.cabElectorate.length) return failure("Aucun membre du comité disponible.", 409);
      Object.assign(data, review, { cabRound: row.cabRound + 1, cabReviewerIds: "[]", cabRejections: [] });
      if (next.type === "emergency") {
        await tx.notification.createMany({ data: review.cabElectorate.map(userId => ({
          userId, type: "warning", level: 2, title: row.reference, message: "Revue urgente du changement : " + next.title,
        })) });
      }
    }
    return save(tx, row, actor, data, "edit");
  });
}

export const ballotInput = z.object({ round: z.number().int().nonnegative().optional(), comment: z.string().trim().nullish() });
export function voteChange(id: string, actor: string, approve: boolean, ballot: z.infer<typeof ballotInput>) {
  return withChange(id, async (tx, row) => {
    if (ballot.round !== undefined && ballot.round !== row.cabRound) return failure("Ce tour de vote est clos.", 409);
    const recorded = changeApprovals(row.cabReviewerIds);
    if (row.status !== "cab_review") {
      if (["approved", "rejected"].includes(row.status) && (approve ? recorded : row.cabRejections).includes(actor))
        return Response.json(row);
      return failure("La demande doit être en revue CAB.", 409);
    }
    const review = row.cabElectorate.length ? row : await electorate(tx, row.type, row.domainId);
    if (!review.cabElectorate.includes(actor)) return failure("Vous ne participez pas à ce tour de vote.", 403);
    const yes = recorded.filter(id => review.cabElectorate.includes(id));
    const no = row.cabRejections.filter(id => review.cabElectorate.includes(id));
    if ((approve ? no : yes).includes(actor)) return failure("Votre décision a déjà été enregistrée.", 409);
    const votes = approve ? yes : no;
    if (!votes.includes(actor)) votes.push(actor);
    else if (row.cabElectorate.length) return Response.json(row);
    const needed = review.cabRequiredVotes ?? review.cabElectorate.length;
    const status = yes.length >= needed ? "approved" : no.length > review.cabElectorate.length - needed ? "rejected" : "cab_review";
    return save(tx, row, actor, {
      status, cabElectorate: review.cabElectorate, cabRequiredVotes: needed, cabReviewerIds: JSON.stringify(yes),
      cabRejections: no, implementationNotes: !approve && ballot.comment ? ballot.comment : undefined,
    }, approve ? "vote_approve" : "vote_reject", ballot.comment);
  });
}
