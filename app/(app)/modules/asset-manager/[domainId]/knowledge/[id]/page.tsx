"use client";

import { useState, useEffect } from "react";
import { readResponse } from "../../../lib/read-response";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Panel, Button, Badge, Metric, Divider } from "@/components/bpm";
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
  canEdit: boolean;
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
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const endpoint = `/api/asset-manager/knowledge/${id}`;

  useEffect(() => {
    let current = true;
    setError(""); setLoading(true); setArticle(null);
    async function load() {
      const item = await fetch(endpoint).then(readResponse);
      const counts = await fetch(endpoint + "/reader", { method: "PUT", headers: { "Content-Type": "application/json" }, body: "{}" }).then(readResponse);
      if (current) { setArticle({ ...item, ...counts }); setHelpful(counts.helpful); }
    }
    load().catch(err => { if (current) setError(err.message); }).finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [domainId, endpoint]);

  async function vote(value: boolean) {
    setBusy(true); setError("");
    try {
      const counts = await fetch(endpoint + "/reader", { method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ helpful: helpful === value ? null : value }) }).then(readResponse);
      setHelpful(counts.helpful);
      setArticle(item => item && ({ ...item, ...counts }));
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(false); }
  }

  async function remove() {
    if (!article || !window.confirm(locale === "fr" ? "Supprimer cet article ?" : "Delete this article?")) return;
    setBusy(true); setError("");
    try {
      await fetch(endpoint + "?expectedUpdatedAt=" + encodeURIComponent(article.updatedAt), { method: "DELETE" }).then(readResponse);
      router.push(`/modules/asset-manager/${domainId}/knowledge`);
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(false); }
  }

  if (loading) {
    return <FicheSkeleton sections={1} withMetrics />;
  }

  if (!article) {
    return (
      <div className="doc-page">
        <Panel variant="warning" title={tk.notFoundTitle}>{error || tk.notFoundDescription}</Panel>
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
        <Button size="small" variant={helpful === true ? "primary" : "outline"} disabled={busy} onClick={() => vote(true)}>{tk.metricHelpful}</Button>
        <Button size="small" variant={helpful === false ? "primary" : "outline"} disabled={busy} onClick={() => vote(false)}>{tk.metricNotHelpful}</Button>
        {article.canEdit && <><Link href={`/modules/asset-manager/${domainId}/knowledge/${id}/edit`}>
          <Button size="small" variant="outline">{t.common.edit}</Button>
        </Link><Button size="small" variant="outline" disabled={busy} onClick={remove}>{locale === "fr" ? "Supprimer" : "Delete"}</Button></>}
      </div>
      {error && <p role="alert">{error}</p>}

      <Divider thickness={1} color="var(--bpm-border)" className="my-4" />
      <FicheSectionCard title={tk.sectionContent} className="mt-4">
        <Markdown text={article.content} className="prose prose-sm max-w-none" />
      </FicheSectionCard>

      <FicheNav backLink={`/modules/asset-manager/${domainId}/knowledge`} backLabel={`← ${tk.title}`} />
    </div>
  );
}
