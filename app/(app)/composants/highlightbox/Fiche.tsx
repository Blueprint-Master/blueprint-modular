"use client";

import { useState } from "react";
import Link from "next/link";
import { HighlightBox, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  components: "Composants",
  description: "Carte avec barre latérale (numéro + label) et contenu structuré (titre, moment, RTB, cible).",
  category: "Mise en page",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  yes: "Oui",
  no: "Non",
  examples: "Exemples",
  optional: "Optionnel",
  targetExample: "Cible exemple",
  d_value: "Numéro affiché dans la barre gauche.",
  d_label: "Texte sous le numéro (ex. &quot;DAILY&quot;).",
  d_title: "Titre principal du contenu.",
  d_moment: "Texte affiché après le libellé &quot;Moment :&quot; (en italique, gris).",
  d_rtb: "Points RTB (affichés séparés par ·).",
  d_target: "Points Cible (chaîne ou liste).",
  d_barColor: "Couleur de la barre latérale (hex, rgb ou nom CSS).",
};

const en: typeof fr = {
  components: "Components",
  description: "Card with a side bar (number + label) and structured content (title, moment, RTB, target).",
  category: "Layout",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  yes: "Yes",
  no: "No",
  examples: "Examples",
  optional: "Optional",
  targetExample: "Target example",
  d_value: "Number shown in the left bar.",
  d_label: "Text below the number (e.g. &quot;DAILY&quot;).",
  d_title: "Main content title.",
  d_moment: "Text shown after the &quot;Moment:&quot; label (italic, grey).",
  d_rtb: "RTB points (shown separated by ·).",
  d_target: "Target points (string or list).",
  d_barColor: "Side bar color (hex, rgb or CSS name).",
};

const L = { fr, en } as const;

export default function DocHighlightboxPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [value, setValue] = useState(1);
  const [label, setLabel] = useState("DAILY");
  const [title, setTitle] = useState("Tranché hyperprotéiné");
  const [momentDescription, setMomentDescription] = useState("base quotidienne");
  const [barColor, setBarColor] = useState("#212121");

  const pyValue = value !== 1 ? `value=${value}, ` : "";
  const pyLabel = `label="${label.replace(/"/g, '\\"')}"`;
  const pyTitle = `, title="${title.replace(/"/g, '\\"')}"`;
  const pyMoment = momentDescription ? `, moment_description="${momentDescription.replace(/"/g, '\\"')}"` : "";
  const pyBar = barColor !== "#212121" ? `, bar_color="${barColor}"` : "";
  const pythonCode = `bpm.highlightBox(${pyValue}${pyLabel}${pyTitle}${pyMoment}${pyBar})`;
  const { prev, next } = getPrevNext("highlightbox");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/composants">{t.components}</Link> → bpm.highlightBox</div>
        <h1>bpm.highlightBox</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div style={{ maxWidth: 400 }}>
            <HighlightBox
              value={value}
              label={label}
              title={title}
              momentDescription={momentDescription || undefined}
              rtbPoints={["Point 1", "Point 2"]}
              targetPoints={t.targetExample}
              barColor={barColor}
            />
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>value</label>
            <input type="number" min={1} value={value} onChange={(e) => setValue(Number(e.target.value) || 1)} />
          </div>
          <div className="sandbox-control-group">
            <label>label</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>momentDescription</label>
            <input type="text" value={momentDescription} onChange={(e) => setMomentDescription(e.target.value)} placeholder={t.optional} />
          </div>
          <div className="sandbox-control-group">
            <label>barColor</label>
            <input type="text" value={barColor} onChange={(e) => setBarColor(e.target.value)} placeholder="#212121" />
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>{t.copy}</button>
          </div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>

      <table className="props-table">
        <thead>
          <tr><th>Prop</th><th>Type</th><th>{t.thDefault}</th><th>{t.thRequired}</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>value</code></td><td><code>number</code></td><td>—</td><td>{t.yes}</td><td>{t.d_value}</td></tr>
          <tr><td><code>label</code></td><td><code>string</code></td><td>—</td><td>{t.yes}</td><td>{t.d_label}</td></tr>
          <tr><td><code>title</code></td><td><code>string</code></td><td>—</td><td>{t.yes}</td><td>{t.d_title}</td></tr>
          <tr><td><code>momentDescription</code></td><td><code>string | null</code></td><td>—</td><td>{t.no}</td><td>{t.d_moment}</td></tr>
          <tr><td><code>rtbPoints</code></td><td><code>string[] | null</code></td><td>—</td><td>{t.no}</td><td>{t.d_rtb}</td></tr>
          <tr><td><code>targetPoints</code></td><td><code>string | string[] | null</code></td><td>—</td><td>{t.no}</td><td>{t.d_target}</td></tr>
          <tr><td><code>barColor</code></td><td><code>string | null</code></td><td>#212121</td><td>{t.no}</td><td>{t.d_barColor}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'bpm.highlightBox(value=1, label="DAILY", title="Produit phare")'} language="python" />
      <CodeBlock code={'bpm.highlightBox(value=2, label="WEEKLY", title="Objectif", moment_description="ce mois", bar_color="#048dc3")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
