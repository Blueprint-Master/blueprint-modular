"use client";

import { Panel } from "@/components/bpm/Panel";
import { CodeBlock } from "@/components/bpm/CodeBlock";
import Link from "next/link";

export default function DocPanelPage() {
  return (
    <div className="max-w-4xl">
      <nav className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/docs">Docs</Link>
        <span className="mx-2">/</span>
        <Link href="/docs/components">Composants</Link>
        <span className="mx-2">/</span>
        <span>panel</span>
      </nav>
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--bpm-accent)" }}>
        bpm.panel
      </h1>
      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        Panneau informatif (info, success, warning, error).
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2">Sandbox</h2>
      <div className="space-y-3 mb-6">
        <Panel variant="info" title="Info">
          Message d&apos;information.
        </Panel>
        <Panel variant="success" title="Succès">
          Opération réussie.
        </Panel>
        <Panel variant="warning" title="Attention">
          Vérifiez les données.
        </Panel>
        <Panel variant="error" title="Erreur">
          Une erreur s&apos;est produite.
        </Panel>
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemple Python</h2>
      <CodeBlock
        code={`bpm.panel("Titre", "Contenu du panneau", variant="info")
bpm.panel("Erreur", "Détail", variant="error")`}
        language="python"
      />

      <div className="mt-8 flex gap-4">
        <Link href="/docs/components/button" className="underline" style={{ color: "var(--bpm-accent-cyan)" }}>
          ← bpm.button
        </Link>
        <Link href="/docs/components" className="underline" style={{ color: "var(--bpm-text-secondary)" }}>
          Tous les composants
        </Link>
      </div>
    </div>
  );
}
