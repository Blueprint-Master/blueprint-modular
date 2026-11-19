"use client";

import { useState, useEffect, useRef } from "react";
import { readResponse } from "../../lib/read-response";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ClipboardList, ChevronDown, ChevronUp } from "lucide-react";
import { Input, Button, Panel, Spinner, Chip, Table, EmptyState } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR, dateLocale } from "../../strings";

type AuditEntry = {
  id: string;
  domainId: string | null;
  userId: string;
  userName?: string;
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
  const search = useSearchParams();
  const { locale } = useI18n();
  const t = STR[locale];
  const ta = t.audit;
  const ACTION_LABELS = ta.actionLabels;
  const RESOURCE_LABELS = ta.resourceLabels;
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState(search.get("resourceType") ?? "");
  const [filterAction, setFilterAction] = useState(search.get("action") ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [resource, setResource] = useState(search.get("resourceId") ?? "");
  useEffect(() => {
    setFilterType(search.get("resourceType") ?? ""); setFilterAction(search.get("action") ?? "");
    setResource(search.get("resourceId") ?? "");
  }, [search]);
  const [error, setError] = useState("");
  const [next, setNext] = useState("");
  const [more, setMore] = useState(false);
  const [selected, setSelected] = useState<AuditEntry | null>(null);
  const version = useRef(0);
  const query = new URLSearchParams({ domainId, limit: "100", resourceType: filterType, action: filterAction,
    resourceId: resource, from, to }).toString();
  useEffect(() => {
    const current = ++version.current;
    setLoading(true); setSelected(null); setError(""); setNext(""); setMore(false);
    fetch("/api/asset-manager/audit-log?" + query).then(async response => {
      const rows = await readResponse(response);
      if (version.current === current) { setLogs(rows); setNext(response.headers.get("X-Next-Cursor") ?? ""); }
    }).catch(err => { if (version.current === current) setError(err.message); })
      .finally(() => { if (version.current === current) setLoading(false); });
    return () => { version.current++; };
  }, [query]);

  async function loadMore() {
    if (!next || more) return;
    const current = version.current;
    setMore(true); setError("");
    try {
      const response = await fetch("/api/asset-manager/audit-log?" + query + "&cursor=" + encodeURIComponent(next));
      const rows = await readResponse(response);
      if (version.current === current) { setLogs(previous => [...previous, ...rows]); setNext(response.headers.get("X-Next-Cursor") ?? ""); }
    } catch (err) { if (version.current === current) setError(err instanceof Error ? err.message : String(err)); }
    finally { if (version.current === current) setMore(false); }
  }
  function display(value: string | null) {
    if (!value) return t.common.dash;
    try { return JSON.stringify(JSON.parse(value), null, 2); } catch { return value; }
  }

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
    { key: "userId", label: ta.colUser, render: (id: unknown, row: unknown) => (row as AuditEntry).userName || String(id) },
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
        return <Button variant="outline" size="small" onClick={() => setSelected(log)}>{locale === "fr" ? "Consulter" : "View"}</Button>;
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <Input type="date" label={locale === "fr" ? "Du" : "From"} value={from} onChange={setFrom} />
            <Input type="date" label={locale === "fr" ? "Au" : "To"} value={to} onChange={setTo} />
            <Input label={locale === "fr" ? "Identifiant de la ressource" : "Resource ID"} value={resource} onChange={setResource} />
          </div>
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

      {error && <p role="alert">{error}</p>}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="medium" />
        </div>
      ) : error && !next ? null : logs.length === 0 ? (
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

      {next && <Button variant="outline" disabled={more} onClick={loadMore}>{locale === "fr" ? "Afficher la suite" : "Load more"}</Button>}
      {selected && <Panel title={RESOURCE_LABELS[selected.resourceType] ?? selected.resourceType}>
        <p>{selected.resourceId} · {ACTION_LABELS[selected.action] ?? selected.action} · {selected.userName || selected.userId}</p>
        {[[locale === "fr" ? "Avant" : "Before", selected.beforeState], [locale === "fr" ? "Après" : "After", selected.afterState]].map(([label, value]) =>
          <details key={label} open><summary>{label}</summary><pre className="overflow-auto">{display(value)}</pre></details>)}
        <Button size="small" variant="outline" onClick={() => setSelected(null)}>{locale === "fr" ? "Fermer" : "Close"}</Button>
      </Panel>}
      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>{ta.backToDashboard}</Link>
      </nav>
    </div>
  );
}
