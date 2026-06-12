"use client";

import Link from "next/link";
import { CodeBlock, Tabs } from "@/components/bpm";
import RapportsSimulateur from "./simulateur-content";

const docContent = (
  <div className="prose-sm">
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      À propos
    </h2>
    <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
      Le module Rapports génère des rapports d&apos;entreprise prêts à diffuser à partir de modèles
      prédéfinis : chiffre d&apos;affaires mensuel, commandes par région, effectifs par service. On
      choisit un modèle et une période (année complète ou semestre — la période filtre réellement
      les données), on génère, et le rapport s&apos;affiche immédiatement : métriques clés,
      graphique et tableau détaillé. Chaque rapport généré est conservé dans l&apos;historique et
      exportable en CSV d&apos;un clic.
    </p>
    <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      Composants utilisés
    </h3>
    <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
      <code>bpm.metricRow</code> et <code>bpm.metric</code> (indicateurs de tête et métriques du
      rapport), <code>bpm.selectbox</code> (modèle et période), <code>bpm.lineChart</code> /{" "}
      <code>bpm.barChart</code> (visualisations), <code>bpm.table</code> (détail et historique,
      variations rendues par <code>bpm.badge</code>, actions par <code>bpm.button</code>),{" "}
      <code>bpm.confirmModal</code> (suppression) et <code>bpm.toast</code> (confirmations).
    </p>
    <CodeBlock
      code={`import bpm

bpm.metricRow([
    bpm.metric("Rapports générés (30 j)", 2),
    bpm.metric("Modèles disponibles", 3),
])

modele = bpm.selectbox(options=modeles, label="Modèle de rapport")
periode = bpm.selectbox(options=["Année 2025", "S1 2025", "S2 2025"], label="Période")

bpm.button("Générer", on_click=generer_rapport)

bpm.lineChart(data=ca_mensuel)  # ou bpm.barChart pour les régions
bpm.table(
    columns=[("mois", "Mois"), ("ca2025", "CA 2025"), ("variation", "Variation N-1")],
    data=lignes_rapport,
)`}
      language="python"
    />
    <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      Paramétrage
    </h3>
    <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
      Le simulateur fonctionne entièrement en local (jeux de données seedés, aucune API requise).
      En production, brancher chaque modèle sur vos sources (ERP, CRM, SIRH) et l&apos;export CSV
      sur votre stockage documentaire. Voir la{" "}
      <Link href="/modules/rapports/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
        documentation
      </Link>{" "}
      pour le modèle de données et les points d&apos;intégration.
    </p>
  </div>
);

export default function RapportsModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → Rapports
        </div>
        <h1>Rapports</h1>
        <p className="doc-description">
          Générez des rapports d&apos;entreprise à partir de modèles prédéfinis : choisissez un
          modèle et une période, visualisez métriques, graphique et tableau, puis exportez en CSV.
          Tout est testable dans le Simulateur.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Données &amp; reporting</span>
        </div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link
            href="/modules/rapports/simulateur"
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
          { label: "Simulateur", content: <RapportsSimulateur /> },
        ]}
        defaultTab={0}
      />
    </div>
  );
}
