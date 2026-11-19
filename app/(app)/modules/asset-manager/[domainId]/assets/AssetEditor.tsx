"use client";

import { useState, useEffect } from "react";
import { readResponse } from "../../lib/read-response";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, Caption, Divider, Button, Input, Selectbox } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../../strings";

interface DomainConfig {
  domain_id: string;
  domain_label: string;
  asset_label_singular: string;
  asset_types: {
    id: string;
    label: string;
    fields: { key: string; label: string; type: string; options?: string[] }[];
  }[];
  statuses: { id: string; label: string }[];
}

type Attribute = { key: string; valueText?: string; valueDate?: string; valueNumber?: number; valueBool?: boolean };
type RecordFields = { label: string; statusId: string; assetTypeId: string; updatedAt: string; attributes: Attribute[]; canEdit: boolean; domainId: string };
function valuesOf(row: RecordFields) {
  return Object.fromEntries(row.attributes.map(a => [a.key, a.valueDate?.slice(0, 10) ?? a.valueNumber ?? a.valueBool ?? a.valueText ?? ""]));
}
export default function AssetEditor() {
  const params = useParams();
  const router = useRouter();
  const { locale } = useI18n();
  const ta = STR[locale].assets;
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const id = typeof params?.id === "string" ? params.id : "";
  const [record, setRecord] = useState<RecordFields | null>(null);
  const [config, setConfig] = useState<DomainConfig | null>(null);
  const [assetTypeId, setAssetTypeId] = useState("");
  const [label, setLabel] = useState("");
  const [statusId, setStatusId] = useState("");
  const [attributes, setAttributes] = useState<Record<string, string | number | boolean>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!domainId) return;
    let active = true;
    Promise.all([
      fetch(`/api/asset-manager/config/${domainId}`).then(readResponse),
      id ? fetch(`/api/asset-manager/assets/${id}`).then(readResponse) : Promise.resolve(null),
    ]).then(([c, existing]) => {
      if (!active) return;
      if (existing && (!existing.canEdit || existing.domainId !== domainId)) {
        setError(locale === "fr" ? "Cette fiche ne peut pas être modifiée." : "This asset cannot be edited."); return;
      }
      setConfig(c);
      setStatusId(existing?.statusId ?? c.statuses?.[0]?.id ?? "");
      if (existing) { setRecord(existing); setAssetTypeId(existing.assetTypeId); setLabel(existing.label); setAttributes(valuesOf(existing)); }
    }).catch(err => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [domainId, id, locale]);

  const typeOptions = config?.asset_types.map((t) => ({ value: t.id, label: t.label })) ?? [];
  const statusOptions = config?.statuses.map((s) => ({ value: s.id, label: s.label })) ?? [];
  const fields = config?.asset_types.find((t) => t.id === assetTypeId)?.fields ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!label.trim() || !statusId || !assetTypeId) {
      setError(ta.errRequiredAll);
      return;
    }
    setSaving(true);
    try {
      const original = record ? valuesOf(record) : {};
      const changed = fields.filter(f => attributes[f.key] !== original[f.key]);
      const attrs = changed.flatMap(f => {
        const value = attributes[f.key];
        if (value === "" || value === undefined) return [];
        const attr: Attribute = { key: f.key };
        if (f.type === "date") attr.valueDate = String(value);
        else if (typeof value === "boolean") attr.valueBool = value;
        else if (typeof value === "number") attr.valueNumber = value;
        else attr.valueText = String(value);
        return [attr];
      });
      const retained = record?.attributes.filter(a => !changed.some(f => f.key === a.key)) ?? [];
      const res = await fetch(id ? "/api/asset-manager/assets/" + id : "/api/asset-manager/assets", {
        method: id ? "PUT" : "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domainId, assetTypeId, label: record?.label === label.trim() ? undefined : label.trim(),
          statusId: record?.statusId === statusId ? undefined : statusId, expectedUpdatedAt: record?.updatedAt,
          attributes: !record || changed.length ? [...retained, ...attrs] : undefined,
        }),
      });
      if (record && res.status === 409) {
        const latest = await fetch("/api/asset-manager/assets/" + id).then(readResponse);
        if (record.updatedAt !== latest.updatedAt) {
          const merged = valuesOf(latest);
          for (const f of changed) merged[f.key] = attributes[f.key];
          setAttributes(merged); setRecord(latest);
          if (label === record.label) setLabel(latest.label);
          if (statusId === record.statusId) setStatusId(latest.statusId);
          setError(locale === "fr" ? "La fiche a changé. Vérifiez votre saisie avant de confirmer." : "The asset changed. Review your edits before saving."); return;
        }
      }
      if (!res.ok) { const body = await res.json(); setError(body.error ?? ta.errCreate); return; }
      const asset = await res.json();
      router.push(`/modules/asset-manager/${domainId}/assets/${asset.id}`);
    } catch {
      setError(ta.errNetwork);
    } finally {
      setSaving(false);
    }
  };

  if (!config && error) return <p role="alert">{error}</p>;
  if (!config) {
    return (
      <div className="doc-page">
        <p style={{ color: "var(--bpm-text-secondary)" }}>{STR[locale].common.loading}</p>
        <Link href={`/modules/asset-manager/${domainId}/assets`} style={{ color: "var(--bpm-accent-cyan)" }}>
          {ta.back}
        </Link>
      </div>
    );
  }

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <div className="doc-breadcrumb">
          <Link href={`/modules/asset-manager/${domainId}/assets`}>{config.asset_label_singular}s</Link> → {id ? STR[locale].common.edit : ta.breadcrumbNew}
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
          {id ? (locale === "fr" ? "Modifier · " : "Edit · ") + record?.label : ta.newAssetHeading(config.asset_label_singular.toLowerCase())}
        </h1>
        <Caption>{ta.fillBelow}</Caption>
      </div>

      <Card variant="outlined">
        <form onSubmit={handleSubmit} className="space-y-0">
          <section className="space-y-4" aria-label={ta.sectionIdentification}>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
                {ta.fieldTypeRequired}
              </label>
              <Selectbox
                disabled={!!id}
                options={typeOptions}
                value={assetTypeId}
                onChange={(v) => setAssetTypeId(v ?? "")}
                placeholder={ta.chooseType}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
                {ta.fieldLabelRequired}
              </label>
              <Input value={label} onChange={setLabel} placeholder={ta.placeholderAssetName} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
                {ta.fieldStatusRequired}
              </label>
              <Selectbox
                options={statusOptions}
                value={statusId}
                onChange={(v) => setStatusId(v ?? "")}
                placeholder={ta.placeholderStatus}
              />
            </div>
          </section>

          {fields.length > 0 && (
            <>
              <Divider thickness={1} color="var(--bpm-border)" className="my-4" label={ta.sectionCharacteristics} />
              <section className="space-y-4" aria-label={ta.sectionCharacteristics}>
                {fields.map((f) => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
                      {f.label}
                    </label>
                    {f.type === "select" ? (
                      <Selectbox
                        options={[{ value: "", label: "—" }, ...(f.options ?? []).map((o) => ({ value: o, label: o }))]}
                        value={String(attributes[f.key] ?? "")}
                        onChange={(v) => setAttributes((prev) => ({ ...prev, [f.key]: v ?? "" }))}
                      />
                    ) : f.type === "number" ? (
                      <Input
                        type="number"
                        value={String(attributes[f.key] ?? "")}
                        onChange={(v) => setAttributes((prev) => ({ ...prev, [f.key]: v === "" ? "" : Number(v) }))}
                        placeholder={f.label}
                      />
                    ) : f.type === "date" ? (
                      <input
                        type="date"
                        value={String(attributes[f.key] ?? "")}
                        onChange={(e) => setAttributes((prev) => ({ ...prev, [f.key]: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border text-sm"
                        style={{
                          borderColor: "var(--bpm-border)",
                          background: "var(--bpm-bg-primary)",
                          color: "var(--bpm-text-primary)",
                        }}
                      />
                    ) : (
                      <Input
                        value={String(attributes[f.key] ?? "")}
                        onChange={(v) => setAttributes((prev) => ({ ...prev, [f.key]: v }))}
                        placeholder={f.label}
                      />
                    )}
                  </div>
                ))}
              </section>
            </>
          )}

          <Divider thickness={1} color="var(--bpm-border)" className="my-4" />
          {error && (
            <p role="alert" className="text-sm mb-4" style={{ color: "var(--bpm-accent)" }}>
              {error}
            </p>
          )}
          <div className="flex gap-2 mt-6">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? STR[locale].common.saving : id ? STR[locale].common.save : ta.create}
            </Button>
            <Link href={`/modules/asset-manager/${domainId}/assets`}>
              <Button type="button" variant="outline">{ta.cancel}</Button>
            </Link>
          </div>
        </form>
      </Card>

      <nav className="doc-pagination mt-8">
        <Link href={`/modules/asset-manager/${domainId}/assets`} style={{ color: "var(--bpm-accent-cyan)" }}>
          {ta.backList}
        </Link>
      </nav>
    </div>
  );
}
