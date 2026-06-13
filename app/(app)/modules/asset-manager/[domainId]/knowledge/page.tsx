"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { Table, Spinner, Panel, Button, Chip, EmptyState } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR, dateLocale } from "../../strings";

type KnowledgeArticle = {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  assetTypeId: string | null;
  tags: string[];
  visibility: string;
  publishedAt: string | null;
  viewsCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  createdAt: string;
  updatedAt: string;
};

export default function AssetManagerKnowledgePage() {
  const params = useParams();
  const router = useRouter();
  const { locale } = useI18n();
  const t = STR[locale];
  const tk = t.knowledge;
  const CATEGORY_LABELS = tk.categoryLabels;
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [config, setConfig] = useState<{ domain_label?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (!domainId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const url = `/api/asset-manager/knowledge?domainId=${encodeURIComponent(domainId)}${filterCategory ? `&categoryId=${encodeURIComponent(filterCategory)}` : ""}`;
    Promise.all([
      fetch(`/api/asset-manager/config/${domainId}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
      fetch(url, { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([cfg, data]) => {
        setConfig(cfg);
        setArticles(Array.isArray(data) ? data : []);
      })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [domainId, filterCategory]);

  const columns = [
    { key: "title", label: tk.colTitle },
    {
      key: "categoryId",
      label: tk.colCategory,
      render: (val: unknown) => CATEGORY_LABELS[String(val)] ?? String(val),
    },
    {
      key: "tags",
      label: tk.colTags,
      render: (val: unknown) => (Array.isArray(val) ? (val as string[]).join(", ") : t.common.dash),
    },
    {
      key: "visibility",
      label: tk.colVisibility,
      render: (val: unknown) => (String(val) === "public" ? tk.visibilityPublic : tk.visibilityTechniciansShort),
    },
    {
      key: "publishedAt",
      label: tk.colPublishedAt,
      render: (val: unknown) => (val ? new Date(String(val)).toLocaleDateString(dateLocale(locale)) : tk.draft),
    },
    {
      key: "viewsCount",
      label: tk.colViews,
      render: (val: unknown) => String(val ?? 0),
    },
  ];

  const categoryOptions = [
    { value: "", label: tk.allCategories },
    ...Object.entries(CATEGORY_LABELS).map(([id, label]) => ({ value: id, label })),
  ];

  if (!config && !loading) {
    return (
      <div className="doc-page">
        <Panel variant="warning" title={t.hub.configNotFoundTitle}>{tk.checkUrl}</Panel>
        <Link href="/modules/asset-manager" style={{ color: "var(--bpm-accent-cyan)" }}>← {t.common.moduleTitle}</Link>
      </div>
    );
  }

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <nav className="doc-breadcrumb">
          <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>{t.common.breadcrumbModules}</Link> →{" "}
          <Link href="/modules/asset-manager" style={{ color: "var(--bpm-accent-cyan)" }}>{t.common.moduleTitle}</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>{t.nav.dashboard}</Link> → {tk.title}
        </nav>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>{tk.title}</h1>
            <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
              {tk.listSubtitle}
            </p>
          </div>
          <Link href={`/modules/asset-manager/${domainId}/knowledge/new`} className="asset-manager-cta-button">
            <Button variant="primary" size="small">{tk.newArticle}</Button>
          </Link>
        </div>
      </div>

      <div className={`asset-manager-equipment-filters ${!filtersOpen ? "asset-manager-equipment-filters--collapsed" : ""}`}>
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="asset-manager-equipment-filters__toggle"
          aria-expanded={filtersOpen}
          aria-controls="asset-manager-filters-knowledge"
          id="asset-manager-filters-toggle-knowledge"
        >
          <span className="asset-manager-equipment-filters__label">{tk.filters}</span>
          {filtersOpen ? <ChevronUp size={18} aria-hidden /> : <ChevronDown size={18} aria-hidden />}
        </button>
        <div id="asset-manager-filters-knowledge" role="region" aria-labelledby="asset-manager-filters-toggle-knowledge" hidden={!filtersOpen}>
          <div className="asset-manager-equipment-filters__row">
            <span className="asset-manager-equipment-filters__label">{tk.filterCategory}</span>
            <div className="asset-manager-equipment-filters__chips">
              {categoryOptions.map((opt) => {
                const isActive = filterCategory === opt.value;
                const isReset = opt.value === "";
                return (
                  <Chip
                    key={opt.value || "all"}
                    label={opt.label}
                    variant={isActive ? "primary" : "default"}
                    onClick={() => setFilterCategory(isActive ? "" : opt.value)}
                    className={`${isActive ? "asset-manager-chip-active" : ""} ${isReset ? "asset-manager-chip-reset" : ""}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="medium" />
        </div>
      ) : articles.length === 0 ? (
        <div className="rounded-xl border bg-[var(--bpm-surface)] p-4" style={{ border: "1px solid #E5E7EB", borderRadius: 12 }}>
          <EmptyState
            title={tk.emptyTitle}
            description={tk.emptyDescription}
            icon={<BookOpen size={64} style={{ color: "var(--bpm-text-secondary)", opacity: 0.6 }} />}
            action={
              <Link href={`/modules/asset-manager/${domainId}/knowledge/new`}>
                <Button variant="primary" size="small">{tk.newArticle}</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--bpm-border)" }}>
          <Table
            columns={columns}
            data={articles}
            minWidth={560}
            keyColumn="id"
            onRowClick={(row) => router.push(`/modules/asset-manager/${domainId}/knowledge/${(row as KnowledgeArticle).id}`)}
          />
        </div>
      )}

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>← {t.nav.dashboard}</Link>
        <Link href="/modules/asset-manager/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>{tk.documentation}</Link>
      </nav>
    </div>
  );
}
