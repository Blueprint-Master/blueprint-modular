"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

export default function VeilleDocumentationPage() {
  const { locale } = useI18n();
  const s = STR[locale];
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">{s.breadcrumbModules}</Link> →{" "}
          <Link href="/modules/veille">{s.moduleName}</Link> → {s.docBreadcrumb}
        </nav>
        <h1>{s.docTitle}</h1>
        <p className="doc-description">{s.docDescription}</p>
      </div>

      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.intro1}
        <strong>{s.introStrongApp}</strong>
        {s.intro2}
        <code>pip install blueprint-modular-veille</code>
        {s.introNor}
        <code>npm install blueprint-modular-veille</code>
        {s.intro3}
        <strong>{s.introStrongInstall}</strong>
        {s.intro4}
        <strong>{s.introStrongWorks}</strong>
        {s.intro5}
        <strong>{s.introStrongConfigure}</strong>
        {s.intro6}
        <code>/modules/veille</code>
        {s.intro7}
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.howHeading}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.how1}
        <code>/modules/veille</code>
        {s.how2}
        <code>bpm.*</code>
        {s.how3}
        <code>bpm.metricRow</code>
        {s.how4}
        <code>bpm.table</code>
        {s.how5}
        <code>bpm.badge</code>
        {s.how6}
        <code>bpm.anomalyAlert</code>
        {s.how7}
        <code>bpm.activityFeed</code>
        {s.how8}
        <code>bpm.input</code> + <code>bpm.selectbox</code> + <code>bpm.button</code>
        {s.how9}
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.installHeading}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.installBody}
      </p>
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.commandsHeading}
      </h3>
      <CodeBlock code={s.bashSnippet} language="bash" />
      <p className="mt-2 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.envNote1}
        <code>DATABASE_URL</code>
        {s.envNoteIn}
        <code>.env</code>
        {s.envNote2}
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.loadHeading}
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <strong>{s.loadStrongLoad}</strong>
        {s.load1}
        <code>npm install</code>
        {s.loadAnd}
        <code>prisma migrate deploy</code>
        {s.load2}
        <strong>{s.loadStrongUse}</strong>
        {s.load3}
        <code>/modules/veille</code>
        {s.load4}
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.envHeading}
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.envBody}
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.evolHeading}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.evolBody}
      </p>

      <nav className="doc-pagination mt-10">
        <Link href="/modules/veille" className="text-sm font-medium" style={{ color: "var(--bpm-accent-cyan)" }}>
          {s.backToModule}
        </Link>
      </nav>
    </div>
  );
}
