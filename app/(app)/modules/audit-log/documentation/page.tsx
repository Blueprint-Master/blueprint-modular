"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function AuditLogDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/audit-log">Audit / Log</Link> → Documentation
        </nav>
        <h1>Documentation — Audit / Log</h1>
        <p className="doc-description">
          Journal d&apos;audit (qui, quand, quoi) : modèle d&apos;événement, politique de
          rétention, garanties d&apos;intégrité et points d&apos;intégration.
        </p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Modèle d&apos;événement
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Un événement d&apos;audit est un enregistrement immuable : il répond à « qui »
        (<code>acteur</code>, <code>acteurId</code>, <code>ip</code>), « quand »
        (<code>timestamp</code> ISO 8601, posé côté serveur) et « quoi » (<code>action</code>,{" "}
        <code>entite</code>, <code>detail</code> avec l&apos;avant/après lisible). La{" "}
        <code>source</code> distingue l&apos;interface web, l&apos;API et les tâches planifiées.
      </p>
      <CodeBlock
        code={`{
  "id": "EVT-1032",
  "timestamp": "2026-06-12T17:40:00",       // ISO 8601, jamais modifié
  "acteur": "Alice Martin",
  "acteurId": "a.martin",                   // identifiant stable (humain, service, système)
  "action": "modification",                 // creation | modification | suppression | connexion
  "entite": "Devis DV-2026-104",
  "detail": "statut : brouillon → validé",  // avant → après, lisible par un humain
  "ip": "10.20.4.18",
  "source": "Interface web"                 // Interface web | API | Tâche planifiée
}`}
        language="json"
      />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Rétention
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>
          <strong>Journal chaud</strong> — 90 jours en base, interrogeable depuis l&apos;interface
          (le simulateur montre une fenêtre de 10 jours).
        </li>
        <li>
          <strong>Archive froide</strong> — export mensuel compressé vers un stockage objet,
          conservé 6 ans (exigence courante pour les pièces comptables et contractuelles).
        </li>
        <li>
          <strong>Purge</strong> — la purge elle-même est journalisée (événement{" "}
          <code>suppression</code> émis par l&apos;acteur <code>Système</code>), jamais silencieuse.
        </li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Conformité et intégrité
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>
          <strong>Append-only</strong> — la table <code>audit_events</code> n&apos;autorise ni{" "}
          <code>UPDATE</code> ni <code>DELETE</code> applicatifs ; on corrige en ajoutant un
          événement, jamais en réécrivant l&apos;historique.
        </li>
        <li>
          <strong>Chaînage</strong> — chaque ligne peut embarquer le hachage SHA-256 de la
          précédente : toute altération a posteriori casse la chaîne et se détecte.
        </li>
        <li>
          <strong>Horodatage de confiance</strong> — timestamps posés côté serveur, jamais par le
          client ; horloge synchronisée (NTP).
        </li>
        <li>
          <strong>Données personnelles</strong> — le <code>detail</code> décrit le changement sans
          recopier de données sensibles (RGPD : minimisation) ; les adresses IP suivent la même
          politique de rétention que le journal.
        </li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Intégration en production
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Le simulateur fonctionne en local (32 événements seedés, filtres et pagination côté
        client). Pour brancher un vrai backend : émettre un événement depuis un middleware à
        chaque mutation (création, modification, suppression) et à chaque authentification ;
        exposer une API de lecture paginée acceptant les mêmes paramètres que les filtres du
        simulateur (<code>q</code>, <code>acteur</code>, <code>action</code>, <code>depuis</code>) ;
        servir l&apos;export CSV côté serveur au-delà de quelques milliers de lignes. La recherche
        plein texte gagne à être indexée (index trigram ou moteur dédié).
      </p>

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link
          href="/modules/audit-log/simulateur"
          className="font-medium underline"
          style={{ color: "var(--bpm-accent-cyan)" }}
        >
          Ouvrir le simulateur
        </Link>
      </p>
    </div>
  );
}
