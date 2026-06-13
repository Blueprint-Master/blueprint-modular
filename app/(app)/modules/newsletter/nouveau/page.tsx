"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Panel, Input, Textarea } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

export default function NewsletterNouveauPage() {
  const router = useRouter();
  const { locale } = useI18n();
  const str = STR[locale];
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const t = title.trim();
    if (!t) {
      setError(str.titleRequired);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/newsletter/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: t,
          content: content,
          excerpt: excerpt.trim() || null,
          publishedAt: publishedAt.trim() ? publishedAt.trim() : null,
        }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data && typeof data.error === "string") ? data.error : str.createError);
        return;
      }
      const article = await res.json();
      router.push(`/modules/newsletter/${article.id}`);
    } catch {
      setError(str.networkError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/newsletter">{str.moduleName}</Link> → {str.newBreadcrumb}
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
          {str.newTitle}
        </h1>
        <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
          {str.newDescription}
        </p>
      </div>

      <Panel variant="info" title={str.newPanelTitle}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              {str.titleLabel}
            </label>
            <Input
              value={title}
              onChange={setTitle}
              placeholder={str.titlePlaceholder}
              aria-label={str.titleAria}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              {str.contentLabel}
            </label>
            <Textarea
              value={content}
              onChange={setContent}
              placeholder={str.newContentPlaceholder}
              aria-label={str.contentAria}
              rows={10}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              {str.excerptLabel}
            </label>
            <Textarea
              value={excerpt}
              onChange={setExcerpt}
              placeholder={str.newExcerptPlaceholder}
              aria-label={str.excerptAria}
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              {str.publishedAtLabel}
            </label>
            <input
              type="datetime-local"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm min-h-[44px]"
              style={{
                borderColor: "var(--bpm-border)",
                background: "var(--bpm-bg-primary)",
                color: "var(--bpm-text-primary)",
              }}
              aria-label={str.publishedAtAria}
            />
          </div>
          {error && (
            <p className="text-sm" style={{ color: "var(--bpm-accent)" }}>
              {error}
            </p>
          )}
          <div className="flex items-center gap-2">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? str.creating : str.createSubmit}
            </Button>
            <Link href="/modules/newsletter">
              <Button type="button" variant="secondary">
                {str.cancel}
              </Button>
            </Link>
          </div>
        </form>
      </Panel>

      <nav className="doc-pagination mt-8">
        <Link href="/modules/newsletter" style={{ color: "var(--bpm-accent-cyan)" }}>
          {str.backToModule}
        </Link>
      </nav>
    </div>
  );
}
