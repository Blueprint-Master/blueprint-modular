"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Monitor, Ticket, UserCheck, FileText, BookOpen, RefreshCw } from "lucide-react";
import { Button, Spinner, Metric, Table, Panel } from "@/components/bpm";
import type { DomainConfig } from "@/lib/asset-manager/get-domain-config";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR, dateLocale } from "../strings";

const ACCENT = {
  assets: "#2563eb",
  tickets: "#f59e0b",
  assignments: "#8b5cf6",
  contracts: "#10b981",
  knowledge: "#06b6d4",
  changes: "#ec4899",
} as const;

function formatLastUpdated(iso: string | null | undefined, locale: "fr" | "en"): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (!Number.isFinite(d.getTime())) return "—";
    return d.toLocaleDateString(dateLocale(locale), { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return "—";
  }
}

type Asset = {
  id: string;
  reference: string;
  label: string;
  assetTypeId: string;
  statusId: string;
  domainId: string;
  updatedAt: string;
};

export default function AssetManagerDomainPage() {
  const params = useParams();
  const { locale } = useI18n();
  const t = STR[locale];
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const [config, setConfig] = useState<DomainConfig | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  const [ticketCount, setTicketCount] = useState(0);
  const [assignmentCount, setAssignmentCount] = useState(0);
  const [contractCount, setContractCount] = useState(0);
  const [knowledgeCount, setKnowledgeCount] = useState(0);
  const [changeCount, setChangeCount] = useState(0);
  const [alerts, setAlerts] = useState<{ contractsExpiring30: number; ticketsSlaRisk: number; assetsOutOfService: number }>({
    contractsExpiring30: 0,
    ticketsSlaRisk: 0,
    assetsOutOfService: 0,
  });
  const [lastUpdated, setLastUpdated] = useState<{
    assets: string | null;
    tickets: string | null;
    assignments: string | null;
    contracts: string | null;
    knowledge: string | null;
    changes: string | null;
  }>({ assets: null, tickets: null, assignments: null, contracts: null, knowledge: null, changes: null });

  useEffect(() => {
    if (!domainId) return;
    Promise.all([
      fetch(`/api/asset-manager/config/${domainId}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/asset-manager/assets?domainId=${encodeURIComponent(domainId)}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
      fetch(`/api/asset-manager/tickets?domainId=${encodeURIComponent(domainId)}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
      fetch(`/api/asset-manager/assignments?domainId=${encodeURIComponent(domainId)}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
      fetch(`/api/asset-manager/contracts?domainId=${encodeURIComponent(domainId)}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
      fetch(`/api/asset-manager/knowledge?domainId=${encodeURIComponent(domainId)}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
      fetch(`/api/asset-manager/changes?domainId=${encodeURIComponent(domainId)}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([cfg, list, tickets, assignments, contracts, knowledge, changes]) => {
        setConfig(cfg);
        const assetList = Array.isArray(list) ? list : [];
        setAssets(assetList);
        setTicketCount(Array.isArray(tickets) ? tickets.length : 0);
        setAssignmentCount(Array.isArray(assignments) ? assignments.length : 0);
        setContractCount(Array.isArray(contracts) ? contracts.length : 0);
        setKnowledgeCount(Array.isArray(knowledge) ? knowledge.length : 0);
        setChangeCount(Array.isArray(changes) ? changes.length : 0);
        const priorities = (cfg as DomainConfig)?.priorities ?? [];
        const openStatuses = ["new", "open", "pending", "in_progress", "assigned"];
        const now = Date.now();
        const in30Days = now + 30 * 24 * 60 * 60 * 1000;
        const contractsExpiring30 = (Array.isArray(contracts) ? contracts : []).filter((c: { endDate?: string | null }) => {
          const end = c.endDate ? new Date(c.endDate).getTime() : null;
          return end != null && end >= now && end <= in30Days;
        }).length;
        const ticketsSlaRisk = (Array.isArray(tickets) ? tickets : []).filter((t: { status: string; openedAt: string; priorityId: string }) => {
          if (!openStatuses.includes(t.status)) return false;
          const prio = priorities.find((p: { id: string; sla_hours: number }) => p.id === t.priorityId);
          const slaHours = prio?.sla_hours ?? 48;
          const opened = new Date(t.openedAt).getTime();
          const elapsed = (now - opened) / (1000 * 60 * 60);
          const pct = (elapsed / slaHours) * 100;
          return pct >= 80;
        }).length;
        const assetsOutOfService = assetList.filter((a: { statusId: string }) => a.statusId === "out_of_service").length;
        setAlerts({ contractsExpiring30, ticketsSlaRisk, assetsOutOfService });
        const ticketList = Array.isArray(tickets) ? tickets : [];
        const assignmentList = Array.isArray(assignments) ? assignments : [];
        const contractList = Array.isArray(contracts) ? contracts : [];
        const knowledgeList = Array.isArray(knowledge) ? knowledge : [];
        const changeList = Array.isArray(changes) ? changes : [];
        const latest = (arr: { updatedAt?: string | null }[]) => {
          if (!arr?.length) return null;
          const dates = arr.map((x) => (x?.updatedAt ? new Date(x.updatedAt).getTime() : 0)).filter(Boolean);
          if (!dates.length) return null;
          return new Date(Math.max(...dates)).toISOString();
        };
        setLastUpdated({
          assets: assetList[0]?.updatedAt ?? null,
          tickets: latest(ticketList),
          assignments: latest(assignmentList),
          contracts: latest(contractList),
          knowledge: latest(knowledgeList),
          changes: latest(changeList),
        });
      })
      .finally(() => setLoading(false));
  }, [domainId]);

  const getStatusLabel = (id: string) => config?.statuses.find((s) => s.id === id)?.label ?? id;
  const getStatusColor = (id: string) => {
    const c = config?.statuses.find((s) => s.id === id)?.color ?? "gray";
    const map: Record<string, string> = {
      green: "var(--bpm-accent-mint)",
      red: "var(--bpm-accent)",
      yellow: "var(--bpm-accent-amber, #f59e0b)",
      blue: "var(--bpm-accent-cyan)",
      gray: "var(--bpm-text-secondary)",
      orange: "#e65100",
    };
    return map[c] ?? map.gray;
  };

  const metricsCarouselRef = useRef<HTMLDivElement>(null);
  const scrollCarousel = useCallback((direction: "left" | "right") => {
    if (metricsCarouselRef.current) {
      const scrollAmount = 280;
      metricsCarouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  }, []);

  if (loading) {
    return (
      <div className="doc-page flex justify-center py-12">
        <Spinner size="medium" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="doc-page">
        <div className="doc-page-header mb-6">
          <nav className="doc-breadcrumb">
            <Link href="/modules">{t.common.breadcrumbModules}</Link> → {t.common.moduleTitle}
          </nav>
          <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
            {t.common.moduleTitle}
          </h1>
        </div>
        <Panel variant="warning" title={t.hub.configNotFoundTitle}>
          {t.hub.domainNotConfigured(domainId)}
        </Panel>
        <nav className="doc-pagination mt-6">
          <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>{t.common.backToModules}</Link>
        </nav>
      </div>
    );
  }

  const columns = [
    { key: "reference", label: t.hub.colReference },
    { key: "label", label: t.hub.colLabel },
    { key: "assetTypeId", label: t.hub.colType },
    {
      key: "statusId",
      label: t.hub.colStatus,
      render: (val: unknown) => {
        const id = String(val ?? "");
        return (
          <span
            className="rounded px-2 py-0.5 text-xs font-medium"
            style={{ backgroundColor: getStatusColor(id), color: "var(--bpm-bg)" }}
          >
            {getStatusLabel(id)}
          </span>
        );
      },
    },
  ];

  const tableData = assets.map((a) => ({
    id: a.id,
    reference: a.reference,
    label: a.label,
    assetTypeId: a.assetTypeId,
    statusId: a.statusId,
  }));

  const iconSize = 18;

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="doc-page-title text-2xl font-semibold" style={{ color: "var(--bpm-text-primary)" }}>
              {t.common.moduleTitle}
            </h1>
            <p className="doc-description mt-0.5" style={{ color: "var(--bpm-text-secondary)" }}>
              {t.hub.dashboardSubtitle(config.asset_label_plural, config.assignment_label)}
            </p>
          </div>
          <Link href={`/modules/asset-manager/${domainId}/assets/nouveau`} className="asset-manager-cta-button">
            <Button variant="primary" size="small">{t.hub.newAsset}</Button>
          </Link>
        </div>
      </div>

      <div className="asset-manager-metrics-carousel-container mb-6">
        <button
          type="button"
          className="asset-manager-carousel-btn asset-manager-carousel-btn--left"
          onClick={() => scrollCarousel("left")}
          aria-label={t.hub.scrollLeft}
        >
          ←
        </button>
        <div className="asset-manager-metrics-carousel" ref={metricsCarouselRef} role="region" aria-label={t.hub.metricsAriaLabel}>
          <Link href={`/modules/asset-manager/${domainId}/assets`} className="block min-w-0 overflow-hidden asset-manager-metrics-grid">
            <Metric
              label={config.asset_label_plural}
              value={assets.length}
              compact
              border={false}
              icon={<Monitor size={iconSize} />}
              accentColor={ACCENT.assets}
              subtext={assets.length === 0 ? t.hub.noAssetRegistered : t.hub.updatedAt(formatLastUpdated(lastUpdated.assets, locale))}
            />
          </Link>
          <Link href={`/modules/asset-manager/${domainId}/tickets`} className="block min-w-0 overflow-hidden asset-manager-metrics-grid">
            <Metric
              label={`${config.ticket_label_singular}s`}
              value={ticketCount}
              compact
              border={false}
              icon={<Ticket size={iconSize} />}
              accentColor={ACCENT.tickets}
              subtext={ticketCount === 0 ? t.hub.noTicket : t.hub.updatedAt(formatLastUpdated(lastUpdated.tickets, locale))}
            />
          </Link>
          <Link href={`/modules/asset-manager/${domainId}/assignments`} className="block min-w-0 overflow-hidden asset-manager-metrics-grid">
            <Metric
              label={`${config.assignment_label}s`}
              value={assignmentCount}
              compact
              border={false}
              icon={<UserCheck size={iconSize} />}
              accentColor={ACCENT.assignments}
              subtext={assignmentCount === 0 ? t.hub.noAssignment : t.hub.updatedAt(formatLastUpdated(lastUpdated.assignments, locale))}
            />
          </Link>
          <Link href={`/modules/asset-manager/${domainId}/contracts`} className="block min-w-0 overflow-hidden asset-manager-metrics-grid">
            <Metric
              label={t.hub.contracts}
              value={contractCount}
              compact
              border={false}
              icon={<FileText size={iconSize} />}
              accentColor={ACCENT.contracts}
              subtext={contractCount === 0 ? t.hub.noContract : t.hub.updatedAt(formatLastUpdated(lastUpdated.contracts, locale))}
            />
          </Link>
          <Link href={`/modules/asset-manager/${domainId}/knowledge`} className="block min-w-0 overflow-hidden asset-manager-metrics-grid">
            <Metric
              label={t.hub.knowledge}
              value={knowledgeCount}
              compact
              border={false}
              icon={<BookOpen size={iconSize} />}
              accentColor={ACCENT.knowledge}
              subtext={knowledgeCount === 0 ? t.hub.noArticle : t.hub.updatedAt(formatLastUpdated(lastUpdated.knowledge, locale))}
            />
          </Link>
          <Link href={`/modules/asset-manager/${domainId}/changes`} className="block min-w-0 overflow-hidden asset-manager-metrics-grid">
            <Metric
              label={t.hub.changes}
              value={changeCount}
              compact
              border={false}
              icon={<RefreshCw size={iconSize} />}
              accentColor={ACCENT.changes}
              subtext={changeCount === 0 ? t.hub.noChange : t.hub.updatedAt(formatLastUpdated(lastUpdated.changes, locale))}
            />
          </Link>
        </div>
        <button
          type="button"
          className="asset-manager-carousel-btn asset-manager-carousel-btn--right"
          onClick={() => scrollCarousel("right")}
          aria-label={t.hub.scrollRight}
        >
          →
        </button>
      </div>

      {(alerts.contractsExpiring30 > 0 || alerts.ticketsSlaRisk > 0 || alerts.assetsOutOfService > 0) && (
        <div
          className="rounded-xl border overflow-hidden mb-6"
          style={{
            background: "var(--bpm-surface)",
            border: "1px solid var(--bpm-border)",
            borderRadius: 12,
            padding: 16,
          }}
          role="region"
          aria-label={t.hub.alerts}
        >
          <h2 className="text-sm font-semibold m-0 mb-3" style={{ color: "var(--bpm-text-secondary)", letterSpacing: "0.04em" }}>
            {t.hub.alerts}
          </h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3 text-sm">
            {alerts.contractsExpiring30 > 0 && (
              <Link
                href={`/modules/asset-manager/${domainId}/contracts`}
                className="flex items-center gap-2 p-3 rounded-lg border"
                style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}
              >
                <span className="font-semibold" style={{ color: "var(--bpm-accent-amber, #f59e0b)" }}>
                  {alerts.contractsExpiring30}
                </span>
                <span style={{ color: "var(--bpm-text-primary)" }}>{t.hub.contractsExpiring(alerts.contractsExpiring30)}</span>
              </Link>
            )}
            {alerts.ticketsSlaRisk > 0 && (
              <Link
                href={`/modules/asset-manager/${domainId}/tickets`}
                className="flex items-center gap-2 p-3 rounded-lg border"
                style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}
              >
                <span className="font-semibold" style={{ color: "var(--bpm-accent)" }}>{alerts.ticketsSlaRisk}</span>
                <span style={{ color: "var(--bpm-text-primary)" }}>{t.hub.ticketsSlaRisk}</span>
              </Link>
            )}
            {alerts.assetsOutOfService > 0 && (
              <Link
                href={`/modules/asset-manager/${domainId}/assets?statusId=out_of_service`}
                className="flex items-center gap-2 p-3 rounded-lg border"
                style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}
              >
                <span className="font-semibold" style={{ color: "var(--bpm-accent)" }}>{alerts.assetsOutOfService}</span>
                <span style={{ color: "var(--bpm-text-primary)" }}>{t.hub.assetsOutOfService}</span>
              </Link>
            )}
          </div>
        </div>
      )}

      <div
        className="rounded-xl border overflow-hidden"
        style={{
          background: "var(--bpm-surface)",
          border: "1px solid #E5E7EB",
          borderRadius: 12,
          padding: 16,
        }}
        role="region"
        aria-label={config.asset_label_plural}
      >
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold m-0" style={{ color: "var(--bpm-text-secondary)", letterSpacing: "0.04em" }}>
            {config.asset_label_plural}
          </h2>
          <Link href={`/modules/asset-manager/${domainId}/cmdb-graph`} className="asset-manager-cta-button">
            <Button variant="outline" size="small">{t.hub.cmdbButton}</Button>
          </Link>
        </div>
        {assets.length === 0 ? (
          <p className="text-sm m-0" style={{ color: "var(--bpm-text-secondary)" }}>
            {t.hub.noAssetsHint}
          </p>
        ) : (
          <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--bpm-border)" }}>
            <Table
              columns={columns}
              data={tableData}
              minWidth={560}
              onRowClick={(row) => {
                const id = (row as { id?: string }).id;
                if (id) window.location.href = `/modules/asset-manager/${domainId}/assets/${id}`;
              }}
            />
          </div>
        )}
      </div>

    </div>
  );
}
