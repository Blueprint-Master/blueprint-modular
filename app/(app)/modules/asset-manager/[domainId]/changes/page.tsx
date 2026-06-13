"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Download, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Table, Spinner, Panel, Button, Chip, EmptyState } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR, dateLocale } from "../../strings";

type ChangeRequest = {
  id: string;
  reference: string;
  type: string;
  title: string;
  status: string;
  riskLevel: string;
  plannedStart: string | null;
  plannedEnd: string | null;
  createdAt: string;
};

export default function AssetManagerChangesPage() {
  const { locale } = useI18n();
  const t = STR[locale];
  const tch = t.changes;
  const TYPE_LABELS = tch.typeLabels;
  const STATUS_LABELS = tch.statusLabels;
  const RISK_LABELS = tch.riskLabels;
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const [changes, setChanges] = useState<ChangeRequest[]>([]);
  const [config, setConfig] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState(() => searchParams.get("status") ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setFilterStatus(searchParams.get("status") ?? "");
  }, [searchParams]);

  useEffect(() => {
    if (!domainId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const url = `/api/asset-manager/changes?domainId=${encodeURIComponent(domainId)}${filterStatus ? `&status=${encodeURIComponent(filterStatus)}` : ""}`;
    Promise.all([
      fetch(`/api/asset-manager/config/${domainId}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
      fetch(url, { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([cfg, data]) => {
        setConfig(cfg);
        setChanges(Array.isArray(data) ? data : []);
      })
      .catch(() => setChanges([]))
      .finally(() => setLoading(false));
  }, [domainId, filterStatus]);

  const columns = [
    { key: "reference", label: tch.colReference },
    { key: "title", label: tch.colTitle },
    { key: "type", label: tch.colType, render: (val: unknown) => TYPE_LABELS[String(val)] ?? String(val) },
    { key: "status", label: tch.colStatus, render: (val: unknown) => STATUS_LABELS[String(val)] ?? String(val) },
    { key: "riskLevel", label: tch.colRisk, render: (val: unknown) => RISK_LABELS[String(val)] ?? String(val) },
    { key: "plannedStart", label: tch.colPlannedStart, render: (val: unknown) => (val ? new Date(String(val)).toLocaleDateString(dateLocale(locale)) : t.common.dash) },
  ];

  const statusOptions = [
    { value: "", label: tch.allStatuses },
    ...Object.entries(STATUS_LABELS).map(([id, label]) => ({ value: id, label })),
  ];

  if (!config && !loading) {
    return (
      <div className="doc-page">
        <Panel variant="warning" title={t.hub.configNotFoundTitle}>{tch.checkUrl}</Panel>
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
          <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>{tch.breadcrumbDashboard}</Link> → {tch.breadcrumbChanges}
        </nav>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>{tch.title}</h1>
            <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
              {tch.listSubtitle}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/modules/asset-manager/${domainId}/changes/calendar`} className="asset-manager-cta-button">
              <Button size="small" variant="outline">{tch.calendar}</Button>
            </Link>
            <Link href={`/modules/asset-manager/${domainId}/changes/new`} className="asset-manager-cta-button">
              <Button variant="primary" size="small">{tch.newChange}</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className={`asset-manager-equipment-filters ${!filtersOpen ? "asset-manager-equipment-filters--collapsed" : ""}`}>
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="asset-manager-equipment-filters__toggle"
          aria-expanded={filtersOpen}
          aria-controls="asset-manager-filters-changes"
          id="asset-manager-filters-toggle-changes"
        >
          <span className="asset-manager-equipment-filters__label">{tch.filters}</span>
          {filtersOpen ? <ChevronUp size={18} aria-hidden /> : <ChevronDown size={18} aria-hidden />}
        </button>
        <div id="asset-manager-filters-changes" role="region" aria-labelledby="asset-manager-filters-toggle-changes" hidden={!filtersOpen}>
          <div className="asset-manager-equipment-filters__row">
            <span className="asset-manager-equipment-filters__label">{tch.filterStatus}</span>
            <div className="asset-manager-equipment-filters__chips">
              {statusOptions.map((opt) => {
                const isActive = filterStatus === opt.value;
                const isReset = opt.value === "";
                return (
                  <Chip
                    key={opt.value || "all"}
                    label={opt.label}
                    variant={isActive ? "primary" : "default"}
                    onClick={() => setFilterStatus(isActive ? "" : opt.value)}
                    className={`${isActive ? "asset-manager-chip-active" : ""} ${isReset ? "asset-manager-chip-reset" : ""}`}
                  />
                );
              })}
            </div>
            {!loading && changes.filter((c) => c.status === "cab_review").length > 0 && !filterStatus && (
              <Link
                href={`/modules/asset-manager/${domainId}/changes?status=cab_review`}
                className="rounded px-3 py-1.5 text-sm font-medium flex-shrink-0"
                style={{ background: "var(--bpm-accent-amber, #f59e0b)", color: "#fff" }}
              >
                {tch.cabPendingChip(changes.filter((c) => c.status === "cab_review").length)}
              </Link>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="medium" />
        </div>
      ) : changes.length === 0 ? (
        <div className="rounded-xl border bg-[var(--bpm-surface)] p-4" style={{ border: "1px solid #E5E7EB", borderRadius: 12 }}>
          <EmptyState
            title={tch.emptyTitle}
            description={tch.emptyDescription}
            icon={<RefreshCw size={64} style={{ color: "var(--bpm-text-secondary)", opacity: 0.6 }} />}
            action={
              <Link href={`/modules/asset-manager/${domainId}/changes/new`}>
                <Button variant="primary" size="small">{tch.newChange}</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="asset-manager-table-export-wrap">
          <button
            type="button"
            onClick={() => {
              const headers = [tch.colReference, tch.colTitle, tch.colType, tch.colStatus, tch.colRisk, tch.colPlannedStart];
              const rows = changes.map((c) => [
                c.reference,
                c.title,
                TYPE_LABELS[c.type] ?? c.type,
                STATUS_LABELS[c.status] ?? c.status,
                RISK_LABELS[c.riskLevel] ?? c.riskLevel,
                c.plannedStart ? new Date(c.plannedStart).toLocaleDateString(dateLocale(locale)) : "",
              ]);
              const csv = [headers.join(";"), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))].join("\r\n");
              const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${tch.csvFilePrefix}-${domainId}-${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            disabled={changes.length === 0}
            className="asset-manager-export-btn asset-manager-export-btn-float flex items-center justify-center w-8 h-8 rounded-lg border"
            style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-secondary)" }}
            title={t.common.exportCsv}
          >
            <Download size={18} />
          </button>
          <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--bpm-border)" }}>
            <Table
              columns={columns}
              data={changes}
              minWidth={560}
              keyColumn="id"
              onRowClick={(row) => router.push(`/modules/asset-manager/${domainId}/changes/${(row as ChangeRequest).id}`)}
            />
          </div>
        </div>
      )}

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>← {tch.breadcrumbDashboard}</Link>
        <Link href="/modules/asset-manager/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>{tch.documentation}</Link>
      </nav>
    </div>
  );
}
