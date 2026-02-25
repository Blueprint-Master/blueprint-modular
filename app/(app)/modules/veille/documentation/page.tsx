"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function VeilleDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/veille">Veille</Link> → Documentation
        </nav>
        <h1>Documentation — Veille</h1>
        <p className="doc-description">
          Monitoring et veille : suivi des sources, alertes et flux d&apos;information.
        </p>
      </div>

      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        Les modules Blueprint Modular font partie de l&apos;<strong>application Next.js</strong>. Il n&apos;y a pas de package séparé par module (pas de <code>pip install blueprint-modular-veille</code> ni <code>npm install blueprint-modular-veille</code>) : on installe l&apos;application une fois. Cette documentation décrit <strong>comment installer</strong> l&apos;app pour accéder au module Veille, <strong>comment il fonctionne</strong> (état actuel et évolutions prévues), <strong>comment le paramétrer</strong> (aucune variable spécifique pour l&apos;instant) et comment l&apos;utiliser (page <code>/modules/veille</code>).
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Comment fonctionne le module Veille
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Le module Veille est prévu pour centraliser la veille stratégique et opérationnelle : agrégation de flux (RSS, alertes métier), tableaux de bord de suivi et notifications. L&apos;interface détaillée (sources, abonnements, filtres) sera enrichie dans une prochaine version. Actuellement, la page /modules/veille présente une description du module et un lien vers cette documentation.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Installation et dépendances
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Le module Veille fait partie de l&apos;application Next.js. Installer l&apos;application suffit pour accéder à la page du module. Aucune dépendance externe spécifique (API, base dédiée) n&apos;est requise pour l&apos;instant.
      </p>
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Résumé des commandes (installer l&apos;app et accéder au module Veille)
      </h3>
      <CodeBlock
        code={`# Depuis la racine du projet (application Next.js)
npm install
npx prisma generate --schema=prisma/schema.prisma
npx prisma migrate deploy
npm run dev

# Ouvrir le module Veille
# http://localhost:3000/modules/veille`}
        language="bash"
      />
      <p className="mt-2 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        Définir <code>DATABASE_URL</code> dans <code>.env</code> (comme pour le reste de l&apos;app). Aucune variable d&apos;environnement spécifique au module Veille n&apos;est requise pour l&apos;instant.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Comment charger et utiliser le module
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <strong>Charger</strong> : le module est intégré à l&apos;app ; après <code>npm install</code> et <code>prisma migrate deploy</code>, il est disponible. <strong>Utiliser</strong> : ouvrez la page <code>/modules/veille</code> pour accéder à la description du module et aux évolutions prévues (sources RSS, alertes, filtres). Aucune API dédiée ni paramètre spécifique pour l&apos;instant.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Variables d&apos;environnement et paramétrage
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        Aucune variable d&apos;environnement spécifique au module Veille. Les évolutions à venir (sources, seuils d&apos;alertes, filtres) pourront introduire des paramètres ou variables ; la documentation sera mise à jour en conséquence.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Paramétrage et évolution
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Les fonctionnalités à venir peuvent inclure : configuration des sources (URLs RSS, APIs), seuils d&apos;alertes, filtres par thème ou workspace, et intégration avec le module Notification pour les alertes. Lorsque ces fonctionnalités seront implémentées, la documentation sera mise à jour avec les paramètres, API et lignes de commande associés.
      </p>

      <nav className="doc-pagination mt-10">
        <Link href="/modules/veille" className="text-sm font-medium" style={{ color: "var(--bpm-accent-cyan)" }}>
          ← Retour au module Veille
        </Link>
      </nav>
    </div>
  );
}
