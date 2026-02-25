"use client";

import Link from "next/link";
import { Button, Panel, Table } from "@/components/bpm";
import { useState } from "react";

const initialTasks = [
  { id: "1", titre: "Rédiger la doc API", assigné: "Alice", échéance: "2025-03-01", statut: "En cours" },
  { id: "2", titre: "Tests e2e", assigné: "Bob", échéance: "2025-03-05", statut: "À faire" },
  { id: "3", titre: "Déploiement staging", assigné: "Alice", échéance: "2025-02-28", statut: "Terminé" },
];

export default function TachesSimulateurPage() {
  const [filter, setFilter] = useState<"all" | "À faire" | "En cours" | "Terminé">("all");
  const filtered = filter === "all" ? initialTasks : initialTasks.filter((t) => t.statut === filter);

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/taches">Tâches</Link> → Simulateur
        </div>
        <h1>Simulateur — Tâches</h1>
        <p className="doc-description">
          Filtrez et consultez une liste de tâches de démo (assignation, échéance, statut).
        </p>
      </div>

      <Panel variant="info" title="Filtres">
        <div className="flex flex-wrap gap-2 mb-4">
          <Button size="small" variant={filter === "all" ? "primary" : "secondary"} onClick={() => setFilter("all")}>Toutes</Button>
          <Button size="small" variant={filter === "À faire" ? "primary" : "secondary"} onClick={() => setFilter("À faire")}>À faire</Button>
          <Button size="small" variant={filter === "En cours" ? "primary" : "secondary"} onClick={() => setFilter("En cours")}>En cours</Button>
          <Button size="small" variant={filter === "Terminé" ? "primary" : "secondary"} onClick={() => setFilter("Terminé")}>Terminé</Button>
        </div>
        <Table
          columns={[
            { key: "titre", label: "Tâche" },
            { key: "assigné", label: "Assigné" },
            { key: "échéance", label: "Échéance" },
            { key: "statut", label: "Statut" },
          ]}
          data={filtered}
          striped
          hover
        />
      </Panel>
    </div>
  );
}
