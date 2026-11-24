"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Table, Spinner, EmptyState, Button, Selectbox } from "@/components/bpm";
import { ModulePageHeader } from "@/components/site/ModulePageHeader";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "./strings";

interface NewsletterArticle {
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

export default function NewsletterPage() {
  const router = useRouter();
  const { locale } = useI18n();
  const str = STR[locale];
  const [articles, setArticles] = useState<NewsletterArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [archivedFilter, setArchivedFilter] = useState("");
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [signIn, setSignIn] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchArticles = useCallback(() => {
    const params = new URLSearchParams();
    if (archivedFilter !== "") params.set("archived", archivedFilter);
    fetch(`/api/newsletter/articles?${params}`, { credentials: "include" })
      .then(r => {
        setSignIn(r.status === 401);
        if (r.status === 401) return [];
        if (!r.ok) throw new Error("load");
        return r.json();
      })
      .then((data) => {
        setArticles(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError(str.networkError);
        setArticles([]);
        setLoading(false);
      });
  }, [archivedFilter, str.networkError]);

  useEffect(() => {
    setLoading(true);
    fetchArticles();
  }, [fetchArticles]);

  const handleArchive = async (id: string, currentArchived: boolean, revision: number) => {
    if (archivingId) return;
    setError("");
    setArchivingId(id);
    try {
      const res = await fetch(`/api/newsletter/articles/${id}/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: !currentArchived, revision }),
        credentials: "include",
      });
      if (!res.ok) setError((await res.json()).error || str.saveError);
      fetchArticles();
    } catch {
      setError(str.networkError);
    } finally {
      setArchivingId(null);
    }
  };

  const handleDelete = async (id: string, title: string, revision: number) => {
    if (deletingId) return;
    if (!confirm(str.deleteConfirm(title))) return;
    setError("");
    setDeletingId(id);
    try {
      const res = await fetch(`/api/newsletter/articles/${id}?revision=${revision}`, { method: "DELETE", credentials: "include" });
      if (res.ok) setArticles((prev) => prev.filter((a) => a.id !== id));
      else { setError((await res.json()).error || str.saveError); fetchArticles(); }
    } catch {
      setError(str.networkError);
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    { key: "title", label: str.colTitle },
    {
      key: "publishedAt",
      label: str.colPublishedAt,
      render: (d: unknown) => {
        if (!d) return str.noPublicationDate;
        try {
          return new Date(String(d)).toLocaleDateString(str.dateLocale, { dateStyle: "short" });
        } catch {
          return String(d);
        }
      },
    },
    {
      key: "archived",
      label: str.colStatus,
      render: (val: unknown) => {
        const archived = val === true;
        return (
          <span
            className="rounded px-2 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: archived ? "var(--bpm-text-secondary)" : "var(--bpm-accent-mint)",
              color: "var(--bpm-bg)",
            }}
          >
            {archived ? str.statusArchived : str.statusActive}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: str.colActions,
      render: (_: unknown, row: Record<string, unknown>) => {
        const id = row.id as string;
        const title = row.title as string;
        const archived = row.archived === true;
        const isArchiving = archivingId === id;
        const isDeleting = deletingId === id;
        return (
          <span className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
            <Button size="small" variant="secondary" onClick={() => router.push(`/modules/newsletter/${id}`)}>
              {str.actionView}
            </Button>
            <Button size="small" variant="secondary" onClick={() => router.push(`/modules/newsletter/${id}/edit`)}>
              {str.actionEdit}
            </Button>
            <Button
              size="small"
              variant="secondary"
              disabled={!!archivingId}
              onClick={() => handleArchive(id, archived, Number(row.revision))}
            >
              {isArchiving ? str.ellipsis : archived ? str.actionUnarchive : str.actionArchive}
            </Button>
            <Button
              size="small"
              variant="secondary"
              disabled={!!deletingId}
              onClick={() => handleDelete(id, title, Number(row.revision))}
            >
              {isDeleting ? str.ellipsis : str.actionDelete}
            </Button>
          </span>
        );
      },
    },
  ];

  const data = articles.map((a) => ({
    id: a.id,
    title: a.title,
    revision: a.revision,
    publishedAt: a.publishedAt,
    archived: a.archived,
  }));

  return (
    <div className="doc-page newsletter-page">
      <ModulePageHeader
        className="mb-6"
        breadcrumbCurrent={str.moduleName}
        title={str.moduleName}
        description={str.listDescription}
      />

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Link href="/modules/newsletter/parametres">
          <Button variant="secondary">{str.headerPhotoButton}</Button>
        </Link>
        <Link href="/modules/newsletter/nouveau">
          <Button variant="primary">{str.newArticleButton}</Button>
        </Link>
        <Selectbox
          options={str.filterOptions}
          value={archivedFilter}
          onChange={(v) => setArchivedFilter(v ?? "")}
          placeholder={str.filterPlaceholder}
        />
      </div>

      {error && <p role="alert">{error} <button className="underline" onClick={() => { setError(""); fetchArticles(); }}>{locale === "en" ? "Retry" : "Réessayer"}</button></p>}
      {signIn ? <Link className="underline" href="/login?callbackUrl=%2Fmodules%2Fnewsletter">
        {locale === "en" ? "Sign in to manage your newsletter" : "Se connecter pour gérer sa newsletter"}
      </Link> : loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="medium" />
        </div>
      ) : articles.length === 0 ? (
        <EmptyState
          title={str.emptyTitle}
          description={<>{str.emptyBefore}<strong>{str.emptyStrongNew}</strong>{str.emptyMiddle}<strong>{str.emptyStrongHeader}</strong>{str.emptyAfter}</>}
        />
      ) : (
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--bpm-border)" }}>
          <Table
            columns={columns}
            data={data}
            onRowClick={(row) => {
              const id = (row as { id?: string }).id;
              if (id) router.push(`/modules/newsletter/${id}`);
            }}
          />
        </div>
      )}

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>
          {str.backToModules}
        </Link>
        <Link href="/modules/newsletter/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
          {str.documentationLink}
        </Link>
      </nav>
    </div>
  );
}
