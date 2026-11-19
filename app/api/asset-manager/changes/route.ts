import type { Prisma } from "@prisma/client";
import { parseCalendarDate } from "@/lib/calendar/event-input";
import { NextResponse } from "next/server";
import { getPersonalModuleSession } from "@/lib/auth";
import { requireWriteRole } from "@/lib/asset-manager/authz";
import { prisma } from "@/lib/prisma";
import { getDomainConfig } from "@/lib/asset-manager/get-domain-config";
import { changeInput } from "@/lib/asset-manager/change-input";
import { nextInventoryReference } from "@/lib/asset-manager/numbering";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const result = await getPersonalModuleSession();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const domainId = searchParams.get("domainId");
  const status = searchParams.get("status");

  if (!domainId || !getDomainConfig(domainId)) {
    return NextResponse.json({ error: "domainId invalide" }, { status: 400 });
  }

  const where: Prisma.ChangeRequestWhereInput = { domainId };
  const month = searchParams.get("month");
  if (month !== null) {
    const start = parseCalendarDate(month + "-01");
    if (!/^\d{4}-\d{2}$/.test(month) || !start) return NextResponse.json({ error: "Mois invalide." }, { status: 400 });
    const end = new Date(start);
    end.setUTCMonth(end.getUTCMonth() + 1);
    where.plannedStart = { lt: end };
    where.OR = [{ plannedEnd: { gte: start } }, { plannedEnd: null, plannedStart: { gte: start } }];
  }
  if (status) where.status = status;

  const changes = await prisma.changeRequest.findMany({
    where,
    orderBy: [{ plannedStart: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(changes);
}

export async function POST(request: Request) {
  const result = await getPersonalModuleSession();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const forbidden = requireWriteRole(result.user);
  if (forbidden) return forbidden;

  const parsed = changeInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const body = parsed.data;
  if (!getDomainConfig(body.domainId)) return NextResponse.json({ error: "Domaine invalide." }, { status: 400 });
  return prisma.$transaction(async tx => {
    const domainId = body.domainId;
    if (body.assetsImpacted.length && await tx.asset.count({ where: { domainId, id: { in: body.assetsImpacted } } }) !== body.assetsImpacted.length) {
      return NextResponse.json({ error: "Actif introuvable dans ce domaine." }, { status: 400 });
    }
    if (body.ticketsLinked.length && await tx.ticket.count({ where: { domainId, id: { in: body.ticketsLinked } } }) !== body.ticketsLinked.length) {
      return NextResponse.json({ error: "Ticket introuvable dans ce domaine." }, { status: 400 });
    }
    const reference = await nextInventoryReference(tx, "ChangeRequest", `CHG-${new Date().getFullYear()}-`);
    const change = await tx.changeRequest.create({ data: {
      domainId, reference, type: body.type, riskLevel: body.riskLevel, status: "draft", title: body.title,
      description: body.description, impact: body.impact, rollbackPlan: body.rollbackPlan, requesterId: result.user.id,
      plannedStart: body.plannedStart, plannedEnd: body.plannedEnd,
      assetsImpacted: body.assetsImpacted.length ? JSON.stringify(body.assetsImpacted) : null,
      ticketsLinked: body.ticketsLinked.length ? JSON.stringify(body.ticketsLinked) : null,
    } });
    return NextResponse.json(change);
  });
}
