"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function NotificationsCibleesDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/notifications-ciblees">Notifications ciblées</Link> → Documentation
        </nav>
        <h1>Documentation — Notifications ciblées</h1>
        <p className="doc-description">
          Moteur de règles de notification : modèle de règle, événements disponibles, canaux et
          bonnes pratiques anti-spam.
        </p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Modèle de règle
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Une règle associe un événement métier à des destinataires (équipe ou rôle) et à un ou
        plusieurs canaux. La condition est optionnelle et lisible (ex. « montant &gt; 10 000 ») ;
        le statut (<code>actif</code>) permet de suspendre sans supprimer, et le compteur{" "}
        <code>declenchements7j</code> sert au suivi anti-spam.
      </p>
      <CodeBlock
        code={`{
  "nom": "Gros devis → direction commerciale",
  "evenement": "devis.cree",
  "condition": "montant > 10 000",          // optionnelle, lisible
  "destinataires": "Direction commerciale", // équipe ou rôle, pas d'adresses en dur
  "canaux": ["e-mail", "in-app"],           // in-app | e-mail | SMS
  "actif": true,
  "declenchements7j": 4
}`}
        language="json"
      />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Événements disponibles
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><code>document.valide</code> — un document vient d&apos;être validé (contexte : auteur).</li>
        <li><code>devis.cree</code> — un devis est créé (contexte : <code>montant</code> en €).</li>
        <li><code>ticket.critique</code> — un ticket de sévérité critique est ouvert.</li>
        <li><code>contrat.echeance_30j</code> — un contrat arrive à échéance dans 30 jours.</li>
        <li><code>stock.rupture</code> — une référence passe en rupture de stock.</li>
        <li><code>facture.impayee</code> — une facture dépasse sa date d&apos;échéance (contexte : <code>montant</code>).</li>
      </ul>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        À chaque événement émis, le moteur évalue toutes les règles <strong>actives</strong> dont
        l&apos;événement correspond ; si la règle porte une condition de montant, elle ne se
        déclenche que si le contexte fournit un montant qui la satisfait.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Canaux
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><strong>in-app</strong> — notification dans la cloche du header (module Notification) ; idéal pour l&apos;information courante.</li>
        <li><strong>e-mail</strong> — pour les destinataires hors application ou les sujets à trace écrite (direction, juridique).</li>
        <li><strong>SMS</strong> — réservé à l&apos;urgence réelle (astreinte, incident critique) : coûteux et intrusif.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Bonnes pratiques anti-spam
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><strong>Conditionnez</strong> — « devis créé » sans seuil noie la direction ; « montant &gt; 10 000 » cible les cas qui comptent.</li>
        <li><strong>Ciblez une équipe, pas tout le monde</strong> — un rôle ou une équipe par règle ; évitez les listes de diffusion larges.</li>
        <li><strong>Un canal adapté à l&apos;urgence</strong> — in-app par défaut, e-mail si une trace est nécessaire, SMS uniquement pour l&apos;astreinte.</li>
        <li><strong>Surveillez les déclenchements (7 j)</strong> — une règle qui part des dizaines de fois par semaine doit être resserrée ou regroupée en digest.</li>
        <li><strong>Suspendez plutôt que supprimer</strong> — la pause conserve la configuration ; dupliquez pour tester une variante sans toucher à la règle en service.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Intégration en production
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Le simulateur fonctionne en local (état React seedé) ; le canal in-app est déjà branché sur
        le contexte de notifications de l&apos;application. Pour un vrai backend : persister les
        règles (table <code>notification_rules</code>), abonner le moteur à votre bus
        d&apos;événements (webhooks, file de messages), résoudre les équipes en destinataires
        concrets au moment de l&apos;envoi, et journaliser chaque déclenchement (l&apos;équivalent
        du « Journal des déclenchements »).
      </p>

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link
          href="/modules/notifications-ciblees/simulateur"
          className="font-medium underline"
          style={{ color: "var(--bpm-accent-cyan)" }}
        >
          Ouvrir le simulateur
        </Link>
      </p>
    </div>
  );
}
