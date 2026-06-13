"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Download, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Table, Spinner, Panel, Button, Chip, EmptyState } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR, dateLocale } from "../../strings";

type AssetContract = {
  id: string;
  reference: string;
  type: string;
  label: string;
  supplier: string | null;
  startDate: string;
  endDate: string;
  amount: number | null;
  autoRenewal: boolean;
  noticeDays: number;
  alertDaysBefore: number;
};

export default function AssetManagerContractsPage() {
  const params = useParams();
  const router = useRouter();
  const { locale } = useI18n();
  const t = STR[locale];
  const tc = t.contracts;
  const TYPE_LABELS: Record<string, string> = tc.typeLabels;
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const [contracts, setContracts] = useState<AssetContract[]>([]);
  const [config, setConfig] = useState<{ domain_label?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (!domainId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const url = `/api/asset-manager/contracts?domainId=${encodeURIComponent(domainId)}${filterType ? `&type=${encodeURIComponent(filterType)}` : ""}`;
    Promise.all([
      fetch(`/api/asset-manager/config/${domainId}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
      fetch(url, { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([cfg, data]) => {
        setConfig(cfg);
        setContracts(Array.isArray(data) ? data : []);
      })
      .catch(() => setContracts([]))
      .finally(() => setLoading(false));
  }, [domainId, filterType]);

  const filtered = contracts;

  const columns = [
    { key: "reference", label: tc.colReference },
    { key: "label", label: tc.colLabel },
    {
      key: "type",
      label: tc.colType,
      render: (val: unknown) => TYPE_LABELS[String(val)] ?? String(val),
    },
    {
      key: "supplier",
      label: tc.colSupplier,
      render: (val: unknown) => (val ? String(val) : t.common.dash),
    },
    {
      key: "startDate",
      label: tc.colStart,
      render: (val: unknown) => (val ? new Date(String(val)).toLocaleDateString(dateLocale(locale)) : ""),
    },
    {
      key: "endDate",
      label: tc.colEnd,
      render: (val: unknown) => (val ? new Date(String(val)).toLocaleDateString(dateLocale(locale)) : ""),
    },
    {
      key: "amount",
      label: tc.colAmount,
      render: (val: unknown) => (val != null && Number.isFinite(Number(val)) ? `${Number(val).toLocaleString(dateLocale(locale))} €` : t.common.dash),
    },
  ];

  const typeOptions = [
    { value: "", label: tc.allTypes },
    ...Object.entries(TYPE_LABELS).map(([id, label]) => ({ value: id, label })),
  ];

  if (!config && !loading) {
    return (
      <div className="doc-page">
        <Panel variant="warning" title={t.hub.configNotFoundTitle}>{tc.checkUrl}</Panel>
        <Link href="/modules/asset-manager" style={{ color: "var(--bpm-accent-cyan)" }}>← {t.common.moduleTitle}</Link>
      </div>
    );
  }

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <nav className="doc-breadcrumb">
          <Link href="/modules">{t.common.breadcrumbModules}</Link> → <Link href="/modules/asset-manager">{t.common.moduleTitle}</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}`}>{t.nav.dashboard}</Link> → {t.nav.contracts}
        </nav>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>{tc.listTitle}</h1>
            <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
              {tc.listSubtitle}
            </p>
          </div>
          <Link href={`/modules/asset-manager/${domainId}/contracts/new`} className="asset-manager-cta-button">
            <Button variant="primary" size="small">{tc.newContract}</Button>
          </Link>
        </div>
      </div>

      <div className={`asset-manager-equipment-filters ${!filtersOpen ? "asset-manager-equipment-filters--collapsed" : ""}`}>
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="asset-manager-equipment-filters__toggle"
          aria-expanded={filtersOpen}
          aria-controls="asset-manager-filters-contracts"
          id="asset-manager-filters-toggle-contracts"
        >
          <span className="asset-manager-equipment-filters__label">{tc.filters}</span>
          {filtersOpen ? <ChevronUp size={18} aria-hidden /> : <ChevronDown size={18} aria-hidden />}
        </button>
        <div id="asset-manager-filters-contracts" role="region" aria-labelledby="asset-manager-filters-toggle-contracts" hidden={!filtersOpen}>
          <div className="asset-manager-equipment-filters__row">
            <span className="asset-manager-equipment-filters__label">{tc.colType}</span>
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
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="medium" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border bg-[var(--bpm-surface)] p-4" style={{ border: "1px solid #E5E7EB", borderRadius: 12 }}>
          <EmptyState
            title={tc.emptyTitle}
            description={tc.emptyDescription}
            icon={<FileText size={64} style={{ color: "var(--bpm-text-secondary)", opacity: 0.6 }} />}
            action={
              <Link href={`/modules/asset-manager/${domainId}/contracts/new`}>
                <Button variant="primary" size="small">{tc.newContract}</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="asset-manager-table-export-wrap">
          <button
            type="button"
            onClick={() => {
              const headers = [tc.colReference, tc.colLabel, tc.colType, tc.colSupplier, tc.colStart, tc.colEnd, tc.colAmount];
              const rows = filtered.map((c) => [
                c.reference,
                c.label,
                TYPE_LABELS[c.type] ?? c.type,
                c.supplier ?? "",
                c.startDate ? new Date(c.startDate).toLocaleDateString(dateLocale(locale)) : "",
                c.endDate ? new Date(c.endDate).toLocaleDateString(dateLocale(locale)) : "",
                c.amount != null ? String(c.amount) : "",
              ]);
              const csv = [headers.join(";"), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))].join("\r\n");
              const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${tc.csvFilePrefix}-${domainId}-${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            disabled={filtered.length === 0}
            className="asset-manager-export-btn asset-manager-export-btn-float flex items-center justify-center w-8 h-8 rounded-lg border"
            style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-secondary)" }}
            title={t.common.exportCsv}
          >
            <Download size={18} />
          </button>
          <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--bpm-border)" }}>
            <Table
              columns={columns}
              data={filtered}
              minWidth={560}
              keyColumn="id"
              onRowClick={(row) => router.push(`/modules/asset-manager/${domainId}/contracts/${(row as { id: string }).id}`)}
            />
          </div>
        </div>
      )}

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>← {t.nav.dashboard}</Link>
        <Link href="/modules/asset-manager/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>{tc.documentation}</Link>
      </nav>
    </div>
  );
}
