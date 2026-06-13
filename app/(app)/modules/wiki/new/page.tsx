"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button, Panel, Toggle, Selectbox } from "@/components/bpm";
import { WikiEditorToolbar } from "@/components/wiki/WikiEditorToolbar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { getGuestWikiArticles, addGuestArticle } from "@/lib/wiki-guest";
import { normalizeSlug } from "@/lib/slug";
import { VoiceRecorder } from "@/components/ai/VoiceRecorder";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

function slugFromTitle(title: string): string {
  return normalizeSlug(title);
}

export default function WikiNewPage() {
  const { locale } = useI18n();
  const tr = STR[locale];
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [pinned, setPinned] = useState(false);
  const [preview, setPreview] = useState(false);
  const [parents, setParents] = useState<{ id: string; title: string; slug: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [articleType, setArticleType] = useState<"guide" | "procedure" | "best-practice" | "reference">("procedure");
  const [workspace, setWorkspace] = useState<"service1" | "service2" | "shared">("service1");
  const [generating, setGenerating] = useState(false);

  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  /** Parent depuis l'URL (?parentId=...) pour créer un sous-article depuis la liste. */
  useEffect(() => {
    const pid = searchParams.get("parentId");
    if (pid) setParentId(pid);
  }, [searchParams]);

  /** Pré-remplir depuis le bac à sable (Simulateur) si l'utilisateur a cliqué sur "Créer un article depuis ce contenu". */
  useEffect(() => {
    try {
      const fromSandbox = typeof window !== "undefined" && sessionStorage.getItem("wiki-sandbox-content");
      if (fromSandbox) {
        sessionStorage.removeItem("wiki-sandbox-content");
        setContent(fromSandbox);
        const firstH1 = fromSandbox.split("\n").find((l) => l.startsWith("# "));
        if (firstH1 && !title) {
          const t = firstH1.replace(/^#+\s*/, "").trim();
          if (t) {
            setTitle(t);
            setSlug(slugFromTitle(t));
          }
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetch("/api/wiki", { credentials: "include" })
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => setParents(Array.isArray(data) ? data : []))
        .catch(() => setParents([]));
    } else {
      const guest = getGuestWikiArticles();
      setParents(guest.map((a) => ({ id: a.id, title: a.title, slug: a.slug })));
    }
  }, [session]);

  const handleTitleChange = (v: string) => {
    setTitle(v);
    setSlug(slugFromTitle(v));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const finalSlug = normalizeSlug(slug || slugFromTitle(title));
      if (!session) {
        const article = addGuestArticle({
          title,
          content,
          slug: finalSlug,
          parentId,
          isPublished,
          author: { name: tr.new.guestAuthor },
        });
        router.push(`/modules/wiki/${article.slug}`);
        return;
      }
      const res = await fetch("/api/wiki", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          slug: finalSlug,
          parentId: parentId || undefined,
          isPublished,
          excerpt: excerpt.trim() || undefined,
          tags: tags.length ? tags : undefined,
          pinned,
        }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? tr.new.genericError);
      }
      const article = await res.json();
      router.push(`/modules/wiki/${article.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : tr.new.genericError);
    } finally {
      setSaving(false);
    }
  };

  const handleVoiceTranscription = async (transcription: string) => {
    setVoiceError(null);
    setGenerating(true);
    setContent(tr.new.generatingHeader);

    try {
      const res = await fetch("/api/wiki/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: transcription, articleType, workspace }),
      });
      if (!res.ok) throw new Error(tr.new.genErrorStatus(res.status));

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          for (const line of decoder.decode(value, { stream: true }).split("\n")) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.slice(6)) as { type: string; t?: string };
              if (data.type === "chunk" && data.t) {
                full += data.t;
                setContent(full);
              }
            } catch { /* ignore */ }
          }
        }
      }
      if (!title.trim()) {
        const firstH1 = full.split("\n").find((l) => l.startsWith("# "));
        if (firstH1) handleTitleChange(firstH1.replace(/^#+\s*/, "").trim());
      }
    } catch (err) {
      setVoiceError(err instanceof Error ? err.message : tr.new.genError);
      setContent("");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--bpm-accent)" }}>
        {tr.new.title}
      </h1>

      {error && (
        <Panel variant="error" title={tr.common.error} className="mb-4">
          {error}
        </Panel>
      )}

      {/* Bloc vocal */}
      <div
        className="rounded-lg border p-4 mb-6"
        style={{ background: "var(--bpm-bg-primary)", borderColor: "var(--bpm-border)" }}
      >
        <p className="text-sm font-semibold mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
          {tr.new.generateFromVoice}
        </p>
        <div className="flex gap-3 mb-3 flex-wrap">
          <Selectbox
            label={tr.new.typeLabel}
            options={[
              { value: "procedure", label: tr.new.typeProcedure },
              { value: "guide", label: tr.new.typeGuide },
              { value: "best-practice", label: tr.new.typeBestPractice },
              { value: "reference", label: tr.new.typeReference },
            ]}
            value={articleType}
            onChange={(v) => setArticleType(v as typeof articleType)}
            placeholder={tr.new.typeLabel}
          />
          <Selectbox
            label={tr.new.workspaceLabel}
            options={[
              { value: "service1", label: tr.new.workspaceService1 },
              { value: "service2", label: tr.new.workspaceService2 },
              { value: "shared", label: tr.new.workspaceShared },
            ]}
            value={workspace}
            onChange={(v) => setWorkspace(v as typeof workspace)}
            placeholder={tr.new.workspaceLabel}
          />
        </div>
        <div className="flex items-center gap-3">
          <VoiceRecorder
            onTranscription={handleVoiceTranscription}
            onError={setVoiceError}
            label={tr.new.dictateArticle}
            disabled={generating}
          />
          {generating && (
            <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
              {tr.new.generatingQwen}
            </span>
          )}
        </div>
        {voiceError && (
          <p className="text-sm mt-2" style={{ color: "var(--bpm-accent)" }}>⚠ {voiceError}</p>
        )}
        <p className="text-xs mt-2" style={{ color: "var(--bpm-text-secondary)" }}>
          {tr.new.voiceHint}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
        <label className="block">
          <span className="block text-sm mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{tr.new.labelTitle}</span>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
            className="bpm-input w-full px-3 py-2 rounded border"
            style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
          />
        </label>
        <label className="block">
          <span className="block text-sm mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{tr.new.labelSlug}</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={tr.new.slugPlaceholder}
            className="bpm-input w-full px-3 py-2 rounded border"
            style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
          />
        </label>
        <Selectbox
          label={tr.new.labelParent}
          options={[{ value: "", label: tr.new.parentNone }, ...parents.map((p) => ({ value: p.id, label: p.title }))]}
          value={parentId ?? ""}
          onChange={(v) => setParentId(v || null)}
          placeholder={tr.new.parentNone}
        />
        <div>
          <Toggle label={tr.new.labelPublished} value={isPublished} onChange={setIsPublished} />
        </div>
        <div>
          <Toggle label={tr.new.labelPin} value={pinned} onChange={setPinned} />
        </div>
        <label className="block">
          <span className="block text-sm mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{tr.new.labelExcerpt}</span>
          <input
            type="text"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder={tr.new.excerptPlaceholder}
            className="bpm-input w-full px-3 py-2 rounded border"
            style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
          />
        </label>
        <label className="block">
          <span className="block text-sm mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{tr.new.labelTags}</span>
          <div className="flex flex-wrap gap-1 mb-1">
            {tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm" style={{ background: "var(--bpm-border)", color: "var(--bpm-text-primary)" }}>
                {t}
                <button type="button" onClick={() => setTags((prev) => prev.filter((x) => x !== t))} className="opacity-70 hover:opacity-100" aria-label={tr.new.removeTag}>×</button>
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
              placeholder={tr.new.tagPlaceholder}
              className="flex-1 min-w-[120px] px-2 py-1 rounded border text-sm"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
            />
          </div>
        </label>

        <div className="flex items-center gap-2 border-b pb-2" style={{ borderColor: "var(--bpm-border)" }}>
          <Toggle
            label={preview ? tr.new.previewOn : tr.new.previewOff}
            value={preview}
            onChange={setPreview}
          />
        </div>

        {preview ? (
          <div
            className="min-h-[400px] p-4 rounded border prose prose-sm max-w-none"
            style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{content || tr.article.noContent}</ReactMarkdown>
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
              placeholder={tr.new.contentPlaceholder}
            />
          </>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? tr.common.saving : tr.common.save}
          </Button>
          <Link href="/modules/wiki">
            <Button type="button" variant="outline">{tr.common.cancel}</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
