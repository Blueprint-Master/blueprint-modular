"use client";

import Link from "next/link";
import { Panel, Badge, Button } from "@/components/bpm";

export default function WorkflowSimulateurPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/workflow">Workflow</Link> → Simulateur
        </div>
        <h1>Simulateur — Workflow</h1>
        <p className="doc-description">Exemple d&apos;entité avec statut et bouton de transition.</p>
      </div>
      <Panel variant="info" title="Document #42">
        <div className="flex flex-wrap gap-2 items-center mb-4">
          <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Statut :</span>
          <Badge variant="primary">Validé</Badge>
          <Button size="small" variant="outline">Archiver</Button>
        </div>
        <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Historique : Brouillon → Validé (par Alice, 24/02).</p>
      </Panel>
    </div>
  );
}
