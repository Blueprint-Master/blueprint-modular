"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Panel, Button, Spinner, Selectbox, Badge, Card, Divider, Progress } from "@/components/bpm";
import { FicheHeader, FicheSectionCard, FicheFieldGrid, FicheNav, FicheSkeleton } from "@/components/fiche";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR, dateLocale } from "../../../strings";

type Ticket = {
  id: string;
  reference: string;
  typeId: string;
  title: string;
  description: string;
  status: string;
  priorityId: string;
  categoryId: string;
  subcategory: string | null;
  openedAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
  solution: string | null;
  requester: { id: string; name: string | null; email: string | null } | null;
  assignee: { id: string; name: string | null } | null;
  asset: { id: string; reference: string; label: string } | null;
};

type DomainConfig = {
  priorities: { id: string; label: string; sla_hours?: number }[];
  ticket_categories: { id: string; label: string; subcategories: string[] }[];
};

const STATUS_VALUES = ["new", "in_progress", "on_hold", "resolved", "closed"];

function statusBadgeVariant(s: string): "primary" | "success" | "warning" | "error" | "default" {
  if (s === "resolved" || s === "closed") return "success";
  if (s === "new" || s === "open") return "primary";
  if (s === "in_progress" || s === "on_hold" || s === "pending") return "warning";
  return "default";
}

export default function AssetManagerTicketDetailPage() {
  const params = useParams();
  const { locale } = useI18n();
  const t = STR[locale];
  const tt = t.tickets;
  const STATUS_OPTIONS = STATUS_VALUES.map((value) => ({ value, label: tt.statusLabels[value] ?? value }));
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const id = typeof params?.id === "string" ? params.id : "";
  const [config, setConfig] = useState<DomainConfig | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editStatus, setEditStatus] = useState("");
  const [editSolution, setEditSolution] = useState("");

  useEffect(() => {
    if (!domainId || !id) return;
    Promise.all([
      fetch(`/api/asset-manager/config/${domainId}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/asset-manager/tickets/${id}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([cfg, tk]) => {
        setConfig(cfg);
        setTicket(tk);
        if (tk) {
          setEditStatus(tk.status);
          setEditSolution(tk.solution ?? "");
        }
      })
      .finally(() => setLoading(false));
  }, [domainId, id]);

  const handleSave = () => {
    if (!ticket || saving) return;
    setSaving(true);
    fetch(`/api/asset-manager/tickets/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: editStatus, solution: editSolution || null }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((updated) => {
        if (updated) setTicket(updated);
        setEditStatus(updated?.status ?? editStatus);
        setEditSolution(updated?.solution ?? editSolution);
      })
      .finally(() => setSaving(false));
  };

  if (loading) {
    return <FicheSkeleton sections={2} withSla withForm />;
  }

  if (!ticket) {
    return (
      <div className="doc-page">
        <Panel variant="warning" title={tt.notFoundTitle}>{tt.notFoundDescription}</Panel>
        <FicheNav backLink={`/modules/asset-manager/${domainId}/tickets`} backLabel={tt.backToList} />
      </div>
    );
  }

  const getPriorityLabel = (pid: string) => config?.priorities?.find((p) => p.id === pid)?.label ?? pid;
  const getCategoryLabel = (cid: string) => config?.ticket_categories?.find((c) => c.id === cid)?.label ?? cid;

  const openStatuses = ["new", "open", "pending", "in_progress", "on_hold", "assigned"];
  const isOpen = openStatuses.includes(ticket.status);
  const slaHours = config?.priorities?.find((p) => p.id === ticket.priorityId)?.sla_hours ?? 48;
  const elapsedHours = (Date.now() - new Date(ticket.openedAt).getTime()) / (1000 * 60 * 60);
  const slaPercent = isOpen && slaHours > 0 ? Math.min(150, Math.round((elapsedHours / slaHours) * 100)) : 0;
  const slaExceeded = isOpen && slaPercent >= 100;

  const statusLabel = STATUS_OPTIONS.find((o) => o.value === ticket.status)?.label ?? ticket.status;

  return (
    <div className="doc-page">
      <FicheHeader
        breadcrumb={
          <>
            <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>{t.common.breadcrumbModules}</Link> → <Link href="/modules/asset-manager" style={{ color: "var(--bpm-accent-cyan)" }}>{t.common.moduleTitle}</Link> →{" "}
            <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>{tt.breadcrumbDashboard}</Link> →{" "}
            <Link href={`/modules/asset-manager/${domainId}/tickets`} style={{ color: "var(--bpm-accent-cyan)" }}>{tt.breadcrumbTickets}</Link> → {ticket.reference}
          </>
        }
        title={ticket.title}
        subtitle={
          <>
            <Badge variant="default">{ticket.reference}</Badge>
            <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>{tt.openedOn(new Date(ticket.openedAt).toLocaleDateString(dateLocale(locale)))}</span>
            <Badge variant="default">{getPriorityLabel(ticket.priorityId)}</Badge>
            <Badge variant="default">{getCategoryLabel(ticket.categoryId)}</Badge>
            <Badge variant={statusBadgeVariant(ticket.status)}>{statusLabel}</Badge>
          </>
        }
      />

      {isOpen && (
        <>
          <FicheSectionCard title={tt.slaTitle} className="mt-4">
            <Progress
              value={Math.min(100, slaPercent)}
              max={100}
              label={tt.slaConsumed(slaHours)}
              showValue
            />
            <div className="mt-2">
              {slaExceeded ? (
                <Badge variant="error">{tt.slaExceeded}</Badge>
              ) : (
                <Badge variant="success">{tt.slaOk}</Badge>
              )}
            </div>
          </FicheSectionCard>
          <Divider thickness={1} color="var(--bpm-border)" className="my-4" />
        </>
      )}

      <FicheSectionCard title={tt.sectionInformation} className="mt-4">
        <FicheFieldGrid
          withDividers
          items={[
            { label: tt.fieldRequester, value: ticket.requester?.name ?? ticket.requester?.email ?? "" },
            { label: tt.fieldAssignee, value: ticket.assignee?.name ?? "" },
            { label: tt.fieldLinkedAsset, value: ticket.asset ? `${ticket.asset.reference} — ${ticket.asset.label}` : "" },
          ]}
        />
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{t.common.description}</p>
          <div className="whitespace-pre-wrap rounded-lg p-3 text-sm" style={{ background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)" }}>
            {ticket.description}
          </div>
        </div>
      </FicheSectionCard>

      <Divider thickness={1} color="var(--bpm-border)" className="my-4" />
      {(ticket.status === "resolved" || ticket.status === "closed") && (
        <FicheSectionCard title={tt.sectionKnowledge} className="mt-4">
          <p className="text-sm mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
            {tt.knowledgeHint}
          </p>
          <Link href={`/modules/asset-manager/${domainId}/knowledge/new?fromTicket=${ticket.id}`}>
            <Button variant="outline" size="small">{tt.publishKnowledge}</Button>
          </Link>
        </FicheSectionCard>
      )}

      <Divider thickness={1} color="var(--bpm-border)" className="my-4" />
      <Card variant="outlined" className="mt-4">
        <div className="bpm-card-body p-4">
          <h3 className="text-base font-semibold mb-3" style={{ color: "var(--bpm-text-primary)" }}>{tt.editTicket}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Selectbox
              label={t.common.status}
              value={editStatus}
              onChange={(v) => setEditStatus(String(v))}
              options={STATUS_OPTIONS}
            />
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{tt.fieldSolution}</label>
              <textarea
                value={editSolution}
                onChange={(e) => setEditSolution(e.target.value)}
                rows={4}
                className="bpm-textarea w-full rounded-lg border px-3 py-2 text-sm resize-y"
                style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
                placeholder={tt.placeholderSolution}
              />
            </div>
          </div>
          <div className="mt-6">
            <Button variant="primary" size="medium" onClick={handleSave} disabled={saving}>
              {saving ? t.common.saving : t.common.save}
            </Button>
          </div>
        </div>
      </Card>

      <FicheNav backLink={`/modules/asset-manager/${domainId}/tickets`} backLabel={tt.backToList} />
    </div>
  );
}
