"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Panel, Button, Spinner, Input, Selectbox } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../../../../strings";

export default function AssetManagerKnowledgeEditPage() {
  const params = useParams();
  const router = useRouter();
  const { locale } = useI18n();
  const t = STR[locale];
  const tk = t.knowledge;
  const CATEGORY_OPTIONS = Object.entries(tk.categoryLabels).map(([value, label]) => ({ value, label }));
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const id = typeof params?.id === "string" ? params.id : "";
  const [config, setConfig] = useState<{ asset_types?: { id: string; label: string }[] } | null>(null);
  const [article, setArticle] = useState<{ title: string; content: string; categoryId: string; assetTypeId: string | null; tags: string[]; visibility: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("procedure");
  const [assetTypeId, setAssetTypeId] = useState("");
  const [tagsStr, setTagsStr] = useState("");
  const [visibility, setVisibility] = useState<"technicians_only" | "public">("technicians_only");

  useEffect(() => {
    if (!domainId || !id) return;
    Promise.all([
      fetch(`/api/asset-manager/config/${domainId}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/asset-manager/knowledge/${id}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([cfg, a]) => {
        setConfig(cfg);
        setArticle(a);
        if (a) {
          setTitle(a.title);
          setContent(a.content);
          setCategoryId(a.categoryId);
          setAssetTypeId(a.assetTypeId ?? "");
          setTagsStr(Array.isArray(a.tags) ? a.tags.join(", ") : "");
          setVisibility(a.visibility === "public" ? "public" : "technicians_only");
        }
      })
      .finally(() => setLoading(false));
  }, [domainId, id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!article || saving) return;
    setSaving(true);
    const tags = tagsStr.trim() ? tagsStr.split(/[\s,]+/).map((tag) => tag.trim()).filter(Boolean) : [];
    fetch(`/api/asset-manager/knowledge/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        title: title.trim(),
        content: content.trim(),
        categoryId,
        assetTypeId: assetTypeId || null,
        tags,
        visibility,
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((updated) => {
        if (updated) router.push(`/modules/asset-manager/${domainId}/knowledge/${id}`);
      })
      .finally(() => setSaving(false));
  };

  if (loading || !article) {
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
          <Link href={`/modules/asset-manager/${domainId}/knowledge`} style={{ color: "var(--bpm-accent-cyan)" }}>{tk.title}</Link> → {article.title} → {t.common.edit}
        </nav>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>{tk.editArticleHeading}</h1>
      </div>

      <Panel variant="info" title={tk.editPanelTitle}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label={tk.fieldTitleRequired} value={title} onChange={setTitle} required />
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{tk.fieldContentRequired}</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={12}
              className="bpm-textarea w-full rounded-lg border px-3 py-2 text-sm resize-y"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
            />
          </div>
          <Selectbox label={tk.fieldCategory} value={categoryId} onChange={(v) => setCategoryId(String(v))} options={CATEGORY_OPTIONS} />
          {config?.asset_types && config.asset_types.length > 0 && (
            <Selectbox
              label={tk.fieldAssetTypeOptional}
              value={assetTypeId}
              onChange={(v) => setAssetTypeId(String(v))}
              options={[{ value: "", label: t.common.dash }, ...config.asset_types.map((at) => ({ value: at.id, label: at.label }))]}
            />
          )}
          <Input label={tk.fieldTags} value={tagsStr} onChange={setTagsStr} />
          <Selectbox
            label={tk.fieldVisibility}
            value={visibility}
            onChange={(v) => setVisibility(v as "technicians_only" | "public")}
            options={[
              { value: "technicians_only", label: tk.visibilityTechniciansOnly },
              { value: "public", label: tk.visibilityPublic },
            ]}
          />
          <div className="flex gap-2 mt-6">
            <Button type="submit" size="small" disabled={saving}>{t.common.save}</Button>
            <Link href={`/modules/asset-manager/${domainId}/knowledge/${id}`}>
              <Button type="button" size="small" variant="outline">{t.common.cancel}</Button>
            </Link>
          </div>
        </form>
      </Panel>

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href={`/modules/asset-manager/${domainId}/knowledge/${id}`} style={{ color: "var(--bpm-accent-cyan)" }}>← {tk.backToArticle}</Link>
      </nav>
    </div>
  );
}
