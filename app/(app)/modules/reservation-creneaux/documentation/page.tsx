"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function ReservationCreneauxDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/reservation-creneaux">Réservation / Créneaux</Link> → Documentation
        </nav>
        <h1>Documentation — Réservation / Créneaux</h1>
        <p className="doc-description">
          Réservation de ressources partagées (salles de réunion) : modèle de données, règles de
          conflit et intégration calendrier.
        </p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Modèle de données
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Trois entités. Une <strong>ressource</strong> décrit ce qui se réserve (capacité,
        équipements). Un <strong>créneau</strong> est une unité de temps réservable — ici un pas
        d&apos;1 h entre 09:00 et 18:00, du lundi au vendredi, soit 45 créneaux par ressource et
        par semaine. Une <strong>réservation</strong> pose un titre, un organisateur et une durée
        (1 ou 2 créneaux consécutifs) sur une ressource.
      </p>
      <CodeBlock
        code={`// Ressource
{
  "id": "hugo",
  "nom": "Salle Hugo",
  "capacite": 8,
  "equipements": ["Écran", "Visio"]
}

// Créneau (implicite : grille jour × heure)
{ "jour": "Lundi 15", "debut": "09:00", "fin": "10:00" }

// Réservation
{
  "id": "rsv-1",
  "ressourceId": "hugo",
  "jour": 0,                 // 0 = Lundi … 4 = Vendredi
  "heure": 9,                // créneau de départ (09:00)
  "duree": 2,                // en heures (1 ou 2)
  "titre": "Comité de direction",
  "organisateur": "Claire Morel",
  "participants": 7
}`}
        language="json"
      />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Règles de conflit
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>
          <strong>Unicité du créneau</strong> — une case (ressource × jour × heure) ne peut porter
          qu&apos;une seule réservation : seules les cases libres sont cliquables pour réserver.
        </li>
        <li>
          <strong>Durée de 2 h</strong> — la réservation occupe deux créneaux consécutifs ; elle
          est refusée (message d&apos;erreur dans le modal) si le créneau suivant est déjà occupé
          ou s&apos;il dépasse 18:00.
        </li>
        <li>
          <strong>Annulation</strong> — seules vos propres réservations sont annulables, après
          confirmation explicite (<code>bpm.confirmModal</code>) ; tous les créneaux occupés sont
          alors libérés.
        </li>
        <li>
          <strong>Lecture seule</strong> — les réservations des autres collaborateurs sont
          consultables (titre, organisateur, participants) mais jamais modifiables.
        </li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Indicateurs
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Le taux d&apos;occupation rapporte le nombre d&apos;heures réservées de la salle affichée
        aux 45 créneaux de la semaine. « Réservations cette semaine » et « Salle la plus
        demandée » agrègent l&apos;ensemble des ressources. Les trois indicateurs sont recalculés
        à chaque réservation ou annulation.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Intégration calendrier
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Le simulateur fonctionne en local (état React seedé). En production : persister ressources
        et réservations (tables <code>resources</code> / <code>bookings</code> avec contrainte
        d&apos;exclusion sur l&apos;intervalle ressource × plage horaire), publier chaque
        réservation comme événement dans l&apos;agenda de l&apos;organisateur (invitation aux
        participants, salle en tant que ressource invitée) et synchroniser les annulations dans
        les deux sens. Le module{" "}
        <Link href="/modules/calendrier" style={{ color: "var(--bpm-accent-cyan)" }}>
          Calendrier
        </Link>{" "}
        fournit la vue semaine correspondante côté agenda.
      </p>

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link
          href="/modules/reservation-creneaux/simulateur"
          className="font-medium underline"
          style={{ color: "var(--bpm-accent-cyan)" }}
        >
          Ouvrir le simulateur
        </Link>
      </p>
    </div>
  );
}
