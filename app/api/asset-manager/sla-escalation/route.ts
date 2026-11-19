import { NextResponse } from "next/server";
import { getPersonalModuleSession } from "@/lib/auth";
import { ticketSla, openTicketStatuses } from "@/lib/asset-manager/ticket-sla";
import { prisma } from "@/lib/prisma";
import { getDomainConfig } from "@/lib/asset-manager/get-domain-config";

export const dynamic = "force-dynamic";

/**
 * GET ?domainId=it
 * Retourne les tickets ouverts en danger ou dépassement SLA (≥80% du temps consommé).
 * Utilisable par un job planifié (cron) pour notifications / escalade.
 */
export async function GET(request: Request) {
  const result = await getPersonalModuleSession();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const domainId = searchParams.get("domainId");
  if (!domainId || !getDomainConfig(domainId)) {
    return NextResponse.json({ error: "domainId invalide" }, { status: 400 });
  }

  const config = getDomainConfig(domainId);
  const priorities = config?.priorities ?? [];
  const now = Date.now();

  const tickets = await prisma.ticket.findMany({
    where: { domainId, status: { in: openTicketStatuses } },
    select: {
      id: true,
      reference: true,
      title: true,
      status: true,
      priorityId: true,
      openedAt: true,
      slaDueAt: true,
    },
    orderBy: [{ openedAt: "asc" }, { id: "asc" }],
  });

  const atRisk = tickets.map(ticket => ({ ticket, sla: ticketSla(ticket, priorities, now) })).filter(row => row.sla.atRisk);

  return NextResponse.json({
    domainId,
    checkedAt: new Date(now).toISOString(),
    totalOpen: tickets.length,
    atRiskCount: atRisk.length,
    atRisk: atRisk.map(({ ticket: t, sla }) => ({
      slaDueAt: new Date(sla.due), overdue: sla.overdue,
      id: t.id,
      reference: t.reference,
      title: t.title,
      status: t.status,
      priorityId: t.priorityId,
      openedAt: t.openedAt,
    })),
  });
}
