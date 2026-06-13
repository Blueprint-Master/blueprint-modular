"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ClipboardList, ChevronDown, ChevronUp } from "lucide-react";
import { Panel, Spinner, Chip, Table, EmptyState } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR, dateLocale } from "../../strings";

type AuditEntry = {
  id: string;
  domainId: string | null;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  beforeState: string | null;
  afterState: string | null;
  changedFields: string[];
  timestamp: string;
};

export default function AssetManagerAuditPage() {
  const params = useParams();
  const { locale } = useI18n();
  const t = STR[locale];
  const ta = t.audit;
  const ACTION_LABELS = ta.actionLabels;
  const RESOURCE_LABELS = ta.resourceLabels;
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (!domainId) return;
    setLoading(true);
    const sp = new URLSearchParams({ domainId, limit: "100" });
    if (filterType) sp.set("resourceType", filterType);
    if (filterAction) sp.set("action", filterAction);
    fetch(`/api/asset-manager/audit-log?${sp}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setLogs(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [domainId, filterType, filterAction]);

  const typeOptions = [
    { value: "", label: ta.allTypes },
    ...Object.entries(RESOURCE_LABELS).map(([id, label]) => ({ value: id, label })),
  ];
  const actionOptions = [
    { value: "", label: ta.allActions },
    ...Object.entries(ACTION_LABELS).map(([id, label]) => ({ value: id, label })),
  ];

  const columns = [
    {
      key: "timestamp",
      label: ta.colDate,
      render: (val: unknown) => (val ? new Date(String(val)).toLocaleString(dateLocale(locale)) : t.common.dash),
    },
    { key: "userId", label: ta.colUser },
    {
      key: "action",
      label: ta.colAction,
      render: (val: unknown) => ACTION_LABELS[String(val)] ?? String(val),
    },
    {
      key: "resourceType",
      label: ta.colResource,
      render: (val: unknown) => RESOURCE_LABELS[String(val)] ?? String(val),
    },
    {
      key: "resourceId",
      label: ta.colDetail,
      render: (val: unknown, row: unknown) => {
        const log = row as AuditEntry;
        if (!log?.resourceId) return t.common.dash;
        const href =
          log.resourceType === "asset"
            ? `/modules/asset-manager/${domainId}/assets/${log.resourceId}`
            : log.resourceType === "ticket"
              ? `/modules/asset-manager/${domainId}/tickets/${log.resourceId}`
              : log.resourceType === "change"
                ? `/modules/asset-manager/${domainId}/changes/${log.resourceId}`
                : null;
        if (!href) return log.resourceId.slice(0, 12) + "…";
        return (
          <Link href={href} className="hover:underline" style={{ color: "var(--bpm-accent-cyan)" }}>
            {log.resourceId.slice(0, 12)}…
          </Link>
        );
      },
    },
  ];

  if (!domainId) {
    return (
      <div className="doc-page">
        <Panel variant="warning" title={ta.domainRequired} />
      </div>
    );
  }

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <nav className="doc-breadcrumb">
          <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>{t.common.breadcrumbModules}</Link> →{" "}
          <Link href="/modules/asset-manager" style={{ color: "var(--bpm-accent-cyan)" }}>{t.common.moduleTitle}</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>{t.nav.dashboard}</Link> → {ta.title}
        </nav>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
          {ta.title}
        </h1>
        <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
          {ta.description}
        </p>
      </div>

      <div className={`asset-manager-equipment-filters ${!filtersOpen ? "asset-manager-equipment-filters--collapsed" : ""}`}>
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="asset-manager-equipment-filters__toggle"
          aria-expanded={filtersOpen}
          aria-controls="asset-manager-filters-audit"
          id="asset-manager-filters-toggle-audit"
        >
          <span className="asset-manager-equipment-filters__label">{ta.filters}</span>
          {filtersOpen ? <ChevronUp size={18} aria-hidden /> : <ChevronDown size={18} aria-hidden />}
        </button>
        <div id="asset-manager-filters-audit" role="region" aria-labelledby="asset-manager-filters-toggle-audit" hidden={!filtersOpen}>
          <div className="asset-manager-equipment-filters__row">
            <span className="asset-manager-equipment-filters__label">{ta.filterResourceType}</span>
            <div className="asset-manager-equipment-filters__chips">
              {typeOptions.map((opt) => {
                const isActive = filterType === opt.value;
                const isReset = opt.value === "";
                return (
                  <Chip
                    key={opt.value || "all"}
                    label={opt.label}
                    variant={isActive ? "primary" : "default"}
                    onClick={() => setFilterType(isActive ? "" : opt.value)}
                    className={`${isActive ? "asset-manager-chip-active" : ""} ${isReset ? "asset-manager-chip-reset" : ""}`}
                  />
                );
              })}
            </div>
          </div>
          <div className="asset-manager-equipment-filters__row">
            <span className="asset-manager-equipment-filters__label">{ta.filterAction}</span>
            <div className="asset-manager-equipment-filters__chips">
              {actionOptions.map((opt) => {
                const isActive = filterAction === opt.value;
                const isReset = opt.value === "";
                return (
                  <Chip
                    key={opt.value || "all"}
                    label={opt.label}
                    variant={isActive ? "primary" : "default"}
                    onClick={() => setFilterAction(isActive ? "" : opt.value)}
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
      ) : logs.length === 0 ? (
        <div className="rounded-xl border bg-[var(--bpm-surface)] p-4" style={{ border: "1px solid #E5E7EB", borderRadius: 12 }}>
          <EmptyState
            title={ta.emptyTitle}
            description={ta.emptyDescription}
            icon={<ClipboardList size={64} style={{ color: "var(--bpm-text-secondary)", opacity: 0.6 }} />}
          />
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--bpm-border)" }}>
          <Table
            columns={columns}
            data={logs}
            minWidth={560}
            keyColumn="id"
          />
        </div>
      )}

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>{ta.backToDashboard}</Link>
      </nav>
    </div>
  );
}
