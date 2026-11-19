import { hasWriteRole } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import { knowledgeEdit, knowledgeVisibility } from "@/lib/asset-manager/knowledge";
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
  const article = await prisma.knowledgeArticle.findUnique({
    where: { id, ...knowledgeVisibility(result.user) },
  });
  if (!article) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
  return NextResponse.json({ ...article, canEdit: hasWriteRole(result.user) });
}

export async function PUT(request: Request, context: { params: Promise<Awaited<Params>> }) {
  const result = await getPersonalModuleSession();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const forbidden = requireWriteRole(result.user);
  if (forbidden) return forbidden;

  const { id } = await resolveParams(context.params);
  const existing = await prisma.knowledgeArticle.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });

  const parsed = knowledgeEdit.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Article invalide." }, { status: 400 });
  const { expectedUpdatedAt, publishedAt, ...patch } = parsed.data;
  const conflict = () => NextResponse.json({ error: "Article modifié. Rechargez la fiche." }, { status: 409 });
  if (expectedUpdatedAt && expectedUpdatedAt !== existing.updatedAt.toISOString()) return conflict();
  try {
    const updated = await prisma.knowledgeArticle.update({ where: { id, updatedAt: existing.updatedAt }, data: {
      ...patch, updatedAt: new Date(Math.max(Date.now(), existing.updatedAt.getTime() + 1)),
      publishedAt: publishedAt !== undefined ? publishedAt : patch.visibility === "public" ? existing.publishedAt ?? new Date() : undefined,
    } });
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") return conflict();
    throw error;
  }
}

export async function DELETE(request: Request, context: { params: Promise<Awaited<Params>> }) {
  const result = await getPersonalModuleSession();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const forbidden = requireWriteRole(result.user);
  if (forbidden) return forbidden;

  const { id } = await resolveParams(context.params);
  const version = new URL(request.url).searchParams.get("expectedUpdatedAt");
  if (version && !Number.isFinite(Date.parse(version))) return NextResponse.json({ error: "Version invalide" }, { status: 400 });
  const deleted = await prisma.knowledgeArticle.deleteMany({ where: { id, updatedAt: version ? new Date(version) : undefined } });
  if (!deleted.count && version) return NextResponse.json({ error: "Article modifié ou supprimé." }, { status: 409 });
  if (!deleted.count) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
