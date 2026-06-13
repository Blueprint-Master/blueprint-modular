"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Card, Caption, Divider, Button, Spinner, Input, Selectbox } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../../../strings";

export default function AssetManagerKnowledgeNewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useI18n();
  const t = STR[locale];
  const tk = t.knowledge;
  const CATEGORY_OPTIONS = Object.entries(tk.categoryLabels).map(([value, label]) => ({ value, label }));
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const fromTicketId = searchParams.get("fromTicket");
  const [config, setConfig] = useState<{ asset_types?: { id: string; label: string }[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("procedure");
  const [assetTypeId, setAssetTypeId] = useState("");
  const [tagsStr, setTagsStr] = useState("");
  const [visibility, setVisibility] = useState<"technicians_only" | "public">("technicians_only");

  useEffect(() => {
    if (!domainId) return;
    fetch(`/api/asset-manager/config/${domainId}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then(setConfig)
      .finally(() => setLoading(false));
  }, [domainId]);

  useEffect(() => {
    if (!fromTicketId || !domainId) return;
    fetch(`/api/asset-manager/tickets/${fromTicketId}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((ticket: { title?: string; solution?: string | null; description?: string } | null) => {
        if (ticket) {
          setTitle(ticket.title ?? "");
          setContent([ticket.solution, ticket.description].filter(Boolean).join("\n\n---\n\n") || "");
        }
      });
  }, [fromTicketId, domainId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || saving) return;
    setSaving(true);
    const tags = tagsStr.trim() ? tagsStr.split(/[\s,]+/).map((tag) => tag.trim()).filter(Boolean) : [];
    fetch("/api/asset-manager/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        domainId,
        title: title.trim(),
        content: content.trim(),
        categoryId,
        assetTypeId: assetTypeId || null,
        tags,
        visibility,
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((created) => {
        if (created?.id) router.push(`/modules/asset-manager/${domainId}/knowledge/${created.id}`);
      })
      .finally(() => setSaving(false));
  };

  if (loading) {
    return (
      <div className="doc-page flex justify-center py-12">
        <Spinner size="medium" />
      </div>
    );
  }

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <nav className="doc-breadcrumb">
          <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>{t.common.breadcrumbModules}</Link> →{" "}
          <Link href="/modules/asset-manager" style={{ color: "var(--bpm-accent-cyan)" }}>{t.common.moduleTitle}</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>{t.nav.dashboard}</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}/knowledge`} style={{ color: "var(--bpm-accent-cyan)" }}>{tk.title}</Link> → {tk.breadcrumbNew}
        </nav>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>{tk.newArticleHeading}</h1>
        <Caption>
          {fromTicketId ? tk.prefilledFromTicket : tk.fillBelow}
        </Caption>
      </div>

      <Card variant="outlined">
        <form onSubmit={handleSubmit} className="space-y-0">
          <section className="space-y-4" aria-label={tk.sectionArticle}>
            <Input label={tk.fieldTitleRequired} value={title} onChange={setTitle} required placeholder={tk.placeholderTitle} />
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{tk.fieldContentRequired}</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={12}
                className="bpm-textarea w-full rounded-lg border px-3 py-2 text-sm resize-y"
                style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
                placeholder={tk.placeholderContent}
              />
            </div>
          </section>

          <Divider thickness={1} color="var(--bpm-border)" className="my-4" label={tk.sectionMetadata} />
          <section className="space-y-4" aria-label={tk.sectionMetadata}>
            <Selectbox label={tk.fieldCategory} value={categoryId} onChange={(v) => setCategoryId(String(v))} options={CATEGORY_OPTIONS} />
            {config?.asset_types && config.asset_types.length > 0 && (
              <Selectbox
                label={tk.fieldAssetTypeOptional}
                value={assetTypeId}
                onChange={(v) => setAssetTypeId(String(v))}
                options={[{ value: "", label: t.common.dash }, ...config.asset_types.map((at) => ({ value: at.id, label: at.label }))]}
              />
            )}
            <Input label={tk.fieldTags} value={tagsStr} onChange={setTagsStr} placeholder={tk.placeholderTags} />
            <Selectbox
              label={tk.fieldVisibility}
              value={visibility}
              onChange={(v) => setVisibility(v as "technicians_only" | "public")}
              options={[
                { value: "technicians_only", label: tk.visibilityTechniciansOnly },
                { value: "public", label: tk.visibilityPublic },
              ]}
            />
          </section>

          <Divider thickness={1} color="var(--bpm-border)" className="my-4" />
          <div className="flex gap-2 mt-6">
            <Button type="submit" size="small" disabled={saving || !title.trim() || !content.trim()}>
              {saving ? tk.creating : tk.createArticle}
            </Button>
            <Link href={`/modules/asset-manager/${domainId}/knowledge`}>
              <Button type="button" size="small" variant="outline">{t.common.cancel}</Button>
            </Link>
          </div>
        </form>
      </Card>

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href={`/modules/asset-manager/${domainId}/knowledge`} style={{ color: "var(--bpm-accent-cyan)" }}>← {tk.title}</Link>
      </nav>
    </div>
  );
}
