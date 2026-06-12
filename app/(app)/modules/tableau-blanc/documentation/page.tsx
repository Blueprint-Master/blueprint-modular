"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

export default function TableauBlancDocumentationPage() {
  const { locale } = useI18n();
  const t = STR[locale];
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/tableau-blanc">{t.moduleName}</Link> → {t.breadcrumbDocumentation}
        </nav>
        <h1>{t.documentationTitle}</h1>
        <p className="doc-description">{t.documentationDescription}</p>
      </div>
      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.docIntro}
      </p>
      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>{t.howHeading}</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.howBody}
      </p>
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>{t.dataHeading}</h3>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.dataIntro}
      </p>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><code>id</code>, <code>content</code> {t.fieldIdContent}</li>
        <li><code>column</code> {t.fieldColumn}</li>
        <li><code>author</code> {t.fieldAuthorMid} <code>&#123; id, displayName &#125;</code> {t.fieldAuthorEnd}</li>
        <li><code>createdAt</code> {t.fieldCreatedAt}</li>
        <li><code>order</code> {t.fieldOrder}</li>
        <li><code>boardId</code> / <code>sessionId</code> {t.fieldBoardId}</li>
      </ul>
      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>{t.connectionsHeading}</h2>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.connectionsIntro}
      </p>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.connectionItems.map((item) => (
          <li key={item.name}><strong>{item.name}</strong> — {item.description}</li>
        ))}
      </ul>
      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>{t.integrationHeading}</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.integrationPage} <code>/modules/tableau-blanc</code>{t.integrationExpose} <code>GET /api/tableau-blanc?boardId=...</code>{t.integrationEnv}
      </p>
      <CodeBlock code={'bpm.title("Rétro")\n# Conteneur épuré (sans bpm.panel) : zone idées + colonnes + formulaire Nouveau post-it'} language="python" />
      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>{t.simulatorHeading}</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.simulatorBody}
      </p>
      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/tableau-blanc/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>{t.openSimulatorDoc}</Link>
      </p>
      <p className="mt-8 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/tableau-blanc" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>{t.backToModule}</Link>
      </p>
    </div>
  );
}
