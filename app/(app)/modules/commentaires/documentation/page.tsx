"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function CommentairesDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/commentaires">Commentaires</Link> → Documentation
        </nav>
        <h1>Documentation — Commentaires</h1>
        <p className="doc-description">
          Fil de commentaires et annotations sur une entité (document, ligne, projet). Auteur, date et contenu.
        </p>
      </div>

      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        Les modules Blueprint Modular font partie de l&apos;<strong>application Next.js</strong>. Il n&apos;y a pas de package séparé par module : on installe l&apos;application une fois. Cette documentation décrit <strong>comment fonctionne</strong> le module Commentaires (affichage, ajout, liaison à une entité), <strong>comment l&apos;intégrer</strong> (API ou store) et les données attendues.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Comment fonctionne le module Commentaires
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Le module affiche un <strong>fil de commentaires</strong> associé à une entité (document, ligne, projet). Un <strong>contexte optionnel</strong> (nom + lien de l&apos;entité) peut être affiché en en-tête pour rappeler sur quoi portent les commentaires. Chaque commentaire comporte un auteur (format structuré pour avatars), une date, un contenu, et optionnellement un type (commentaire / annotation / décision / blocage) et un statut résolu. Zone de saisie multi-lignes (Ctrl+Entrée pour envoyer) et bouton Envoyer. Les données sont persistées côté backend (API ou base) selon votre implémentation.
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Structure des commentaires
      </h3>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        Champs de base et champs optionnels (pour threading, résolution, type) :
      </p>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><code>id</code>, <code>entityId</code> / <code>entityType</code>, <code>content</code>, <code>date</code> (ISO)</li>
        <li><code>author</code> — format structuré recommandé : <code>&#123; id, displayName, avatar? &#125;</code> pour cohérence et avatars</li>
        <li><code>parentId</code> — pour réponses imbriquées (optionnel)</li>
        <li><code>type</code> — commentaire / annotation / décision / blocage (optionnel)</li>
        <li><code>resolved</code>, <code>resolvedBy</code>, <code>resolvedAt</code> — clôture (optionnel)</li>
        <li><code>editedAt</code> — trace des modifications (optionnel)</li>
        <li><code>attachments</code> — pièces jointes (optionnel)</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Connexions inter-modules
      </h2>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        Le module Commentaires s&apos;intègre avec :
      </p>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><strong>Notifications ciblées</strong> — notifier les participants ou les @mentionnés à chaque nouveau commentaire</li>
        <li><strong>Audit / Log</strong> — tracer les créations, modifications et suppressions de commentaires dans le journal d&apos;audit</li>
        <li><strong>Workflow</strong> — un commentaire de type &quot;blocage&quot; peut conditionner une transition d&apos;état (ex. blocage levé → passage à &quot;En revue&quot;)</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Intégration côté app
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        La page du module est <code>/modules/commentaires</code>. Pour alimenter et enregistrer les commentaires, exposez par exemple <code>GET /api/comments?entityId=...&entityType=...</code> et <code>POST /api/comments</code>. La session utilisateur (NextAuth) fournit l&apos;auteur du commentaire. Aucune variable d&apos;environnement spécifique n&apos;est requise.
      </p>

      <p className="mb-2 text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>Exemple — afficher et ajouter un commentaire :</p>
      <CodeBlock
        code={'bpm.title("Commentaires")\n# Conteneur épuré (sans bpm.panel) : fil + zone "Nouveau commentaire" (textarea + Envoyer)\n# GET /api/comments?entityId=... & POST /api/comments'}
        language="python"
      />

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Simulateur
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Le simulateur propose un fil long (20+ commentaires) avec types variés (commentaire, annotation, décision, blocage), réponses imbriquées, commentaires résolus, contexte d&apos;entité, avatars colorés, actions au survol (modifier, supprimer, marquer résolu), zone multi-lignes (Ctrl+Entrée pour envoyer), validation, chargement et pagination.
      </p>
      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/commentaires/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Ouvrir le simulateur Commentaires</Link>
      </p>

      <p className="mt-8 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/commentaires" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>← Retour au module Commentaires</Link>
      </p>
    </div>
  );
}
