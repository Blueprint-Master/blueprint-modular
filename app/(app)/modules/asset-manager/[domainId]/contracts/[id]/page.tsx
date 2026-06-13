"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Panel, Button, Spinner, Selectbox, Input, Badge, Card, Divider } from "@/components/bpm";
import { FicheHeader, FicheSectionCard, FicheFieldGrid, FicheNav, FicheSkeleton } from "@/components/fiche";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../../../strings";

type AssetContract = {
  id: string;
  domainId: string;
  reference: string;
  type: string;
  label: string;
  supplier: string | null;
  startDate: string;
  endDate: string;
  amount: number | null;
  autoRenewal: boolean;
  noticeDays: number;
  assetIds: string | null;
  notes: string | null;
  documentUrl: string | null;
  alertDaysBefore: number;
  createdAt: string;
  updatedAt: string;
};

export default function AssetManagerContractDetailPage() {
  const params = useParams();
  const { locale } = useI18n();
  const t = STR[locale];
  const tc = t.contracts;
  const TYPE_LABELS: Record<string, string> = tc.typeLabels;
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const id = typeof params?.id === "string" ? params.id : "";
  const [contract, setContract] = useState<AssetContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editLabel, setEditLabel] = useState("");
  const [editSupplier, setEditSupplier] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editNoticeDays, setEditNoticeDays] = useState("");
  const [editAutoRenewal, setEditAutoRenewal] = useState(false);
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/asset-manager/contracts/${id}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((c) => {
        setContract(c);
        if (c) {
          setEditLabel(c.label);
          setEditSupplier(c.supplier ?? "");
          setEditStartDate(c.startDate ? new Date(c.startDate).toISOString().slice(0, 10) : "");
          setEditEndDate(c.endDate ? new Date(c.endDate).toISOString().slice(0, 10) : "");
          setEditAmount(c.amount != null ? String(c.amount) : "");
          setEditNoticeDays(String(c.noticeDays ?? 30));
          setEditAutoRenewal(c.autoRenewal);
          setEditNotes(c.notes ?? "");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = () => {
    if (!contract || saving) return;
    setSaving(true);
    fetch(`/api/asset-manager/contracts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        label: editLabel.trim(),
        supplier: editSupplier.trim() || null,
        startDate: editStartDate || null,
        endDate: editEndDate || null,
        amount: editAmount ? parseFloat(editAmount) : null,
        noticeDays: parseInt(editNoticeDays, 10) || 30,
        autoRenewal: editAutoRenewal,
        notes: editNotes.trim() || null,
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((updated) => {
        if (updated) setContract(updated);
      })
      .finally(() => setSaving(false));
  };

  if (loading) {
    return <FicheSkeleton singleSection />;
  }

  if (!contract) {
    return (
      <div className="doc-page">
        <Panel variant="warning" title={tc.notFoundTitle}>{tc.notFoundDescription}</Panel>
        <FicheNav backLink={`/modules/asset-manager/${domainId}/contracts`} backLabel={tc.backList} />
      </div>
    );
  }

  const typeLabel = TYPE_LABELS[contract.type] ?? contract.type;

  return (
    <div className="doc-page">
      <FicheHeader
        breadcrumb={
          <>
            <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>{t.common.breadcrumbModules}</Link> → <Link href="/modules/asset-manager" style={{ color: "var(--bpm-accent-cyan)" }}>{t.common.moduleTitle}</Link> →{" "}
            <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>{t.nav.dashboard}</Link> →{" "}
            <Link href={`/modules/asset-manager/${domainId}/contracts`} style={{ color: "var(--bpm-accent-cyan)" }}>{t.nav.contracts}</Link> → {contract.reference}
          </>
        }
        title={contract.label}
        subtitle={
          <>
            <Badge variant="default">{contract.reference}</Badge>
            <Badge variant="default">{typeLabel}</Badge>
          </>
        }
      />

      <Divider thickness={1} color="var(--bpm-border)" className="my-4" />
      <Card variant="outlined" className="mt-4">
        <div className="bpm-card-body p-4">
          <h3 className="text-base font-semibold mb-3" style={{ color: "var(--bpm-text-primary)" }}>{tc.detailTitle}</h3>
          <FicheFieldGrid
            withDividers
            items={[
              { label: tc.fieldReference, value: contract.reference },
              { label: tc.fieldType, value: typeLabel, asBadge: true },
              {
                label: tc.fieldLabel,
                value: <Input value={editLabel} onChange={(v) => setEditLabel(v)} placeholder={tc.fieldLabel} />,
              },
              {
                label: tc.fieldSupplier,
                value: <Input value={editSupplier} onChange={(v) => setEditSupplier(v)} placeholder={tc.fieldSupplier} />,
              },
              {
                label: tc.fieldStart,
                value: (
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full rounded-lg border px-2 py-1.5 text-sm"
                    style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
                  />
                ),
              },
              {
                label: tc.fieldEnd,
                value: (
                  <input
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="w-full rounded-lg border px-2 py-1.5 text-sm"
                    style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
                  />
                ),
              },
              {
                label: tc.fieldAmount,
                value: <Input value={editAmount} onChange={(v) => setEditAmount(v)} placeholder={tc.placeholderAmount} />,
              },
              {
                label: tc.fieldNoticeDays,
                value: <Input value={editNoticeDays} onChange={(v) => setEditNoticeDays(v)} placeholder="30" />,
              },
              {
                label: tc.fieldAutoRenewalShort,
                value: (
                  <Selectbox
                    value={editAutoRenewal ? "yes" : "no"}
                    onChange={(v) => setEditAutoRenewal(v === "yes")}
                    options={[{ value: "no", label: t.common.no }, { value: "yes", label: t.common.yes }]}
                  />
                ),
              },
            ]}
          />
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{tc.sectionNotes}</label>
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              rows={3}
              className="bpm-textarea w-full rounded-lg border px-3 py-2 text-sm resize-y"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
              placeholder={tc.sectionNotes}
            />
          </div>
          <div className="mt-6">
            <Button variant="primary" size="medium" onClick={handleSave} disabled={saving}>
              {saving ? t.common.saving : t.common.save}
            </Button>
          </div>
        </div>
      </Card>

      <FicheNav backLink={`/modules/asset-manager/${domainId}/contracts`} backLabel={tc.backList} />
    </div>
  );
}
