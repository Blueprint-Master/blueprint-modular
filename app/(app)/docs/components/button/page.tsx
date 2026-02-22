"use client";

import { Button } from "@/components/bpm/Button";
import { CodeBlock } from "@/components/bpm/CodeBlock";
import Link from "next/link";

export default function DocButtonPage() {
  return (
    <div className="max-w-4xl">
      <nav className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/docs">Docs</Link>
        <span className="mx-2">/</span>
        <Link href="/docs/components">Composants</Link>
        <span className="mx-2">/</span>
        <span>button</span>
      </nav>
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--bpm-accent)" }}>
        bpm.button
      </h1>
      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        Bouton d&apos;action avec variantes (primary, secondary, outline).
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2">Sandbox</h2>
      <div
        className="p-4 rounded-lg border mb-6 flex flex-wrap gap-3"
        style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}
      >
        <Button onClick={() => alert("Cliqué")}>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button size="small">Small</Button>
        <Button disabled>Disabled</Button>
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemple Python</h2>
      <CodeBlock
        code={`if bpm.button("Valider"):
    bpm.write("Validé !")`}
        language="python"
      />

      <div className="mt-8 flex gap-4">
        <Link href="/docs/components/panel" className="underline" style={{ color: "var(--bpm-accent-cyan)" }}>
          bpm.panel →
        </Link>
        <Link href="/docs/components/metric" className="underline" style={{ color: "var(--bpm-accent-cyan)" }}>
          ← bpm.metric
        </Link>
      </div>
    </div>
  );
}
