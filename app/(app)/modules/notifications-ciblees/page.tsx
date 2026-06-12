"use client";

import Link from "next/link";
import { CodeBlock, Tabs } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import NotificationsCibleesSimulateur from "./simulateur-content";
import { STR } from "./strings";

/** Snippet python : identique dans les deux locales (codes techniques inchangés). */
const PYTHON_SNIPPET = `import bpm

bpm.metricRow([
    bpm.metric("Règles actives", 4),
    bpm.metric("Déclenchements (7 j)", 23),
])

bpm.table(
    columns=[("nom", "Règle"), ("destinataires", "Destinataires"), ("canaux", "Canaux")],
    data=regles_notification,
)

# Banc d'essai : émettre un événement et laisser le moteur évaluer les règles
bpm.button("Émettre l'événement", on_click=lambda: moteur.emettre("devis.cree", montant=12500))`;

function DocContent() {
  const { locale } = useI18n();
  const s = STR[locale];
  return (
    <div className="prose-sm">
      <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.aboutTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {s.aboutText}
      </p>
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.componentsTitle}
      </h3>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        <code>bpm.metricRow</code>, <code>bpm.table</code> ({s.compStatusBy}{" "}
        <code>bpm.badge</code>, {s.compActionsBy} <code>bpm.button</code>),{" "}
        <code>bpm.selectbox</code>, <code>bpm.input</code>, <code>bpm.checkbox</code> (
        {s.compMultiChannel}), <code>bpm.confirmModal</code>, <code>bpm.message</code>,{" "}
        <code>bpm.activityFeed</code> ({s.compJournal}) {s.and} <code>bpm.toast</code>.
      </p>
      <CodeBlock code={PYTHON_SNIPPET} language="python" />
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.paramTitle}
      </h3>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.paramText1}{" "}
        <Link href="/modules/notifications-ciblees/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
          {s.paramLink}
        </Link>{" "}
        {s.paramText2}
      </p>
    </div>
  );
}

export default function NotificationsCibleesModulePage() {
  const { locale } = useI18n();
  const s = STR[locale];
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → {s.moduleName}
        </div>
        <h1>{s.moduleName}</h1>
        <p className="doc-description">{s.pageDescription}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">{s.category}</span>
        </div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link
            href="/modules/notifications-ciblees/simulateur"
            className="font-medium underline"
            style={{ color: "var(--bpm-accent-cyan)" }}
          >
            {s.openSimulator}
          </Link>
        </p>
      </div>
      <Tabs
        tabs={[
          { label: s.tabDocumentation, content: <DocContent /> },
          { label: s.tabSimulateur, content: <NotificationsCibleesSimulateur /> },
        ]}
        defaultTab={0}
      />
    </div>
  );
}
