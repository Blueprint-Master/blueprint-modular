"use client";

import Link from "next/link";
import { CodeBlock, Tabs } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "./strings";
import WebhooksSimulateur from "./simulateur-content";

function DocContent() {
  const { locale } = useI18n();
  const S = STR[locale];
  return (
    <div className="prose-sm">
      <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {S.aboutTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {S.aboutBody}
      </p>
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {S.componentsTitle}
      </h3>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        <code>bpm.metricRow</code>, <code>bpm.table</code>
        {S.compStatusRendered}
        <code>bpm.badge</code>
        {S.compActionsBy}
        <code>bpm.button</code>
        {"), "}
        <code>bpm.selectbox</code>
        {S.compEvent}
        <code>bpm.input</code>
        {S.compValidation}
        <code>bpm.confirmModal</code>
        {S.compAnd}
        <code>bpm.toast</code>.
      </p>
      <CodeBlock code={S.bpmSnippet} language="python" />
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {S.configTitle}
      </h3>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {S.configP1}
        <Link href="/modules/webhooks/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
          {S.configDocLink}
        </Link>
        {S.configP2}
      </p>
    </div>
  );
}

export default function WebhooksModulePage() {
  const { locale } = useI18n();
  const S = STR[locale];
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → {S.moduleTitle}
        </div>
        <h1>{S.moduleTitle}</h1>
        <p className="doc-description">{S.moduleDescription}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">{S.categoryBadge}</span>
        </div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link
            href="/modules/webhooks/simulateur"
            className="font-medium underline"
            style={{ color: "var(--bpm-accent-cyan)" }}
          >
            {S.openSimulator}
          </Link>
        </p>
      </div>
      <Tabs
        tabs={[
          { label: S.tabDocumentation, content: <DocContent /> },
          { label: S.tabSimulator, content: <WebhooksSimulateur /> },
        ]}
        defaultTab={0}
      />
    </div>
  );
}
