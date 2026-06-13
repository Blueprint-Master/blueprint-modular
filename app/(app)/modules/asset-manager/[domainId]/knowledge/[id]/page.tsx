"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Panel, Button, Spinner, Badge, Metric, Divider } from "@/components/bpm";
import { Markdown } from "@/components/bpm/Markdown";
import { FicheHeader, FicheSectionCard, FicheNav, FicheSkeleton } from "@/components/fiche";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR, dateLocale } from "../../../strings";

type KnowledgeArticle = {
  id: string;
  title: string;
  slug: string;
  content: string;
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

export default function AssetManagerKnowledgeDetailPage() {
  const params = useParams();
  const { locale } = useI18n();
  const t = STR[locale];
  const tk = t.knowledge;
  const CATEGORY_LABELS = tk.categoryLabels;
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const id = typeof params?.id === "string" ? params.id : "";
  const [article, setArticle] = useState<KnowledgeArticle | null>(null);
  const [config, setConfig] = useState<{ asset_types?: { id: string; label: string }[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!domainId || !id) return;
    Promise.all([
      fetch(`/api/asset-manager/config/${domainId}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/asset-manager/knowledge/${id}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([cfg, a]) => {
        setConfig(cfg);
        setArticle(a);
      })
      .finally(() => setLoading(false));
  }, [domainId, id]);

  if (loading) {
    return <FicheSkeleton sections={1} withMetrics />;
  }

  if (!article) {
    return (
      <div className="doc-page">
        <Panel variant="warning" title={tk.notFoundTitle}>{tk.notFoundDescription}</Panel>
        <FicheNav backLink={`/modules/asset-manager/${domainId}/knowledge`} backLabel={`← ${tk.title}`} />
      </div>
    );
  }

  return (
    <div className="doc-page">
      <FicheHeader
        breadcrumb={
          <>
            <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>{t.common.breadcrumbModules}</Link> →{" "}
            <Link href="/modules/asset-manager" style={{ color: "var(--bpm-accent-cyan)" }}>{t.common.moduleTitle}</Link> →{" "}
            <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>{t.nav.dashboard}</Link> →{" "}
            <Link href={`/modules/asset-manager/${domainId}/knowledge`} style={{ color: "var(--bpm-accent-cyan)" }}>{tk.title}</Link> → {article.title}
          </>
        }
        title={article.title}
        subtitle={
          <>
            <Badge variant="default">{CATEGORY_LABELS[article.categoryId] ?? article.categoryId}</Badge>
            {article.tags.length > 0 && article.tags.map((tag) => <Badge key={tag} variant="default">{tag}</Badge>)}
            {article.publishedAt && (
              <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
                {tk.publishedOn(new Date(article.publishedAt).toLocaleDateString(dateLocale(locale)))}
              </span>
            )}
          </>
        }
      />
      <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
        <div className="flex flex-wrap gap-3">
          <Metric label={tk.metricViews} value={article.viewsCount} border={false} />
          <Metric label={tk.metricHelpful} value={article.helpfulCount} border={false} />
          <Metric label={tk.metricNotHelpful} value={article.notHelpfulCount} border={false} />
        </div>
        <Link href={`/modules/asset-manager/${domainId}/knowledge/${id}/edit`}>
          <Button size="small" variant="outline">{t.common.edit}</Button>
        </Link>
      </div>

      <Divider thickness={1} color="var(--bpm-border)" className="my-4" />
      <FicheSectionCard title={tk.sectionContent} className="mt-4">
        <Markdown text={article.content} className="prose prose-sm max-w-none" />
      </FicheSectionCard>

      <FicheNav backLink={`/modules/asset-manager/${domainId}/knowledge`} backLabel={`← ${tk.title}`} />
    </div>
  );
}
