"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/bpm/Button";
import { Panel } from "@/components/bpm/Panel";

export default function WikiNewPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/wiki", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          slug: slug || title.replace(/\s+/g, "-").toLowerCase(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erreur");
      }
      const article = await res.json();
      router.push(`/modules/wiki/${article.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <nav className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/wiki">Wiki</Link>
        <span className="mx-2">/</span>
        <span>Nouvel article</span>
      </nav>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--bpm-accent)" }}>
        Nouvel article
      </h1>

      {error && (
        <Panel variant="error" title="Erreur" className="mb-4">
          {error}
        </Panel>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <label className="block">
          <span className="block text-sm mb-1" style={{ color: "var(--bpm-text-secondary)" }}>
            Titre
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slug) setSlug(e.target.value.replace(/\s+/g, "-").toLowerCase());
            }}
            required
            className="w-full px-3 py-2 rounded border"
            style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
          />
        </label>
        <label className="block">
          <span className="block text-sm mb-1" style={{ color: "var(--bpm-text-secondary)" }}>
            Slug (URL)
          </span>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full px-3 py-2 rounded border"
            style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
          />
        </label>
        <label className="block">
          <span className="block text-sm mb-1" style={{ color: "var(--bpm-text-secondary)" }}>
            Contenu (Markdown)
          </span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full px-3 py-2 rounded border font-mono text-sm"
            style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
          />
        </label>
        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Enregistrement..." : "Créer"}
          </Button>
          <Link href="/modules/wiki">
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
