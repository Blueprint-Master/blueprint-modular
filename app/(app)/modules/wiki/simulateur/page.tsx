"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import { Button } from "@/components/bpm";
import { WikiEditorToolbar } from "@/components/wiki/WikiEditorToolbar";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";
import "highlight.js/styles/github.css";

const STORAGE_KEY_SANDBOX_TO_NEW = "wiki-sandbox-content";

export default function WikiSimulateurPage() {
  const { locale } = useI18n();
  const t = STR[locale];
  const router = useRouter();
  const [content, setContent] = useState(t.sandbox.initialContent);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  const handleReset = () => {
    if (typeof window !== "undefined" && window.confirm(t.sandbox.confirmReset)) {
      setContent(t.sandbox.initialContent);
    }
  };

  const handleCreateFromContent = () => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(STORAGE_KEY_SANDBOX_TO_NEW, content);
      } catch {
        // ignore quota
      }
      router.push("/modules/wiki/new");
    }
  };

  return (
    <div className="doc-page">
      <nav className="doc-breadcrumb mb-4">
        <Link href="/modules">{t.common.modules}</Link>
        {" → "}
        <Link href="/modules/wiki">Wiki</Link>
        {" → "}
        {t.sandbox.breadcrumb}
      </nav>

      <div
        className="mb-4 py-3 px-4 rounded-lg border flex items-center justify-between flex-wrap gap-2"
        style={{
          background: "var(--bpm-bg-secondary)",
          borderColor: "var(--bpm-border)",
          color: "var(--bpm-text-secondary)",
        }}
        role="status"
        aria-live="polite"
      >
        <span className="text-sm font-medium">
          {t.sandbox.sandboxNotice}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="small" onClick={handleReset} aria-label={t.sandbox.resetLabel}>
            {t.sandbox.reset}
          </Button>
          <Button variant="primary" size="small" onClick={handleCreateFromContent} aria-label={t.sandbox.createFromContentLabel}>
            {t.sandbox.createFromContent}
          </Button>
        </div>
      </div>

      <h1 className="text-xl font-semibold mb-4" style={{ color: "var(--bpm-text-primary)" }}>
        {t.sandbox.title}
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.sandbox.intro}
      </p>

      <div
        className="grid gap-4 rounded-lg border overflow-hidden grid-cols-1 lg:grid-cols-2"
        style={{
          borderColor: "var(--bpm-border)",
          background: "var(--bpm-bg-primary)",
        }}
      >
        {/* Colonne gauche : éditeur */}
        <div className="flex flex-col min-h-0 lg:border-r" style={{ borderColor: "var(--bpm-border)" }}>
          <div className="shrink-0 p-2 border-b" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>
            <WikiEditorToolbar
              textareaRef={contentTextareaRef}
              value={content}
              onChange={setContent}
            />
          </div>
          <textarea
            ref={contentTextareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 min-h-[480px] p-4 font-mono text-sm resize-none border-0 rounded-none w-full"
            style={{
              background: "var(--bpm-bg-primary)",
              color: "var(--bpm-text-primary)",
            }}
            placeholder={t.sandbox.contentPlaceholder}
            aria-label={t.sandbox.editAreaLabel}
          />
        </div>

        {/* Colonne droite : prévisualisation */}
        <div className="flex flex-col min-h-0 overflow-auto">
          <div
            className="p-4 min-h-[480px] prose prose-sm max-w-none wiki-sandbox-preview"
            style={{
              background: "var(--bpm-bg-primary)",
              color: "var(--bpm-text-primary)",
            }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeHighlight]}
            >
              {content || t.article.noContent}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      <p className="text-xs mt-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.sandbox.footnote}
      </p>
    </div>
  );
}
