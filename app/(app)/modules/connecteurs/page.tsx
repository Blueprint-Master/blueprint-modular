"use client";

import Link from "next/link";
import { CodeBlock, Tabs } from "@/components/bpm";
import ConnecteursSimulateur from "./simulateur-content";

const docContent = (
  <div className="prose-sm">
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      À propos
    </h2>
    <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
      Le module Connecteurs centralise vos intégrations de données entrantes : l&apos;ERP expose
      ses écritures via API REST, la banque dépose ses relevés sur un SFTP, le datawarehouse se
      lit en PostgreSQL. Chaque connecteur déclare une source (type + hôte + identifiant), une
      planification de synchronisation et remonte son état de santé : statut, dernière synchro,
      volumétrie importée. Tout est pilotable à la main — tester la connexion, lancer une
      synchronisation, corriger un identifiant refusé, supprimer.
    </p>
    <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      Composants utilisés
    </h3>
    <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
      <code>bpm.metricRow</code>, <code>bpm.table</code> (type et statut rendus par{" "}
      <code>bpm.badge</code>, actions par <code>bpm.button</code>), <code>bpm.selectbox</code>,{" "}
      <code>bpm.input</code> (validation hôte/URL), <code>bpm.confirmModal</code>,{" "}
      <code>bpm.activityFeed</code> (journal de synchronisation) et <code>bpm.toast</code>.
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
      Paramétrage
    </h3>
    <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
      Le simulateur fonctionne entièrement en local (données seedées, aucune API requise). En
      production, brancher le test de connexion et les synchronisations sur vos workers, et
      stocker les secrets dans un coffre dédié. Voir la{" "}
      <Link href="/modules/connecteurs/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
        documentation
      </Link>{" "}
      pour le modèle de données, la gestion des secrets et la planification des synchros.
    </p>
  </div>
);

export default function ConnecteursModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → Connecteurs
        </div>
        <h1>Connecteurs</h1>
        <p className="doc-description">
          Hub d&apos;intégrations entrantes : API REST, SFTP, PostgreSQL, MySQL. Testez les
          connexions, lancez des synchronisations, suivez la volumétrie — tout est visible dans le
          Simulateur.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Intégrations &amp; technique</span>
        </div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link
            href="/modules/connecteurs/simulateur"
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
          { label: "Simulateur", content: <ConnecteursSimulateur /> },
        ]}
        defaultTab={0}
      />
    </div>
  );
}
