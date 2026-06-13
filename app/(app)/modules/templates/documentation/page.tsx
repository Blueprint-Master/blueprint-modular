"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

export default function TemplatesDocumentationPage() {
  const { locale } = useI18n();
  const s = STR[locale];
  const codeStyle = { background: "var(--bpm-bg-secondary)" };
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/templates">{s.moduleName}</Link> → {s.breadcrumbDocumentation}
        </nav>
        <h1>{s.documentationTitle}</h1>
        <p className="doc-description">{s.documentationDescription}</p>
      </div>
      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>{s.aboutHeading}</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.docAbout}
      </p>
      <CodeBlock code={'bpm.title("Modèles")\nbpm.selectbox(options=modeles, label="Choisir un modèle")'} language="python" />

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>{s.structHeading}</h2>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.structIntro} <code className="px-1 rounded" style={codeStyle}>id</code>, <code className="px-1 rounded" style={codeStyle}>label</code>, <code className="px-1 rounded" style={codeStyle}>category</code>, <code className="px-1 rounded" style={codeStyle}>description</code>, <code className="px-1 rounded" style={codeStyle}>output</code> {s.structOutputNote}, <code className="px-1 rounded" style={codeStyle}>fields</code> {s.structFieldsNote}, <code className="px-1 rounded" style={codeStyle}>body</code> {s.structBodyPrefix}<code>{'{{variable}}'}</code>{s.structBodySuffix}. {s.structSeeAudit}
      </p>

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/templates/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>{s.breadcrumbSimulator}</Link>
      </p>
    </div>
  );
}
