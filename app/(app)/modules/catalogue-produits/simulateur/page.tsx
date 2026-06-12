"use client";

import Link from "next/link";
import CatalogueProduitsSimulateur from "../simulateur-content";

export default function CatalogueProduitsSimulateurPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/catalogue-produits">Catalogue produits</Link> → Simulateur
        </div>
        <h1>Simulateur — Catalogue produits</h1>
        <p className="doc-description">
          Dix produits seedés (mobilier et équipement de bureau), dont deux avec variantes.
          Recherchez, filtrez par catégorie, triez, ouvrez une fiche (code-barres EAN-13, QR code,
          variantes), ajustez le stock, créez ou supprimez un produit : chaque action met à jour le
          tableau et les métriques.
        </p>
      </div>
      <CatalogueProduitsSimulateur />
    </div>
  );
}
