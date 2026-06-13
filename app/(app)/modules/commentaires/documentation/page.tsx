"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

export default function CommentairesDocumentationPage() {
  const { locale } = useI18n();
  const t = STR[locale];
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/commentaires">{t.breadcrumbComments}</Link> → {t.breadcrumbDocumentation}
        </nav>
        <h1>{t.docTitle}</h1>
        <p className="doc-description">
          {t.docDescription}
        </p>
      </div>

      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.docIntro}
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.docHowHeading}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.docHowBody}
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.docStructHeading}
      </h3>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.docStructIntro}
      </p>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><code>id</code>, <code>entityId</code> / <code>entityType</code>, <code>content</code>, <code>date</code> (ISO)</li>
        <li><code>author</code> {t.docStructAuthor}</li>
        <li><code>parentId</code> {t.docStructParent}</li>
        <li><code>type</code> {t.docStructType}</li>
        <li><code>resolved</code>, <code>resolvedBy</code>, <code>resolvedAt</code> {t.docStructResolved}</li>
        <li><code>editedAt</code> {t.docStructEdited}</li>
        <li><code>attachments</code> {t.docStructAttachments}</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.docConnHeading}
      </h2>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.docConnIntro}
      </p>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><strong>{t.docConnNotif}</strong> {t.docConnNotifBody}</li>
        <li><strong>{t.docConnAudit}</strong> {t.docConnAuditBody}</li>
        <li><strong>{t.docConnWorkflow}</strong> {t.docConnWorkflowBody}</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.docIntegHeading}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.docIntegBody}
      </p>

      <p className="mb-2 text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>{t.docExampleLabel}</p>
      <CodeBlock
        code={t.docExampleCode}
        language="python"
      />

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.docSimHeading}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.docSimBody}
      </p>
      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/commentaires/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>{t.docOpenSimulator}</Link>
      </p>

      <p className="mt-8 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/commentaires" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>{t.backToModuleArrow}</Link>
      </p>
    </div>
  );
}
