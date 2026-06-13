"use client";

import Link from "next/link";
import { CodeBlock, Tabs } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import TachesSimulateur from "./simulateur-content";
import { STR } from "./strings";

function DocContent() {
  const { locale } = useI18n();
  const s = STR[locale].doc;

  return (
    <div className="prose-sm">
      <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.aboutTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {s.aboutBefore}
        <strong>{s.aboutModule}</strong>
        {s.aboutAfter}
      </p>
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.conceptsTitle}
      </h3>
      <ul className="list-disc pl-5 mb-4 space-y-1" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {s.concepts.map((c) => (
          <li key={c.term}>
            <strong style={{ color: "var(--bpm-text-primary)" }}>{c.term}</strong>
            {c.text}
          </li>
        ))}
      </ul>
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.componentsTitle}
      </h3>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        <code>bpm.metricRow</code>, <code>bpm.table</code> ({s.compTable} <code>bpm.badge</code>
        {s.compActions} <code>bpm.button</code>), <code>bpm.selectbox</code>,{" "}
        <code>bpm.input</code> ({s.compInput}), <code>bpm.modal</code> ({s.compModal}),{" "}
        <code>bpm.confirmModal</code> ({s.compConfirm}) {s.compAnd} <code>bpm.toast</code>.
      </p>
      <CodeBlock
        code={`# Exemple Python (bpm) — gestionnaire de tâches
import bpm

bpm.metricRow([
    bpm.metric("À faire", 4),
    bpm.metric("En cours", 3),
    bpm.metric("En retard", 2),
])

bpm.table(
    columns=[
        {"key": "titre", "label": "Tâche"},
        {"key": "assigne", "label": "Assigné"},
        {"key": "echeance", "label": "Échéance"},
        {"key": "priorite", "label": "Priorité"},
        {"key": "statut", "label": "Statut"},
    ],
    data=taches,
)

bpm.button("Nouvelle tâche", on_click=ouvrir_modale_creation)`}
        language="python"
      />
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.configTitle}
      </h3>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.configBefore}
        <Link href="/modules/taches/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
          {s.configLink}
        </Link>
        {s.configAfter}
      </p>
    </div>
  );
}

export default function TachesModulePage() {
  const { locale } = useI18n();
  const s = STR[locale];

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → {s.breadcrumb.tasks}
        </div>
        <h1>{s.page.title}</h1>
        <p className="doc-description">{s.page.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">{s.page.category}</span>
        </div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link
            href="/modules/taches/simulateur"
            className="font-medium underline"
            style={{ color: "var(--bpm-accent-cyan)" }}
          >
            {s.page.openSimulator}
          </Link>
        </p>
      </div>
      <Tabs
        tabs={[
          { label: s.page.tabDocumentation, content: <DocContent /> },
          { label: s.page.tabSimulator, content: <TachesSimulateur /> },
        ]}
        defaultTab={0}
      />
    </div>
  );
}
