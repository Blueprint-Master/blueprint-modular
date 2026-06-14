"use client";

import { useState } from "react";
import Link from "next/link";
import { FAB } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  components: "Composants",
  description: "Bouton d’action flottant (FAB).",
  category: "Interaction",
  copy: "Copier",
  d_icon: "Icône (défaut : +).",
  d_label: "Accessibilité / title.",
  d_onClick: "Callback clic.",
};

const en: typeof fr = {
  components: "Components",
  description: "Floating action button (FAB).",
  category: "Interaction",
  copy: "Copy",
  d_icon: "Icon (default: +).",
  d_label: "Accessibility / title.",
  d_onClick: "Click callback.",
};

const L = { fr, en } as const;

export default function DocFABPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [position, setPosition] = useState<"bottom-right" | "bottom-left" | "top-right" | "top-left">("bottom-right");
  const pythonCode = "bpm.fab(position=\"" + position + "\", label=\"Action\")";
  const { prev, next } = getPrevNext("fab");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/composants">{t.components}</Link> → bpm.fab</div>
        <h1>bpm.fab</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">{t.category}</span></div>
      </div>
      <div className="sandbox-container">
        <div className="sandbox-preview" style={{ minHeight: 120 }}>
          <FAB position={position} label="Action" onClick={() => alert("FAB cliqué")} />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>position</label>
            <select value={position} onChange={(e) => setPosition(e.target.value as typeof position)}>
              <option value="bottom-right">bottom-right</option>
              <option value="bottom-left">bottom-left</option>
              <option value="top-right">top-right</option>
              <option value="top-left">top-left</option>
            </select>
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header"><span>Python</span><button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>{t.copy}</button></div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>
      <table className="props-table">
        <thead><tr><th>Prop</th><th>Type</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>icon</code></td><td>ReactNode</td><td>{t.d_icon}</td></tr>
          <tr><td><code>label</code></td><td>string</td><td>{t.d_label}</td></tr>
          <tr><td><code>onClick</code></td><td>function</td><td>{t.d_onClick}</td></tr>
          <tr><td><code>position</code></td><td>string</td><td>bottom-right | bottom-left | top-right | top-left.</td></tr>
        </tbody>
      </table>
      <nav className="doc-pagination mt-8">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
