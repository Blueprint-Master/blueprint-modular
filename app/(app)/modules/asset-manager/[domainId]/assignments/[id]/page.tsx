"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Panel, Button, Spinner, Selectbox, Badge, Card, Divider } from "@/components/bpm";
import { FicheHeader, FicheSectionCard, FicheFieldGrid, FicheNav, FicheSkeleton } from "@/components/fiche";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR, dateLocale } from "../../../strings";

type Assignment = {
  id: string;
  reference: string;
  assignmentType: string;
  startDate: string;
  expectedEndDate: string | null;
  actualEndDate: string | null;
  status: string;
  reason: string | null;
  conditionAtStart: string | null;
  conditionAtReturn: string | null;
  contractSigned: boolean;
  notes: string | null;
  asset: { id: string; reference: string; label: string } | null;
  assignee: { id: string; name: string | null; email: string | null } | null;
  technician: { id: string; name: string | null } | null;
  ticket: { id: string; reference: string; title: string } | null;
};

function statusBadgeVariant(s: string): "primary" | "success" | "warning" | "error" | "default" {
  if (s === "returned") return "success";
  if (s === "active") return "primary";
  if (s === "overdue") return "error";
  if (s === "cancelled") return "default";
  return "default";
}

export default function AssetManagerAssignmentDetailPage() {
  const { locale } = useI18n();
  const t = STR[locale];
  const ta = t.assignments;
  const STATUS_OPTIONS = [
    { value: "active", label: ta.statusActive },
    { value: "returned", label: ta.statusReturned },
    { value: "overdue", label: ta.statusOverdue },
    { value: "cancelled", label: ta.statusCancelled },
  ];
  const params = useParams();
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const id = typeof params?.id === "string" ? params.id : "";
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [returning, setReturning] = useState(false);
  const [editStatus, setEditStatus] = useState("");
  const [editConditionReturn, setEditConditionReturn] = useState("");
  const [editContractSigned, setEditContractSigned] = useState(false);

  const handleReturn = () => {
    if (!assignment || assignment.status !== "active" || returning) return;
    if (!confirm(ta.returnConfirm)) return;
    setReturning(true);
    fetch(`/api/asset-manager/assignments/${id}/return`, { method: "POST", credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((updated) => {
        if (updated) {
          setAssignment(updated);
          setEditStatus(updated.status);
          setEditConditionReturn(updated.conditionAtReturn ?? "");
          setEditContractSigned(updated.contractSigned);
        }
      })
      .finally(() => setReturning(false));
  };

  useEffect(() => {
    if (!id) return;
    fetch(`/api/asset-manager/assignments/${id}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((a) => {
        setAssignment(a);
        if (a) {
          setEditStatus(a.status);
          setEditConditionReturn(a.conditionAtReturn ?? "");
          setEditContractSigned(a.contractSigned);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = () => {
    if (!assignment || saving) return;
    setSaving(true);
    fetch(`/api/asset-manager/assignments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        status: editStatus,
        conditionAtReturn: editConditionReturn.trim() || null,
        contractSigned: editContractSigned,
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((updated) => {
        if (updated) setAssignment(updated);
      })
      .finally(() => setSaving(false));
  };

  if (loading) {
    return <FicheSkeleton sections={2} withForm />;
  }

  if (!assignment) {
    return (
      <div className="doc-page">
        <Panel variant="warning" title={ta.notFoundTitle}>{ta.notFoundBody}</Panel>
        <FicheNav backLink={`/modules/asset-manager/${domainId}/assignments`} backLabel={ta.backToList} />
      </div>
    );
  }

  const statusLabel = STATUS_OPTIONS.find((o) => o.value === assignment.status)?.label ?? assignment.status;

  return (
    <div className="doc-page">
      <FicheHeader
        breadcrumb={
          <>
            <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>{t.common.breadcrumbModules}</Link> → <Link href="/modules/asset-manager" style={{ color: "var(--bpm-accent-cyan)" }}>{t.common.moduleTitle}</Link> →{" "}
            <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>{ta.breadcrumbDashboard}</Link> →{" "}
            <Link href={`/modules/asset-manager/${domainId}/assignments`} style={{ color: "var(--bpm-accent-cyan)" }}>{ta.breadcrumbShort}</Link> → {assignment.reference}
          </>
        }
        title={assignment.reference}
        subtitle={
          <>
            <Badge variant="default">{assignment.asset?.label ?? t.common.dash}</Badge>
            <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
              {ta.beneficiaryLabel} {assignment.assignee?.name ?? assignment.assignee?.email ?? t.common.dash}
            </span>
            <Badge variant={statusBadgeVariant(assignment.status)}>{statusLabel}</Badge>
          </>
        }
      />

      {assignment.status === "active" && (
        <>
          <FicheSectionCard title={ta.returnTitle} className="mt-4">
            <p className="text-sm mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
              {ta.returnDescription}
            </p>
            <Button variant="primary" size="medium" onClick={handleReturn} disabled={returning}>
              {returning ? ta.returning : ta.returnCta}
            </Button>
          </FicheSectionCard>
          <Divider thickness={1} color="var(--bpm-border)" className="my-4" />
        </>
      )}

      <FicheSectionCard title={ta.sectionInfo} className="mt-4">
        <FicheFieldGrid
          withDividers
          items={[
            { label: ta.fieldAsset, value: assignment.asset ? `${assignment.asset.reference} — ${assignment.asset.label}` : "" },
            { label: ta.fieldBeneficiary, value: assignment.assignee?.name ?? assignment.assignee?.email ?? "" },
            { label: ta.fieldStart, value: new Date(assignment.startDate).toLocaleDateString(dateLocale(locale)) },
            { label: ta.fieldExpectedEnd, value: assignment.expectedEndDate ? new Date(assignment.expectedEndDate).toLocaleDateString(dateLocale(locale)) : "" },
            { label: ta.fieldActualEnd, value: assignment.actualEndDate ? new Date(assignment.actualEndDate).toLocaleDateString(dateLocale(locale)) : "" },
            { label: ta.fieldLinkedTicket, value: assignment.ticket ? `${assignment.ticket.reference} — ${assignment.ticket.title}` : "" },
            ...(assignment.reason ? [{ label: ta.fieldReason, value: assignment.reason }] : []),
          ]}
        />
      </FicheSectionCard>

      <Divider thickness={1} color="var(--bpm-border)" className="my-4" />
      <Card variant="outlined" className="mt-4">
        <div className="bpm-card-body p-4">
          <h3 className="text-base font-semibold mb-3" style={{ color: "var(--bpm-text-primary)" }}>{ta.editTitle}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Selectbox label={t.common.status} value={editStatus} onChange={(v) => setEditStatus(String(v))} options={STATUS_OPTIONS} />
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{ta.fieldConditionReturn}</label>
              <textarea
                value={editConditionReturn}
                onChange={(e) => setEditConditionReturn(e.target.value)}
                rows={2}
                className="bpm-textarea w-full rounded-lg border px-3 py-2 text-sm resize-y"
                style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
              />
            </div>
            <label className="flex items-center gap-2 col-span-2">
              <input type="checkbox" checked={editContractSigned} onChange={(e) => setEditContractSigned(e.target.checked)} />
              <span style={{ color: "var(--bpm-text-primary)" }}>{ta.fieldContractSigned}</span>
            </label>
          </div>
          <div className="mt-6">
            <Button variant="primary" size="medium" onClick={handleSave} disabled={saving}>
              {saving ? t.common.saving : t.common.save}
            </Button>
          </div>
        </div>
      </Card>

      <FicheNav backLink={`/modules/asset-manager/${domainId}/assignments`} backLabel={ta.backToList} />
    </div>
  );
}
