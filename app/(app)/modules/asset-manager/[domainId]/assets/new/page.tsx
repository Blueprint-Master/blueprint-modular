"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, Caption, Divider, Button, Input, Selectbox, Spinner } from "@/components/bpm";
import type { DomainConfig } from "@/lib/asset-manager/get-domain-config";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../../../strings";

export default function NewAssetPage() {
  const params = useParams();
  const router = useRouter();
  const { locale } = useI18n();
  const t = STR[locale];
  const ta = t.assets;
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const [config, setConfig] = useState<DomainConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [label, setLabel] = useState("");
  const [assetTypeId, setAssetTypeId] = useState("");
  const [statusId, setStatusId] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!domainId) return;
    fetch(`/api/asset-manager/config/${domainId}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((cfg) => {
        setConfig(cfg);
        if (cfg?.asset_types?.length) {
          setAssetTypeId(cfg.asset_types[0].id);
          setStatusId(cfg.statuses?.[0]?.id ?? "");
        }
      })
      .finally(() => setLoading(false));
  }, [domainId]);

  useEffect(() => {
    if (config?.statuses?.length && !statusId) setStatusId(config.statuses[0].id);
  }, [config, statusId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!label.trim()) {
      setError(ta.errRequiredLabel);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/asset-manager/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domainId,
          assetTypeId: assetTypeId || config?.asset_types?.[0]?.id,
          label: label.trim(),
          statusId: statusId || config?.statuses?.[0]?.id,
        }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data.error as string) || ta.errCreateGeneric);
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

  if (loading || !config) {
    return (
      <div className="doc-page flex justify-center py-12">
        <Spinner size="medium" />
      </div>
    );
  }

  const typeOptions = (config.asset_types ?? []).map((t) => ({ value: t.id, label: t.label }));
  const statusOptions = (config.statuses ?? []).map((s) => ({ value: s.id, label: s.label }));

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <div className="doc-breadcrumb">
          <Link href="/modules">{t.common.breadcrumbModules}</Link> → <Link href="/modules/asset-manager">{t.common.moduleTitle}</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}`}>{config.domain_label}</Link> → {ta.breadcrumbNew}
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
                placeholder={ta.placeholderType}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
                {ta.fieldLabelRequired}
              </label>
              <Input value={label} onChange={setLabel} placeholder={ta.placeholderLabel} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
                {ta.fieldStatus}
              </label>
              <Selectbox
                options={statusOptions}
                value={statusId}
                onChange={(v) => setStatusId(v ?? "")}
                placeholder={ta.placeholderStatus}
              />
            </div>
          </section>
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
            <Link href={`/modules/asset-manager/${domainId}`}>
              <Button type="button" variant="outline">{ta.cancel}</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
