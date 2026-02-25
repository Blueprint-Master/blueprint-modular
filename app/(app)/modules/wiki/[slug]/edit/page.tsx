"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button, Panel, Toggle, Selectbox } from "@/components/bpm";
import { WikiEditorToolbar } from "@/components/wiki/WikiEditorToolbar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { getGuestArticleBySlug, updateGuestArticle } from "@/lib/wiki-guest";

export default function WikiEditPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const slug = params.slug as string;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [pinned, setPinned] = useState(false);
  const [changeNote, setChangeNote] = useState("");
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGuestArticle, setIsGuestArticle] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNotes, setAiNotes] = useState("");
  const [aiArticleType, setAiArticleType] = useState<"guide" | "procedure" | "best-practice" | "reference">("guide");
  const [aiWorkspace, setAiWorkspace] = useState<"service1" | "service2" | "shared">("shared");

  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  const streamWikiGenerate = async (body: Record<string, unknown>) => {
    setAiLoading(true);
    setError(null);
    let accumulated = "";
    const updateContent = (chunk: string) => {
      accumulated += chunk;
      setContent(accumulated);
    };
    try {
      const res = await fetch("/api/wiki/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Erreur API");
      }
      const reader = res.body?.getReader();
      if (!reader) throw new Error("Pas de flux");
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6)) as { type: string; t?: string; message?: string };
              if (data.type === "chunk" && typeof data.t === "string") updateContent(data.t);
              if (data.type === "error") throw new Error(data.message ?? "Erreur IA");
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de la génération");
    } finally {
      setAiLoading(false);
    }
  };

  const handleFormatWithAi = () => {
    if (!content.trim()) return;
    streamWikiGenerate({ action: "format", content, title: title || undefined });
  };

  const handleGenerateFromNotes = () => {
    if (!aiNotes.trim()) return;
    streamWikiGenerate({ notes: aiNotes.trim(), articleType: aiArticleType, workspace: aiWorkspace });
  };

  useEffect(() => {
    if (!slug) return;

    // Toujours vérifier le localStorage en premier : un article créé en invité
    // peut être édité même si l'utilisateur est connecté (article pas encore en base).
    const guest = getGuestArticleBySlug(slug);
    if (guest?.canEdit) {
      setTitle(guest.title);
      setContent(guest.content ?? "");
      setIsPublished(guest.isPublished ?? false);
      setExcerpt((guest as { excerpt?: string }).excerpt ?? "");
      setTags(Array.isArray((guest as { tags?: string[] }).tags) ? (guest as { tags: string[] }).tags : []);
      setPinned((guest as { pinned?: boolean }).pinned ?? false);
      setIsGuestArticle(true);
      setLoading(false);
      return;
    }
    if (guest && !guest.canEdit) {
      setError("Article en lecture seule en mode invité (article de base).");
      setLoading(false);
      return;
    }

    if (status === "loading") return;
    if (!session) {
      setError("Article introuvable.");
      setLoading(false);
      return;
    }

    fetch(`/api/wiki/${encodeURIComponent(slug)}`, { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((a: { title: string; content?: string; isPublished?: boolean; excerpt?: string | null; tags?: string[]; pinned?: boolean }) => {
        setTitle(a.title);
        setContent(a.content ?? "");
        setIsPublished(a.isPublished ?? false);
        setExcerpt(a.excerpt ?? "");
        setTags(Array.isArray(a.tags) ? a.tags : []);
        setPinned(a.pinned ?? false);
      })
      .catch(() => setError("Article introuvable"))
      .finally(() => setLoading(false));
  }, [slug, session, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (isGuestArticle) {
        const updated = updateGuestArticle(slug, { title, content, isPublished });
        if (updated) router.push(`/modules/wiki/${slug}`);
        else setError("Impossible de sauvegarder (article invité)");
        return;
      }
      const res = await fetch(`/api/wiki/${encodeURIComponent(slug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          isPublished,
          excerpt: excerpt.trim() || null,
          tags,
          pinned,
          changeNote: changeNote.trim() || null,
        }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erreur");
      router.push(`/modules/wiki/${slug}`);
    } catch {
      setError("Impossible de sauvegarder");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ color: "var(--bpm-text-secondary)" }}>Chargement...</p>;
  if (error) {
    return (
      <Panel variant="error" title="Erreur">
        {error}
        <Link href="/modules/wiki" className="block mt-2 underline" style={{ color: "var(--bpm-accent-cyan)" }}>Retour au Wiki</Link>
      </Panel>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--bpm-accent)" }}>
        Modifier l&apos;article
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
        <label className="block">
          <span className="block text-sm mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Titre</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="bpm-input w-full px-3 py-2 rounded border"
            style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
          />
        </label>
        <div>
          <Toggle label="Publié" value={isPublished} onChange={setIsPublished} />
        </div>
        <div>
          <Toggle label="Épingler cet article" value={pinned} onChange={setPinned} />
        </div>
        <label className="block">
          <span className="block text-sm mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Résumé (excerpt)</span>
          <input
            type="text"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="2-3 lignes optionnel"
            className="bpm-input w-full px-3 py-2 rounded border"
            style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
          />
        </label>
        <label className="block">
          <span className="block text-sm mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Tags (séparés par Entrée)</span>
          <div className="flex flex-wrap gap-1 mb-1">
            {tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm" style={{ background: "var(--bpm-border)", color: "var(--bpm-text-primary)" }}>
                {t}
                <button type="button" onClick={() => setTags((prev) => prev.filter((x) => x !== t))} className="opacity-70 hover:opacity-100" aria-label="Retirer">×</button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  const v = (e.key === "," ? tagInput.replace(/,/g, "") : tagInput).trim();
                  if (v && !tags.includes(v)) setTags((prev) => [...prev, v]);
                  setTagInput("");
                }
              }}
              placeholder="Ajouter un tag..."
              className="flex-1 min-w-[120px] px-2 py-1 rounded border text-sm"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
            />
          </div>
        </label>
        <label className="block">
          <span className="block text-sm mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Note de changement (historique)</span>
          <input
            type="text"
            value={changeNote}
            onChange={(e) => setChangeNote(e.target.value)}
            placeholder="Optionnel : décrire les modifications"
            className="bpm-input w-full px-3 py-2 rounded border"
            style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
          />
        </label>

        <div className="flex flex-wrap items-center gap-2 border-b pb-2" style={{ borderColor: "var(--bpm-border)" }}>
          <Toggle
            label={preview ? "Prévisualisation : oui" : "Prévisualisation : non"}
            value={preview}
            onChange={setPreview}
          />
          {!isGuestArticle && (
            <button
              type="button"
              onClick={() => setAiPanelOpen((v) => !v)}
              className="px-3 py-1 rounded text-sm border"
              style={{
                borderColor: "var(--bpm-border)",
                background: aiPanelOpen ? "var(--bpm-accent)" : "transparent",
                color: aiPanelOpen ? "var(--bpm-surface)" : "var(--bpm-text-secondary)",
              }}
            >
              Aide IA
            </button>
          )}
        </div>

        {aiPanelOpen && !isGuestArticle && (
          <div className="p-4 rounded border space-y-4" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)" }}>
            <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
              Utiliser l&apos;IA pour rédiger ou mettre en forme le contenu de l&apos;article.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                size="small"
                disabled={aiLoading || !content.trim()}
                onClick={handleFormatWithAi}
              >
                {aiLoading ? "Génération…" : "Mettre en forme le contenu actuel"}
              </Button>
            </div>
            <div className="pt-2 border-t" style={{ borderColor: "var(--bpm-border)" }}>
              <span className="block text-sm mb-2" style={{ color: "var(--bpm-text-secondary)" }}>Générer un article depuis des notes</span>
              <textarea
                value={aiNotes}
                onChange={(e) => setAiNotes(e.target.value)}
                placeholder="Collez ici vos notes brutes…"
                rows={3}
                className="bpm-textarea w-full px-3 py-2 rounded border font-mono text-sm mb-2"
                style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg)", color: "var(--bpm-text-primary)" }}
              />
              <div className="flex flex-wrap gap-2 items-center mb-2">
                <Selectbox
                  label="Type"
                  options={[
                    { value: "guide", label: "Guide" },
                    { value: "procedure", label: "Procédure" },
                    { value: "best-practice", label: "Bonnes pratiques" },
                    { value: "reference", label: "Référence" },
                  ]}
                  value={aiArticleType}
                  onChange={(v) => setAiArticleType(v as typeof aiArticleType)}
                  placeholder="Type"
                />
                <Selectbox
                  label="Workspace"
                  options={[
                    { value: "service1", label: "Service 1" },
                    { value: "service2", label: "Service 2" },
                    { value: "shared", label: "Partagé" },
                  ]}
                  value={aiWorkspace}
                  onChange={(v) => setAiWorkspace(v as typeof aiWorkspace)}
                  placeholder="Workspace"
                />
                <Button
                  type="button"
                  size="small"
                  disabled={aiLoading || !aiNotes.trim()}
                  onClick={handleGenerateFromNotes}
                >
                  Générer l&apos;article
                </Button>
              </div>
            </div>
          </div>
        )}

        {preview ? (
          <div
            className="min-h-[400px] p-4 rounded border prose prose-sm max-w-none"
            style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{content || "*Aucun contenu.*"}</ReactMarkdown>
          </div>
        ) : (
          <>
            <WikiEditorToolbar
              textareaRef={contentTextareaRef}
              value={content}
              onChange={setContent}
            />
            <textarea
              ref={contentTextareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={18}
              className="bpm-textarea w-full px-3 py-2 rounded-b border font-mono text-sm min-h-[400px]"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
            />
          </>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Enregistrement..." : "Sauvegarder"}
          </Button>
          <Link href={`/modules/wiki/${slug}`}>
            <Button type="button" variant="outline">Annuler</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
