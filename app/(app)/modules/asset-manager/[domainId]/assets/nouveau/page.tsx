"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, Caption, Divider, Button, Input, Selectbox } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../../../strings";

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

export default function AssetManagerAssetNewPage() {
  const params = useParams();
  const router = useRouter();
  const { locale } = useI18n();
  const ta = STR[locale].assets;
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const [config, setConfig] = useState<DomainConfig | null>(null);
  const [assetTypeId, setAssetTypeId] = useState("");
  const [label, setLabel] = useState("");
  const [statusId, setStatusId] = useState("");
  const [attributes, setAttributes] = useState<Record<string, string | number | boolean>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!domainId) return;
    fetch(`/api/asset-manager/config/${domainId}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((c) => {
        setConfig(c);
        if (c?.statuses?.length) setStatusId(c.statuses[0].id);
      })
      .catch(() => {});
  }, [domainId]);

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
      const attrs = fields.map((f) => ({
        key: f.key,
        valueText: typeof attributes[f.key] === "string" ? (attributes[f.key] as string) : undefined,
        valueNumber: typeof attributes[f.key] === "number" ? (attributes[f.key] as number) : undefined,
        valueBool: typeof attributes[f.key] === "boolean" ? (attributes[f.key] as boolean) : undefined,
        valueDate: typeof attributes[f.key] === "string" && f.type === "date" ? (attributes[f.key] as string) : undefined,
      }));
      const res = await fetch("/api/asset-manager/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          domainId,
          assetTypeId,
          label: label.trim(),
          statusId,
          attributes: attrs,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data.error as string) || ta.errCreate);
        return;
      }
      const asset = await res.json();
      router.push(`/modules/asset-manager/${domainId}/assets/${asset.id}`);
    } catch {
      setError(ta.errNetwork);
    } finally {
      setSaving(false);
    }
  };

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
          <Link href={`/modules/asset-manager/${domainId}/assets`}>{config.asset_label_singular}s</Link> → {ta.breadcrumbNew}
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
          {ta.newAssetHeading(config.asset_label_singular.toLowerCase())}
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
                        type="text"
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
            <p className="text-sm mb-4" style={{ color: "var(--bpm-accent)" }}>
              {error}
            </p>
          )}
          <div className="flex gap-2 mt-6">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? ta.creating : ta.create}
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
