import { z } from "zod";
import type { WikiArticle } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeSlug } from "@/lib/slug";
import { visibleWikiArticles } from "./visibility";
import { countWords, extractWikiSlugs, readingTimeMinutes } from "@/lib/wiki-utils";

export const revisionNumber = z.number().int().min(0).max(2147483646);
export const articleEdit = z.object({
  revision: revisionNumber.optional(), title: z.string().trim().min(1).optional(),
  content: z.string().optional(), isPublished: z.boolean().optional(), pinned: z.boolean().optional(),
  excerpt: z.string().nullable().optional(), coverImage: z.string().nullable().optional(),
  template: z.string().nullable().optional(), tags: z.array(z.string()).optional(),
  changeNote: z.string().nullable().optional(),
});

export async function editArticle(article: WikiArticle, user: { id: string; name?: string | null }, edit: z.infer<typeof articleEdit>) {
  const { revision = article.revision, changeNote, ...data } = edit;
  const content = data.content ?? article.content;
  const plain = content.replace(/\s+/g, " ").trim();
  const excerpt = data.excerpt === undefined && data.content !== undefined && !article.excerpt
    ? plain.slice(0, 160) + (plain.length > 160 ? "…" : "") : data.excerpt;
  if (revision !== article.revision) return Response.json({ error: "Article modifié depuis la dernière lecture" }, { status: 409 });
  const saved = await prisma.$transaction(async tx => {
    const changed = await tx.wikiArticle.updateMany({
      where: { id: article.id, revision: article.revision },
      data: { ...data, excerpt, wordCount: countWords(content), readingTimeMinutes: readingTimeMinutes(content),
        lastRevisedBy: user.name ?? null, revision: { increment: 1 } },
    });
    if (!changed.count) return null;
    await tx.wikiRevision.create({ data: { articleId: article.id, content: article.content,
      title: article.title, authorId: user.id, authorName: user.name, changeNote } });
    const oldest = await tx.wikiRevision.findMany({ where: { articleId: article.id }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: 50, select: { id: true } });
    if (oldest.length) await tx.wikiRevision.deleteMany({ where: { id: { in: oldest.map(r => r.id) } } });
    const targets = await tx.wikiArticle.findMany({ where: { slug: { in: extractWikiSlugs(content).map(normalizeSlug) },
      id: { not: article.id }, ...visibleWikiArticles(user.id) }, select: { id: true } });
    await tx.wikiBacklink.deleteMany({ where: { sourceArticleId: article.id } });
    if (targets.length) await tx.wikiBacklink.createMany({ data: targets.map(t => ({ sourceArticleId: article.id, targetArticleId: t.id })) });
    return tx.wikiArticle.findUniqueOrThrow({ where: { id: article.id }, include: {
      author: { select: { name: true, email: true } },
      children: { where: visibleWikiArticles(user.id), select: { id: true, title: true, slug: true, excerpt: true, tags: true, pinned: true, isPublished: true } },
    } });
  });
  return saved ? Response.json(saved) : Response.json({ error: "Article modifié depuis la dernière lecture" }, { status: 409 });
}
