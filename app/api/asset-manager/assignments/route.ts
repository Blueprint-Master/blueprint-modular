import { issueLoan, createLoan } from "@/lib/asset-manager/assignments";
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

  const assignments = await prisma.assignment.findMany({
    where: { domainId },
    orderBy: [{ startDate: "desc" }],
    take: 200,
    include: {
      asset: { select: { id: true, reference: true, label: true } },
      assignee: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json(assignments);
}

export async function POST(request: Request) {
  const result = await getPersonalModuleSession();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const forbidden = requireWriteRole(result.user);
  if (forbidden) return forbidden;

  const parsed = createLoan.safeParse(await request.json().catch(() => null));
  return parsed.success ? issueLoan(parsed.data) : NextResponse.json({ error: "Vérifiez les champs du prêt." }, { status: 400 });
}
