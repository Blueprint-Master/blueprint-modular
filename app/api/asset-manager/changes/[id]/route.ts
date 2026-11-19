import { changeEdit } from "@/lib/asset-manager/change-input";
import { editChange } from "@/lib/asset-manager/change-workflow";
import { NextResponse } from "next/server";
import { getPersonalModuleSession, hasWriteRole } from "@/lib/auth";
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
  const change = await prisma.changeRequest.findUnique({ where: { id } });
  if (!change) return NextResponse.json({ error: "Demande de changement introuvable" }, { status: 404 });
  return NextResponse.json({ ...change, canEdit: hasWriteRole(result.user), viewerId: result.user.id });
}

export async function PUT(request: Request, context: { params: Promise<Awaited<Params>> }) {
  const result = await getPersonalModuleSession();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const forbidden = requireWriteRole(result.user);
  if (forbidden) return forbidden;

  const { id } = await resolveParams(context.params);
  const parsed = changeEdit.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  return editChange(id, result.user.id, parsed.data);
}

export async function DELETE(_request: Request, context: { params: Promise<Awaited<Params>> }) {
  const result = await getPersonalModuleSession();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const forbidden = requireWriteRole(result.user);
  if (forbidden) return forbidden;

  const { id } = await resolveParams(context.params);
  const existing = await prisma.changeRequest.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Demande de changement introuvable" }, { status: 404 });
  if (existing.status !== "draft") return NextResponse.json({ error: "Seul un brouillon peut être supprimé." }, { status: 409 });
  const deleted = await prisma.changeRequest.deleteMany({ where: { id, status: "draft", updatedAt: existing.updatedAt } });
  if (!deleted.count) return NextResponse.json({ error: "La demande a été modifiée." }, { status: 409 });
  return NextResponse.json({ ok: true });
}
