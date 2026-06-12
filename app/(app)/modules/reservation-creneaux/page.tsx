"use client";

import Link from "next/link";
import { CodeBlock, Tabs } from "@/components/bpm";
import ReservationCreneauxSimulateur from "./simulateur-content";

const docContent = (
  <div className="prose-sm">
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      À propos
    </h2>
    <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
      Le module Réservation / Créneaux gère la réservation de ressources partagées — ici trois
      salles de réunion (Salle Hugo, Salle Colette, Box Rimbaud). Le planning hebdomadaire affiche
      en un coup d&apos;œil les créneaux libres et occupés de la salle sélectionnée : un clic sur
      une case libre ouvre le formulaire de réservation (titre, organisateur, durée 1 h ou 2 h avec
      contrôle de conflit), un clic sur une case occupée affiche le détail en lecture seule. Vos
      propres réservations sont mises en évidence et annulables à tout moment.
    </p>
    <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      Composants utilisés
    </h3>
    <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
      <code>bpm.metricRow</code> (réservations, taux d&apos;occupation, salle la plus demandée),{" "}
      <code>bpm.selectbox</code> (choix de la ressource et de la durée), <code>bpm.modal</code>{" "}
      (réservation et détail), <code>bpm.confirmModal</code> (annulation), <code>bpm.input</code>,{" "}
      <code>bpm.badge</code>, <code>bpm.button</code> et <code>bpm.toast</code>. La grille du
      planning est une grille CSS locale (Lun→Ven × créneaux 09:00–18:00).
    </p>
    <CodeBlock
      code={`import bpm

salle = bpm.selectbox("Ressource", options=["Salle Hugo", "Salle Colette", "Box Rimbaud"])

bpm.metricRow([
    bpm.metric("Réservations cette semaine", 11),
    bpm.metric("Taux d'occupation", "20 %"),
    bpm.metric("Salle la plus demandée", "Salle Hugo"),
])

# Réserver un créneau libre (contrôle de conflit inclus)
bpm.modal(
    title="Réserver un créneau",
    children=[
        bpm.input("Titre de la réunion", required=True),
        bpm.input("Organisateur", value="Vous"),
        bpm.selectbox("Durée", options=["1 heure", "2 heures"]),
        bpm.button("Confirmer la réservation", on_click=reserver),
    ],
)`}
      language="python"
    />
    <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      Paramétrage
    </h3>
    <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
      Le simulateur fonctionne entièrement en local (réservations seedées, aucune API requise). En
      production, brancher les ressources et réservations sur votre backend et synchroniser avec
      l&apos;agenda des collaborateurs. Voir la{" "}
      <Link href="/modules/reservation-creneaux/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
        documentation
      </Link>{" "}
      pour le modèle ressource / créneau / réservation, les règles de conflit et l&apos;intégration
      calendrier.
    </p>
  </div>
);

export default function ReservationCreneauxModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → Réservation / Créneaux
        </div>
        <h1>Réservation / Créneaux</h1>
        <p className="doc-description">
          Réservez vos salles de réunion sur un planning hebdomadaire : créneaux libres cliquables,
          contrôle de conflit (1 h / 2 h), annulation, taux d&apos;occupation. Tout est manipulable
          dans le Simulateur.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Métier</span>
        </div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link
            href="/modules/reservation-creneaux/simulateur"
            className="font-medium underline"
            style={{ color: "var(--bpm-accent-cyan)" }}
          >
            Ouvrir le simulateur
          </Link>
        </p>
      </div>
      <Tabs
        tabs={[
          { label: "Documentation", content: docContent },
          { label: "Simulateur", content: <ReservationCreneauxSimulateur /> },
        ]}
        defaultTab={0}
      />
    </div>
  );
}
