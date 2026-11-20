import { visibleWikiArticles } from "@/lib/wiki/visibility";
import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeSlug } from "@/lib/slug";
import archiver from "archiver";
import { Readable } from "node:stream";
import { articleMarkdown } from "@/lib/wiki/markdown-export";

const MAX_SLUGS = 100;

export async function GET(request: Request) {
  const result = await getSessionOrTestUser();
  const user = result?.user ?? null;
  const { searchParams } = new URL(request.url);
  const slugsParam = searchParams.get("slugs") ?? "";
  const slugs = [...new Set(slugsParam
    .split(",")
    .map((s) => normalizeSlug(s.trim()))
    .filter(Boolean))];
  if (slugs.length > MAX_SLUGS) return NextResponse.json({ error: "Sélection limitée à 100 articles" }, { status: 400 });
  if (slugs.length === 0) {
    return NextResponse.json({ error: "Paramètre slugs requis (ex: ?slugs=article1,article2)" }, { status: 400 });
  }

  const where = { slug: { in: slugs }, ...visibleWikiArticles(user?.id) };

  const articles = await prisma.wikiArticle.findMany({
    where,
    select: {
      title: true,
      slug: true,
      content: true,
      tags: true,
      excerpt: true,
      updatedAt: true,
      createdAt: true,
      isPublished: true,
      authorName: true,
    },
  });

  if (articles.length === 0) {
    return NextResponse.json({ error: "Aucun article trouvé pour les slugs demandés" }, { status: 404 });
  }

  if (articles.length !== slugs.length) return NextResponse.json({ error: "La sélection a changé" }, { status: 409 });

  const archive = archiver("zip", { zlib: { level: 9 } });
  const webStream = Readable.toWeb(archive) as ReadableStream;

  for (const article of articles) {
    const md = articleMarkdown(article);
    archive.append(md, { name: `${article.slug}.md` });
  }
  void archive.finalize().catch(reason => archive.destroy(reason));
  const filename = "wiki-export.zip";
  return new Response(webStream, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
