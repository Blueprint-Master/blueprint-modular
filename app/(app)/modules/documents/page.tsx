"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Table, Message, Spinner } from "@/components/bpm";
import { DocumentAnalysisImport } from "@/components/DocumentAnalysisImport";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import {
  strings,
  fmtDate,
  dueSuffix,
  alertBanner,
  uploadError,
} from "./strings";

interface Document {
  id: string;
  filename: string;
  analysisStatus: "pending" | "processing" | "done" | "error";
  supplier: string | null;
  client: string | null;
  contractDate: string | null;
  terminationDate: string | null;
  summary: string | null;
  createdAt: string;
}

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function DocumentsPage() {
  const { locale } = useI18n();
  const t = strings(locale).list;
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchDocuments = () => {
    fetch("/api/documents", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setDocuments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setDocuments([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    const hasProcessing = documents.some(
      (d) => d.analysisStatus === "processing" || d.analysisStatus === "pending"
    );
    if (!hasProcessing) return;
    const interval = setInterval(fetchDocuments, 3000);
    return () => clearInterval(interval);
  }, [documents]);

  const handleAnalyze = async (files: File[]) => {
    const pdfs = files.filter((f) => f.type === "application/pdf");
    if (pdfs.length === 0) {
      alert(t.onlyPdf);
      return;
    }
    setUploading(true);
    try {
      for (const file of pdfs) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/documents", { method: "POST", body: formData, credentials: "include" });
        if (res.ok) {
          const newDoc = await res.json();
          setDocuments((prev) => [newDoc, ...prev]);
        } else {
          const err = await res.json().catch(() => ({}));
          const msg = (err && typeof err === "object" && "error" in err && typeof err.error === "string")
            ? err.error
            : res.status === 413
              ? t.fileTooLarge
              : uploadError(res.status, locale);
          alert(msg);
        }
      }
    } finally {
      setUploading(false);
    }
  };

  const today = new Date();
  const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const alerts = documents.filter((d) => {
    if (!d.terminationDate) return false;
    const t = new Date(d.terminationDate);
    return t >= today && t <= in30Days;
  });

  const filtered = documents.filter(
    (d) =>
      !search ||
      [d.supplier, d.client, d.filename].some((v) =>
        v?.toLowerCase().includes(search.toLowerCase())
      )
  );

  const columns = [
    { key: "filename", label: t.columns.filename },
    { key: "supplier", label: t.columns.supplier },
    { key: "client", label: t.columns.client },
    { key: "contractDate", label: t.columns.contractDate },
    { key: "terminationDate", label: t.columns.terminationDate },
    { key: "analysisStatus", label: t.columns.analysisStatus },
  ];

  const tableData = filtered.map((d) => ({
    id: d.id,
    filename: d.filename,
    supplier: d.supplier ?? "—",
    client: d.client ?? "—",
    contractDate: fmtDate(d.contractDate, locale),
    terminationDate: d.terminationDate
      ? `${fmtDate(d.terminationDate, locale)} ${dueSuffix(daysUntil(d.terminationDate), locale)}`
      : "—",
    analysisStatus:
      d.analysisStatus === "done"
        ? t.statusDone
        : d.analysisStatus === "error"
          ? t.statusError
          : d.analysisStatus === "processing"
            ? t.statusProcessing
            : t.statusPending,
  }));

  return (
    <div className="documents-page doc-page">
      <div id="documentation">
      <DocumentAnalysisImport
        title={t.importTitle}
        description={t.importDescription}
        accept=".pdf"
        maxFiles={10}
        dropLabel={t.dropLabel}
        buttonLabel={t.analyzeButton}
        disabled={uploading}
        onAnalyze={handleAnalyze}
      />
      {uploading && (
        <div className="flex items-center justify-center gap-2 py-4" style={{ color: "var(--bpm-text-secondary)" }}>
          <Spinner size="small" text={t.analyzing} />
        </div>
      )}
      </div>

      <div className="documents-header mt-8">
        <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--bpm-text-primary)" }}>{t.documentsHeading}</h2>
      </div>

      {alerts.length > 0 && (
        <Message type="warning">
          ⚠ {alertBanner(
            alerts.length,
            alerts.map((a) => `${a.supplier || a.filename} ${dueSuffix(daysUntil(a.terminationDate!), locale)}`).join(", "),
            locale
          )}
        </Message>
      )}

      <div className="documents-filters">
        <input
          type="search"
          placeholder={t.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <Spinner text={t.loading} />
      ) : documents.length === 0 ? (
        <div className="documents-empty py-6">
          <p style={{ color: "var(--bpm-text-secondary)" }}>{t.emptyText}</p>
          <Link href="/modules/documents#documentation" className="text-sm mt-2 inline-block" style={{ color: "var(--bpm-accent-cyan)" }}>
            {t.emptyCta}
          </Link>
        </div>
      ) : (
        <div className="documents-table-scroll" style={{ marginBottom: 24 }}>
          <Table
            columns={columns}
            data={tableData}
            minWidth={900}
            striped
            hover
            onRowClick={(row) => {
              const id = (row as { id?: string }).id;
              if (id) window.location.href = `/modules/documents/${id}`;
            }}
          />
        </div>
      )}

      <nav className="doc-pagination mt-8">
        <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>{t.backToModules}</Link>
        <Link href="/modules/documents#documentation" style={{ color: "var(--bpm-accent-cyan)" }}>{t.analyzeNav}</Link>
        <Link href="/modules/documents/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>{t.documentationNav}</Link>
      </nav>
    </div>
  );
}
