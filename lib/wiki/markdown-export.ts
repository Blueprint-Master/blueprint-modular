interface ExportArticle {
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  createdAt?: Date | string;
  updatedAt: Date | string;
  authorName?: string | null;
  excerpt?: string | null;
  tags?: string[];
}

/** JSON-quoted scalars and arrays are valid YAML and retain their original types. */
export function articleMarkdown(article: ExportArticle) {
  const metadata = {
    title: article.title, slug: article.slug, updatedAt: article.updatedAt, createdAt: article.createdAt,
    isPublished: article.isPublished, authorName: article.authorName, excerpt: article.excerpt,
    tags: article.tags?.length ? article.tags : undefined,
  };
  const lines = Object.entries(metadata).filter(([, value]) => value != null)
    .map(([key, value]) => key + ": " + JSON.stringify(value));
  return ["---", ...lines, "---", "", article.content].join("\n");
}
