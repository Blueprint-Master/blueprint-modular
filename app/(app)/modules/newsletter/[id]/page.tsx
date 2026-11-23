"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button, Card, EmptyState, Spinner } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

interface Article {
  revision: number;
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
  const [header, setHeader] = useState<string | null>(null);
  useEffect(() => {
    const control = new AbortController();
    fetch("/api/newsletter/settings", { signal: control.signal }).then(r => r.ok ? r.json() : null)
      .then(data => setHeader(data?.headerImageUrl ?? null)).catch(() => {});
    return () => control.abort();
  }, []);
  const [error, setError] = useState("");
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
    setError("");
    try {
      const res = await fetch(`/api/newsletter/articles/${id}/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: !article.archived, revision: article.revision }),
        credentials: "include",
      });
      if (res.ok) {
        const updated = await res.json();
        setArticle(updated);
      } else {
        setError((await res.json()).error || str.saveError);
      }
    } catch {
      setError(str.networkError);
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

  const dateStr = article.publishedAt;
  const formattedDate = dateStr
    ? new Date(dateStr).toLocaleDateString(str.dateLocale, { dateStyle: "long" })
    : str.noPublicationDate;

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

      {header && <img src={header} alt="" referrerPolicy="no-referrer" className="mb-6 w-full max-h-48 object-cover rounded-lg" />}
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

      {error && <p role="alert">{error} <button className="underline" onClick={() => window.location.reload()}>{locale === "en" ? "Reload" : "Recharger"}</button></p>}
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
