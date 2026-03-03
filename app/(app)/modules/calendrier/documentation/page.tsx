"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function CalendrierDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/calendrier/simulateur">Calendrier</Link> → Documentation
        </nav>
        <h1>Documentation — Calendrier</h1>
        <p className="doc-description">
          Agenda avec vues jour, semaine et mois. Événements et rappels, optionnellement synchronisables avec un backend ou un calendrier externe.
        </p>
      </div>

      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        Les modules Blueprint Modular font partie de l&apos;<strong>application Next.js</strong>. Il n&apos;y a pas de package séparé par module : on installe l&apos;application une fois, puis on configure les variables d&apos;environnement selon les modules utilisés. Cette documentation décrit <strong>comment utiliser</strong> le module Calendrier, <strong>comment il fonctionne</strong> (vues jour / semaine / mois, données événements), <strong>comment l&apos;intégrer</strong> (API ou store local) et comment le paramétrer.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Comment fonctionne le module Calendrier
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Le module Calendrier affiche des <strong>événements</strong> avec date, heure, titre et durée. Trois vues sont disponibles : <strong>Jour</strong> (agenda du jour), <strong>Semaine</strong> (liste ou grille de la semaine), <strong>Mois</strong> (grille du mois avec indicateurs par jour). Les données peuvent provenir d&apos;un état local (React), d&apos;une API REST ou d&apos;un service de calendrier (Google Calendar, etc.) selon votre implémentation.
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Structure des événements
      </h3>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        Chaque événement est un objet avec les champs suivants (tous optionnels sauf date, heure, titre) :
      </p>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><code>id</code> — identifiant unique</li>
        <li><code>date</code> — date au format YYYY-MM-DD</li>
        <li><code>heure</code> — heure de début (ex. 09h, 14h30)</li>
        <li><code>titre</code> — libellé de l&apos;événement</li>
        <li><code>duree</code> — durée en minutes (optionnel)</li>
        <li><code>couleur</code> — couleur d&apos;affichage (optionnel)</li>
        <li><code>description</code> — notes ou description (optionnel)</li>
        <li><code>lieu</code> — lieu (salle, Visio) (optionnel)</li>
        <li><code>categorie</code> — catégorie ou tag (optionnel)</li>
        <li><code>statut</code> — confirmé / annulé / tentative (optionnel)</li>
        <li><code>participants</code> — liste d&apos;identifiants ou noms (optionnel)</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Compatible avec
      </h2>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        Le Calendrier s&apos;intègre naturellement avec d&apos;autres modules Blueprint Modular :
      </p>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><strong>Tâches</strong> — une tâche avec échéance peut être affichée comme événement dans l&apos;agenda.</li>
        <li><strong>Workflow</strong> — les transitions de statut peuvent déclencher des créneaux ou rappels dans le calendrier.</li>
        <li><strong>Notifications ciblées</strong> — rappels (ex. J-1 avant un événement) ou alertes selon le profil utilisateur.</li>
        <li><strong>Réservation / Créneaux</strong> — partage de la notion de plage horaire et de disponibilité.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Intégration côté app
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Le module est une page Next.js (<code>/modules/calendrier</code>). Pour alimenter les événements depuis votre backend, exposez une API (ex. <code>GET /api/calendar/events</code>) et appelez-la depuis la page ou un hook. Aucune variable d&apos;environnement spécifique n&apos;est requise pour le module Calendrier.
      </p>

      <p className="mb-2 text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>Exemple — récupérer les événements :</p>
      <CodeBlock
        code={`# Côté Python BPM (si vous générez la page via BPM)
bpm.title("Agenda")
# Les événements sont passés en data (date, titre, heure, durée)
# Exemple de structure :
# events = [
#   {"date": "2025-02-25", "titre": "Réunion équipe", "heure": "10h"},
#   {"date": "2025-02-26", "titre": "Revue livrables", "heure": "14h"},
# ]`}
        language="python"
      />

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Simulateur
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Le simulateur propose la <strong>vue Jour</strong> (timeline verticale avec créneaux 8h–20h et événements positionnés, gestion des chevauchements), la <strong>vue Semaine</strong> (grille temporelle : colonnes Lun–Dim, lignes par demi-heure), la <strong>vue Mois</strong> (grille avec jour courant mis en évidence, clic pour ouvrir le jour). S&apos;y ajoutent la <strong>navigation temporelle</strong> (← / →, Aujourd&apos;hui), les <strong>filtres par couleur</strong>, le <strong>clic sur un événement</strong> (modale détail) et le bouton <strong>+ Nouvel événement</strong> (formulaire de création). Aucune icône ambiguë dans l&apos;en-tête : libellés clairs uniquement.
      </p>
      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/calendrier/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Ouvrir le simulateur Calendrier</Link>
      </p>

      <p className="mt-8 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/calendrier/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>← Retour au Calendrier</Link>
      </p>
    </div>
  );
}
