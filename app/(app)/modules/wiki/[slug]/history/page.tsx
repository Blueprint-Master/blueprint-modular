"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Panel, Button } from "@/components/bpm";

type Revision = {
  id: string;
  content: string;
  authorId: string;
  authorName: string | null;
  changeNote: string | null;
  createdAt: string;
};

export default function WikiHistoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: session, status } = useSession();
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [compareId, setCompareId] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || status === "loading") return;
    if (!session) {
      setError("Connectez-vous pour voir l'historique.");
      setLoading(false);
      return;
    }
    fetch(`/api/wiki/${encodeURIComponent(slug)}/revisions`, { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => setRevisions(Array.isArray(data) ? data : []))
      .catch(() => setError("Impossible de charger l'historique."))
      .finally(() => setLoading(false));
  }, [slug, session, status]);

  const selected = revisions.find((r) => r.id === selectedId);
  const compare = compareId ? revisions.find((r) => r.id === compareId) : null;

  function diffLines(oldContent: string, newContent: string): { type: "add" | "remove"; text: string }[] {
    const oldSet = new Set(oldContent.split("\n"));
    const newSet = new Set(newContent.split("\n"));
    const result: { type: "add" | "remove"; text: string }[] = [];
    for (const line of oldContent.split("\n")) {
      if (!newSet.has(line)) result.push({ type: "remove", text: line });
    }
    for (const line of newContent.split("\n")) {
      if (!oldSet.has(line)) result.push({ type: "add", text: line });
    }
    return result;
  }

  if (loading) return <p style={{ color: "var(--bpm-text-secondary)" }}>Chargement…</p>;
  if (error) {
    return (
      <Panel variant="error" title="Erreur">
        {error}
        <Link href={`/modules/wiki/${slug}`} className="block mt-2 underline" style={{ color: "var(--bpm-accent-cyan)" }}>Retour à l&apos;article</Link>
      </Panel>
    );
  }

  return (
    <div className="doc-page">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
          Historique des révisions
        </h1>
        <Link href={`/modules/wiki/${slug}`}>
          <Button variant="outline" size="small">← Retour à l&apos;article</Button>
        </Link>
      </div>

      <p className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Cliquez sur une révision pour afficher son contenu. Les 50 dernières révisions sont conservées.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel variant="info" title="Révisions">
          <ul className="space-y-2 max-h-[400px] overflow-y-auto">
            {revisions.map((r) => (
              <li key={r.id} className="text-sm">
                <button
                  type="button"
                  onClick={() => setSelectedId(selectedId === r.id ? null : r.id)}
                  className={`w-full text-left px-3 py-2 rounded border transition-colors ${selectedId === r.id ? "ring-2 ring-offset-1" : ""}`}
                  style={{
                    borderColor: "var(--bpm-border)",
                    background: selectedId === r.id ? "var(--bpm-bg-secondary)" : "transparent",
                    color: "var(--bpm-text-primary)",
                  }}
                >
                  <span className="font-medium">{new Date(r.createdAt).toLocaleString("fr-FR")}</span>
                  {r.authorName && <span className="opacity-80"> · {r.authorName}</span>}
                  {r.changeNote && <span className="block truncate text-xs mt-0.5 opacity-70">{r.changeNote}</span>}
                </button>
                <div className="flex gap-1 mt-1">
                  <button
                    type="button"
                    className="text-xs px-2 py-0.5 rounded hover:opacity-90"
                    style={{ background: "var(--bpm-border)", color: "var(--bpm-text-secondary)" }}
                    onClick={() => setCompareId(compareId === r.id ? null : r.id)}
                  >
                    {compareId === r.id ? "Désélectionner" : "Comparer"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {revisions.length === 0 && (
            <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Aucune révision enregistrée.</p>
          )}
        </Panel>

        <div className="space-y-4">
          {selected && (
            <Panel variant="info" title={`Révision du ${new Date(selected.createdAt).toLocaleString("fr-FR")}`}>
              <pre className="text-xs whitespace-pre-wrap overflow-x-auto max-h-[300px] overflow-y-auto p-2 rounded border" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)", color: "var(--bpm-text-primary)" }}>
                {selected.content}
              </pre>
            </Panel>
          )}
          {selected && compare && selected.id !== compare.id && (
            <Panel variant="info" title="Diff (révision sélectionnée vs comparée)">
              <div className="text-xs space-y-1 max-h-[300px] overflow-y-auto">
                {diffLines(compare.content, selected.content).map((line, i) => (
                  <div
                    key={i}
                    className="px-2 py-0.5 font-mono"
                    style={{
                      background: line.type === "add" ? "rgba(0,200,0,0.15)" : "rgba(200,0,0,0.15)",
                      color: "var(--bpm-text-primary)",
                    }}
                  >
                    {line.type === "add" ? "+ " : "- "}
                    {line.text || " "}
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>
      </div>

      <nav className="doc-pagination mt-8">
        <Link href={`/modules/wiki/${slug}`} style={{ color: "var(--bpm-accent-cyan)" }}>← Retour à l&apos;article</Link>
        <Link href={`/modules/wiki/${slug}/edit`} style={{ color: "var(--bpm-accent-cyan)" }}>Modifier</Link>
      </nav>
    </div>
  );
}
