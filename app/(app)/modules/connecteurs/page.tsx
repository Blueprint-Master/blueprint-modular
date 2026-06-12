"use client";

import Link from "next/link";
import { CodeBlock, Tabs } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import ConnecteursSimulateur from "./simulateur-content";
import { STR } from "./strings";

export default function ConnecteursModulePage() {
  const { locale } = useI18n();
  const S = STR[locale];

  const docContent = (
    <div className="prose-sm">
      <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {S.aboutTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {S.aboutText}
      </p>
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {S.componentsTitle}
      </h3>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        <code>bpm.metricRow</code>, <code>bpm.table</code> ({S.compBadge}{" "}
        <code>bpm.badge</code>, {S.compButton} <code>bpm.button</code>),{" "}
        <code>bpm.selectbox</code>, <code>bpm.input</code> ({S.compInput}),{" "}
        <code>bpm.confirmModal</code>, <code>bpm.activityFeed</code> ({S.compFeed}) {S.and}{" "}
        <code>bpm.toast</code>.
      </p>
      <CodeBlock
        code={`import bpm

bpm.metricRow([
    bpm.metric("Connecteurs actifs", 2),
    bpm.metric("Lignes importées (24 h)", 12710),
])

bpm.table(
    columns=[("nom", "Connecteur"), ("type", "Type"), ("statut", "Statut"), ("lignes24h", "Volumétrie (24 h)")],
    data=connecteurs,
)

bpm.button("Créer et tester", on_click=creer_et_tester)`}
        language="python"
      />
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {S.setupTitle}
      </h3>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {S.setupText1}{" "}
        <Link href="/modules/connecteurs/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
          {S.setupLinkLabel}
        </Link>{" "}
        {S.setupText2}
      </p>
    </div>
  );

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → {S.pageTitle}
        </div>
        <h1>{S.pageTitle}</h1>
        <p className="doc-description">{S.pageDescription}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">{S.badgeCategory}</span>
        </div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link
            href="/modules/connecteurs/simulateur"
            className="font-medium underline"
            style={{ color: "var(--bpm-accent-cyan)" }}
          >
            {S.openSimulator}
          </Link>
        </p>
      </div>
      <Tabs
        tabs={[
          { label: S.tabDocumentation, content: docContent },
          { label: S.tabSimulator, content: <ConnecteursSimulateur /> },
        ]}
        defaultTab={0}
      />
    </div>
  );
}
