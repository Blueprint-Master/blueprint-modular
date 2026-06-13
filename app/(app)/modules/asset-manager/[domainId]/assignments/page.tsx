"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Download, UserCheck, ChevronDown, ChevronUp } from "lucide-react";
import { Table, Spinner, Button, Chip, EmptyState } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR, dateLocale } from "../../strings";

type Assignment = {
  id: string;
  reference: string;
  assignmentType: string;
  startDate: string;
  expectedEndDate: string | null;
  actualEndDate: string | null;
  status: string;
  asset: { id: string; reference: string; label: string } | null;
  assignee: { id: string; name: string | null } | null;
};

export default function AssetManagerAssignmentsPage() {
  const { locale } = useI18n();
  const t = STR[locale];
  const ta = t.assignments;
  const STATUS_LABELS: Record<string, string> = {
    active: ta.statusActive,
    returned: ta.statusReturned,
    overdue: ta.statusOverdue,
    cancelled: ta.statusCancelled,
  };
  const params = useParams();
  const router = useRouter();
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fetchAssignments = useCallback(() => {
    if (!domainId) return;
    fetch(`/api/asset-manager/assignments?domainId=${encodeURIComponent(domainId)}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setAssignments(Array.isArray(data) ? data : []);
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
    fetchAssignments();
  }, [domainId, fetchAssignments]);

  const filtered = assignments.filter((a) => !filterStatus || a.status === filterStatus);

  const columns = [
    { key: "reference", label: t.common.reference },
    {
      key: "asset",
      label: ta.columnAsset,
      render: (_: unknown, row: Record<string, unknown>) => {
        const r = row as Assignment;
        return r.asset ? `${r.asset.reference} — ${r.asset.label}` : t.common.dash;
      },
    },
    {
      key: "assignee",
      label: ta.columnAssignee,
      render: (_: unknown, row: Record<string, unknown>) => (row as Assignment).assignee?.name ?? t.common.dash,
    },
    {
      key: "status",
      label: t.common.status,
      render: (val: unknown) => (
        <span className="rounded px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)" }}>
          {STATUS_LABELS[String(val)] ?? String(val)}
        </span>
      ),
    },
    {
      key: "startDate",
      label: ta.columnStart,
      render: (val: unknown) => (val ? new Date(String(val)).toLocaleDateString(dateLocale(locale)) : ""),
    },
    {
      key: "expectedEndDate",
      label: ta.columnExpectedEnd,
      render: (val: unknown) => (val ? new Date(String(val)).toLocaleDateString(dateLocale(locale)) : t.common.dash),
    },
  ];

  const statusOptions = [
    { value: "", label: ta.filterAllStatuses },
    ...Object.entries(STATUS_LABELS).map(([id, label]) => ({ value: id, label })),
  ];

  const getStatusBadgeColor = (status: string) => {
    if (status === "active") return "var(--bpm-accent-mint)";
    if (status === "returned") return "#6b7280";
    if (status === "overdue") return "#ef4444";
    if (status === "cancelled") return "#6b7280";
    return "#4b5563"; /* fallback gris lisible (texte blanc) */
  };

  const exportCsv = () => {
    const headers = [t.common.reference, ta.columnAsset, ta.columnAssignee, t.common.status, ta.columnStart, ta.columnExpectedEnd];
    const rows = filtered.map((a) => [
      a.reference,
      a.asset ? `${a.asset.reference} — ${a.asset.label}` : t.common.dash,
      a.assignee?.name ?? t.common.dash,
      STATUS_LABELS[a.status] ?? a.status,
      a.startDate ? new Date(a.startDate).toLocaleDateString(dateLocale(locale)) : "",
      a.expectedEndDate ? new Date(a.expectedEndDate).toLocaleDateString(dateLocale(locale)) : t.common.dash,
    ]);
    const csv = [headers.join(";"), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))].join("\r\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mad-${domainId}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columnsWithBadges = columns.map((col) =>
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
  );

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="doc-page-title text-2xl font-semibold" style={{ color: "var(--bpm-text-primary)" }}>{ta.listTitle}</h1>
            <p className="doc-description mt-0.5" style={{ color: "var(--bpm-text-secondary)" }}>
              {ta.listDescription}
            </p>
          </div>
          <Link href={`/modules/asset-manager/${domainId}/assignments/new`} className="asset-manager-cta-button">
            <Button variant="primary" size="small">{ta.newCta}</Button>
          </Link>
        </div>
      </div>

      <div className={`asset-manager-equipment-filters ${!filtersOpen ? "asset-manager-equipment-filters--collapsed" : ""}`}>
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="asset-manager-equipment-filters__toggle"
          aria-expanded={filtersOpen}
          aria-controls="asset-manager-filters-assignments"
          id="asset-manager-filters-toggle-assignments"
        >
          <span className="asset-manager-equipment-filters__label">{ta.filters}</span>
          {filtersOpen ? <ChevronUp size={18} aria-hidden /> : <ChevronDown size={18} aria-hidden />}
        </button>
        <div id="asset-manager-filters-assignments" role="region" aria-labelledby="asset-manager-filters-toggle-assignments" hidden={!filtersOpen}>
          <div className="asset-manager-equipment-filters__row">
            <span className="asset-manager-equipment-filters__label">{t.common.status}</span>
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
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="medium" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border bg-[var(--bpm-surface)] p-4" style={{ border: "1px solid #E5E7EB", borderRadius: 12 }}>
          <EmptyState
            title={ta.emptyTitle}
            description={ta.emptyDescription}
            icon={<UserCheck size={64} style={{ color: "var(--bpm-text-secondary)", opacity: 0.6 }} />}
            action={
              <Link href={`/modules/asset-manager/${domainId}/assignments/new`}>
                <Button variant="primary" size="small">{ta.newCta}</Button>
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
              columns={columnsWithBadges}
              data={filtered}
              minWidth={560}
              keyColumn="id"
              onRowClick={(row) => router.push(`/modules/asset-manager/${domainId}/assignments/${row.id}`)}
            />
          </div>
        </div>
      )}

    </div>
  );
}
