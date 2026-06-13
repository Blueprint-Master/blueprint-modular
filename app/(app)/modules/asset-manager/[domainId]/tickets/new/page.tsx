"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, Caption, Divider, Button, Spinner, Input, Selectbox } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../../../strings";

type DomainConfig = {
  ticket_types?: string[];
  priorities: { id: string; label: string }[];
  ticket_categories: { id: string; label: string; subcategories: string[] }[];
};

export default function AssetManagerTicketNewPage() {
  const params = useParams();
  const router = useRouter();
  const { locale } = useI18n();
  const t = STR[locale];
  const tt = t.tickets;
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const [config, setConfig] = useState<DomainConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [typeId, setTypeId] = useState("");
  const [priorityId, setPriorityId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [assetId, setAssetId] = useState("");
  const [assets, setAssets] = useState<{ id: string; reference: string; label: string }[]>([]);
  const [suggestedArticles, setSuggestedArticles] = useState<{ id: string; title: string; slug: string }[]>([]);

  useEffect(() => {
    if (!domainId) return;
    Promise.all([
      fetch(`/api/asset-manager/config/${domainId}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/asset-manager/assets?domainId=${encodeURIComponent(domainId)}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([cfg, list]) => {
        setConfig(cfg);
        setAssets(Array.isArray(list) ? list : []);
        if (cfg?.priorities?.length) setPriorityId(cfg.priorities[0].id);
        if (cfg?.ticket_categories?.length) setCategoryId(cfg.ticket_categories[0].id);
        if (cfg?.ticket_types?.length) setTypeId(cfg.ticket_types[0]);
      })
      .finally(() => setLoading(false));
  }, [domainId]);

  useEffect(() => {
    if (!domainId || !categoryId) {
      setSuggestedArticles([]);
      return;
    }
    const params = new URLSearchParams({ domainId, categoryId });
    fetch(`/api/asset-manager/knowledge?${params}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((list: { id: string; title: string; slug: string }[]) => setSuggestedArticles(Array.isArray(list) ? list.slice(0, 5) : []));
  }, [domainId, categoryId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || saving) return;
    setSaving(true);
    fetch("/api/asset-manager/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        domainId,
        title: title.trim(),
        description: description.trim(),
        typeId: typeId || undefined,
        priorityId: priorityId || undefined,
        categoryId: categoryId || undefined,
        subcategory: subcategory.trim() || null,
        assetId: assetId.trim() || null,
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((created) => {
        if (created?.id) router.push(`/modules/asset-manager/${domainId}/tickets/${created.id}`);
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

  const typeOptions = (config?.ticket_types ?? []).map((tk: string) => ({ value: tk, label: tk }));
  const priorityOptions = (config?.priorities ?? []).map((p: { id: string; label: string }) => ({ value: p.id, label: p.label }));
  const categoryOptions = (config?.ticket_categories ?? []).map((c: { id: string; label: string }) => ({ value: c.id, label: c.label }));
  const selectedCategory = config?.ticket_categories?.find((c: { id: string; subcategories: string[] }) => c.id === categoryId);
  const subcategoryOptions = (selectedCategory?.subcategories ?? []).map((s: string) => ({ value: s, label: s }));

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <nav className="doc-breadcrumb">
          <Link href="/modules">{t.common.breadcrumbModules}</Link> → <Link href="/modules/asset-manager">{t.common.moduleTitle}</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}`}>{tt.breadcrumbDashboard}</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}/tickets`}>{tt.breadcrumbTickets}</Link> → {tt.breadcrumbNew}
        </nav>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>{tt.newTicket}</h1>
        <Caption>{tt.fillBelow}</Caption>
      </div>

      <Card variant="outlined">
        <form onSubmit={handleSubmit} className="space-y-0">
          <section className="space-y-4" aria-label={tt.sectionRequest}>
            <Input label={tt.fieldTitle} value={title} onChange={(value) => setTitle(value)} required placeholder={tt.placeholderTitle} />
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{tt.fieldDescriptionRequired}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={5}
                className="bpm-textarea w-full rounded-lg border px-3 py-2 text-sm resize-y"
                style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
                placeholder={tt.placeholderDescription}
              />
            </div>
          </section>

          {(typeOptions.length > 0 || priorityOptions.length > 0 || categoryOptions.length > 0 || subcategoryOptions.length > 0 || assets.length > 0) && (
            <>
              <Divider thickness={1} color="var(--bpm-border)" className="my-4" label={tt.sectionClassification} />
              <section className="space-y-4" aria-label={tt.sectionClassification}>
                {typeOptions.length > 0 && (
                  <Selectbox label={tt.fieldType} value={typeId} onChange={(v) => setTypeId(String(v))} options={[{ value: "", label: t.common.dash }, ...typeOptions]} />
                )}
                {priorityOptions.length > 0 && (
                  <Selectbox label={tt.fieldPriority} value={priorityId} onChange={(v) => setPriorityId(String(v))} options={priorityOptions} />
                )}
                {categoryOptions.length > 0 && (
                  <Selectbox label={tt.fieldCategory} value={categoryId} onChange={(v) => setCategoryId(String(v))} options={categoryOptions} />
                )}
                {subcategoryOptions.length > 0 && (
                  <Selectbox label={tt.fieldSubcategory} value={subcategory} onChange={(v) => setSubcategory(String(v))} options={[{ value: "", label: t.common.dash }, ...subcategoryOptions]} />
                )}
                {assets.length > 0 && (
                  <Selectbox
                    label={tt.fieldRelatedAsset}
                    value={assetId}
                    onChange={(v) => setAssetId(String(v))}
                    options={[{ value: "", label: tt.optionNone }, ...assets.map((a) => ({ value: a.id, label: `${a.reference} — ${a.label}` }))]}
                  />
                )}
              </section>
            </>
          )}

          {suggestedArticles.length > 0 && (
            <>
              <Divider thickness={1} color="var(--bpm-border)" className="my-4" label={tt.sectionHelp} />
              <section className="rounded-lg border p-3" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }} aria-label={tt.suggestedArticles}>
                <div className="text-sm font-medium mb-2" style={{ color: "var(--bpm-text-secondary)" }}>{tt.suggestedArticles}</div>
                <ul className="space-y-1 text-sm">
                  {suggestedArticles.map((a) => (
                    <li key={a.id}>
                      <Link
                        href={`/modules/asset-manager/${domainId}/knowledge/${a.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                        style={{ color: "var(--bpm-accent)" }}
                      >
                        {a.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}

          <Divider thickness={1} color="var(--bpm-border)" className="my-4" />
          <div className="flex gap-2 mt-6">
            <Button type="submit" size="small" disabled={saving || !title.trim() || !description.trim()}>
              {saving ? t.common.creating : tt.createTicket}
            </Button>
            <Link href={`/modules/asset-manager/${domainId}/tickets`}>
              <Button type="button" variant="outline" size="small">{t.common.cancel}</Button>
            </Link>
          </div>
        </form>
      </Card>

      <nav className="doc-pagination mt-8">
        <Link href={`/modules/asset-manager/${domainId}/tickets`} style={{ color: "var(--bpm-accent-cyan)" }}>{tt.backToList}</Link>
      </nav>
    </div>
  );
}
