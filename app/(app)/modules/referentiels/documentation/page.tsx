"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function ReferentielsDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/referentiels">Référentiels</Link> → Documentation
        </nav>
        <h1>Documentation — Référentiels</h1>
        <p className="doc-description">
          Tables de codes partagées (devises, pays, taux de TVA, unités de mesure) : modèle de
          données, gouvernance, versionnage et diffusion aux applications.
        </p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Modèle d&apos;une entrée de référentiel
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Toute entrée partage un socle commun — <code>code</code> (identifiant métier, unique dans
        le référentiel, format contrôlé), <code>libelle</code>, <code>actif</code> et{" "}
        <code>utilisations</code> (nombre d&apos;enregistrements applicatifs qui la référencent).
        Les attributs spécifiques (<code>symbole</code>, <code>decimales</code>, <code>taux</code>,
        <code>famille</code>…) dépendent du référentiel et pilotent les colonnes affichées.
      </p>
      <CodeBlock
        code={`{
  "referentiel": "devises",
  "code": "EUR",              // unique, format imposé (ex. devise = 3 lettres majuscules)
  "libelle": "Euro",
  "actif": true,              // false = masqué dans les formulaires, données conservées
  "utilisations": 42,         // > 0 => suppression refusée, désactivation recommandée
  "champs": {                 // attributs propres au référentiel
    "symbole": "€",
    "decimales": 2
  }
}`}
        language="json"
      />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Gouvernance — qui modifie quoi
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>
          <strong>Administrateur référentiels</strong> — crée les tables de codes, définit le
          format des codes et les attributs ; seul habilité à supprimer une entrée (jamais une
          entrée utilisée : la désactivation est la voie normale).
        </li>
        <li>
          <strong>Responsables métier</strong> — proposent ajouts et corrections de libellés sur
          leur périmètre (la DAF pour les taux de TVA, la logistique pour les unités…) ; les
          modifications sont tracées nominativement dans l&apos;historique.
        </li>
        <li>
          <strong>Applications consommatrices</strong> — accès en lecture seule ; elles ne
          modifient jamais un référentiel directement.
        </li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Versionnage
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Chaque référentiel porte un numéro de version incrémenté à chaque modification (ajout,
        édition, bascule actif/inactif, suppression). L&apos;historique conserve l&apos;auteur,
        l&apos;action, l&apos;entrée touchée et l&apos;horodatage — c&apos;est l&apos;équivalent du
        flux « Historique des modifications » du simulateur. Les anciennes valeurs ne sont jamais
        écrasées physiquement : une entrée obsolète (ex. l&apos;ancien taux normal de TVA à
        19,6 %) reste consultable à l&apos;état inactif pour relire les documents historiques.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Diffusion aux applications
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>
          <strong>API de lecture</strong> — <code>GET /referentiels/&#123;id&#125;?version=…</code> ;
          les formulaires ne consomment que les entrées <code>actif: true</code>.
        </li>
        <li>
          <strong>Cache et invalidation</strong> — les applications mettent en cache la version
          courante et se resynchronisent quand le numéro de version change (webhook ou polling).
        </li>
        <li>
          <strong>Export CSV</strong> — extraction ponctuelle pour audit ou import dans un outil
          tiers ; c&apos;est le bouton « Exporter en CSV » du simulateur.
        </li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Intégration en production
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Le simulateur fonctionne en local (état React seedé). Pour brancher un vrai backend :
        persister les entrées dans une table <code>reference_entries</code> (contrainte
        d&apos;unicité <code>referentiel + code</code>), calculer <code>utilisations</code> via les
        clés étrangères des applications, journaliser chaque action dans{" "}
        <code>reference_audit</code> et exposer l&apos;API de lecture versionnée décrite ci-dessus.
      </p>

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link
          href="/modules/referentiels/simulateur"
          className="font-medium underline"
          style={{ color: "var(--bpm-accent-cyan)" }}
        >
          Ouvrir le simulateur
        </Link>
      </p>
    </div>
  );
}
