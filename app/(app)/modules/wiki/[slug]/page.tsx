"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Panel } from "@/components/bpm/Panel";

type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  updatedAt: string;
  author: { name: string | null; email: string };
};

export default function WikiArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/wiki/${encodeURIComponent(slug)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setArticle)
      .catch(() => setError("Article introuvable"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <p style={{ color: "var(--bpm-text-secondary)" }}>Chargement...</p>;
  if (error || !article) {
    return (
      <Panel variant="error" title="Erreur">
        {error ?? "Article introuvable."}
        <Link href="/modules/wiki" className="block mt-2 underline">Retour au Wiki</Link>
      </Panel>
    );
  }

  return (
    <div>
      <nav className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/wiki">Wiki</Link>
        <span className="mx-2">/</span>
        <span>{article.slug}</span>
      </nav>
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-accent)" }}>
          {article.title}
        </h1>
        {!article.isPublished && (
          <span className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--bpm-accent-light)", color: "var(--bpm-accent)" }}>
            Brouillon
          </span>
        )}
      </div>
      <p className="text-sm mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        Par {article.author.name ?? article.author.email} · Mis à jour {new Date(article.updatedAt).toLocaleDateString()}
      </p>
      <div
        className="prose max-w-none rounded-lg p-4 border"
        style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
      >
        <pre className="whitespace-pre-wrap font-sans text-sm">{article.content}</pre>
      </div>
      <p className="mt-6">
        <Link href="/modules/wiki" className="underline" style={{ color: "var(--bpm-accent)" }}>
          Retour au Wiki
        </Link>
      </p>
    </div>
  );
}
