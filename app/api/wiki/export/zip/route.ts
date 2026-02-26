import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeSlug } from "@/lib/slug";
import archiver from "archiver";
import { PassThrough, Readable } from "stream";

const MAX_SLUGS = 100;

/** Construit le frontmatter YAML (échappement basique pour valeurs entre guillemets). */
function toYamlValue(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(v);
  if (Array.isArray(v)) return v.map((item) => `  - ${toYamlValue(item)}`).join("\n");
  const s = String(v);
  if (s.includes("\n") || s.includes('"') || s.includes(":")) return `"${s.replace(/"/g, '\\"')}"`;
  return s;
}

/** Markdown avec frontmatter YAML pour un article. */
function toMarkdownWithFrontmatter(article: {
  title: string;
  slug: string;
  content: string;
  tags: string[];
  excerpt: string | null;
  updatedAt: Date;
  createdAt: Date;
  isPublished: boolean;
  authorName: string | null;
}): string {
  const lines = [
    "---",
    `title: ${toYamlValue(article.title)}`,
    `slug: ${toYamlValue(article.slug)}`,
    `updatedAt: ${toYamlValue(article.updatedAt.toISOString())}`,
    `createdAt: ${toYamlValue(article.createdAt.toISOString())}`,
    `isPublished: ${article.isPublished}`,
    ...(article.authorName ? [`authorName: ${toYamlValue(article.authorName)}`] : []),
    ...(article.excerpt ? [`excerpt: ${toYamlValue(article.excerpt)}`] : []),
    ...(article.tags.length ? [`tags:\n${article.tags.map((t) => `  - ${toYamlValue(t)}`).join("\n")}`] : []),
    "---",
    "",
    article.content || "",
  ];
  return lines.join("\n");
}

export async function GET(request: Request) {
  const result = await getSessionOrTestUser();
  const user = result?.user ?? null;
  const { searchParams } = new URL(request.url);
  const slugsParam = searchParams.get("slugs") ?? "";
  const slugs = slugsParam
    .split(",")
    .map((s) => normalizeSlug(s.trim()))
    .filter(Boolean)
    .slice(0, MAX_SLUGS);
  if (slugs.length === 0) {
    return NextResponse.json({ error: "Paramètre slugs requis (ex: ?slugs=article1,article2)" }, { status: 400 });
  }

  const where = user
    ? { slug: { in: slugs }, OR: [{ isPublished: true }, { authorId: user.id }] }
    : { slug: { in: slugs }, isPublished: true };

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

  const archive = archiver("zip", { zlib: { level: 9 } });
  const pass = new PassThrough();
  archive.pipe(pass);

  for (const article of articles) {
    const md = toMarkdownWithFrontmatter(article);
    archive.append(md, { name: `${article.slug}.md` });
  }
  await archive.finalize();

  const webStream = Readable.toWeb(pass) as ReadableStream;
  const filename = "wiki-export.zip";
  return new Response(webStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
