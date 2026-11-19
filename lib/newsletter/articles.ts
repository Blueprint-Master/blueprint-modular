import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getPersonalModuleSession } from "@/lib/auth";

const publication = z.string().datetime({ offset: true, local: true }).refine(value => Number.isFinite(Date.parse(value)));
export const fields = {
  title: z.string().trim().min(1).max(500), content: z.string().max(500000),
  excerpt: z.string().trim().max(5000).nullable(),
  publishedAt: publication.nullable().transform(value => value ? new Date(value) : null),
};
export const revision = z.number().int().nonnegative().max(2147483647).optional();
export const select = { id: true, authorId: true, title: true, content: true, excerpt: true,
  publishedAt: true, archived: true, createdAt: true, updatedAt: true, revision: true,
  author: { select: { name: true, email: true } } } as const;
export type Context = { params: Promise<{ id: string }> };
export const error = (status: number, message: string) => Response.json({ error: message }, { status });

export async function access(ctx: Context) {
  const session = await getPersonalModuleSession();
  if (!session) return error(401, "Non autorisé");
  const { id } = await ctx.params;
  const article = await prisma.newsletterArticle.findFirst({ where: { id, authorId: session.user.id, removed: false }, select });
  return article ?? error(404, "Article introuvable");
}

export async function update(id: string, authorId: string, expected: number, data: Prisma.NewsletterArticleUpdateInput) {
  try {
    const article = await prisma.newsletterArticle.update({
      where: { id, authorId, revision: expected, removed: false }, data: { ...data, revision: { increment: 1 } }, select,
    });
    return Response.json(article);
  } catch (reason) {
    if (reason instanceof Prisma.PrismaClientKnownRequestError && reason.code === "P2025")
      return error(409, "Article modifié. Rechargez la version actuelle avant de reprendre votre modification.");
    throw reason;
  }
}
