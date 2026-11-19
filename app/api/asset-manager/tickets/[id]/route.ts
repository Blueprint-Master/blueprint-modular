import { ticketDetails, ticketEdit, ticketOptions } from "@/lib/asset-manager/ticket-input";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getPersonalModuleSession } from "@/lib/auth";
import { requireWriteRole } from "@/lib/asset-manager/authz";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }> | { id: string };

async function resolveParams(params: Params): Promise<{ id: string }> {
  return typeof (params as Promise<{ id: string }>)?.then === "function"
    ? await (params as Promise<{ id: string }>)
    : (params as { id: string });
}

export async function GET(_request: Request, context: { params: Promise<Awaited<Params>> }) {
  const result = await getPersonalModuleSession();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await resolveParams(context.params);
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      requester: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true, email: true } },
      asset: { select: { id: true, reference: true, label: true } },
    },
  });
  if (!ticket) return NextResponse.json({ error: "Ticket introuvable" }, { status: 404 });
  return NextResponse.json(ticket);
}

export async function PUT(request: Request, context: { params: Promise<Awaited<Params>> }) {
  const result = await getPersonalModuleSession();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const forbidden = requireWriteRole(result.user);
  if (forbidden) return forbidden;

  const { id } = await resolveParams(context.params);
  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) return NextResponse.json({ error: "Ticket introuvable" }, { status: 404 });

  const parsed = ticketEdit.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Champs du ticket invalides." }, { status: 400 });
  const { expectedUpdatedAt, ...data } = parsed.data;
  const conflict = () => NextResponse.json({ error: "Le ticket a changé. Rechargez la fiche." }, { status: 409 });
  if (expectedUpdatedAt && expectedUpdatedAt !== ticket.updatedAt.toISOString()) return conflict();
  if (data.categoryId && data.categoryId !== ticket.categoryId && data.subcategory === undefined) data.subcategory = null;
  const options = ticketOptions(ticket.domainId, { ...ticket, ...data });
  if (!options && [data.categoryId, data.typeId, data.priorityId, data.subcategory].some(value => value !== undefined))
    return NextResponse.json({ error: "Options inconnues dans ce domaine." }, { status: 400 });
  if (data.assetId && !await prisma.asset.count({ where: { id: data.assetId, domainId: ticket.domainId } }))
    return NextResponse.json({ error: "Actif introuvable dans ce domaine." }, { status: 400 });
  const now = new Date(Math.max(Date.now(), ticket.updatedAt.getTime() + 1));
  const status = data.status ?? ticket.status;
  const closed = status === "closed";
  const resolved = status === "resolved" || closed;
  try {
    const updated = await prisma.ticket.update({
      where: { id, updatedAt: ticket.updatedAt },
      data: { ...data, updatedAt: now,
        takenAt: ticket.takenAt ?? (["in_progress", "assigned", "on_hold", "resolved", "closed"].includes(status) ? now : null),
        resolvedAt: resolved ? ticket.resolvedAt ?? now : null, closedAt: closed ? ticket.closedAt ?? now : null,
        slaDueAt: options && (data.priorityId || !ticket.slaDueAt)
          ? new Date(ticket.openedAt.getTime() + options.priority.sla_hours * 3_600_000) : undefined },
      include: ticketDetails,
    });
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") return conflict();
      if (error.code === "P2003") return NextResponse.json({ error: "Actif ou technicien introuvable." }, { status: 400 });
    }
    throw error;
  }
}
