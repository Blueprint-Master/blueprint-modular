"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button, Card, EmptyState, Spinner } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  publishedAt: string | null;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  author?: { name: string | null; email: string | null };
}

export default function NewsletterArticlePage() {
  const params = useParams();
  const router = useRouter();
  const { locale } = useI18n();
  const str = STR[locale];
  const id = typeof params?.id === "string" ? params.id : "";
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    fetch(`/api/newsletter/articles/${id}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setArticle(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleArchive = async () => {
    if (!article || archiving) return;
    setArchiving(true);
    try {
      const res = await fetch(`/api/newsletter/articles/${id}/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: !article.archived }),
        credentials: "include",
      });
      if (res.ok) {
        const updated = await res.json();
        setArticle(updated);
      }
    } finally {
      setArchiving(false);
    }
  };

  if (loading) {
    return (
      <div className="doc-page flex justify-center py-12">
        <Spinner size="medium" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="doc-page">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/newsletter">{str.moduleName}</Link>
        </div>
        <EmptyState title={str.notFoundTitle} description={str.notFoundBody} />
        <nav className="doc-pagination mt-8">
          <Link href="/modules/newsletter" style={{ color: "var(--bpm-accent-cyan)" }}>
            {str.backToModule}
          </Link>
        </nav>
      </div>
    );
  }

  const dateStr = article.publishedAt || article.createdAt;
  const formattedDate = dateStr
    ? new Date(dateStr).toLocaleDateString(str.dateLocale, { dateStyle: "long" })
    : "—";

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/newsletter">{str.moduleName}</Link> → {article.title}
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
          {article.title}
        </h1>
        <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
          {formattedDate}
          {article.archived && (
            <span
              className="ml-2 rounded px-2 py-0.5 text-xs font-medium"
              style={{ backgroundColor: "var(--bpm-text-secondary)", color: "var(--bpm-bg)" }}
            >
              {str.statusArchived}
            </span>
          )}
        </p>
      </div>

      {article.excerpt && (
        <p className="mb-6 text-lg" style={{ color: "var(--bpm-text-secondary)" }}>
          {article.excerpt}
        </p>
      )}

      <Card variant="outlined">
        <div
          className="prose max-w-none whitespace-pre-wrap"
          style={{ color: "var(--bpm-text-primary)" }}
        >
          {article.content || str.noContent}
        </div>
      </Card>

      <div className="flex flex-wrap gap-2 mt-6">
        <Button variant="primary" onClick={() => router.push(`/modules/newsletter/${id}/edit`)}>
          {str.actionEdit}
        </Button>
        <Button variant="secondary" disabled={archiving} onClick={handleArchive}>
          {archiving ? str.ellipsis : article.archived ? str.actionUnarchive : str.actionArchive}
        </Button>
        <Link href="/modules/newsletter">
          <Button variant="secondary">{str.articleListButton}</Button>
        </Link>
      </div>

      <nav className="doc-pagination mt-8">
        <Link href="/modules/newsletter" style={{ color: "var(--bpm-accent-cyan)" }}>
          {str.backToModule}
        </Link>
      </nav>
    </div>
  );
}
