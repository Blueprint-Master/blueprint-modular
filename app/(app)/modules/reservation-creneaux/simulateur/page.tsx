"use client";

import Link from "next/link";
import { Panel, Selectbox, Button } from "@/components/bpm";

export default function ReservationCreneauxSimulateurPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → <Link href="/modules/reservation-creneaux">Réservation / Créneaux</Link> → Simulateur</div>
        <h1>Simulateur — Réservation / Créneaux</h1>
        <p className="doc-description">Choisir un créneau (démo).</p>
      </div>
      <Panel variant="info" title="Créneaux disponibles">
        <Selectbox options={[{ value: "09", label: "09h-10h" }, { value: "10", label: "10h-11h" }, { value: "11", label: "11h-12h" }]} value={null} onChange={() => {}} placeholder="Créneau" label="Créneau" />
        <Button className="mt-4">Réserver</Button>
      </Panel>
    </div>
  );
}
