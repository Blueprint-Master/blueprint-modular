"use client";

import Link from "next/link";
import { Panel, Table, Button, Badge } from "@/components/bpm";

const lignes = [{ designation: "Prestation A", qté: "1", pu: "1 000 €", total: "1 000 €" }];

export default function DevisFacturationSimulateurPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → <Link href="/modules/devis-facturation">Devis / Facturation</Link> → Simulateur</div>
        <h1>Simulateur — Devis / Facturation</h1>
        <p className="doc-description">Devis de démo (lignes, statut, PDF).</p>
      </div>
      <Panel variant="info" title="Devis #2025-001">
        <div className="flex gap-2 mb-4"><Badge variant="warning">Brouillon</Badge><Button size="small">Envoyer</Button><Button size="small" variant="outline">Télécharger PDF</Button></div>
        <Table columns={[{ key: "designation", label: "Désignation" }, { key: "qté", label: "Qté" }, { key: "pu", label: "P.U." }, { key: "total", label: "Total" }]} data={lignes} striped hover />
        <p className="text-sm mt-4" style={{ color: "var(--bpm-text-primary)" }}>Total TTC : 1 000 €</p>
      </Panel>
    </div>
  );
}
