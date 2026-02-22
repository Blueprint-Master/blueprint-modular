"use client";

import { useState } from "react";
import { Metric } from "@/components/bpm/Metric";
import { CodeBlock } from "@/components/bpm/CodeBlock";
import Link from "next/link";

export default function DocMetricPage() {
  const [value, setValue] = useState(142500);
  const [delta, setDelta] = useState(3200);
  const [label, setLabel] = useState("Chiffre d'affaires");

  return (
    <div className="max-w-4xl">
      <nav className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/docs">Docs</Link>
        <span className="mx-2">/</span>
        <Link href="/docs/components">Composants</Link>
        <span className="mx-2">/</span>
        <span>metric</span>
      </nav>
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--bpm-accent)" }}>
        bpm.metric
      </h1>
      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        Affiche une métrique avec valeur, label et delta optionnel (évolution).
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Sandbox
      </h2>
      <div
        className="p-4 rounded-lg border mb-6"
        style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <label className="block">
            <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Label</span>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full mt-1 px-2 py-1 rounded border"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)" }}
            />
          </label>
          <label className="block">
            <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Valeur</span>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="w-full mt-1 px-2 py-1 rounded border"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)" }}
            />
          </label>
          <label className="block">
            <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Delta</span>
            <input
              type="number"
              value={delta}
              onChange={(e) => setDelta(Number(e.target.value))}
              className="w-full mt-1 px-2 py-1 rounded border"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)" }}
            />
          </label>
        </div>
        <div className="pt-4 border-t" style={{ borderColor: "var(--bpm-border)" }}>
          <Metric label={label} value={value.toLocaleString("fr-FR")} delta={delta} />
        </div>
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Exemple Python
      </h2>
      <CodeBlock
        code={`import bpm

bpm.metric("Chiffre d'affaires", 142500, delta=3200)
bpm.metric("NPS", 72, delta=-3)`}
        language="python"
      />

      <div className="mt-8 flex gap-4">
        <Link href="/docs/components/button" className="underline" style={{ color: "var(--bpm-accent-cyan)" }}>
          bpm.button →
        </Link>
        <Link href="/docs/components" className="underline" style={{ color: "var(--bpm-text-secondary)" }}>
          Tous les composants
        </Link>
      </div>
    </div>
  );
}
