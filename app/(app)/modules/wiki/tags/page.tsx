"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Panel } from "@/components/bpm";

export default function WikiTagsPage() {
  const { data: session } = useSession();
  const [tags, setTags] = useState<{ tag: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      setTags([]);
      setLoading(false);
      return;
    }
    fetch("/api/wiki/tags", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setTags(Array.isArray(data) ? data : []))
      .catch(() => setTags([]))
      .finally(() => setLoading(false));
  }, [session]);

  const maxCount = tags.length ? Math.max(...tags.map((t) => t.count)) : 1;

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/wiki">Wiki</Link> → Tags
        </div>
        <h1>Tags du Wiki</h1>
        <p className="doc-description">
          Nuage de tags et nombre d&apos;articles par tag. Cliquez sur un tag pour filtrer la liste.
        </p>
      </div>

      {loading ? (
        <p style={{ color: "var(--bpm-text-secondary)" }}>Chargement…</p>
      ) : tags.length === 0 ? (
        <Panel variant="info" title="Aucun tag">
          <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
            Aucun article n&apos;a encore de tag. Ajoutez des tags lors de l&apos;édition des articles.
          </p>
          <Link href="/modules/wiki" className="inline-block mt-2 underline" style={{ color: "var(--bpm-accent-cyan)" }}>
            Retour au Wiki
          </Link>
        </Panel>
      ) : (
        <Panel variant="info" title="Nuage de tags" className="mt-4">
          <div className="flex flex-wrap gap-3 items-baseline">
            {tags.map(({ tag, count }) => {
              const scale = maxCount > 0 ? 0.85 + (count / maxCount) * 0.6 : 1;
              return (
                <Link
                  key={tag}
                  href={`/modules/wiki?tag=${encodeURIComponent(tag)}`}
                  className="inline-block px-2 py-1 rounded hover:opacity-90 transition-opacity"
                  style={{
                    background: "var(--bpm-bg-secondary)",
                    color: "var(--bpm-text-primary)",
                    fontSize: `${scale}rem`,
                  }}
                >
                  {tag} <span className="opacity-70">({count})</span>
                </Link>
              );
            })}
          </div>
          <p className="text-xs mt-4" style={{ color: "var(--bpm-text-secondary)" }}>
            Cliquez sur un tag pour afficher les articles associés.
          </p>
        </Panel>
      )}

      <nav className="doc-pagination mt-8">
        <Link href="/modules/wiki" style={{ color: "var(--bpm-accent-cyan)" }}>← Retour au Wiki</Link>
      </nav>
    </div>
  );
}
