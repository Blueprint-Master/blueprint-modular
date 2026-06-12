"use client";

import Link from "next/link";
import MultiLangueSimulateur from "../simulateur-content";

export default function MultiLangueSimulateurPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/multi-langue">Multi-langue</Link> → Simulateur
        </div>
        <h1>Simulateur — Multi-langue</h1>
        <p className="doc-description">
          Une mini-application « Suivi des commandes » traduite en FR/EN/ES : basculez la langue
          (titres, navigation, statuts, montants et dates se reformatent par locale), observez le
          repli sur le français pour les 3 clés espagnoles manquantes, puis complétez-les avec
          l&apos;éditeur de traduction — la couverture et l&apos;aperçu se mettent à jour en
          direct. Le choix de langue est mémorisé en local.
        </p>
      </div>
      <MultiLangueSimulateur />
    </div>
  );
}
