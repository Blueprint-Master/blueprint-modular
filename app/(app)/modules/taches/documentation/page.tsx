"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function TachesDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/taches">Tâches</Link> → Documentation
        </nav>
        <h1>Documentation — Tâches</h1>
        <p className="doc-description">
          Liste de tâches avec assignation, échéance et statut. Utilisable en standalone ou lié à un projet.
        </p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Le module Tâches permet de gérer des tâches avec titre, assignation, date d&apos;échéance et statut (À faire, En cours, Terminé). Les données peuvent être stockées en base ou en état local selon votre implémentation.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>Modèle de données</h2>
      <ul className="list-disc pl-5 mb-4 space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><strong style={{ color: "var(--bpm-text-primary)" }}>titre</strong> (requis)</li>
        <li><strong style={{ color: "var(--bpm-text-primary)" }}>description</strong> (optionnel)</li>
        <li><strong style={{ color: "var(--bpm-text-primary)" }}>assigné</strong> (utilisateur ou équipe)</li>
        <li><strong style={{ color: "var(--bpm-text-primary)" }}>échéance</strong> (date)</li>
        <li><strong style={{ color: "var(--bpm-text-primary)" }}>statut</strong> : À faire | En cours | Terminé</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>Exemple (bpm)</h2>
      <CodeBlock
        code={'import bpm\n\nbpm.title("Mes tâches")\nbpm.table(columns=[{"key":"titre","label":"Tâche"},{"key":"assigné","label":"Assigné"},{"key":"échéance","label":"Échéance"},{"key":"statut","label":"Statut"}], data=tasks)'}
        language="python"
      />

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/taches/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>
          Tester dans le simulateur
        </Link>
      </p>
    </div>
  );
}
