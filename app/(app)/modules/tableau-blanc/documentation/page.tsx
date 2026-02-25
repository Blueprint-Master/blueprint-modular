"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function TableauBlancDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/tableau-blanc">Tableau blanc</Link> → Documentation
        </nav>
        <h1>Documentation — Tableau blanc</h1>
        <p className="doc-description">Post-it et zones de texte pour rétrospectives ou ateliers.</p>
      </div>
      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        Les modules Blueprint Modular font partie de l&apos;application Next.js. Cette documentation décrit comment fonctionne le module Tableau blanc (post-it, zones de texte), comment l&apos;intégrer (API ou store) et les données attendues.
      </p>
      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>Comment fonctionne le module Tableau blanc</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Le module fournit un tableau blanc avec des post-it répartis en colonnes (Bien / À améliorer / Action par défaut). Chaque carte a un auteur et une date. Zone de saisie séparée avec sélecteur de colonne ; Ctrl+Entrée pour ajouter. Actions sur les cartes : modifier, supprimer, déplacer vers une autre colonne. Pas de bpm.panel : conteneur épuré pour occuper l&apos;espace atelier.
      </p>
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>Structure des données</h3>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        Champs de base et optionnels (pour traçabilité et ateliers) :
      </p>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><code>id</code>, <code>content</code> — identifiant et texte du post-it</li>
        <li><code>column</code> — colonne (bien, ameliorer, action ou valeurs paramétrables selon le type d&apos;atelier)</li>
        <li><code>author</code> — objet structuré <code>&#123; id, displayName &#125;</code> pour traçabilité</li>
        <li><code>createdAt</code> — date de création (ISO)</li>
        <li><code>order</code> — ordre d&apos;affichage dans la colonne (optionnel)</li>
        <li><code>boardId</code> / <code>sessionId</code> — pour plusieurs tableaux ou sessions (optionnel)</li>
      </ul>
      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>Connexions (inter-modules)</h2>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        Le tableau blanc s&apos;intègre avec :
      </p>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><strong>Tâches</strong> — une carte &quot;Action&quot; peut être convertie en tâche (échéance, assignation).</li>
        <li><strong>Workflow</strong> — une action du tableau peut déclencher une transition d&apos;état ou une assignation.</li>
        <li><strong>Notifications ciblées</strong> — notifier les participants lorsqu&apos;un post-it est ajouté ou déplacé.</li>
      </ul>
      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>Intégration</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Page <code>/modules/tableau-blanc</code>. Exposez GET/POST pour les post-it (ex. <code>GET /api/tableau-blanc?boardId=...</code>). Aucune variable d&apos;environnement spécifique.
      </p>
      <CodeBlock code={'bpm.title("Rétro")\n# Conteneur épuré (sans bpm.panel) : zone idées + colonnes + formulaire Nouveau post-it'} language="python" />
      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>Simulateur</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Le simulateur propose 3 colonnes visuelles (Bien, À améliorer, Action) avec post-it de démo (auteur, date), sélecteur de colonne à l&apos;ajout, Ctrl+Entrée pour soumettre, actions au survol (modifier, supprimer, déplacer) et surbrillance du post-it nouvellement ajouté.
      </p>
      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/tableau-blanc/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Ouvrir le simulateur Tableau blanc</Link>
      </p>
      <p className="mt-8 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/tableau-blanc" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>← Retour au module Tableau blanc</Link>
      </p>
    </div>
  );
}
