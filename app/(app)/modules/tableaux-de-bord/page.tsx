"use client";

import Link from "next/link";
import { CodeBlock, Tabs } from "@/components/bpm";
import TableauxDeBordSimulateur from "./simulateur-content";

const docContent = (
  <div className="prose-sm">
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      À propos
    </h2>
    <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
      Le module Tableaux de bord laisse chaque utilisateur composer sa propre vue : il choisit les
      widgets affichés depuis un catalogue (métriques, courbe des ventes, CA par région, top
      produits, objectif trimestre, flux de commandes), les réordonne, les redimensionne (1 ou 2
      colonnes) et les masque. La disposition est sauvegardée localement et restaurée à la
      prochaine visite — chacun retrouve « son » tableau de bord.
    </p>
    <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      Composants utilisés
    </h3>
    <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
      <code>bpm.metric</code>, <code>bpm.lineChart</code>, <code>bpm.barChart</code>,{" "}
      <code>bpm.table</code>, <code>bpm.progressRing</code>, <code>bpm.activityFeed</code>,{" "}
      <code>bpm.panel</code> (bibliothèque), <code>bpm.button</code> (barre d&apos;outils par
      widget), <code>bpm.confirmModal</code> (réinitialisation) et <code>bpm.toast</code>.
    </p>
    <CodeBlock
      code={`import bpm

# Chaque widget du catalogue rend un vrai composant bpm
bpm.metric("CA du mois", "142,5 k€", delta="+12,3 %")
bpm.line_chart(ventes_12_mois)          # 12 points mensuels
bpm.bar_chart(ca_par_region)            # 6 régions
bpm.table(columns=[("ref", "Réf."), ("nom", "Produit"), ("ca", "CA")], data=top_produits)
bpm.progress_ring(78, max=100)          # objectif trimestre
bpm.activity_feed(dernieres_commandes)  # 4 dernières commandes

# La disposition (ordre, taille, visibilité) est un simple JSON persisté
layout = [
    {"id": "metric-ca", "size": 1},
    {"id": "line-ventes", "size": 2},
]`}
      language="python"
    />
    <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      Personnalisation
    </h3>
    <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
      <li><strong>Personnaliser</strong> — active le mode édition : bordures pointillées et barre d&apos;outils sur chaque widget ; « Terminer » pour en sortir.</li>
      <li><strong>↑ / ↓</strong> — réordonne les widgets (boutons désactivés aux extrémités).</li>
      <li><strong>⤢</strong> — bascule la taille du widget entre 1 et 2 colonnes.</li>
      <li><strong>Masquer / Ajouter</strong> — retire un widget vers la bibliothèque, ou l&apos;en ressort dans la grille.</li>
      <li><strong>Réinitialiser la disposition</strong> — retour à la disposition par défaut, avec confirmation explicite.</li>
    </ul>
    <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
      Le simulateur fonctionne entièrement en local (données seedées, persistance{" "}
      <code>localStorage</code>, aucune API requise). En production, remplacer la persistance
      locale par un enregistrement par utilisateur côté serveur. Voir la{" "}
      <Link href="/modules/tableaux-de-bord/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
        documentation
      </Link>{" "}
      pour le catalogue de widgets et le modèle de configuration.
    </p>
  </div>
);

export default function TableauxDeBordModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → Tableaux de bord
        </div>
        <h1>Tableaux de bord</h1>
        <p className="doc-description">
          Tableau de bord à widgets réellement personnalisable : affichez, masquez, réordonnez et
          redimensionnez 8 widgets (métriques, graphiques, tableau, objectif, flux de commandes).
          La disposition est sauvegardée et restaurée automatiquement. Testez dans le Simulateur.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Données &amp; reporting</span>
        </div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link
            href="/modules/tableaux-de-bord/simulateur"
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
          { label: "Simulateur", content: <TableauxDeBordSimulateur /> },
        ]}
        defaultTab={0}
      />
    </div>
  );
}
