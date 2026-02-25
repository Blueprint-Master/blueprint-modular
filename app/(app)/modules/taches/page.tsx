"use client";

import Link from "next/link";
import { Tabs, CodeBlock, Button, Panel, Title } from "@/components/bpm";

const docContent = (
  <>
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
    <p className="mb-6" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
      Le module <strong>Tâches</strong> permet de gérer une liste de tâches avec assignation, échéance et statut (à faire, en cours, terminé). Il peut être utilisé en standalone ou relié à un autre module (ex. projet, livrable).
    </p>
    <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>Concepts</h2>
    <ul className="list-disc pl-5 mb-4 space-y-1" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
      <li><strong style={{ color: "var(--bpm-text-primary)" }}>Tâche</strong> : titre, description optionnelle, assigné à, date d&apos;échéance, statut.</li>
      <li><strong style={{ color: "var(--bpm-text-primary)" }}>Statuts</strong> : À faire, En cours, Terminé (personnalisables côté backend).</li>
      <li>Filtres par statut et par assigné. Tri par échéance ou par date de création.</li>
    </ul>
    <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>Intégration</h2>
    <p className="mb-3" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
      Dans l&apos;app Blueprint Modular, le module Tâches expose une API REST (CRUD) et une UI dans cette page. Pour l&apos;intégrer à votre propre app, utilisez les composants <code className="px-1.5 py-0.5 rounded text-sm" style={{ background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)" }}>bpm.table</code>, <code className="px-1.5 py-0.5 rounded text-sm" style={{ background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)" }}>bpm.button</code>, <code className="px-1.5 py-0.5 rounded text-sm" style={{ background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)" }}>bpm.selectbox</code> et un store (état local ou API) pour persister les tâches.
    </p>
    <CodeBlock
      code={`# Exemple Python (bpm) — afficher des tâches
import bpm

bpm.title("Mes tâches")
bpm.table(
  columns=[
    {"key": "titre", "label": "Tâche"},
    {"key": "assigné", "label": "Assigné"},
    {"key": "échéance", "label": "Échéance"},
    {"key": "statut", "label": "Statut"},
  ],
  data=tasks,
)`}
      language="python"
    />
  </>
);

export default function TachesModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → Tâches</div>
        <h1>Tâches</h1>
        <p className="doc-description">
          Liste de tâches avec assignation, échéance et statut. Testez dans le Simulateur.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Processus & workflow</span>
        </div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link href="/modules/taches/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>
            Ouvrir le simulateur
          </Link>
        </p>
      </div>
      <Tabs
        tabs={[
          { label: "Documentation", content: docContent },
          { label: "Simulateur", content: <SimulateurContent /> },
        ]}
        defaultTab={0}
      />
    </div>
  );
}

function SimulateurContent() {
  const tasks = [
    { id: "1", titre: "Rédiger la doc API", assigné: "Alice", échéance: "2025-03-01", statut: "En cours" },
    { id: "2", titre: "Tests e2e", assigné: "Bob", échéance: "2025-03-05", statut: "À faire" },
    { id: "3", titre: "Déploiement staging", assigné: "Alice", échéance: "2025-02-28", statut: "Terminé" },
  ];
  return (
    <>
      <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>Liste de tâches (démo)</h2>
      <p className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Exemple de tableau de tâches avec filtres simulés. En production, les données viendraient d&apos;une API ou d&apos;un store.
      </p>
      <Panel variant="info" title="Simulateur">
        <p className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
          Utilisez les boutons ci-dessous pour filtrer par statut. Le tableau affiche des données de démo.
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          <Button size="small">Toutes</Button>
          <Button variant="secondary" size="small">À faire</Button>
          <Button variant="secondary" size="small">En cours</Button>
          <Button variant="secondary" size="small">Terminé</Button>
        </div>
        <table className="w-full text-sm border-collapse" style={{ borderColor: "var(--bpm-border)" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--bpm-border)", color: "var(--bpm-text-primary)" }}>
              <th className="text-left py-2 pr-4">Tâche</th>
              <th className="text-left py-2 pr-4">Assigné</th>
              <th className="text-left py-2 pr-4">Échéance</th>
              <th className="text-left py-2">Statut</th>
            </tr>
          </thead>
          <tbody style={{ color: "var(--bpm-text-secondary)" }}>
            {tasks.map((t) => (
              <tr key={t.id} style={{ borderBottom: "1px solid var(--bpm-border)" }}>
                <td className="py-2 pr-4" style={{ color: "var(--bpm-text-primary)" }}>{t.titre}</td>
                <td className="py-2 pr-4">{t.assigné}</td>
                <td className="py-2 pr-4">{t.échéance}</td>
                <td className="py-2">{t.statut}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
