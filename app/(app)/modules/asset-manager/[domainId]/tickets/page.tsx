"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Download, Ticket as TicketIcon, ChevronDown, ChevronUp } from "lucide-react";
import { Table, Spinner, Panel, Button, Chip, EmptyState } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR, dateLocale } from "../../strings";

type Ticket = {
  id: string;
  reference: string;
  title: string;
  status: string;
  priorityId: string;
  categoryId: string;
  openedAt: string;
  requester: { id: string; name: string | null } | null;
  assignee: { id: string; name: string | null } | null;
  asset: { id: string; reference: string; label: string } | null;
};

type DomainConfig = {
  domain_label: string;
  ticket_categories: { id: string; label: string; subcategories: string[] }[];
  priorities: { id: string; label: string; color: string; sla_hours?: number }[];
};

export default function AssetManagerTicketsPage() {
  const params = useParams();
  const router = useRouter();
  const { locale } = useI18n();
  const t = STR[locale];
  const tt = t.tickets;
  const STATUS_LABELS = tt.statusLabels;
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const [config, setConfig] = useState<DomainConfig | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterSlaRisk, setFilterSlaRisk] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fetchTickets = useCallback(() => {
    if (!domainId) return;
    fetch(`/api/asset-manager/tickets?domainId=${encodeURIComponent(domainId)}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setTickets(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [domainId]);

  useEffect(() => {
    if (!domainId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/asset-manager/config/${domainId}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then(setConfig)
      .catch(() => {});
    fetchTickets();
  }, [domainId, fetchTickets]);

  const getPriorityLabel = (id: string) => config?.priorities?.find((p) => p.id === id)?.label ?? id;
  const getPriorityColor = (id: string) => {
    const c = config?.priorities?.find((p) => p.id === id)?.color ?? "gray";
    const map: Record<string, string> = {
      red: "#ef4444",
      green: "var(--bpm-accent-mint)",
      amber: "#f59e0b",
      yellow: "#f59e0b",
      orange: "#f59e0b",
      gray: "#6b7280",
      blue: "var(--bpm-accent-cyan)",
    };
    return map[c] ?? map.gray;
  };
  const getCategoryLabel = (id: string) => config?.ticket_categories?.find((c) => c.id === id)?.label ?? id;

  const openStatuses = ["new", "open", "pending", "in_progress", "on_hold", "assigned"];
  const isTicketSlaRisk = (tk: Ticket) => {
    if (!openStatuses.includes(tk.status)) return false;
    const prio = config?.priorities?.find((p) => p.id === tk.priorityId);
    const slaHours = prio?.sla_hours ?? 48;
    const elapsed = (Date.now() - new Date(tk.openedAt).getTime()) / (1000 * 60 * 60);
    const pct = (elapsed / slaHours) * 100;
    return pct >= 80;
  };
  const slaRiskCount = tickets.filter(isTicketSlaRisk).length;

  const filtered = tickets.filter((tk) => {
    if (filterStatus && tk.status !== filterStatus) return false;
    if (filterPriority && tk.priorityId !== filterPriority) return false;
    if (filterSlaRisk && !isTicketSlaRisk(tk)) return false;
    return true;
  });

  const columns = [
    { key: "reference", label: tt.colReference },
    { key: "title", label: tt.colTitle },
    {
      key: "status",
      label: tt.colStatus,
      render: (val: unknown) => (
        <span className="rounded px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)" }}>
          {STATUS_LABELS[String(val)] ?? String(val)}
        </span>
      ),
    },
    {
      key: "priorityId",
      label: tt.colPriority,
      render: (val: unknown) => {
        const id = String(val);
        const bg = getPriorityColor(id);
        return (
          <span
            className="rounded px-2 py-0.5 text-xs font-medium"
            style={{ backgroundColor: bg, color: "#fff" }}
          >
            {getPriorityLabel(id)}
          </span>
        );
      },
    },
    {
      key: "categoryId",
      label: tt.colCategory,
      render: (val: unknown) => getCategoryLabel(String(val)),
    },
    {
      key: "openedAt",
      label: tt.colOpenedAt,
      render: (val: unknown) => (val ? new Date(String(val)).toLocaleDateString(dateLocale(locale)) : ""),
    },
    {
      key: "assignee",
      label: tt.colAssignee,
      render: (_: unknown, row: Record<string, unknown>) => (row as Ticket).assignee?.name ?? "—",
    },
  ];

  const statusOptions = [
    { value: "", label: tt.allStatuses },
    ...Object.entries(STATUS_LABELS).map(([id, label]) => ({ value: id, label })),
  ];
  const priorityOptions = [
    { value: "", label: tt.allPriorities },
    ...(config?.priorities?.map((p) => ({ value: p.id, label: p.label })) ?? []),
  ];

  if (!config && !loading) {
    return (
      <div className="doc-page">
        <Panel variant="warning" title={t.hub.configNotFoundTitle}>{tt.checkUrl}</Panel>
        <Link href="/modules/asset-manager" style={{ color: "var(--bpm-accent-cyan)" }}>← {t.common.moduleTitle}</Link>
      </div>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    if (status === "new") return "#4b5563"; /* gris foncé pour contraste (Nouveau) */
    if (status === "in_progress" || status === "assigned") return "#f59e0b";
    if (status === "resolved" || status === "closed") return "var(--bpm-accent-mint)";
    if (status === "on_hold") return "#6b7280";
    return "#4b5563"; /* fallback gris lisible */
  };

  const exportCsv = () => {
    const headers = [tt.colReference, tt.colTitle, tt.colStatus, tt.colPriority, tt.colCategory, tt.colOpenedAt];
    const rows = filtered.map((tk) => [
      tk.reference,
      tk.title,
      STATUS_LABELS[tk.status] ?? tk.status,
      getPriorityLabel(tk.priorityId),
      getCategoryLabel(tk.categoryId),
      tk.openedAt ? new Date(tk.openedAt).toLocaleDateString(dateLocale(locale)) : "",
    ]);
    const csv = [headers.join(";"), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))].join("\r\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tt.csvFilePrefix}-${domainId}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="doc-page-title text-2xl font-semibold" style={{ color: "var(--bpm-text-primary)" }}>{tt.title}</h1>
            <p className="doc-description mt-0.5" style={{ color: "var(--bpm-text-secondary)" }}>
              {tt.listSubtitle}
            </p>
          </div>
          <Link href={`/modules/asset-manager/${domainId}/tickets/new`} className="asset-manager-cta-button">
            <Button variant="primary" size="small">{tt.newTicket}</Button>
          </Link>
        </div>
      </div>

      <div className={`asset-manager-equipment-filters ${!filtersOpen ? "asset-manager-equipment-filters--collapsed" : ""}`}>
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="asset-manager-equipment-filters__toggle"
          aria-expanded={filtersOpen}
          aria-controls="asset-manager-filters-tickets"
          id="asset-manager-filters-toggle-tickets"
        >
          <span className="asset-manager-equipment-filters__label">{tt.filters}</span>
          {filtersOpen ? <ChevronUp size={18} aria-hidden /> : <ChevronDown size={18} aria-hidden />}
        </button>
        <div id="asset-manager-filters-tickets" role="region" aria-labelledby="asset-manager-filters-toggle-tickets" hidden={!filtersOpen}>
          <div className="asset-manager-equipment-filters__row">
            <span className="asset-manager-equipment-filters__label">{tt.filterStatus}</span>
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
          </div>
          <div className="asset-manager-equipment-filters__row">
            <span className="asset-manager-equipment-filters__label">{tt.filterPriority}</span>
            <div className="asset-manager-equipment-filters__chips">
              {priorityOptions.map((opt) => {
                const isActive = filterPriority === opt.value;
                const isReset = opt.value === "";
                return (
                  <Chip
                    key={opt.value || "all"}
                    label={opt.label}
                    variant={isActive ? "primary" : "default"}
                    onClick={() => setFilterPriority(isActive ? "" : opt.value)}
                    className={`${isActive ? "asset-manager-chip-active" : ""} ${isReset ? "asset-manager-chip-reset" : ""}`}
                  />
                );
              })}
            </div>
          </div>
          {slaRiskCount > 0 && (
            <div className="asset-manager-equipment-filters__row">
              <span className="asset-manager-equipment-filters__label">{tt.filterSla}</span>
              <div className="asset-manager-equipment-filters__chips">
                <Chip
                  label={tt.slaRiskChip(slaRiskCount)}
                  variant={filterSlaRisk ? "primary" : "default"}
                  onClick={() => setFilterSlaRisk((v) => !v)}
                  className={filterSlaRisk ? "asset-manager-chip-active" : ""}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="medium" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border bg-[var(--bpm-surface)] p-4" style={{ border: "1px solid #E5E7EB", borderRadius: 12 }}>
          <EmptyState
            title={tt.emptyTitle}
            description={tt.emptyDescription}
            icon={<TicketIcon size={64} style={{ color: "var(--bpm-text-secondary)", opacity: 0.6 }} />}
            action={
              <Link href={`/modules/asset-manager/${domainId}/tickets/new`}>
                <Button variant="primary" size="small">{tt.newTicket}</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="asset-manager-table-export-wrap">
          <button
            type="button"
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="asset-manager-export-btn asset-manager-export-btn-float flex items-center justify-center w-8 h-8 rounded-lg border"
            style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-secondary)" }}
            title={t.common.exportCsv}
          >
            <Download size={18} />
          </button>
          <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--bpm-border)" }}>
            <Table
              minWidth={560}
              columns={columns.map((col) =>
                col.key === "status"
                  ? {
                      ...col,
                      render: (val: unknown) => {
                        const s = String(val);
                        return (
                          <span
                            className="rounded px-2 py-0.5 text-xs font-medium"
                            style={{ backgroundColor: getStatusBadgeColor(s), color: "#fff" }}
                          >
                            {STATUS_LABELS[s] ?? s}
                          </span>
                        );
                      },
                    }
                  : col
              )}
              data={filtered}
              keyColumn="id"
              onRowClick={(row) => router.push(`/modules/asset-manager/${domainId}/tickets/${row.id}`)}
            />
          </div>
        </div>
      )}

    </div>
  );
}
