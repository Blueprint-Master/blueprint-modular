"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

export default function ExportPlanifieDocumentationPage() {
  const { locale } = useI18n();
  const t = STR[locale];
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/export-planifie">{t.moduleTitle}</Link> → {t.docLabel}
        </nav>
        <h1>{t.docPageTitle}</h1>
        <p className="doc-description">{t.docPageDescription}</p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.dataModelHeading}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {t.dataModelP1}
        <code>actif</code>
        {t.dataModelP2}
        <code>prochainEnvoi</code>
        {t.dataModelP3}
      </p>
      <CodeBlock
        code={`{
  "rapport": "Ventes — synthèse hebdomadaire",
  "format": "PDF",            // PDF | CSV
  "frequence": "weekly",      // daily | weekly | monthly
  "heure": "08:00",
  "destinataires": ["dir.commerciale@acme.fr", "ventes@acme.fr"],
  "actif": true
}`}
        language="json"
      />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.lifecycleHeading}
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><strong>{t.lcScheduleTitle}</strong> — {t.lcScheduleDesc}</li>
        <li><strong>{t.lcSendTitle}</strong> — {t.lcSendDesc}</li>
        <li><strong>{t.lcPauseTitle}</strong> — {t.lcPauseDesc}</li>
        <li>
          <strong>{t.lcDeleteTitle}</strong> — {t.lcDeleteDesc1}
          <code>bpm.confirmModal</code>
          {t.lcDeleteDesc2}
        </li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.integrationHeading}
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {t.integrationP1}
        <code>scheduled_exports</code>
        {t.integrationP2}
      </p>

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link
          href="/modules/export-planifie/simulateur"
          className="font-medium underline"
          style={{ color: "var(--bpm-accent-cyan)" }}
        >
          {t.openSimulator}
        </Link>
      </p>
    </div>
  );
}
