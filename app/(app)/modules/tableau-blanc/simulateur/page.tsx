"use client";

import Link from "next/link";
import { Panel, Textarea, Button } from "@/components/bpm";

export default function TableauBlancSimulateurPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/tableau-blanc">Tableau blanc</Link> → Simulateur
        </div>
        <h1>Simulateur — Tableau blanc</h1>
        <p className="doc-description">Post-it de démo et zone de saisie.</p>
      </div>
      <Panel variant="info" title="Zone idées">
        <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
          {["Bien : livraison à l'heure", "À améliorer : tests", "Action : doc API"].map((t, i) => (
            <div key={i} className="p-3 rounded border text-sm" style={{ background: "#fef9c3", borderColor: "var(--bpm-border)", color: "var(--bpm-text-primary)" }}>{t}</div>
          ))}
        </div>
        <Textarea label="Nouveau post-it" rows={2} value="" onChange={() => {}} placeholder="Saisir une idée..." />
        <Button size="small" className="mt-2">Ajouter</Button>
      </Panel>
    </div>
  );
}
