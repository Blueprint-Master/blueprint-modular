import { z } from "zod";
import { editArticle, revisionNumber } from "@/lib/wiki/edit";
import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeSlug } from "@/lib/slug";


type Params = Promise<{ slug: string }> | { slug: string };

async function resolveParams(params: Params): Promise<{ slug: string }> {
  return typeof (params as Promise<{ slug: string }>)?.then === "function"
    ? await (params as Promise<{ slug: string }>)
    : (params as { slug: string });
}

export async function POST(
  request: Request,
  context: { params: Promise<Awaited<Params>> }
) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user } = result;
  const { slug: rawSlug } = await resolveParams(context.params);
  const slug = normalizeSlug(rawSlug);
  const parsed = z.object({ revisionId: z.string().trim().min(1), revision: revisionNumber.optional(), changeNote: z.string().optional() })
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid revision" }, { status: 400 });
  const { revisionId } = parsed.data;

  const article = await prisma.wikiArticle.findFirst({
    where: { slug, authorId: user.id },

  });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const revision = await prisma.wikiRevision.findFirst({
    where: { id: revisionId, articleId: article.id },
    select: { content: true, title: true },
  });
  if (!revision) return NextResponse.json({ error: "Revision not found" }, { status: 404 });

  return editArticle(article, user, { content: revision.content, title: revision.title || article.title,
    revision: parsed.data.revision, changeNote: parsed.data.changeNote || "Restauration" });
}
