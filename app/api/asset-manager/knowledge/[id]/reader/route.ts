import { z } from "zod";
import { getPersonalModuleSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { knowledgeVisibility } from "@/lib/asset-manager/knowledge";

const feedback = z.object({ helpful: z.boolean().nullable().optional() });
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await getPersonalModuleSession();
  if (!actor) return Response.json({ error: "Non autorisé" }, { status: 401 });
  const parsed = feedback.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Avis invalide" }, { status: 400 });
  const { id } = await params;
  return prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT id FROM "KnowledgeArticle" WHERE id = ${id} FOR UPDATE`;
    const article = await tx.knowledgeArticle.findFirst({ where: { id, ...knowledgeVisibility(actor.user) } });
    if (!article) return Response.json({ error: "Article introuvable" }, { status: 404 });
    const key = { articleId: id, userId: actor.user.id };
    const where = { articleId_userId: key };
    const old = await tx.knowledgeReader.findUnique({ where });
    const helpful = parsed.data.helpful === undefined ? old?.helpful ?? null : parsed.data.helpful;
    const counts = {
      viewsCount: article.viewsCount + (old ? 0 : 1),
      helpfulCount: article.helpfulCount + Number(helpful === true) - Number(old?.helpful === true),
      notHelpfulCount: article.notHelpfulCount + Number(helpful === false) - Number(old?.helpful === false),
    };
    if (!old || old.helpful !== helpful) {
      await tx.knowledgeReader.upsert({ where, create: { ...key, helpful }, update: { helpful } });
      await tx.knowledgeArticle.update({ where: { id }, data: { ...counts, updatedAt: article.updatedAt } });
    }
    return Response.json({ helpful, ...counts });
  });
}
