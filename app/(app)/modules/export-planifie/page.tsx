"use client";

import Link from "next/link";
import { CodeBlock, Tabs } from "@/components/bpm";
import ExportPlanifieSimulateur from "./simulateur-content";

const docContent = (
  <div className="prose-sm">
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      À propos
    </h2>
    <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
      Le module Export planifié envoie automatiquement vos rapports (PDF ou CSV) par e-mail :
      la DAF reçoit sa position de trésorerie chaque matin, la direction commerciale sa synthèse
      des ventes chaque lundi. On planifie une fois (rapport + fréquence + heure + destinataires),
      le planificateur fait le reste — et chaque planification reste pilotable : envoi manuel,
      suspension, reprise, suppression.
    </p>
    <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      Composants utilisés
    </h3>
    <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
      <code>bpm.metricRow</code>, <code>bpm.table</code> (statut et format rendus par{" "}
      <code>bpm.badge</code>, actions par <code>bpm.button</code>), <code>bpm.selectbox</code>,{" "}
      <code>bpm.input</code> (validation e-mail), <code>bpm.confirmModal</code>,{" "}
      <code>bpm.activityFeed</code> et <code>bpm.toast</code>.
    </p>
    <CodeBlock
      code={`import bpm

bpm.metricRow([
    bpm.metric("Exports actifs", 3),
    bpm.metric("Envois — 30 derniers jours", 49),
])

bpm.table(
    columns=[("rapport", "Rapport"), ("frequence", "Fréquence"), ("prochainEnvoi", "Prochain envoi")],
    data=exports_planifies,
)

bpm.button("Planifier l'export", on_click=planifier)`}
      language="python"
    />
    <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      Paramétrage
    </h3>
    <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
      Le simulateur fonctionne entièrement en local (données seedées, aucune API requise). En
      production, brancher la création sur votre planificateur (cron, worker) et l&apos;envoi sur
      votre service e-mail. Voir la{" "}
      <Link href="/modules/export-planifie/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
        documentation
      </Link>{" "}
      pour le modèle de données et les points d&apos;intégration.
    </p>
  </div>
);

export default function ExportPlanifieModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → Export planifié
        </div>
        <h1>Export planifié</h1>
        <p className="doc-description">
          Envoyez automatiquement vos rapports PDF/CSV par e-mail — quotidien, hebdomadaire ou
          mensuel. Planifiez, suspendez, déclenchez un envoi manuel : tout est visible dans le
          Simulateur.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Données &amp; reporting</span>
        </div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link
            href="/modules/export-planifie/simulateur"
            className="font-medium underline"
            style={{ color: "var(--bpm-accent-cyan)" }}
          >
            Ouvrir le simulateur
          </Link>
        </p>
      </div>
      <Tabs
        tabs={[
          { label: "Documentation", content: docContent },
          { label: "Simulateur", content: <ExportPlanifieSimulateur /> },
        ]}
        defaultTab={0}
      />
    </div>
  );
}
