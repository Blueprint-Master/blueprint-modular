"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function ConnecteursDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/connecteurs">Connecteurs</Link> → Documentation
        </nav>
        <h1>Documentation — Connecteurs</h1>
        <p className="doc-description">
          Intégrations de données entrantes : types de connecteurs, modèle de données, gestion des
          secrets et planification des synchronisations.
        </p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Types de connecteurs
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>
          <strong>API REST</strong> — interrogation HTTP(S) paginée d&apos;une API métier (ERP,
          CRM). Authentification par jeton ou compte de service ; idéal pour des synchros
          fréquentes (horaires) et incrémentales.
        </li>
        <li>
          <strong>SFTP</strong> — récupération de fichiers déposés par un tiers (relevés
          bancaires, exports paie). Le connecteur liste un répertoire, importe les nouveaux
          fichiers et les archive ; rythme typiquement quotidien.
        </li>
        <li>
          <strong>PostgreSQL</strong> — lecture directe d&apos;une base (datawarehouse, réplique
          analytique) via un compte en lecture seule, avec curseur incrémental sur une colonne de
          mise à jour.
        </li>
        <li>
          <strong>MySQL</strong> — même principe que PostgreSQL pour les applications historiques
          adossées à MySQL/MariaDB.
        </li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Modèle de données
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Un connecteur associe une source (type + hôte/URL + identifiant) à une planification et à
        un état de santé observable : statut, dernière synchronisation, volumétrie importée sur
        24 h. Le secret n&apos;est jamais stocké dans cet enregistrement — seul un pointeur vers le
        coffre y figure.
      </p>
      <CodeBlock
        code={`{
  "nom": "ERP Sage — API REST",
  "type": "API REST",                    // API REST | SFTP | PostgreSQL | MySQL
  "hote": "https://api.sage.acme.fr/v3",
  "identifiant": "svc-bpm-sage",         // compte de service (lecture seule)
  "secretRef": "vault://connecteurs/sage-api-token",
  "statut": "connected",                 // connected | error | paused
  "planification": "0 * * * *",          // cron — toutes les heures
  "derniereSynchro": "2026-06-12T09:00:00Z",
  "lignes24h": 12400
}`}
        language="json"
      />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Gestion des secrets
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>
          Les jetons, mots de passe et clés SSH sont stockés dans un coffre (Vault, AWS Secrets
          Manager…) et référencés par <code>secretRef</code> ; jamais en base ni dans les journaux.
        </li>
        <li>
          Utilisez des comptes de service dédiés en lecture seule, un par connecteur, pour pouvoir
          révoquer sans effet de bord.
        </li>
        <li>
          Une authentification refusée passe le connecteur en statut <code>error</code> : la
          correction de l&apos;identifiant suivie d&apos;un test de connexion (flux « Corriger »
          puis « Tester » du simulateur) rétablit le statut <code>connected</code>.
        </li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Planification des synchros
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Chaque connecteur porte une expression cron exécutée par un worker : toutes les heures pour
        un ERP, quotidien à 06:00 pour des relevés bancaires, toutes les 6 h pour un
        datawarehouse. Une synchronisation manuelle (« Synchroniser ») reste possible à tout
        moment sans modifier la planification. Chaque exécution — réussie ou non — est journalisée
        avec sa volumétrie : c&apos;est l&apos;équivalent du panneau « Journal de
        synchronisation » du simulateur. Un connecteur <code>paused</code> conserve sa
        planification mais n&apos;est plus déclenché.
      </p>

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link
          href="/modules/connecteurs/simulateur"
          className="font-medium underline"
          style={{ color: "var(--bpm-accent-cyan)" }}
        >
          Ouvrir le simulateur
        </Link>
      </p>
    </div>
  );
}
