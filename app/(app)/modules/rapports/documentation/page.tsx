"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function RapportsDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/rapports">Rapports</Link> →
          Documentation
        </nav>
        <h1>Documentation — Rapports</h1>
        <p className="doc-description">
          Génération de rapports d&apos;entreprise à partir de modèles : modèle de données,
          fonctionnement et points d&apos;intégration en production.
        </p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Modèle de données
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Un <strong>modèle de rapport</strong> décrit une source de données, des colonnes et des
        visualisations. Un <strong>rapport généré</strong> est l&apos;instanciation d&apos;un
        modèle sur une période : il fige le périmètre (modèle + période + horodatage + auteur) et
        sert de base à l&apos;aperçu et à l&apos;export CSV.
      </p>
      <CodeBlock
        code={`{
  "modele": "ca-mensuel",        // ca-mensuel | commandes-region | effectifs-service
  "periode": "s1-2025",          // annee-2025 | s1-2025 | s2-2025
  "nom": "Chiffre d'affaires mensuel — S1 2025",
  "genereLe": "2026-06-10T09:12:00",
  "auteur": "Claire Morel"
}`}
        language="json"
      />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Modèles fournis
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>
          <strong>Chiffre d&apos;affaires mensuel</strong> — 12 mois de CA 2025 avec comparatif
          2024 : courbe (<code>bpm.lineChart</code>), tableau des variations N-1 et métriques
          (total période, meilleur mois, variation vs 2024).
        </li>
        <li>
          <strong>Commandes par région</strong> — 6 régions françaises : volume de commandes et
          panier moyen par semestre, barres (<code>bpm.barChart</code>), CA estimé par région.
        </li>
        <li>
          <strong>Effectifs par service</strong> — 5 services : effectif, ETP et turnover par
          semestre, avec turnover annuel consolidé sur l&apos;année.
        </li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Fonctionnement
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>
          <strong>Générer</strong> — le couple modèle + période est validé, la période filtre
          réellement les données (S1 = janvier–juin, S2 = juillet–décembre), le rapport est ajouté
          en tête de l&apos;historique et l&apos;aperçu s&apos;affiche (métriques, graphique,
          tableau).
        </li>
        <li>
          <strong>Afficher</strong> — recharge l&apos;aperçu d&apos;un rapport déjà généré, avec
          son périmètre d&apos;origine.
        </li>
        <li>
          <strong>Télécharger CSV</strong> — export réel côté navigateur (Blob + lien de
          téléchargement), séparateur « ; » et BOM UTF-8 pour Excel français.
        </li>
        <li>
          <strong>Supprimer</strong> — confirmation explicite (<code>bpm.confirmModal</code>)
          avant retrait de l&apos;historique.
        </li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Intégration en production
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Le simulateur fonctionne en local (état React seedé, données déterministes). Pour brancher
        un vrai backend : exposer chaque modèle comme une requête sur vos sources (ERP pour le CA,
        OMS/CRM pour les commandes, SIRH pour les effectifs), persister les rapports générés
        (table <code>generated_reports</code> : modèle, période, horodatage, auteur, snapshot des
        données), produire le CSV côté serveur pour les gros volumes et archiver les fichiers dans
        votre stockage documentaire. L&apos;historique « Rapports générés » correspond alors à un
        simple <code>SELECT</code> trié par date de génération.
      </p>

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link
          href="/modules/rapports/simulateur"
          className="font-medium underline"
          style={{ color: "var(--bpm-accent-cyan)" }}
        >
          Ouvrir le simulateur
        </Link>
      </p>
    </div>
  );
}
