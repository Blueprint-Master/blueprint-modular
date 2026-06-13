"use client";

import { useState } from "react";
import Link from "next/link";
import { HighlightBox, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const BAR_COLOR_VALUES = ["#212121", "#048dc3", "#1a4b8f", "#0d9488", "#15803d", "#b45309", "#b91c1c", "#7c3aed"] as const;

const fr = {
  components: "Composants",
  description: "Carte avec barre latérale (numéro + label) et panneau de contenu structuré : titre, moment (optionnel), RTB et Cible.",
  category: "Mise en page",
  thDefault: "Défaut",
  thRequired: "Requis",
  yes: "Oui",
  no: "Non",
  barColorLabel: "Couleur de la barre (barColor)",
  customHexLabel: "Ou hex personnalisé",
  exampleMinimal: "Exemple minimal",
  withBarColor: "Avec couleur de barre",
  c_black: "Noir (défaut)",
  c_accentBlue: "Bleu accent",
  c_darkBlue: "Bleu foncé",
  c_teal: "Teal",
  c_green: "Vert",
  c_orange: "Orange",
  c_red: "Rouge",
  c_purple: "Violet",
  d_value: "Numéro affiché dans la barre gauche.",
  d_label: "Texte sous le numéro (ex. &quot;DAILY&quot;).",
  d_title: "Titre principal du contenu.",
  d_moment: "Texte affiché après le libellé &quot;Moment :&quot; (en italique, gris).",
  d_rtb: "Points RTB (affichés séparés par ·).",
  d_target: "Points Cible (chaîne ou liste).",
  d_barColor: "Couleur de la barre latérale (hex, rgb ou nom CSS).",
  d_className: "Classes CSS additionnelles.",
};

const en: typeof fr = {
  components: "Components",
  description: "Card with a side bar (number + label) and a structured content panel: title, moment (optional), RTB and Target.",
  category: "Layout",
  thDefault: "Default",
  thRequired: "Required",
  yes: "Yes",
  no: "No",
  barColorLabel: "Bar color (barColor)",
  customHexLabel: "Or custom hex",
  exampleMinimal: "Minimal example",
  withBarColor: "With bar color",
  c_black: "Black (default)",
  c_accentBlue: "Accent blue",
  c_darkBlue: "Dark blue",
  c_teal: "Teal",
  c_green: "Green",
  c_orange: "Orange",
  c_red: "Red",
  c_purple: "Purple",
  d_value: "Number shown in the left bar.",
  d_label: "Text below the number (e.g. &quot;DAILY&quot;).",
  d_title: "Main content title.",
  d_moment: "Text shown after the &quot;Moment:&quot; label (italic, grey).",
  d_rtb: "RTB points (shown separated by ·).",
  d_target: "Target points (string or list).",
  d_barColor: "Side bar color (hex, rgb or CSS name).",
  d_className: "Additional CSS classes.",
};

const L = { fr, en } as const;

export default function DocHighlightBoxPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [barColor, setBarColor] = useState("#212121");
  const { prev, next } = getPrevNext("highlight-box");

  const barColorLabels = [t.c_black, t.c_accentBlue, t.c_darkBlue, t.c_teal, t.c_green, t.c_orange, t.c_red, t.c_purple];
  const barColors = BAR_COLOR_VALUES.map((value, i) => ({ value, label: barColorLabels[i] }));

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
          <Link href="/docs/components">{t.components}</Link> → bpm.highlight-box
        </div>
        <h1>bpm.highlight-box</h1>
        <p className="doc-description">
          {t.description}
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
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
            <label>{t.barColorLabel}</label>
            <select
              value={barColor}
              onChange={(e) => setBarColor(e.target.value)}
              className="w-full px-3 py-2 rounded border text-sm"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)", color: "var(--bpm-text-primary)" }}
            >
              {barColors.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>{t.customHexLabel}</label>
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
            <th>{t.thDefault}</th>
            <th>{t.thRequired}</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>value</code></td>
            <td><code>number</code></td>
            <td>—</td>
            <td>{t.yes}</td>
            <td>{t.d_value}</td>
          </tr>
          <tr>
            <td><code>label</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>{t.yes}</td>
            <td>{t.d_label}</td>
          </tr>
          <tr>
            <td><code>title</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>{t.yes}</td>
            <td>{t.d_title}</td>
          </tr>
          <tr>
            <td><code>momentDescription</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.d_moment}</td>
          </tr>
          <tr>
            <td><code>rtbPoints</code></td>
            <td><code>string[]</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.d_rtb}</td>
          </tr>
          <tr>
            <td><code>targetPoints</code></td>
            <td><code>string | string[]</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.d_target}</td>
          </tr>
          <tr>
            <td><code>barColor</code></td>
            <td><code>string</code></td>
            <td>#212121</td>
            <td>{t.no}</td>
            <td>{t.d_barColor}</td>
          </tr>
          <tr>
            <td><code>className</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.d_className}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.exampleMinimal}</h2>
      <CodeBlock
        code={'bpm.highlight_box(value=1, label="DAILY", title="Mon produit")'}
        language="python"
      />
      <h2 className="text-lg font-semibold mt-6 mb-2">{t.withBarColor}</h2>
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
