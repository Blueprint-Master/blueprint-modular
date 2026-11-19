import { updateLoan, changeLoan } from "@/lib/asset-manager/assignments";
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
  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: {
      asset: { select: { id: true, reference: true, label: true } },
      assignee: { select: { id: true, name: true, email: true } },
      technician: { select: { id: true, name: true } },
      ticket: { select: { id: true, reference: true, title: true } },
    },
  });
  if (!assignment) return NextResponse.json({ error: "Mise à disposition introuvable" }, { status: 404 });
  return NextResponse.json(assignment);
}

export async function PUT(request: Request, context: { params: Promise<Awaited<Params>> }) {
  const result = await getPersonalModuleSession();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const forbidden = requireWriteRole(result.user);
  if (forbidden) return forbidden;

  const { id } = await resolveParams(context.params);
  const parsed = updateLoan.safeParse(await request.json().catch(() => null));
  return parsed.success ? changeLoan(id, parsed.data) : NextResponse.json({ error: "Vérifiez les champs du prêt." }, { status: 400 });
}
