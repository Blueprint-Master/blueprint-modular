"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, Caption, Divider, Button, Input, Selectbox, Spinner } from "@/components/bpm";
import type { DomainConfig } from "@/lib/asset-manager/get-domain-config";

export default function NewAssetPage() {
  const params = useParams();
  const router = useRouter();
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
      setError("Le libellé est requis.");
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
        setError((data.error as string) || "Erreur lors de la création.");
        return;
      }
      const asset = await res.json();
      router.push(`/modules/asset-manager/${domainId}/assets/${asset.id}`);
    } catch {
      setError("Erreur réseau.");
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
          <Link href="/modules">Modules</Link> → <Link href="/modules/asset-manager">Gestion de parc</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}`}>{config.domain_label}</Link> → Nouvel actif
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
          Nouvel {config.asset_label_singular.toLowerCase()}
        </h1>
        <Caption>Remplissez les informations ci-dessous.</Caption>
      </div>

      <Card variant="outlined">
        <form onSubmit={handleSubmit} className="space-y-0">
          <section className="space-y-4" aria-label="Identification">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
                Type *
              </label>
              <Selectbox
                options={typeOptions}
                value={assetTypeId}
                onChange={(v) => setAssetTypeId(v ?? "")}
                placeholder="Type"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
                Libellé *
              </label>
              <Input value={label} onChange={setLabel} placeholder="Libellé" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
                Statut
              </label>
              <Selectbox
                options={statusOptions}
                value={statusId}
                onChange={(v) => setStatusId(v ?? "")}
                placeholder="Statut"
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
              {saving ? "Création…" : "Créer"}
            </Button>
            <Link href={`/modules/asset-manager/${domainId}`}>
              <Button type="button" variant="outline">Annuler</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
