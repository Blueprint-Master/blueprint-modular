"use client";

import Link from "next/link";
import { CodeBlock, Tabs } from "@/components/bpm";
import AuditLogSimulateur from "./simulateur-content";

const docContent = (
  <div className="prose-sm">
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      À propos
    </h2>
    <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
      Le module Audit / Log est le journal de bord de l&apos;application : chaque création,
      modification, suppression ou connexion y est tracée avec son acteur, son horodatage,
      l&apos;entité concernée et le détail du changement (ex. « statut : brouillon → validé »).
      C&apos;est l&apos;outil qu&apos;un administrateur ou un auditeur ouvre pour répondre à la
      question « qui a changé quoi, et quand ? » — recherche plein texte, filtres combinables
      (acteur, type d&apos;action, période), détail complet de chaque événement et export CSV.
    </p>
    <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      Composants utilisés
    </h3>
    <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
      <code>bpm.metricRow</code>, <code>bpm.input</code> et <code>bpm.selectbox</code> (filtres
      combinables), <code>bpm.chip</code> (résumé des filtres actifs), <code>bpm.table</code>{" "}
      (acteur rendu par <code>bpm.avatar</code>, action par <code>bpm.badge</code>),{" "}
      <code>bpm.pagination</code>, <code>bpm.drawer</code> + <code>bpm.jsonViewer</code> (détail
      d&apos;un événement) et <code>bpm.toast</code> (confirmation d&apos;export).
    </p>
    <CodeBlock
      code={`import bpm

bpm.metricRow([
    bpm.metric("Événements (10 j)", 32),
    bpm.metric("Acteurs distincts", 5),
    bpm.metric("Suppressions (10 j)", 4),
])

bpm.input("Recherche", placeholder="Acteur, entité, détail…", on_change=filtrer)
bpm.selectbox("Acteur", options=acteurs, on_change=filtrer)

bpm.table(
    columns=[("timestamp", "Horodatage"), ("acteur", "Acteur"),
             ("action", "Action"), ("entite", "Entité"), ("detail", "Détail")],
    data=evenements_filtres,
    on_row_click=ouvrir_detail,   # bpm.drawer + bpm.jsonViewer
)

bpm.button("Exporter en CSV", on_click=exporter_csv)`}
      language="python"
    />
    <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      Paramétrage
    </h3>
    <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
      Le simulateur fonctionne entièrement en local : 32 événements seedés sur 10 jours, filtres,
      pagination, détail et export CSV sans aucune API. En production, brancher la lecture sur
      votre table <code>audit_events</code> (append-only) et l&apos;écriture sur un middleware qui
      journalise chaque mutation. Voir la{" "}
      <Link href="/modules/audit-log/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
        documentation
      </Link>{" "}
      pour le modèle d&apos;événement, la rétention et les garanties d&apos;intégrité.
    </p>
  </div>
);

export default function AuditLogModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → Audit / Log
        </div>
        <h1>Audit / Log</h1>
        <p className="doc-description">
          Journal d&apos;audit complet : qui a changé quoi, et quand. Recherche plein texte,
          filtres par acteur, type d&apos;action et période, détail JSON de chaque événement et
          export CSV — tout est testable dans le Simulateur.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Processus &amp; workflow</span>
        </div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link
            href="/modules/audit-log/simulateur"
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
          { label: "Simulateur", content: <AuditLogSimulateur /> },
        ]}
        defaultTab={0}
      />
    </div>
  );
}
