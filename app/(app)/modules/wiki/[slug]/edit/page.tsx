"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button, Panel, Toggle, Selectbox } from "@/components/bpm";
import { WikiEditorToolbar } from "@/components/wiki/WikiEditorToolbar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import { getGuestArticleBySlug, updateGuestArticle } from "@/lib/wiki-guest";
import { WIKI_TEMPLATE_IDS, WIKI_TEMPLATE_LABELS, getWikiTemplateContent, type WikiTemplateId } from "@/lib/wiki-templates";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../../strings";

/** Transforme [[slug]] et [[slug|label]] en liens Markdown. */
function contentWithWikiLinks(content: string): string {
  if (!content) return content;
  return content.replace(/\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g, (_, slugPart, label) => {
    const slug = slugPart.trim().toLowerCase().replace(/\s+/g, "-");
    const text = (label ?? slugPart).trim() || slug;
    return `[${text}](/modules/wiki/${encodeURIComponent(slug)})`;
  });
}

export default function WikiEditPage() {
  const params = useParams();
  const { locale } = useI18n();
  const t = STR[locale];
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
  const [template, setTemplate] = useState<WikiTemplateId>("");
  const [coverImage, setCoverImage] = useState("");
  const [changeNote, setChangeNote] = useState("");
  const [preview, setPreview] = useState(false);
  const [viewMode, setViewMode] = useState<"editor" | "split" | "preview">("split");
  const [splitRatio, setSplitRatio] = useState(0.5);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGuestArticle, setIsGuestArticle] = useState(false);
  const [saveToDbLoading, setSaveToDbLoading] = useState(false);
  const [localSaveMessage, setLocalSaveMessage] = useState<string | null>(null);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNotes, setAiNotes] = useState("");
  const [aiArticleType, setAiArticleType] = useState<"guide" | "procedure" | "best-practice" | "reference">("guide");
  const [aiWorkspace, setAiWorkspace] = useState<"service1" | "service2" | "shared">("shared");

  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const splitDragRef = useRef(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!splitDragRef.current) return;
      const container = document.querySelector(".wiki-edit-split-container");
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = Math.max(0.2, Math.min(0.8, (e.clientX - rect.left) / rect.width));
      setSplitRatio(x);
    };
    const onMouseUp = () => { splitDragRef.current = false; };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const markDirty = useCallback(() => setDirty(true), []);

  const performSave = useCallback(async () => {
    if (isGuestArticle) {
      const updated = updateGuestArticle(slug, { title, content, isPublished });
      if (updated) {
        setLastSavedAt(new Date());
        setDirty(false);
        if (!session) setLocalSaveMessage(t.edit.localSaved);
      }
      return;
    }
    setSaving(true);
    setError(null);
    try {
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
          template: template || null,
          coverImage: coverImage.trim() || null,
          changeNote: changeNote.trim() || null,
        }),
        credentials: "include",
      });
      if (res.ok) {
        setLastSavedAt(new Date());
        setDirty(false);
      } else {
        setError(t.edit.errorSaving);
      }
    } catch {
      setError(t.edit.errorCannotSave);
    } finally {
      setSaving(false);
    }
  }, [slug, title, content, isPublished, excerpt, tags, pinned, template, coverImage, changeNote, isGuestArticle, session, t]);

  useEffect(() => {
    if (!dirty || isGuestArticle) return;
    const t = setInterval(performSave, 30_000);
    return () => clearInterval(t);
  }, [dirty, isGuestArticle, performSave]);

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
        throw new Error((err as { error?: string }).error ?? t.edit.apiError);
      }
      const reader = res.body?.getReader();
      if (!reader) throw new Error(t.edit.noStream);
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
              if (data.type === "error") throw new Error(data.message ?? t.edit.aiError);
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t.edit.genError);
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

  /** Charge l'article : API d'abord si connecté, puis fallback localStorage si 404 (CDC Bug 2). */
  useEffect(() => {
    if (!slug) return;

    const loadFromGuest = (guest: ReturnType<typeof getGuestArticleBySlug>) => {
      if (!guest) return false;
      setTitle(guest.title);
      setContent(guest.content ?? "");
      setIsPublished(guest.isPublished ?? false);
      const g = guest as { excerpt?: string; tags?: string[]; pinned?: boolean; template?: string; coverImage?: string };
      setExcerpt(g.excerpt ?? "");
      setTags(Array.isArray(g.tags) ? g.tags : []);
      setPinned(g.pinned ?? false);
      setTemplate((g.template as WikiTemplateId) ?? "");
      setCoverImage(g.coverImage ?? "");
      if (guest.canEdit) {
        setIsGuestArticle(true);
        return true;
      }
      setError(t.edit.readOnlyGuest);
      return true;
    };

    if (status === "loading") return;

    if (!session) {
      const guest = getGuestArticleBySlug(slug);
      if (loadFromGuest(guest)) {
        setLoading(false);
        return;
      }
      setError(t.common.articleNotFoundDot);
      setLoading(false);
      return;
    }

    fetch(`/api/wiki/${encodeURIComponent(slug)}`, { credentials: "include" })
      .then((r) => {
        if (r.ok) return r.json();
        if (r.status === 404) {
          const guest = getGuestArticleBySlug(slug);
          if (guest?.canEdit) {
            loadFromGuest(guest);
            return;
          }
          if (guest && !guest.canEdit) {
            setError(t.edit.readOnlyGuest);
            return;
          }
        }
        throw new Error("Not found");
      })
      .then((a: { title: string; content?: string; isPublished?: boolean; excerpt?: string | null; tags?: string[]; pinned?: boolean; template?: string | null; coverImage?: string | null } | void) => {
        if (!a) return;
        setTitle(a.title);
        setContent(a.content ?? "");
        setIsPublished(a.isPublished ?? false);
        setExcerpt(a.excerpt ?? "");
        setTags(Array.isArray(a.tags) ? a.tags : []);
        setPinned(a.pinned ?? false);
        setTemplate((a.template as WikiTemplateId) ?? "");
        setCoverImage(a.coverImage ?? "");
      })
      .catch(() => setError(t.common.articleNotFound))
      .finally(() => setLoading(false));
  }, [slug, session, status, t]);

  const handleSaveToDb = async () => {
    if (!session || !isGuestArticle) return;
    setError(null);
    setSaveToDbLoading(true);
    try {
      const res = await fetch("/api/wiki", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          slug,
          isPublished,
          excerpt: excerpt.trim() || undefined,
          tags: tags.length ? tags : undefined,
          pinned,
          template: template || undefined,
          coverImage: coverImage.trim() || undefined,
        }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? t.edit.genericError);
      }
      const created = await res.json() as { slug: string };
      router.push(`/modules/wiki/${created.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.edit.errorCannotSaveDb);
    } finally {
      setSaveToDbLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLocalSaveMessage(null);
    setSaving(true);
    try {
      if (isGuestArticle) {
        const updated = updateGuestArticle(slug, { title, content, isPublished });
        if (updated) {
          if (!session) setLocalSaveMessage(t.edit.localSaved);
          router.push(`/modules/wiki/${slug}`);
        } else setError(t.edit.errorCannotSaveGuest);
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
          template: template || null,
          coverImage: coverImage.trim() || null,
          changeNote: changeNote.trim() || null,
        }),
        credentials: "include",
      });
      if (!res.ok) throw new Error(t.edit.genericError);
      setLastSavedAt(new Date());
      setDirty(false);
      router.push(`/modules/wiki/${slug}`);
    } catch {
      setError(t.edit.errorCannotSave);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ color: "var(--bpm-text-secondary)" }}>{t.common.loading}</p>;
  if (error) {
    return (
      <Panel variant="error" title={t.common.error}>
        {error}
        <Link href="/modules/wiki" className="block mt-2 underline" style={{ color: "var(--bpm-accent-cyan)" }}>{t.common.backToWikiPlain}</Link>
      </Panel>
    );
  }

  const handleContentChange = (v: string) => {
    setContent(v);
    setDirty(true);
  };

  const toggleViewMode = () => {
    if (viewMode === "split") setViewMode("preview");
    else if (viewMode === "preview") setViewMode("split");
    else setViewMode("split");
    setPreview(viewMode !== "preview");
  };

  const isPreviewOnly = viewMode === "preview";

  return (
    <div className="flex flex-col min-h-0">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-accent)" }}>
          {t.edit.title}
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-xs px-2 py-1 rounded"
            style={{
              color: "var(--bpm-text-secondary)",
              background: dirty ? "rgba(245,158,11,0.15)" : "var(--bpm-bg-secondary)",
              border: "1px solid var(--bpm-border)",
            }}
            title={dirty ? t.edit.unsavedChange : lastSavedAt ? t.edit.draftSavedAt(lastSavedAt.toLocaleTimeString(t.common.locale, { hour: "2-digit", minute: "2-digit" })) : ""}
          >
            {dirty ? t.edit.unsavedChange : lastSavedAt ? t.edit.savedAt(lastSavedAt.toLocaleTimeString(t.common.locale, { hour: "2-digit", minute: "2-digit" })) : "—"}
          </span>
          <div className="flex gap-1" role="group" aria-label={t.edit.viewModeLabel}>
            <Button
              type="button"
              variant={viewMode === "editor" ? "primary" : "outline"}
              size="small"
              onClick={() => { setViewMode("editor"); setPreview(false); }}
            >
              {t.edit.editor}
            </Button>
            <Button
              type="button"
              variant={viewMode === "split" ? "primary" : "outline"}
              size="small"
              onClick={() => { setViewMode("split"); setPreview(true); }}
            >
              {t.edit.split}
            </Button>
            <Button
              type="button"
              variant={viewMode === "preview" ? "primary" : "outline"}
              size="small"
              onClick={() => { setViewMode("preview"); setPreview(true); }}
            >
              {t.edit.preview}
            </Button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col min-h-0">
        {isGuestArticle && (
          <div
            className="py-3 px-4 rounded-lg border flex flex-wrap items-center justify-between gap-2"
            style={{ background: "var(--bpm-bg-secondary)", borderColor: "var(--bpm-border)", color: "var(--bpm-text-secondary)" }}
            role="status"
          >
            <span className="text-sm">{t.edit.localArticleNotice}</span>
            {session && (
              <Button
                type="button"
                variant="primary"
                size="small"
                onClick={handleSaveToDb}
                disabled={saveToDbLoading}
                aria-label={t.edit.saveToDbLabel}
              >
                {saveToDbLoading ? t.edit.savingToDb : t.edit.saveToDb}
              </Button>
            )}
          </div>
        )}
        {localSaveMessage && (
          <p className="text-sm" style={{ color: "var(--bpm-accent-cyan)" }}>{localSaveMessage}</p>
        )}
        <label className="block">
          <span className="block text-sm mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{t.edit.labelTitle}</span>
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setDirty(true); }}
            required
            className="bpm-input w-full px-3 py-2 rounded border"
            style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
          />
        </label>
        <div>
          <Toggle label={t.edit.labelPublished} value={isPublished} onChange={(v) => { setIsPublished(v); setDirty(true); }} />
        </div>
        <div>
          <Toggle label={t.edit.labelPin} value={pinned} onChange={(v) => { setPinned(v); setDirty(true); }} />
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="block min-w-[180px]">
            <span className="block text-sm mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{t.edit.labelTemplate}</span>
            <select
              value={template}
              onChange={(e) => { setTemplate(e.target.value as WikiTemplateId); setDirty(true); }}
              className="w-full px-3 py-2 rounded border text-sm"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
            >
              {WIKI_TEMPLATE_IDS.map((id) => (
                <option key={id || "none"} value={id}>{WIKI_TEMPLATE_LABELS[id]}</option>
              ))}
            </select>
          </label>
          {template && (
            <Button
              type="button"
              variant="outline"
              size="small"
              onClick={() => {
                const t = getWikiTemplateContent(template as Exclude<WikiTemplateId, "">);
                if (t) { setContent(t); setDirty(true); }
              }}
            >
              {t.edit.applyTemplate}
            </Button>
          )}
        </div>
        <label className="block">
          <span className="block text-sm mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{t.edit.labelCover}</span>
          <input
            type="url"
            value={coverImage}
            onChange={(e) => { setCoverImage(e.target.value); setDirty(true); }}
            placeholder="https://..."
            className="bpm-input w-full px-3 py-2 rounded border"
            style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
          />
        </label>
        <label className="block">
          <span className="block text-sm mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{t.edit.labelExcerpt}</span>
          <input
            type="text"
            value={excerpt}
            onChange={(e) => { setExcerpt(e.target.value); setDirty(true); }}
            placeholder={t.edit.excerptPlaceholder}
            className="bpm-input w-full px-3 py-2 rounded border"
            style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
          />
        </label>
        <label className="block">
          <span className="block text-sm mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{t.edit.labelTags}</span>
          <div className="flex flex-wrap gap-1 mb-1">
            {tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm" style={{ background: "var(--bpm-border)", color: "var(--bpm-text-primary)" }}>
                {t}
                <button type="button" onClick={() => { setTags((prev) => prev.filter((x) => x !== t)); setDirty(true); }} className="opacity-70 hover:opacity-100" aria-label={STR[locale].edit.removeTag}>×</button>
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
                  if (v && !tags.includes(v)) { setTags((prev) => [...prev, v]); setDirty(true); }
                  setTagInput("");
                }
              }}
              placeholder={t.edit.tagPlaceholder}
              className="flex-1 min-w-[120px] px-2 py-1 rounded border text-sm"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
            />
          </div>
        </label>
        <label className="block">
          <span className="block text-sm mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{t.edit.labelChangeNote}</span>
          <input
            type="text"
            value={changeNote}
            onChange={(e) => setChangeNote(e.target.value)}
            placeholder={t.edit.changeNotePlaceholder}
            className="bpm-input w-full px-3 py-2 rounded border"
            style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
          />
        </label>

        <div className="flex flex-wrap items-center gap-2 border-b pb-2" style={{ borderColor: "var(--bpm-border)" }}>
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
              {t.edit.aiHelp}
            </button>
          )}
        </div>

        {aiPanelOpen && !isGuestArticle && (
          <div className="p-4 rounded border space-y-4" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)" }}>
            <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
              {t.edit.aiHelpIntro}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                size="small"
                disabled={aiLoading || !content.trim()}
                onClick={handleFormatWithAi}
              >
                {aiLoading ? t.edit.aiGenerating : t.edit.aiFormatCurrent}
              </Button>
            </div>
            <div className="pt-2 border-t" style={{ borderColor: "var(--bpm-border)" }}>
              <span className="block text-sm mb-2" style={{ color: "var(--bpm-text-secondary)" }}>{t.edit.aiGenerateFromNotes}</span>
              <textarea
                value={aiNotes}
                onChange={(e) => setAiNotes(e.target.value)}
                placeholder={t.edit.aiNotesPlaceholder}
                rows={3}
                className="bpm-textarea w-full px-3 py-2 rounded border font-mono text-sm mb-2"
                style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg)", color: "var(--bpm-text-primary)" }}
              />
              <div className="flex flex-wrap gap-2 items-center mb-2">
                <Selectbox
                  label={t.edit.typeLabel}
                  options={[
                    { value: "guide", label: t.edit.typeGuide },
                    { value: "procedure", label: t.edit.typeProcedure },
                    { value: "best-practice", label: t.edit.typeBestPractice },
                    { value: "reference", label: t.edit.typeReference },
                  ]}
                  value={aiArticleType}
                  onChange={(v) => setAiArticleType(v as typeof aiArticleType)}
                  placeholder={t.edit.typeLabel}
                />
                <Selectbox
                  label={t.edit.workspaceLabel}
                  options={[
                    { value: "service1", label: t.edit.workspaceService1 },
                    { value: "service2", label: t.edit.workspaceService2 },
                    { value: "shared", label: t.edit.workspaceShared },
                  ]}
                  value={aiWorkspace}
                  onChange={(v) => setAiWorkspace(v as typeof aiWorkspace)}
                  placeholder={t.edit.workspaceLabel}
                />
                <Button
                  type="button"
                  size="small"
                  disabled={aiLoading || !aiNotes.trim()}
                  onClick={handleGenerateFromNotes}
                >
                  {t.edit.aiGenerateArticle}
                </Button>
              </div>
            </div>
          </div>
        )}

        {(viewMode === "split" || viewMode === "editor" || viewMode === "preview") && (
          <div
            className="wiki-edit-split-container flex-1 flex min-h-[400px] border rounded overflow-hidden"
            style={{ borderColor: "var(--bpm-border)" }}
          >
            {(viewMode === "editor" || viewMode === "split") && (
              <div
                className="flex flex-col min-w-0 flex-1"
                style={{ width: viewMode === "split" ? `${splitRatio * 100}%` : "100%" }}
              >
                <WikiEditorToolbar
                  textareaRef={contentTextareaRef}
                  value={content}
                  onChange={handleContentChange}
                  onSave={performSave}
                  onTogglePreview={toggleViewMode}
                  showPreview={isPreviewOnly}
                />
                <textarea
                  ref={contentTextareaRef}
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  rows={18}
                  className="bpm-textarea flex-1 w-full px-3 py-2 rounded-b border font-mono text-sm min-h-[200px]"
                  style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
                />
              </div>
            )}
            {viewMode === "split" && (
              <div
                role="separator"
                aria-valuenow={splitRatio}
                className="w-2 flex-shrink-0 cursor-col-resize hover:bg-[var(--bpm-accent)] transition-colors"
                style={{ background: "var(--bpm-border)" }}
                onMouseDown={() => { splitDragRef.current = true; }}
              />
            )}
            {(viewMode === "split" || viewMode === "preview") && (
              <div
                className="flex-1 min-w-0 overflow-auto p-4 prose prose-sm max-w-none"
                style={{
                  width: viewMode === "split" ? `${(1 - splitRatio) * 100}%` : "100%",
                  borderColor: "var(--bpm-border)",
                  background: "var(--bpm-bg-secondary)",
                  color: "var(--bpm-text-primary)",
                }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeHighlight]}
                >
                  {contentWithWikiLinks(content) || t.article.noContent}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? t.common.saving : t.common.save}
          </Button>
          <Link href={`/modules/wiki/${slug}`}>
            <Button type="button" variant="outline">{t.common.cancel}</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
