"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

export default function RapportsDocumentationPage() {
  const { locale } = useI18n();
  const s = STR[locale];
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/rapports">{s.breadcrumbModule}</Link> → {s.docBreadcrumb}
        </nav>
        <h1>{s.docTitle}</h1>
        <p className="doc-description">{s.docDescription}</p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.dataModelTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {s.dm1}
        <strong>{s.dmStrong1}</strong>
        {s.dm2}
        <strong>{s.dmStrong2}</strong>
        {s.dm3}
      </p>
      <CodeBlock code={s.docJsonExample} language="json" />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.providedTitle}
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>
          <strong>{s.tmpl1Name}</strong>
          {s.tmpl1Pre}
          <code>bpm.lineChart</code>
          {s.tmpl1Post}
        </li>
        <li>
          <strong>{s.tmpl2Name}</strong>
          {s.tmpl2Pre}
          <code>bpm.barChart</code>
          {s.tmpl2Post}
        </li>
        <li>
          <strong>{s.tmpl3Name}</strong>
          {s.tmpl3Desc}
        </li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.behaviourTitle}
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>
          <strong>{s.b1Name}</strong>
          {s.b1Desc}
        </li>
        <li>
          <strong>{s.b2Name}</strong>
          {s.b2Desc}
        </li>
        <li>
          <strong>{s.b3Name}</strong>
          {s.b3Desc}
        </li>
        <li>
          <strong>{s.b4Name}</strong>
          {s.b4Pre}
          <code>bpm.confirmModal</code>
          {s.b4Post}
        </li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.prodTitle}
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {s.prod1}
        <code>generated_reports</code>
        {s.prod2}
        <code>SELECT</code>
        {s.prod3}
      </p>

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link
          href="/modules/rapports/simulateur"
          className="font-medium underline"
          style={{ color: "var(--bpm-accent-cyan)" }}
        >
          {s.openSimulator}
        </Link>
      </p>
    </div>
  );
}
