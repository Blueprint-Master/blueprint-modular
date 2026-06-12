"use client";

import Link from "next/link";
import { CodeBlock, Tabs } from "@/components/bpm";
import CatalogueProduitsSimulateur from "./simulateur-content";

const docContent = (
  <div className="prose-sm">
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      À propos
    </h2>
    <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
      Le module Catalogue produits centralise vos références e-commerce ou d&apos;inventaire :
      chaque produit porte une référence interne (P-1001…), une catégorie, un prix, un stock et un
      code-barres EAN-13. Le statut (En stock, Stock faible, Rupture) est dérivé automatiquement du
      stock. Les produits déclinés (coloris, dimensions) embarquent leurs variantes avec référence,
      prix et stock propres. Recherche, filtres par catégorie et tris se combinent en direct, et la
      fiche produit permet d&apos;ajuster le stock, d&apos;imprimer le code-barres ou de supprimer
      la référence.
    </p>
    <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      Composants utilisés
    </h3>
    <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
      <code>bpm.metricRow</code>, <code>bpm.table</code> (statut rendu par <code>bpm.badge</code>,
      actions par <code>bpm.button</code>), <code>bpm.input</code> (recherche),{" "}
      <code>bpm.selectbox</code> (catégorie, tri), <code>bpm.drawer</code> (fiche produit),{" "}
      <code>bpm.barcode</code> + <code>bpm.qrCode</code>, <code>bpm.modal</code> +{" "}
      <code>bpm.numberInput</code> (création), <code>bpm.confirmModal</code> et{" "}
      <code>bpm.toast</code>.
    </p>
    <CodeBlock
      code={`import bpm

bpm.metricRow([
    bpm.metric("Produits", 10),
    bpm.metric("Valeur du stock", "18 432,10 €"),
    bpm.metric("Ruptures / stock faible", 5),
])

bpm.table(
    columns=[("ref", "Réf."), ("nom", "Produit"), ("prix", "Prix"), ("stock", "Stock")],
    data=produits,
    on_row_click=ouvrir_fiche,
)

bpm.drawer(
    title="Fiche produit — P-1001",
    children=[bpm.barcode(value="3761234010018", format="EAN13"), bpm.qrCode(value="P-1001")],
)

bpm.button("Nouveau produit", on_click=creer_produit)`}
      language="python"
    />
    <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      Paramétrage
    </h3>
    <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
      Le simulateur fonctionne entièrement en local (10 produits seedés, aucune API requise). En
      production, brancher la liste sur votre PIM/ERP et les ajustements de stock sur votre WMS.
      Voir la{" "}
      <Link
        href="/modules/catalogue-produits/documentation"
        style={{ color: "var(--bpm-accent-cyan)" }}
      >
        documentation
      </Link>{" "}
      pour le modèle produit/variante, la génération d&apos;EAN-13 et les points
      d&apos;intégration.
    </p>
  </div>
);

export default function CatalogueProduitsModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → Catalogue produits
        </div>
        <h1>Catalogue produits</h1>
        <p className="doc-description">
          Gérez un catalogue e-commerce ou d&apos;inventaire : fiches produit, variantes, prix,
          stocks et codes-barres EAN-13. Recherche, filtres, création et ajustements de stock —
          tout est manipulable dans le Simulateur.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Métier</span>
        </div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link
            href="/modules/catalogue-produits/simulateur"
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
          { label: "Simulateur", content: <CatalogueProduitsSimulateur /> },
        ]}
        defaultTab={0}
      />
    </div>
  );
}
