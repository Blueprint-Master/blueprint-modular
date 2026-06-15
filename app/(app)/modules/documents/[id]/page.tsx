"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Panel, Card, Spinner, Message, Button } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { strings, fmtDate, uploadedOn } from "../strings";

type Document = {
  id: string;
  filename: string;
  analysisStatus: "pending" | "processing" | "done" | "error";
  supplier: string | null;
  client: string | null;
  contractDate: string | null;
  signatureDate: string | null;
  terminationDate: string | null;
  summary: string | null;
  keyPoints: string | null;
  commitments: string | null;
  createdAt: string;
};

export default function DocumentDetailPage() {
  const { locale } = useI18n();
  const t = strings(locale).detail;
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/documents/${id}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!cancelled) setDoc(d); })
      .catch(() => { if (!cancelled) setDoc(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const isProcessing = doc?.analysisStatus === "processing";
  // eslint-disable-next-line react-hooks/exhaustive-deps -- polling only when processing
  useEffect(() => {
    if (!id || !isProcessing) return;
    const interval = setInterval(() => {
      fetch(`/api/documents/${id}`, { credentials: "include" })
        .then((r) => (r.ok ? r.json() : null))
        .then(setDoc);
    }, 3000);
    return () => clearInterval(interval);
  }, [id, isProcessing]);

  const handleDelete = async () => {
    if (!confirm(t.deleteConfirm)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) router.push("/modules/documents");
    } finally {
      setDeleting(false);
    }
  };

  if (loading && !doc) {
    return <Spinner text={t.loading} />;
  }
  if (!doc) {
    return (
      <Panel variant="error" title={t.notFoundTitle}>
        <Link href="/modules/documents" style={{ color: "var(--bpm-accent-cyan)" }}>{t.backToList}</Link>
      </Panel>
    );
  }

  const keyPointsArr = doc.keyPoints ? (JSON.parse(doc.keyPoints) as string[]) : [];
  const commitmentsArr = doc.commitments ? (JSON.parse(doc.commitments) as string[]) : [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
          {doc.filename}
        </h1>
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          {uploadedOn(doc.createdAt, locale)}
          <span>
            {doc.analysisStatus === "done" && t.statusDone}
            {doc.analysisStatus === "error" && t.statusError}
            {doc.analysisStatus === "processing" && t.statusProcessing}
            {doc.analysisStatus === "pending" && t.statusPending}
          </span>
          <Button variant="outline" size="small" onClick={handleDelete} disabled={deleting}>
            {t.deleteButton}
          </Button>
        </div>
      </div>

      {doc.analysisStatus === "processing" && (
        <Spinner text={t.analyzing} size="large" />
      )}

      {doc.analysisStatus === "error" && (
        <Message type="error">
          {t.analysisFailed}
        </Message>
      )}

      {doc.analysisStatus === "done" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card variant="outlined" title={t.supplier}>
            {doc.supplier ?? "—"}
          </Card>
          <Card variant="outlined" title={t.client}>
            {doc.client ?? "—"}
          </Card>
          <Card variant="outlined" title={t.contractDate}>
            {fmtDate(doc.contractDate, locale)}
          </Card>
          <Card variant="outlined" title={t.signatureDate}>
            {fmtDate(doc.signatureDate, locale)}
          </Card>
          <Card variant="outlined" title={t.terminationDate}>
            {fmtDate(doc.terminationDate, locale)}
          </Card>
          {doc.summary && (
            <Card variant="outlined" title={t.summary} className="md:col-span-2">
              {doc.summary}
            </Card>
          )}
          {keyPointsArr.length > 0 && (
            <Card variant="outlined" title={t.keyPoints} className="md:col-span-2">
              <ul className="list-disc pl-4 space-y-1">
                {keyPointsArr.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </Card>
          )}
          {commitmentsArr.length > 0 && (
            <Card variant="outlined" title={t.commitments} className="md:col-span-2">
              <ul className="list-disc pl-4 space-y-1">
                {commitmentsArr.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      <nav className="doc-pagination mt-8">
        <Link href="/modules/documents" style={{ color: "var(--bpm-accent-cyan)" }}>{t.backToAnalysis}</Link>
        <Link href="/modules/documents#documentation" style={{ color: "var(--bpm-accent-cyan)" }}>{t.analyzeNav}</Link>
        <Link href="/modules/documents/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>{t.documentationNav}</Link>
      </nav>
    </div>
  );
}
