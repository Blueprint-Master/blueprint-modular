import { visibleWikiArticles } from "@/lib/wiki/visibility";
import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeSlug } from "@/lib/slug";
import { articleEdit, editArticle } from "@/lib/wiki/edit";



type Params = Promise<{ slug: string }> | { slug: string };

async function resolveParams(params: Params): Promise<{ slug: string }> {
  return typeof (params as Promise<{ slug: string }>)?.then === "function"
    ? await (params as Promise<{ slug: string }>)
    : (params as { slug: string });
}

export async function GET(
  request: Request,
  context: { params: Promise<Awaited<Params>> }
) {
  const result = await getSessionOrTestUser();
  const user = result?.user ?? null;
  const { slug: rawSlug } = await resolveParams(context.params);
  const slug = normalizeSlug(rawSlug);
  const { searchParams } = new URL(request.url);
  const incView = searchParams.get("incView") === "1";

  const article = await prisma.wikiArticle.findFirst({
    where: { slug, ...visibleWikiArticles(user?.id) },
    include: {
      author: { select: { name: true, email: true } },
      children: { where: visibleWikiArticles(user?.id), select: { id: true, title: true, slug: true, excerpt: true, tags: true, pinned: true, isPublished: true } },
    },
  });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (incView) {
    await prisma.wikiArticle.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    });
  }

  const siblings = await prisma.wikiArticle.findMany({
    where: {
      parentId: article.parentId,
      ...visibleWikiArticles(user?.id),
    },
    orderBy: { title: "asc" },
    select: { slug: true },
  });
  const idx = siblings.findIndex((s) => s.slug === article.slug);
  const prevSlug = idx > 0 ? siblings[idx - 1]?.slug ?? null : null;
  const nextSlug = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1]?.slug ?? null : null;

  const canEdit = !!user && (article.authorId === user.id || user.role === "ADMIN" || user.role === "OWNER");
  const payload = {
    ...article,
    ...(incView ? { viewCount: article.viewCount + 1 } : {}),
    prevSlug: prevSlug ?? undefined,
    nextSlug: nextSlug ?? undefined,
    canEdit,
  };
  return NextResponse.json(payload);
}

export async function PUT(
  request: Request,
  context: { params: Promise<Awaited<Params>> }
) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user } = result;
  const { slug: rawSlug } = await resolveParams(context.params);
  const slug = normalizeSlug(rawSlug);
  const article = await prisma.wikiArticle.findFirst({ where: { slug } });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const canEdit = article.authorId === user.id || user.role === "ADMIN" || user.role === "OWNER";
  if (!canEdit) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const edit = articleEdit.safeParse(await request.json().catch(() => null));
  if (!edit.success) return NextResponse.json({ error: "Champs invalides" }, { status: 400 });
  return editArticle(article, user, edit.data);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<Awaited<Params>> }
) {
  return PUT(request, context);
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<Awaited<Params>> }
) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user } = result;
  const { slug: rawSlug } = await resolveParams(context.params);
  const slug = normalizeSlug(rawSlug);
  const article = await prisma.wikiArticle.findFirst({ where: { slug } });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const canDelete = article.authorId === user.id || user.role === "ADMIN" || user.role === "OWNER";
  if (!canDelete) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await prisma.wikiArticle.delete({ where: { id: article.id } });
  return new NextResponse(null, { status: 204 });
}
