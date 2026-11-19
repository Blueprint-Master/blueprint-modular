import { createHash } from "node:crypto";
import { z } from "zod";
import { fields, select, error } from "@/lib/newsletter/articles";
import { NextResponse } from "next/server";
import { getPersonalModuleSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const result = await getPersonalModuleSession();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const archived = searchParams.get("archived"); // "true" | "false" | omit = all
  const sortBy = searchParams.get("sortBy") || "updatedAt";
  const sortOrder = searchParams.get("sortOrder")?.toLowerCase() === "asc" ? "asc" : "desc";

  const where: { authorId: string; archived?: boolean; removed: boolean } = { authorId: result.user.id, removed: false };
  if (archived === "true") where.archived = true;
  else if (archived === "false") where.archived = false;

  const orderByKey = sortBy === "publishedAt" ? "publishedAt" : sortBy === "createdAt" ? "createdAt" : "updatedAt";
  const articles = await prisma.newsletterArticle.findMany({
    where,
    orderBy: { [orderByKey]: sortOrder },
    select,
  });
  return NextResponse.json(articles);
}

const addition = z.object({ ...fields, content: fields.content.default(""), excerpt: fields.excerpt.default(null),
  publishedAt: fields.publishedAt.optional(), requestId: z.string().uuid().optional() }).strict();

export async function POST(request: Request) {
  const session = await getPersonalModuleSession();
  if (!session) return error(401, "Non autorisé");
  const parsed = addition.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return error(400, "Titre, contenu, extrait ou date de publication invalide");
  const authorId = session.user.id;
  const { requestId, title, content, excerpt, publishedAt } = parsed.data;
  const data = { authorId, title, content, excerpt, publishedAt: publishedAt ?? null };
  if (!requestId) return Response.json(await prisma.newsletterArticle.create({ data, select }), { status: 201 });
  const creationDigest = createHash("sha256").update(JSON.stringify(data)).digest("hex");
  return prisma.$transaction(async tx => {
    const created = await tx.newsletterArticle.createMany({ data: { ...data, requestId, creationDigest }, skipDuplicates: true });
    const article = await tx.newsletterArticle.findFirst({ where: { authorId, requestId, creationDigest, removed: false }, select });
    return article ? Response.json(article, { status: created.count ? 201 : 200 }) : error(409, "Clé de création déjà utilisée");
  });
}
