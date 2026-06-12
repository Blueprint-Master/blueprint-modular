"use client";

import Link from "next/link";
import ReservationCreneauxSimulateur from "../simulateur-content";

export default function ReservationCreneauxSimulateurPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/reservation-creneaux">Réservation / Créneaux</Link> → Simulateur
        </div>
        <h1>Simulateur — Réservation / Créneaux</h1>
        <p className="doc-description">
          Trois salles, un planning Lun→Ven (09:00–18:00) et onze réservations déjà posées.
          Changez de salle, cliquez sur une case libre pour réserver (1 h ou 2 h, conflits
          contrôlés), consultez les réservations des autres, annulez les vôtres : métriques et
          planning se mettent à jour en direct.
        </p>
      </div>
      <ReservationCreneauxSimulateur />
    </div>
  );
}
