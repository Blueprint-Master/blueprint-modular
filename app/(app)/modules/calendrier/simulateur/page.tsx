"use client";

import Link from "next/link";
import { Panel, Button, Table } from "@/components/bpm";

const events = [
  { date: "2025-02-25", titre: "Réunion équipe", heure: "10h" },
  { date: "2025-02-26", titre: "Revue livrables", heure: "14h" },
  { date: "2025-02-27", titre: "Point client", heure: "09h" },
];

export default function CalendrierSimulateurPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/calendrier">Calendrier</Link> → Simulateur
        </div>
        <h1>Simulateur — Calendrier</h1>
        <p className="doc-description">Vue liste d&apos;événements de démo (équivalent d&apos;une vue semaine).</p>
      </div>
      <Panel variant="info" title="Événements">
        <div className="flex gap-2 mb-4">
          <Button size="small">Jour</Button>
          <Button variant="secondary" size="small">Semaine</Button>
          <Button variant="secondary" size="small">Mois</Button>
        </div>
        <Table columns={[{ key: "date", label: "Date" }, { key: "heure", label: "Heure" }, { key: "titre", label: "Événement" }]} data={events} striped hover />
      </Panel>
    </div>
  );
}
