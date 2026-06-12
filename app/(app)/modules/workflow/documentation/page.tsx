"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR, type Segment } from "../strings";

function Rich({ segments }: { segments: Segment[] }) {
  return (
    <>
      {segments.map((seg, i) =>
        seg.strong ? (
          <strong key={i}>{seg.text}</strong>
        ) : seg.code ? (
          <code key={i}>{seg.text}</code>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </>
  );
}

export default function WorkflowDocumentationPage() {
  const { locale } = useI18n();
  const s = STR[locale];

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">{s.breadcrumbModules}</Link> → <Link href="/modules/workflow">{s.moduleName}</Link> → {s.breadcrumbDocumentation}
        </nav>
        <h1>{s.documentationTitle}</h1>
        <p className="doc-description">{s.documentationDescription}</p>
      </div>
      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        <Rich segments={s.docIntro} />
      </p>
      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>{s.howItWorksHeading}</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        <Rich segments={s.howItWorksBody} />
      </p>
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>{s.dataStructureHeading}</h3>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.dataStructureItems.map((item, i) => (
          <li key={i}><Rich segments={item} /></li>
        ))}
      </ul>
      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>{s.integrationHeading}</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        <Rich segments={s.integrationBody} />
      </p>
      <CodeBlock code={'bpm.title("Workflow")\n# États : brouillon, validé, archivé. Boutons : Valider, Archiver selon état'} language="python" />
      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>{s.simulatorHeading}</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>{s.simulatorBody}</p>
      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/workflow/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>{s.openWorkflowSimulator}</Link>
      </p>
      <p className="mt-8 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/workflow" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>{s.backToModule}</Link>
      </p>
    </div>
  );
}
