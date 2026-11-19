"use client";

import { useState, useEffect } from "react";
import { contractDocumentHref, contractNumber, coveredIds } from "@/lib/asset-manager/contract-terms";
import { readResponse } from "../../../lib/read-response";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Panel, Button, Spinner, Selectbox, Input, Badge, Card, Divider } from "@/components/bpm";
import { FicheHeader, FicheSectionCard, FicheFieldGrid, FicheNav, FicheSkeleton } from "@/components/fiche";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../../../strings";

type AssetSummary = { id: string; reference: string; label: string };
type AssetContract = {
  canEdit: boolean; coveredAssets: AssetSummary[];
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
  const router = useRouter();
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
  const [error, setError] = useState("");
  const [assets, setAssets] = useState<AssetSummary[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [alertDays, setAlertDays] = useState("30");
  const [documentUrl, setDocumentUrl] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const endpoint = `/api/asset-manager/contracts/${id}`;
  function populate(c: AssetContract) {
    setEditLabel(c.label); setEditSupplier(c.supplier ?? ""); setEditNotes(c.notes ?? "");
    setEditStartDate(c.startDate.slice(0, 10)); setEditEndDate(c.endDate.slice(0, 10));
    setEditAmount(c.amount === null ? "" : String(c.amount)); setEditNoticeDays(String(c.noticeDays));
    setAlertDays(String(c.alertDaysBefore)); setEditAutoRenewal(c.autoRenewal);
    setSelected(coveredIds(c.assetIds)); setDocumentUrl(c.documentUrl ?? "");
  }

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(endpoint).then(readResponse).then(async c => {
      if (!active) return;
      setContract(c); populate(c);
      if (c.canEdit) {
        const list = await fetch(`/api/asset-manager/assets?domainId=${encodeURIComponent(c.domainId)}`).then(readResponse);
        if (active) setAssets(list);
      }
    }).catch(err => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [endpoint]);

  async function handleSave() {
    if (!contract || saving) return;
    setError("");
    const numbers = [editAmount, editNoticeDays, alertDays].map(contractNumber);
    if (numbers.some(n => !Number.isFinite(n))) { setError(locale === "fr" ? "Montant ou délai invalide." : "Invalid amount or period."); return; }
    const fields = { label: editLabel.trim(), supplier: editSupplier.trim() || null, notes: editNotes.trim() || null,
      amount: editAmount.trim() ? numbers[0] : null, noticeDays: numbers[1], alertDaysBefore: numbers[2],
      autoRenewal: editAutoRenewal, startDate: editStartDate, endDate: editEndDate, assetIds: selected,
      documentUrl: documentUrl.trim() || null };
    const original = { ...contract, startDate: contract.startDate.slice(0, 10), endDate: contract.endDate.slice(0, 10), assetIds: coveredIds(contract.assetIds) };
    const patch = Object.fromEntries(Object.entries(fields).filter(([key, value]) => JSON.stringify(value) !== JSON.stringify(original[key])));
    if (!Object.keys(patch).length) return;
    setSaving(true);
    try {
      const response = await fetch(endpoint, { method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...patch, expectedUpdatedAt: contract.updatedAt }) });
      if (response.status === 409) {
        const latest = await fetch(endpoint).then(readResponse);
        setContract(latest);
        populate({ ...latest, ...patch, assetIds: patch.assetIds ? JSON.stringify(patch.assetIds) : latest.assetIds });
        setError(locale === "fr" ? "Le contrat a changé. Vérifiez vos champs avant de les enregistrer." : "The contract changed. Review your fields before saving.");
        return;
      }
      await readResponse(response);
      const saved = await fetch(endpoint).then(readResponse);
      setContract(saved); populate(saved);
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setSaving(false); }
  }
  async function remove() {
    if (!contract || !window.confirm(locale === "fr" ? "Supprimer ce contrat ?" : "Delete this contract?")) return;
    setSaving(true); setError("");
    try {
      await fetch(endpoint + "?expectedUpdatedAt=" + encodeURIComponent(contract.updatedAt), { method: "DELETE" }).then(readResponse);
      router.push(`/modules/asset-manager/${domainId}/contracts`);
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setSaving(false); }
  }

  if (loading) {
    return <FicheSkeleton singleSection />;
  }

  if (!contract) {
    return (
      <div className="doc-page">
        <Panel variant="warning" title={tc.notFoundTitle}>{error || tc.notFoundDescription}</Panel>
        <FicheNav backLink={`/modules/asset-manager/${domainId}/contracts`} backLabel={tc.backList} />
      </div>
    );
  }

  const doc = contractDocumentHref(contract.documentUrl);
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
      {error && <p role="alert">{error}</p>}
      <Card variant="outlined" className="mt-4">
        <div className="bpm-card-body p-4">
          <h3 className="text-base font-semibold mb-3" style={{ color: "var(--bpm-text-primary)" }}>{tc.detailTitle}</h3>
          <fieldset disabled={!contract.canEdit || saving}><FicheFieldGrid
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
              { label: locale === "fr" ? "Alerte (jours)" : "Alert (days)", value: <Input value={alertDays} onChange={setAlertDays} /> },
              { label: locale === "fr" ? "Lien vers le contrat" : "Document URL", value: <Input value={documentUrl} onChange={setDocumentUrl} /> },
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
          {contract.canEdit && assets.length > 0 && <div className="mt-3"><p>{tc.sectionCoveredAssets}</p>
            {assets.map(asset => <label key={asset.id} className="flex gap-2"><input type="checkbox" checked={selected.includes(asset.id)}
              onChange={() => setSelected(ids => ids.includes(asset.id) ? ids.filter(id => id !== asset.id) : [...ids, asset.id])} />
              {asset.reference} — {asset.label}</label>)}
          </div>}
          </fieldset>
          {doc && <p className="mt-3"><a href={doc} target="_blank" rel="noopener noreferrer">{locale === "fr" ? "Ouvrir le contrat" : "Open document"}</a></p>}
          {contract.coveredAssets.length > 0 && <ul className="mt-3">{contract.coveredAssets.map(asset => <li key={asset.id}>
            <Link href={`/modules/asset-manager/${domainId}/assets/${asset.id}`}>{asset.reference} — {asset.label}</Link>
          </li>)}</ul>}
          {contract.canEdit && <div className="mt-6 flex gap-2">
            <Button variant="primary" size="medium" onClick={handleSave} disabled={saving}>{saving ? t.common.saving : t.common.save}</Button>
            <Button variant="outline" size="small" onClick={remove} disabled={saving}>{t.common.delete}</Button>
          </div>}
        </div>
      </Card>

      <FicheNav backLink={`/modules/asset-manager/${domainId}/contracts`} backLabel={tc.backList} />
    </div>
  );
}
