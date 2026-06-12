"use client";

import Link from "next/link";
import { CodeBlock, Tabs } from "@/components/bpm";
import ReferentielsSimulateur from "./simulateur-content";

const docContent = (
  <div className="prose-sm">
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      À propos
    </h2>
    <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
      Le module Référentiels est l&apos;outil d&apos;administration des tables de codes partagées
      par toutes les applications : devises, pays, taux de TVA, unités de mesure. Chaque
      référentiel a ses propres colonnes, mais le cycle de vie est commun : on ajoute une entrée
      (code unique + format contrôlé), on la modifie, on la désactive quand elle ne doit plus être
      proposée — et on ne la supprime que si aucun enregistrement ne la référence.
    </p>
    <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      Composants utilisés
    </h3>
    <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
      <code>bpm.metricRow</code>, <code>bpm.selectbox</code> (choix du référentiel),{" "}
      <code>bpm.table</code> à colonnes dynamiques (statut rendu par <code>bpm.badge</code>,
      actions par <code>bpm.button</code>), <code>bpm.input</code> (recherche et formulaires),{" "}
      <code>bpm.modal</code> (édition), <code>bpm.confirmModal</code> (suppression),{" "}
      <code>bpm.activityFeed</code> (historique) et <code>bpm.toast</code>.
    </p>
    <CodeBlock
      code={`import bpm

bpm.metricRow([
    bpm.metric("Référentiels", 4),
    bpm.metric("Entrées totales", 24),
    bpm.metric("Entrées inactives", 3),
])

ref = bpm.selectbox("Référentiel", options=["Devises", "Pays", "Taux de TVA", "Unités de mesure"])

bpm.table(
    columns=colonnes_du_referentiel(ref),   # colonnes propres à chaque table de codes
    data=entrees(ref),
)

bpm.button("Ajouter l'entrée", on_click=ajouter)
bpm.button("Exporter en CSV", on_click=exporter)`}
      language="python"
    />
    <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      Paramétrage
    </h3>
    <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
      Le simulateur fonctionne entièrement en local (4 référentiels seedés, aucune API requise).
      En production, brancher le CRUD sur votre table <code>reference_entries</code> et diffuser
      les changements aux applications consommatrices. Voir la{" "}
      <Link href="/modules/referentiels/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
        documentation
      </Link>{" "}
      pour le modèle de données, la gouvernance et le versionnage.
    </p>
  </div>
);

export default function ReferentielsModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → Référentiels
        </div>
        <h1>Référentiels</h1>
        <p className="doc-description">
          Administrez les tables de codes partagées (devises, pays, taux de TVA, unités de
          mesure) : ajout contrôlé, modification, activation/désactivation, suppression protégée
          et export CSV. Tout est manipulable dans le Simulateur.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Données &amp; reporting</span>
        </div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link
            href="/modules/referentiels/simulateur"
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
          { label: "Simulateur", content: <ReferentielsSimulateur /> },
        ]}
        defaultTab={0}
      />
    </div>
  );
}
