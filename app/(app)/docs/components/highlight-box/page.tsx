"use client";

import { useState } from "react";
import Link from "next/link";
import { HighlightBox, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

const BAR_COLORS: { value: string; label: string }[] = [
  { value: "#212121", label: "Noir (défaut)" },
  { value: "#048dc3", label: "Bleu accent" },
  { value: "#1a4b8f", label: "Bleu foncé" },
  { value: "#0d9488", label: "Teal" },
  { value: "#15803d", label: "Vert" },
  { value: "#b45309", label: "Orange" },
  { value: "#b91c1c", label: "Rouge" },
  { value: "#7c3aed", label: "Violet" },
];

export default function DocHighlightBoxPage() {
  const [barColor, setBarColor] = useState("#212121");
  const { prev, next } = getPrevNext("highlight-box");

  const exampleRtb = [
    "+30% protéines vs classique",
    "Protéines pois & blé français",
    "Format tranché pratique",
    "Faible MG",
  ];
  const exampleCible = "Usage quotidien, entrée de gamme, recrutement large";

  const pythonBarColor = barColor === "#212121" ? "" : ", bar_color=\"" + barColor + "\"";

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">Composants</Link> → bpm.highlight-box
        </div>
        <h1>bpm.highlight-box</h1>
        <p className="doc-description">
          Carte avec barre latérale (numéro + label) et panneau de contenu structuré : titre, moment (optionnel), RTB et Cible.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Mise en page</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div className="w-full max-w-xl">
            <HighlightBox
              value={1}
              label="DAILY"
              title="Tranché hyperprotéiné (type dinde / poulet)"
              momentDescription="base quotidienne — petit-déjeuner salé, sandwich, collation"
              rtbPoints={exampleRtb}
              targetPoints={exampleCible}
              barColor={barColor}
            />
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>Couleur de la barre (barColor)</label>
            <select
              value={barColor}
              onChange={(e) => setBarColor(e.target.value)}
              className="w-full px-3 py-2 rounded border text-sm"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)", color: "var(--bpm-text-primary)" }}
            >
              {BAR_COLORS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>Ou hex personnalisé</label>
            <input
              type="text"
              value={barColor}
              onChange={(e) => setBarColor(e.target.value)}
              placeholder="#212121"
              className="w-full px-3 py-2 rounded border text-sm font-mono"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)", color: "var(--bpm-text-primary)" }}
            />
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
          </div>
          <pre><code>{`bpm.highlight_box(
  value=1,
  label="DAILY",
  title="Tranché hyperprotéiné (type dinde / poulet)",
  moment_description="base quotidienne — petit-déjeuner salé, sandwich, collation",
  rtb_points=["+30% protéines vs classique", "Protéines pois & blé français", "Format tranché pratique", "Faible MG"],
  target_points="Usage quotidien, entrée de gamme, recrutement large"${pythonBarColor}
)`}</code></pre>
        </div>
      </div>

      <table className="props-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Défaut</th>
            <th>Requis</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>value</code></td>
            <td><code>number</code></td>
            <td>—</td>
            <td>Oui</td>
            <td>Numéro affiché dans la barre gauche.</td>
          </tr>
          <tr>
            <td><code>label</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>Oui</td>
            <td>Texte sous le numéro (ex. &quot;DAILY&quot;).</td>
          </tr>
          <tr>
            <td><code>title</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>Oui</td>
            <td>Titre principal du contenu.</td>
          </tr>
          <tr>
            <td><code>momentDescription</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>Non</td>
            <td>Texte affiché après le libellé &quot;Moment :&quot; (en italique, gris).</td>
          </tr>
          <tr>
            <td><code>rtbPoints</code></td>
            <td><code>string[]</code></td>
            <td>—</td>
            <td>Non</td>
            <td>Points RTB (affichés séparés par ·).</td>
          </tr>
          <tr>
            <td><code>targetPoints</code></td>
            <td><code>string | string[]</code></td>
            <td>—</td>
            <td>Non</td>
            <td>Points Cible (chaîne ou liste).</td>
          </tr>
          <tr>
            <td><code>barColor</code></td>
            <td><code>string</code></td>
            <td>#212121</td>
            <td>Non</td>
            <td>Couleur de la barre latérale (hex, rgb ou nom CSS).</td>
          </tr>
          <tr>
            <td><code>className</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>Non</td>
            <td>Classes CSS additionnelles.</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemple minimal</h2>
      <CodeBlock
        code={'bpm.highlight_box(value=1, label="DAILY", title="Mon produit")'}
        language="python"
      />
      <h2 className="text-lg font-semibold mt-6 mb-2">Avec couleur de barre</h2>
      <CodeBlock
        code={'bpm.highlight_box(value=1, label="DAILY", title="Mon produit", bar_color="#048dc3")'}
        language="python"
      />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
