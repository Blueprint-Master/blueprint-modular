"use client";

import Link from "next/link";
import FormulaireDynamiqueSimulateur from "../simulateur-content";

export default function FormulaireDynamiqueSimulateurPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/formulaire-dynamique">Formulaire dynamique</Link> → Simulateur
        </div>
        <h1>Simulateur — Formulaire dynamique</h1>
        <p className="doc-description">
          Guichet de demandes internes : choisissez un type (congés, achat de matériel, accès
          applicatif), les champs sont générés depuis le schéma JSON affiché à droite. Les règles
          conditionnelles s&apos;appliquent en direct — congé sans solde, achat &gt; 1 000 € ou
          profil admin font apparaître des champs requis supplémentaires. Soumettez : validation
          par champ, récapitulatif et ajout au tableau des demandes.
        </p>
      </div>
      <FormulaireDynamiqueSimulateur />
    </div>
  );
}
