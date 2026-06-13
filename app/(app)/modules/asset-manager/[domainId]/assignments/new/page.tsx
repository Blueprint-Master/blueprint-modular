"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, Caption, Divider, Button, Spinner, Selectbox } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../../../strings";

type Asset = { id: string; reference: string; label: string };
type User = { id: string; name: string | null; email: string | null };

export default function AssetManagerAssignmentNewPage() {
  const { locale } = useI18n();
  const t = STR[locale];
  const ta = t.assignments;
  const params = useParams();
  const router = useRouter();
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const [assets, setAssets] = useState<Asset[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assetId, setAssetId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [expectedEndDate, setExpectedEndDate] = useState("");
  const [assignmentType, setAssignmentType] = useState("temporary");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!domainId) return;
    Promise.all([
      fetch(`/api/asset-manager/assets?domainId=${encodeURIComponent(domainId)}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
      fetch("/api/asset-manager/me", { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([aList, me]) => {
        setAssets(Array.isArray(aList) ? aList : []);
        setCurrentUser(me);
        if (me?.id) setAssigneeId(me.id);
      })
      .finally(() => setLoading(false));
  }, [domainId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetId || !assigneeId || !startDate || saving) return;
    setSaving(true);
    fetch("/api/asset-manager/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        domainId,
        assetId,
        assigneeId,
        startDate,
        expectedEndDate: expectedEndDate.trim() || null,
        assignmentType,
        reason: reason.trim() || null,
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((created) => {
        if (created?.id) router.push(`/modules/asset-manager/${domainId}/assignments/${created.id}`);
      })
      .finally(() => setSaving(false));
  };

  const assetOptions = assets.map((a) => ({ value: a.id, label: `${a.reference} — ${a.label}` }));

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
          <Link href={`/modules/asset-manager/${domainId}`}>{ta.breadcrumbDashboard}</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}/assignments`}>{ta.breadcrumbShort}</Link> → {ta.breadcrumbNew}
        </nav>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>{ta.newTitle}</h1>
        <Caption>{ta.newCaption}</Caption>
      </div>

      <Card variant="outlined">
        <form onSubmit={handleSubmit} className="space-y-0">
          <section className="space-y-4" aria-label={ta.sectionAssignment}>
            <Selectbox
              label={ta.fieldAssetRequired}
              value={assetId}
              onChange={(v) => setAssetId(v)}
              options={[{ value: "", label: ta.selectAssetPlaceholder }, ...assetOptions]}
              required
            />
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{ta.fieldAssignee}</label>
              <p className="text-sm m-0" style={{ color: "var(--bpm-text-primary)" }}>{currentUser?.name ?? currentUser?.email ?? ta.assigneeSelfFallback}</p>
              <input type="hidden" name="assigneeId" value={assigneeId} />
            </div>
            <Selectbox
              label={t.common.type}
              value={assignmentType}
              onChange={(v) => setAssignmentType(v)}
              options={[{ value: "temporary", label: ta.typeTemporary }, { value: "permanent", label: ta.typePermanent }]}
            />
          </section>

          <Divider thickness={1} color="var(--bpm-border)" className="my-4" label={ta.sectionPeriod} />
          <section className="space-y-4" aria-label={ta.sectionPeriod}>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{ta.fieldStartDateRequired}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="rounded border p-2 text-sm w-full"
                style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{ta.fieldExpectedEndDate}</label>
              <input
                type="date"
                value={expectedEndDate}
                onChange={(e) => setExpectedEndDate(e.target.value)}
                className="rounded border p-2 text-sm w-full"
                style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
              />
            </div>
          </section>

          <Divider thickness={1} color="var(--bpm-border)" className="my-4" label={ta.sectionReason} />
          <section className="space-y-4" aria-label={ta.sectionReason}>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{ta.fieldReasonOptional}</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                className="bpm-textarea w-full rounded-lg border px-3 py-2 text-sm resize-y"
                style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
              />
            </div>
          </section>

          <Divider thickness={1} color="var(--bpm-border)" className="my-4" />
          <div className="flex gap-2 mt-6">
            <Button type="submit" size="small" disabled={saving || !assetId || !startDate}>
              {saving ? ta.creating : ta.createCta}
            </Button>
            <Link href={`/modules/asset-manager/${domainId}/assignments`}>
              <Button type="button" variant="outline" size="small">{t.common.cancel}</Button>
            </Link>
          </div>
        </form>
      </Card>

      <nav className="doc-pagination mt-8">
        <Link href={`/modules/asset-manager/${domainId}/assignments`} style={{ color: "var(--bpm-accent-cyan)" }}>{ta.backToList}</Link>
      </nav>
    </div>
  );
}
