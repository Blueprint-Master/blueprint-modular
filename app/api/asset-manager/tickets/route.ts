import { NextResponse } from "next/server";
import { getPersonalModuleSession } from "@/lib/auth";
import { requireWriteRole } from "@/lib/asset-manager/authz";
import { prisma } from "@/lib/prisma";
import { nextInventoryReference } from "@/lib/asset-manager/numbering";
import { ticketDetails, ticketInput, ticketOptions } from "@/lib/asset-manager/ticket-input";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const result = await getPersonalModuleSession();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const domainId = searchParams.get("domainId") ?? "";
  if (!domainId) return NextResponse.json({ error: "domainId requis" }, { status: 400 });

  const tickets = await prisma.ticket.findMany({
    where: { domainId },
    orderBy: [{ openedAt: "desc" }],
    take: 200,
    include: {
      requester: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true } },
      asset: { select: { id: true, reference: true, label: true } },
    },
  });
  return NextResponse.json(tickets);
}

export async function POST(request: Request) {
  const result = await getPersonalModuleSession();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const forbidden = requireWriteRole(result.user);
  if (forbidden) return forbidden;

  const input = ticketInput.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Vérifiez les champs du ticket." }, { status: 400 });
  const data = input.data;
  const options = ticketOptions(data.domainId, data);
  if (!options) return NextResponse.json({ error: "Options inconnues dans ce domaine." }, { status: 400 });
  return prisma.$transaction(async tx => {
    if (data.assetId && !await tx.asset.count({ where: { id: data.assetId, domainId: data.domainId } }))
      return NextResponse.json({ error: "Actif introuvable dans ce domaine." }, { status: 400 });
    const openedAt = new Date();
    const reference = await nextInventoryReference(tx, "Ticket", `${options.prefix}-${openedAt.getFullYear()}-`);
    const ticket = await tx.ticket.create({ data: {
      domainId: data.domainId, title: data.title, description: data.description, reference,
      status: "new", typeId: options.typeId, priorityId: options.priority.id, categoryId: options.categoryId,
      assetId: data.assetId, subcategory: data.subcategory, requesterId: result.user.id, openedAt,
      slaDueAt: new Date(openedAt.getTime() + options.priority.sla_hours * 3_600_000),
    }, include: ticketDetails });
    return NextResponse.json(ticket);
  });
}
