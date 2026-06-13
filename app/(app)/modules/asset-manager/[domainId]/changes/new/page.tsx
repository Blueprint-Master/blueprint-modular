"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, Caption, Divider, Button, Spinner, Input, Selectbox } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../../../strings";

export default function AssetManagerChangeNewPage() {
  const { locale } = useI18n();
  const t = STR[locale];
  const tch = t.changes;
  const params = useParams();
  const router = useRouter();
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const [config, setConfig] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [impact, setImpact] = useState("");
  const [riskLevel, setRiskLevel] = useState("medium");
  const [rollbackPlan, setRollbackPlan] = useState("");
  const [type, setType] = useState("normal");
  const [plannedStart, setPlannedStart] = useState("");
  const [plannedEnd, setPlannedEnd] = useState("");

  useEffect(() => {
    if (!domainId) return;
    fetch(`/api/asset-manager/config/${domainId}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then(setConfig)
      .finally(() => setLoading(false));
  }, [domainId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !impact.trim() || !rollbackPlan.trim() || saving) return;
    setSaving(true);
    fetch("/api/asset-manager/changes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        domainId,
        type,
        title: title.trim(),
        description: description.trim(),
        impact: impact.trim(),
        riskLevel,
        rollbackPlan: rollbackPlan.trim(),
        plannedStart: plannedStart.trim() || null,
        plannedEnd: plannedEnd.trim() || null,
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((created) => {
        if (created?.id) router.push(`/modules/asset-manager/${domainId}/changes/${created.id}`);
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
          <Link href={`/modules/asset-manager/${domainId}/changes`} style={{ color: "var(--bpm-accent-cyan)" }}>{tch.breadcrumbChanges}</Link> → {tch.breadcrumbNew}
        </nav>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>{tch.newPageTitle}</h1>
        <Caption>{tch.fillBelow}</Caption>
      </div>

      <Card variant="outlined">
        <form onSubmit={handleSubmit} className="space-y-0">
          <section className="space-y-4" aria-label={tch.sectionTypeRisk}>
            <Selectbox
              label={t.common.type}
              value={type}
              onChange={(v) => setType(String(v))}
              options={[
                { value: "standard", label: tch.typeLabels.standard },
                { value: "normal", label: tch.typeLabels.normal },
                { value: "emergency", label: tch.typeLabels.emergency },
              ]}
            />
            <Selectbox
              label={tch.fieldRiskLevelRequired}
              value={riskLevel}
              onChange={(v) => setRiskLevel(String(v))}
              options={[
                { value: "low", label: tch.riskLabels.low },
                { value: "medium", label: tch.riskLabels.medium },
                { value: "high", label: tch.riskLabels.high },
                { value: "critical", label: tch.riskLabels.critical },
              ]}
            />
          </section>

          <Divider thickness={1} color="var(--bpm-border)" className="my-4" label={t.common.description} />
          <section className="space-y-4" aria-label={t.common.description}>
            <Input label={tch.fieldTitleRequired} value={title} onChange={setTitle} required placeholder={tch.placeholderTitle} />
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{tch.fieldDescriptionRequired}</label>
              <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="bpm-textarea w-full rounded-lg border px-3 py-2 text-sm resize-y" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{tch.fieldImpactRequired}</label>
              <textarea required value={impact} onChange={(e) => setImpact(e.target.value)} rows={3} className="bpm-textarea w-full rounded-lg border px-3 py-2 text-sm resize-y" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }} />
            </div>
          </section>

          <Divider thickness={1} color="var(--bpm-border)" className="my-4" label={tch.sectionPlanning} />
          <section className="space-y-4" aria-label={tch.sectionPlanning}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{tch.fieldPlannedStart}</label>
                <input
                  type="date"
                  value={plannedStart}
                  onChange={(e) => setPlannedStart(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{tch.fieldPlannedEnd}</label>
                <input
                  type="date"
                  value={plannedEnd}
                  onChange={(e) => setPlannedEnd(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
                />
              </div>
            </div>
          </section>

          <Divider thickness={1} color="var(--bpm-border)" className="my-4" label={tch.sectionRollback} />
          <section className="space-y-4" aria-label={tch.rollbackPlanAria}>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{tch.fieldRollbackPlanRequired}</label>
              <textarea required value={rollbackPlan} onChange={(e) => setRollbackPlan(e.target.value)} rows={3} className="bpm-textarea w-full rounded-lg border px-3 py-2 text-sm resize-y" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }} />
            </div>
          </section>

          <Divider thickness={1} color="var(--bpm-border)" className="my-4" />
          <div className="flex gap-2 mt-6">
            <Button type="submit" size="small" disabled={saving}>{saving ? t.common.creating : tch.createChange}</Button>
            <Link href={`/modules/asset-manager/${domainId}/changes`}><Button type="button" size="small" variant="outline">{t.common.cancel}</Button></Link>
          </div>
        </form>
      </Card>

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href={`/modules/asset-manager/${domainId}/changes`} style={{ color: "var(--bpm-accent-cyan)" }}>{tch.backToChanges}</Link>
      </nav>
    </div>
  );
}
