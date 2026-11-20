import { issueLoan, createLoan } from "@/lib/asset-manager/assignments";
import { readHistoryCursor, historyPage } from "@/lib/asset-manager/history-page";
import { NextResponse } from "next/server";
import { getPersonalModuleSession } from "@/lib/auth";
import { requireWriteRole } from "@/lib/asset-manager/authz";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const result = await getPersonalModuleSession();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const domainId = searchParams.get("domainId") ?? "";
  if (!domainId) return NextResponse.json({ error: "domainId requis" }, { status: 400 });

  const cursor = searchParams.get("cursor");
  const point = cursor ? readHistoryCursor(cursor) : null;
  if (cursor && !point) return NextResponse.json({ error: "Curseur invalide." }, { status: 400 });
  const assignments = await prisma.assignment.findMany({
    where: { domainId, OR: point ? [{ startDate: { lt: point.date } }, { startDate: point.date, id: { lt: point.id } }] : undefined },
    orderBy: [{ startDate: "desc" }, { id: "desc" }],
    take: 201,
    include: {
      asset: { select: { id: true, reference: true, label: true } },
      assignee: { select: { id: true, name: true } },
    },
  });
  return historyPage(assignments, 200, row => row.startDate);
}

export async function POST(request: Request) {
  const result = await getPersonalModuleSession();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const forbidden = requireWriteRole(result.user);
  if (forbidden) return forbidden;

  const parsed = createLoan.safeParse(await request.json().catch(() => null));
  return parsed.success ? issueLoan(parsed.data) : NextResponse.json({ error: "Vérifiez les champs du prêt." }, { status: 400 });
}
