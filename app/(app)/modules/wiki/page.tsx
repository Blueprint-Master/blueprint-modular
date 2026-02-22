"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/bpm/Button";
import { Panel } from "@/components/bpm/Panel";

type WikiArticle = { id: string; title: string; slug: string; parentId: string | null; updatedAt: string };

export default function WikiModulePage() {
  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/wiki")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Unauthorized"))))
      .then(setArticles)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-accent)" }}>
          Module Wiki
        </h1>
        <Link href="/modules/wiki/new">
          <Button>Nouvel article</Button>
        </Link>
      </div>
      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        Gestion de connaissances, articles, recherche IA.
      </p>

      {loading && <p style={{ color: "var(--bpm-text-secondary)" }}>Chargement...</p>}
      {error && (
        <Panel variant="error" title="Erreur">
          {error}. Connectez-vous pour accéder au Wiki.
        </Panel>
      )}
      {!loading && !error && articles.length === 0 && (
        <Panel variant="info" title="Aucun article">
          Créez votre premier article avec le bouton &quot;Nouvel article&quot;.
        </Panel>
      )}
      {!loading && !error && articles.length > 0 && (
        <ul className="space-y-2">
          {articles.map((a) => (
            <li key={a.id}>
              <Link
                href={`/modules/wiki/${a.slug}`}
                className="block p-3 rounded-lg border hover:opacity-90"
                style={{
                  borderColor: "var(--bpm-border)",
                  background: "var(--bpm-surface)",
                  color: "var(--bpm-text-primary)",
                }}
              >
                <span className="font-medium">{a.title}</span>
                <span className="text-sm ml-2" style={{ color: "var(--bpm-text-secondary)" }}>
                  /{a.slug}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
