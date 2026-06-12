"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function TachesDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/taches">Tâches</Link> →
          Documentation
        </nav>
        <h1>Documentation — Tâches</h1>
        <p className="doc-description">
          Gestionnaire de tâches d&apos;équipe : modèle de données, états et transitions, règles de
          retard et points d&apos;intégration.
        </p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Modèle de données
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Une tâche associe un titre (requis) à un assigné, une échéance, une priorité et un statut.
        La description est optionnelle ; les dates sont stockées au format ISO{" "}
        <code>AAAA-MM-JJ</code>, ce qui permet de comparer les échéances par simple ordre
        lexicographique.
      </p>
      <CodeBlock
        code={`{
  "id": "t-3",
  "titre": "Migration Postgres 16",
  "description": "Plan de bascule, répétition sur réplique.",
  "assigne": "Claire Petit",
  "echeance": "2026-06-09",      // ISO AAAA-MM-JJ
  "priorite": "haute",           // haute | normale | basse
  "statut": "À faire"            // À faire | En cours | Terminé
}`}
        language="json"
      />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        États et transitions
      </h2>
      <p className="mb-2" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Le cycle de vie est linéaire et avance en un clic via le bouton contextuel de la colonne
        Actions :
      </p>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>
          <strong style={{ color: "var(--bpm-text-primary)" }}>À faire → En cours</strong> —
          bouton « Démarrer » (statut initial de toute nouvelle tâche).
        </li>
        <li>
          <strong style={{ color: "var(--bpm-text-primary)" }}>En cours → Terminé</strong> —
          bouton « Terminer » ; la ligne est ensuite atténuée et le bouton d&apos;avancement
          disparaît.
        </li>
        <li>
          <strong style={{ color: "var(--bpm-text-primary)" }}>Modifier</strong> — titre, assigné,
          échéance et priorité restent éditables à tout moment (modale pré-remplie).
        </li>
        <li>
          <strong style={{ color: "var(--bpm-text-primary)" }}>Supprimer</strong> — confirmation
          explicite (<code>bpm.confirmModal</code>) avant retrait définitif.
        </li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Règles de retard
      </h2>
      <p className="mb-2" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Une tâche est <strong style={{ color: "var(--bpm-text-primary)" }}>en retard</strong> si
        son échéance est strictement antérieure à la date de référence{" "}
        <em>et</em> que son statut n&apos;est pas Terminé :
      </p>
      <CodeBlock
        code={`// Référence déterministe du simulateur (pas de new Date() au render)
const AUJOURDHUI = "2026-06-12";

const enRetard = (t) => t.echeance < AUJOURDHUI && t.statut !== "Terminé";`}
        language="javascript"
      />
      <ul className="mb-4 mt-3 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>Badge rouge « En retard » et échéance colorée dans le tableau.</li>
        <li>La métrique « En retard » est recalculée à chaque action.</li>
        <li>
          Une tâche terminée n&apos;est jamais en retard, même si son échéance est passée ;
          terminer une tâche en retard la sort donc immédiatement du compteur.
        </li>
        <li>En production, remplacer la constante par la date du jour côté serveur ou client.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Filtres
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Trois filtres se combinent : statut (boutons avec compteurs), assigné (selectbox « Tous » +
        membres de l&apos;équipe) et recherche plein texte sur le titre et la description. Les
        compteurs de statut sont calculés sur la liste déjà filtrée par assigné et recherche.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Intégration en production
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Le simulateur fonctionne en local (état React seedé, 8 tâches). Pour brancher un vrai
        backend : exposer une API CRUD (table <code>tasks</code>), valider la transition de statut
        côté serveur, et notifier l&apos;assigné lors d&apos;une création ou d&apos;une
        réassignation (l&apos;équivalent des toasts du simulateur).
      </p>

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link
          href="/modules/taches/simulateur"
          className="font-medium underline"
          style={{ color: "var(--bpm-accent-cyan)" }}
        >
          Tester dans le simulateur
        </Link>
      </p>
    </div>
  );
}
