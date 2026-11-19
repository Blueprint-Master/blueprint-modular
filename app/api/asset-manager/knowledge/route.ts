import type { Prisma } from "@prisma/client";
import { knowledgeInput, knowledgeVisibility } from "@/lib/asset-manager/knowledge";
import { getDomainConfig } from "@/lib/asset-manager/get-domain-config";
import { NextResponse } from "next/server";
import { getPersonalModuleSession, hasWriteRole } from "@/lib/auth";
import { requireWriteRole } from "@/lib/asset-manager/authz";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function slugify(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "article";
}

export async function GET(request: Request) {
  const result = await getPersonalModuleSession();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const domainId = searchParams.get("domainId");
  const categoryId = searchParams.get("categoryId");
  const assetTypeId = searchParams.get("assetTypeId");
  const tag = searchParams.get("tag");

  if (!domainId) return NextResponse.json({ error: "domainId requis" }, { status: 400 });

  const where: Prisma.KnowledgeArticleWhereInput = { domainId, ...knowledgeVisibility(result.user) };
  const ticketCategory = searchParams.get("ticketCategoryId");
  if (ticketCategory) where.OR = [
    { sourceTicket: { domainId, categoryId: ticketCategory } }, { categoryId: ticketCategory },
  ];
  const query = searchParams.get("q")?.trim();
  if (query) where.AND = [{ OR: [
    { title: { contains: query, mode: "insensitive" } },
    { content: { contains: query, mode: "insensitive" } },
    { tags: { has: query } },
  ] }];
  if (categoryId) where.categoryId = categoryId;
  if (assetTypeId) where.assetTypeId = assetTypeId;
  if (tag) where.tags = { has: tag };

  const articles = await prisma.knowledgeArticle.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: ticketCategory ? 5 : undefined,
    select: {
      id: true,
      title: true,
      slug: true,
      categoryId: true,
      assetTypeId: true,
      tags: true,
      visibility: true,
      publishedAt: true,
      viewsCount: true,
      helpfulCount: true,
      notHelpfulCount: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return NextResponse.json(articles, { headers: { "X-Can-Edit": String(hasWriteRole(result.user)) } });
}

export async function POST(request: Request) {
  const result = await getPersonalModuleSession();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const forbidden = requireWriteRole(result.user);
  if (forbidden) return forbidden;

  const parsed = knowledgeInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !getDomainConfig(parsed.data.domainId)) return NextResponse.json({ error: "Champs de l’article invalides." }, { status: 400 });
  const data = parsed.data;
  const base = slugify(data.title);
  return prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtextextended(${"knowledge:" + data.domainId}, 0))`;
    if (data.sourceTicketId && !await tx.ticket.count({ where: { id: data.sourceTicketId, domainId: data.domainId, status: { in: ["resolved", "closed"] } } }))
      return NextResponse.json({ error: "Ticket résolu introuvable dans ce domaine." }, { status: 400 });
    const matches = await tx.knowledgeArticle.findMany({ where: { domainId: data.domainId, slug: { startsWith: base } }, select: { slug: true } });
    const used = new Set(matches.map(row => row.slug));
    let slug = base;
    for (let i = 1; used.has(slug); i++) slug = `${base}-${i}`;
    const article = await tx.knowledgeArticle.create({ data: {
      domainId: data.domainId, title: data.title, content: data.content, categoryId: data.categoryId,
      sourceTicketId: data.sourceTicketId, visibility: data.visibility, assetTypeId: data.assetTypeId, tags: data.tags,
      createdById: result.user.id, slug, publishedAt: data.visibility === "public" ? new Date() : null,
    } });
    return NextResponse.json(article);
  });
}
