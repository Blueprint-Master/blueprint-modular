"use client";

import { useState, useEffect } from "react";
import { changeSteps, changeApprovals } from "@/lib/asset-manager/change-status";
import { readResponse } from "../../../lib/read-response";
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
  cabRound: number;
  cabReviewerIds: string | null;
  cabElectorate: string[];
  cabRejections: string[];
  cabRequiredVotes: number | null;
  implementationNotes: string | null;
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

  const [error, setError] = useState("");
  const [actor, setActor] = useState({ canEdit: false, viewerId: "" });
  const [plannedStart, setPlannedStart] = useState("");
  const [plannedEnd, setPlannedEnd] = useState("");
  const endpoint = `/api/asset-manager/changes/${id}`;

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(endpoint).then(readResponse).then(data => {
      if (!active) return;
      setActor({ canEdit: data.canEdit, viewerId: data.viewerId });
      setChange(data);
      setPlannedStart(data.plannedStart?.slice(0, 10) ?? "");
      setPlannedEnd(data.plannedEnd?.slice(0, 10) ?? "");
    }).catch(err => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [endpoint]);

  async function command(body: object, vote?: "approve" | "reject") {
    if (!change || saving) return;
    setSaving(true); setError("");
    try {
      const response = await fetch(vote ? endpoint + "/" + vote : endpoint, {
        method: vote ? "POST" : "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vote ? { ...body, round: change.cabRound } : { ...body, expectedUpdatedAt: change.updatedAt }),
      });
      if (response.status === 409) setChange(await fetch(endpoint).then(readResponse));
      const updated = await readResponse(response);
      setChange(updated);
      setRejectComment("");
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setSaving(false); }
  }

  if (loading) {
    return <FicheSkeleton sections={3} />;
  }

  if (!change) {
    return (
      <div className="doc-page">
        <Panel variant="warning" title={tch.notFoundTitle}>{error || tch.notFoundDescription}</Panel>
        <nav className="doc-pagination mt-6 flex flex-wrap gap-2">
          <Link href={`/modules/asset-manager/${domainId}/changes`}>
            <Button variant="outline" size="small" className="border-transparent bg-transparent">{tch.backToChanges}</Button>
          </Link>
        </nav>
      </div>
    );
  }

  const approvals = changeApprovals(change.cabReviewerIds);
  const voted = approvals.includes(actor.viewerId) || change.cabRejections.includes(actor.viewerId);
  const eligible = !change.cabElectorate.length || change.cabElectorate.includes(actor.viewerId);
  const steps = changeSteps[change.status] ?? ["draft"];
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

      {error && <p role="alert">{error}</p>}
      {actor.canEdit && (change.status === "draft" || change.status === "submitted") && (
        <>
          <FicheSectionCard title={tch.submitToCabTitle} className="mb-4">
            <p className="text-sm mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
              {tch.submitToCabDescription}
            </p>
            <Button variant="primary" size="small" onClick={() => command({ status: "cab_review" })} disabled={saving}>
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
          {change.cabRequiredVotes && <p>{locale === "fr" ? "Votes favorables" : "Approvals"} · {approvals.length} / {change.cabRequiredVotes}</p>}
          {actor.canEdit && eligible && <div className="flex flex-wrap items-end gap-4">
            <Button variant="primary" size="small" onClick={() => command({}, "approve")} disabled={saving || voted}>
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
            <Button variant="outline" size="small" onClick={() => command({ comment: rejectComment }, "reject")} disabled={saving || voted}>
              {tch.reject}
            </Button>
          </div>}
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
                  {actor.canEdit && steps.length ? <Selectbox
                    label=""
                    value={change.status}
                    onChange={v => command({ status: String(v) })}
                    options={[change.status, ...steps].map(value => ({ value, label: STATUS_LABELS[value] ?? value }))}
                  /> : STATUS_LABELS[change.status] ?? change.status}
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
        {actor.canEdit && ["draft", "submitted", "approved", "scheduled"].includes(change.status) && <div className="flex flex-wrap items-end gap-3">
          <label>{tch.fieldPlannedStart}<input className="block rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)" }} type="date" value={plannedStart} onChange={e => setPlannedStart(e.target.value)} /></label>
          <label>{tch.fieldPlannedEnd}<input className="block rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)" }} type="date" value={plannedEnd} onChange={e => setPlannedEnd(e.target.value)} /></label>
          <Button variant="outline" size="small" disabled={saving} onClick={() => command({ plannedStart: plannedStart || null, plannedEnd: plannedEnd || null })}>{t.common.save}</Button>
        </div>}
        {change.implementationNotes && <p className="whitespace-pre-wrap">{change.implementationNotes}</p>}
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
