import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { access, error, fields, revision, update, type Context } from "@/lib/newsletter/articles";

export const dynamic = "force-dynamic";
const edit = z.object({ ...fields, archived: z.boolean() }).partial().extend({ revision }).strict()
  .refine(value => Object.keys(value).some(key => key !== "revision"));

export async function GET(_: Request, ctx: Context) {
  const article = await access(ctx);
  return article instanceof Response ? article : Response.json(article);
}
export async function PUT(request: Request, ctx: Context) {
  const article = await access(ctx);
  if (article instanceof Response) return article;
  const input = edit.safeParse(await request.json().catch(() => null));
  if (!input.success) return error(400, "Champs de l’article invalides");
  const { revision, ...data } = input.data;
  return update(article.id, article.authorId, revision ?? article.revision, data);
}
export async function DELETE(request: Request, ctx: Context) {
  const article = await access(ctx);
  if (article instanceof Response) return article;
  const raw = new URL(request.url).searchParams.get("revision");
  if (raw !== null && (!/^\d+$/.test(raw) || Number(raw) > 2147483647)) return error(400, "Révision invalide");
  const removed = await prisma.newsletterArticle.updateMany({ where: {
    id: article.id, authorId: article.authorId, removed: false, revision: raw === null ? article.revision : Number(raw),
  }, data: { removed: true, title: "", content: "", excerpt: null, publishedAt: null, revision: { increment: 1 } } });
  return removed.count ? Response.json({ ok: true }) : error(409, "Article modifié. Rechargez la liste.");
}
