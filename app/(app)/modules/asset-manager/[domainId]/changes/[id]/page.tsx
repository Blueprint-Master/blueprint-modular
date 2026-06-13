"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Panel, Button, Spinner, Selectbox, Badge, Divider } from "@/components/bpm";
import { FicheHeader, FicheSectionCard, FicheFieldGrid, FicheNav, FicheSkeleton } from "@/components/fiche";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR, dateLocale } from "../../../strings";

type ChangeRequest = {
  id: string;
  reference: string;
  type: string;
  title: string;
  description: string;
  impact: string;
  riskLevel: string;
  rollbackPlan: string;
  status: string;
  plannedStart: string | null;
  plannedEnd: string | null;
  createdAt: string;
  updatedAt: string;
};

function getRiskBandColor(riskLevel: string): string {
  switch (riskLevel) {
    case "critical": return "#ef4444";
    case "high": return "#f59e0b";
    case "medium": return "var(--bpm-accent-cyan)";
    case "low": return "var(--bpm-accent-mint)";
    default: return "var(--bpm-border)";
  }
}

function getRiskBadgeVariant(riskLevel: string): "error" | "warning" | "primary" | "success" | "default" {
  switch (riskLevel) {
    case "critical": return "error";
    case "high": return "warning";
    case "medium": return "primary";
    case "low": return "success";
    default: return "default";
  }
}

function getStatusBadgeVariant(status: string): "success" | "warning" | "error" | "default" {
  switch (status) {
    case "approved":
    case "completed":
      return "success";
    case "rejected":
    case "failed":
    case "cancelled":
      return "error";
    case "draft":
    case "submitted":
    case "cab_review":
    case "scheduled":
    case "in_progress":
      return "warning";
    default:
      return "default";
  }
}

function formatRollbackDisplay(value: string, notSetLabel: string): React.ReactNode {
  const trimmed = (value ?? "").trim();
  if (!trimmed || trimmed.toUpperCase() === "NC") {
    return <span className="italic" style={{ color: "var(--bpm-text-secondary)" }}>{notSetLabel}</span>;
  }
  return trimmed;
}

export default function AssetManagerChangeDetailPage() {
  const { locale } = useI18n();
  const t = STR[locale];
  const tch = t.changes;
  const TYPE_LABELS = tch.typeLabels;
  const STATUS_LABELS = tch.statusLabels;
  const RISK_LABELS = tch.riskLabels;
  const params = useParams();
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const id = typeof params?.id === "string" ? params.id : "";
  const [change, setChange] = useState<ChangeRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rejectComment, setRejectComment] = useState("");

  useEffect(() => {
    if (!domainId || !id) return;
    fetch(`/api/asset-manager/changes/${id}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then(setChange)
      .finally(() => setLoading(false));
  }, [domainId, id]);

  const handleStatusChange = async (value: string) => {
    if (!change || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/asset-manager/changes/${change.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: value }),
      });
      if (res.ok) setChange(await res.json());
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!change || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/asset-manager/changes/${change.id}/approve`, { method: "POST", credentials: "include" });
      if (res.ok) setChange(await res.json());
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!change || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/asset-manager/changes/${change.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ comment: rejectComment.trim() || undefined }),
      });
      if (res.ok) {
        setChange(await res.json());
        setRejectComment("");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <FicheSkeleton sections={3} />;
  }

  if (!change) {
    return (
      <div className="doc-page">
        <Panel variant="warning" title={tch.notFoundTitle}>{tch.notFoundDescription}</Panel>
        <nav className="doc-pagination mt-6 flex flex-wrap gap-2">
          <Link href={`/modules/asset-manager/${domainId}/changes`}>
            <Button variant="outline" size="small" className="border-transparent bg-transparent">{tch.backToChanges}</Button>
          </Link>
        </nav>
      </div>
    );
  }

  return (
    <div className="doc-page">
      <FicheHeader
        breadcrumb={
          <>
            <Link href={`/modules/asset-manager/${domainId}/changes`} style={{ color: "var(--bpm-accent-cyan)" }}>{tch.breadcrumbChanges}</Link>
            <span style={{ color: "var(--bpm-text-secondary)" }}> → </span>
            <span>{change.reference}</span>
          </>
        }
        title={change.title}
        subtitle={
          <>
            <Badge variant="default">{change.reference}</Badge>
            <Badge variant={change.type === "emergency" ? "error" : change.type === "standard" ? "success" : "primary"}>
              {TYPE_LABELS[change.type] ?? change.type}
            </Badge>
            <Badge variant={getRiskBadgeVariant(change.riskLevel)}>
              {RISK_LABELS[change.riskLevel] ?? change.riskLevel}
            </Badge>
            <Badge variant={getStatusBadgeVariant(change.status)}>
              {STATUS_LABELS[change.status] ?? change.status}
            </Badge>
          </>
        }
      />

      {(change.status === "draft" || change.status === "submitted") && (
        <>
          <FicheSectionCard title={tch.submitToCabTitle} className="mb-4">
            <p className="text-sm mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
              {tch.submitToCabDescription}
            </p>
            <Button variant="primary" size="small" onClick={() => handleStatusChange("cab_review")} disabled={saving}>
              {tch.submitToCab}
            </Button>
          </FicheSectionCard>
          <Divider thickness={1} color="var(--bpm-border)" className="my-4" />
        </>
      )}

      {change.status === "cab_review" && (
        <>
          <Divider thickness={1} color="var(--bpm-border)" className="my-4" />
          <FicheSectionCard title={tch.cabReviewTitle} className="mb-4">
          <p className="text-sm mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
            {tch.cabReviewDescription}
          </p>
          <div className="flex flex-wrap items-end gap-4">
            <Button variant="primary" size="small" onClick={handleApprove} disabled={saving}>
              {saving ? tch.inProgress : tch.approve}
            </Button>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{tch.rejectCommentLabel}</label>
              <input
                type="text"
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder={tch.rejectCommentPlaceholder}
                className="w-full rounded border p-2 text-sm"
                style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
              />
            </div>
            <Button variant="outline" size="small" onClick={handleReject} disabled={saving}>
              {tch.reject}
            </Button>
          </div>
        </FicheSectionCard>
        </>
      )}

      <Divider thickness={1} color="var(--bpm-border)" className="my-4" />
      <FicheSectionCard title={tch.requestDetailTitle} className="mb-6">
        <FicheFieldGrid
          withDividers
          items={[
            {
              label: t.common.status,
              value: (
                <span className="flex items-center gap-2">
                  <Selectbox
                    label=""
                    value={change.status}
                    onChange={(v) => handleStatusChange(String(v))}
                    options={Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))}
                  />
                  {saving && <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>{t.common.saving}</span>}
                </span>
              ),
            },
            { label: t.common.type, value: TYPE_LABELS[change.type] ?? change.type, asBadge: true, badgeVariant: change.type === "emergency" ? "error" : change.type === "standard" ? "success" : "primary" },
            { label: t.common.priority, value: RISK_LABELS[change.riskLevel] ?? change.riskLevel, asBadge: true, badgeVariant: getRiskBadgeVariant(change.riskLevel) },
            {
              label: tch.fieldDates,
              value: change.plannedStart || change.plannedEnd
                ? [
                    change.plannedStart ? tch.plannedStartLabel(new Date(change.plannedStart).toLocaleDateString(dateLocale(locale))) : null,
                    change.plannedEnd ? tch.plannedEndLabel(new Date(change.plannedEnd).toLocaleDateString(dateLocale(locale))) : null,
                  ].filter(Boolean).join(" · ")
                : "",
            },
          ]}
        />
        <div className="border-t pt-4 mt-4" style={{ borderColor: "var(--bpm-border)" }}>
          <p className="text-xs font-semibold uppercase mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{t.common.description}</p>
          <p className="text-sm whitespace-pre-wrap m-0" style={{ color: "var(--bpm-text-primary)" }}>{change.description}</p>
        </div>
        <div className="border-t pt-4 mt-4" style={{ borderColor: "var(--bpm-border)" }}>
          <p className="text-xs font-semibold uppercase mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{tch.fieldImpact}</p>
          <p className="text-sm whitespace-pre-wrap m-0" style={{ color: "var(--bpm-text-primary)" }}>{change.impact}</p>
        </div>
        <div className="border-t pt-4 mt-4" style={{ borderColor: "var(--bpm-border)" }}>
          <p className="text-xs font-semibold uppercase mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{tch.fieldRollbackPlan}</p>
          <div className="text-sm whitespace-pre-wrap m-0" style={{ color: "var(--bpm-text-primary)" }}>
            {formatRollbackDisplay(change.rollbackPlan, tch.rollbackNotSet)}
          </div>
        </div>
        <div className="border-t pt-4 mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ borderColor: "var(--bpm-border)", color: "var(--bpm-text-secondary)" }}>
          <span>{tch.createdAt(new Date(change.createdAt).toLocaleString(dateLocale(locale)))}</span>
          <span>{tch.updatedAt(new Date(change.updatedAt).toLocaleString(dateLocale(locale)))}</span>
        </div>
      </FicheSectionCard>

      <FicheNav backLink={`/modules/asset-manager/${domainId}/changes`} backLabel={tch.backToChanges} />
    </div>
  );
}
