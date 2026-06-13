"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, Caption, Divider, Button, Spinner, Selectbox, Input } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../../../strings";

export default function AssetManagerContractNewPage() {
  const params = useParams();
  const router = useRouter();
  const { locale } = useI18n();
  const t = STR[locale];
  const tc = t.contracts;
  const TYPE_OPTIONS = Object.entries(tc.typeLabels).map(([value, label]) => ({ value, label }));
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const [config, setConfig] = useState<{ domain_label?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reference, setReference] = useState("");
  const [type, setType] = useState("garantie");
  const [label, setLabel] = useState("");
  const [supplier, setSupplier] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [amount, setAmount] = useState("");
  const [noticeDays, setNoticeDays] = useState("30");
  const [autoRenewal, setAutoRenewal] = useState(false);
  const [notes, setNotes] = useState("");
  const [assetIds, setAssetIds] = useState<string[]>([]);
  const [assets, setAssets] = useState<{ id: string; reference: string; label: string }[]>([]);

  useEffect(() => {
    if (!domainId) return;
    Promise.all([
      fetch(`/api/asset-manager/config/${domainId}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/asset-manager/assets?domainId=${encodeURIComponent(domainId)}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([cfg, list]) => {
        setConfig(cfg);
        setAssets(Array.isArray(list) ? list : []);
      })
      .finally(() => setLoading(false));
  }, [domainId]);

  const toggleAsset = (aid: string) => {
    setAssetIds((prev) => (prev.includes(aid) ? prev.filter((id) => id !== aid) : [...prev, aid]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim() || !label.trim() || !startDate || !endDate || saving) return;
    setSaving(true);
    fetch("/api/asset-manager/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        domainId,
        reference: reference.trim(),
        type,
        label: label.trim(),
        supplier: supplier.trim() || null,
        startDate,
        endDate,
        amount: amount ? parseFloat(amount) : null,
        noticeDays: parseInt(noticeDays, 10) || 30,
        autoRenewal,
        notes: notes.trim() || null,
        assetIds: assetIds.length > 0 ? assetIds : null,
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((created) => {
        if (created?.id) router.push(`/modules/asset-manager/${domainId}/contracts/${created.id}`);
      })
      .finally(() => setSaving(false));
  };

  if (loading) {
    return (
      <div className="doc-page flex justify-center py-12">
        <Spinner size="medium" />
      </div>
    );
  }

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <nav className="doc-breadcrumb">
          <Link href="/modules">{t.common.breadcrumbModules}</Link> → <Link href="/modules/asset-manager">{t.common.moduleTitle}</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}`}>{t.nav.dashboard}</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}/contracts`}>{t.nav.contracts}</Link> → {tc.breadcrumbNew}
        </nav>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>{tc.newContract}</h1>
        <Caption>{tc.fillBelow}</Caption>
      </div>

      <Card variant="outlined">
        <form onSubmit={handleSubmit} className="space-y-0">
          <section className="space-y-4" aria-label={tc.sectionIdentification}>
            <Input label={tc.fieldReferenceRequired} value={reference} onChange={(v) => setReference(v)} required placeholder={tc.placeholderReference} />
            <Input label={tc.fieldLabelRequired} value={label} onChange={(v) => setLabel(v)} required placeholder={tc.placeholderLabel} />
            <Selectbox label={tc.fieldTypeRequired} value={type} onChange={(v) => setType(String(v))} options={TYPE_OPTIONS} />
            <Input label={tc.fieldSupplier} value={supplier} onChange={(v) => setSupplier(v)} placeholder={tc.fieldSupplier} />
          </section>

          <Divider thickness={1} color="var(--bpm-border)" className="my-4" label={tc.sectionPeriod} />
          <section className="space-y-4" aria-label={tc.sectionPeriod}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{tc.fieldStartRequired}</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full rounded border px-2 py-1.5 text-sm"
                  style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{tc.fieldEndRequired}</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full rounded border px-2 py-1.5 text-sm"
                  style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
                />
              </div>
            </div>
            <Input label={tc.fieldAmount} value={amount} onChange={(v) => setAmount(v)} placeholder={t.common.optional} />
            <Input label={tc.fieldNoticeDays} value={noticeDays} onChange={(v) => setNoticeDays(v)} placeholder="30" />
            <Selectbox
              label={tc.fieldAutoRenewal}
              value={autoRenewal ? "yes" : "no"}
              onChange={(v) => setAutoRenewal(v === "yes")}
              options={[{ value: "no", label: t.common.no }, { value: "yes", label: t.common.yes }]}
            />
          </section>

          {assets.length > 0 && (
            <>
              <Divider thickness={1} color="var(--bpm-border)" className="my-4" label={tc.sectionCoveredAssets} />
              <section className="space-y-2" aria-label={tc.sectionCoveredAssets}>
                <div className="max-h-40 overflow-y-auto rounded border p-2 space-y-1" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>
                  {assets.map((a) => (
                    <label key={a.id} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={assetIds.includes(a.id)}
                        onChange={() => toggleAsset(a.id)}
                        className="rounded"
                        style={{ accentColor: "var(--bpm-accent)" }}
                      />
                      <span style={{ color: "var(--bpm-text-primary)" }}>{a.reference} — {a.label}</span>
                    </label>
                  ))}
                </div>
                {assetIds.length > 0 && (
                  <p className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>{tc.assetsSelected(assetIds.length)}</p>
                )}
              </section>
            </>
          )}

          <Divider thickness={1} color="var(--bpm-border)" className="my-4" label={tc.sectionNotes} />
          <section className="space-y-4" aria-label={tc.sectionNotes}>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{tc.sectionNotes}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="bpm-textarea w-full rounded-lg border px-3 py-2 text-sm resize-y"
                style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
                placeholder={tc.placeholderNotesOptional}
              />
            </div>
          </section>

          <Divider thickness={1} color="var(--bpm-border)" className="my-4" />
          <div className="flex gap-2 mt-6">
            <Button type="submit" size="small" disabled={saving || !reference.trim() || !label.trim() || !startDate || !endDate}>
              {saving ? t.common.creating : tc.createContract}
            </Button>
            <Link href={`/modules/asset-manager/${domainId}/contracts`}>
              <Button type="button" variant="outline" size="small">{t.common.cancel}</Button>
            </Link>
          </div>
        </form>
      </Card>

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href={`/modules/asset-manager/${domainId}/contracts`} style={{ color: "var(--bpm-accent-cyan)" }}>{tc.backList}</Link>
        <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>{t.nav.dashboard}</Link>
      </nav>
    </div>
  );
}
