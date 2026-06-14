"use client";

import { useState } from "react";
import Link from "next/link";
import { Title, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

type Level = 1 | 2 | 3 | 4;

const fr = {
  breadcrumb: "Composants",
  description: "Titre (alias bpm.title, niveaux 1 à 4).",
  category: "Affichage de données",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  yes: "Oui",
  no: "Non",
  examples: "Exemples",
  childrenLabel: "children (texte)",
  descChildren: "Texte du titre.",
  descLevel: "Niveau hiérarchique.",
  descSize: "Taille de police (surcharge le défaut du niveau).",
  descBold: "Gras (true = 700, false = 400).",
  descColor: "Couleur du texte.",
  descBar: "Barre verticale à gauche du titre.",
  descBarColor: "Couleur de la barre (si bar=true).",
  descInverted: "Fond sombre, texte blanc.",
  descInvertedBg: "Couleur de fond quand inverted=true.",
  descLogoUrl: "URL logo (affiché seulement si level=1).",
  descOnLogoClick: "Clic sur le logo.",
};
const en: typeof fr = {
  breadcrumb: "Components",
  description: "Title (alias of bpm.title, levels 1 to 4).",
  category: "Data display",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  yes: "Yes",
  no: "No",
  examples: "Examples",
  childrenLabel: "children (text)",
  descChildren: "Title text.",
  descLevel: "Hierarchical level.",
  descSize: "Font size (overrides the level default).",
  descBold: "Weight (true = 700, false = 400).",
  descColor: "Text color.",
  descBar: "Vertical bar on the left of the title.",
  descBarColor: "Bar color (when bar=true).",
  descInverted: "Dark background, white text.",
  descInvertedBg: "Background color when inverted=true.",
  descLogoUrl: "Logo URL (shown only when level=1).",
  descOnLogoClick: "Logo click handler.",
};
const L = { fr, en } as const;

export default function DocTitleBpmPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [children, setChildren] = useState("Titre de la page");
  const [level, setLevel] = useState<Level>(1);
  const [bar, setBar] = useState(false);
  const [inverted, setInverted] = useState(false);

  const pyLevel = level !== 1 ? `, level=${level}` : "";
  const pyBar = bar ? ", bar=True" : "";
  const pyInverted = inverted ? ", inverted=True" : "";
  const pythonCode = `bpm.titleBpm("${children.replace(/"/g, '\\"')}"${pyLevel}${pyBar}${pyInverted})`;
  const { prev, next } = getPrevNext("titlebpm");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/composants">{t.breadcrumb}</Link> → bpm.titleBpm</div>
        <h1>bpm.titleBpm</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Title level={level} bar={bar} inverted={inverted}>
            {children}
          </Title>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>{t.childrenLabel}</label>
            <input type="text" value={children} onChange={(e) => setChildren(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>level</label>
            <select value={level} onChange={(e) => setLevel(Number(e.target.value) as Level)}>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>bar</label>
            <select value={bar ? "true" : "false"} onChange={(e) => setBar(e.target.value === "true")}>
              <option value="false">false</option>
              <option value="true">true</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>inverted</label>
            <select value={inverted ? "true" : "false"} onChange={(e) => setInverted(e.target.value === "true")}>
              <option value="false">false</option>
              <option value="true">true</option>
            </select>
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
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>{t.thDefault}</th>
            <th>{t.thRequired}</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>children</code></td><td><code>ReactNode</code></td><td>—</td><td>{t.yes}</td><td>{t.descChildren}</td></tr>
          <tr><td><code>level</code></td><td><code>1 | 2 | 3 | 4</code></td><td>1</td><td>{t.no}</td><td>{t.descLevel}</td></tr>
          <tr><td><code>size</code></td><td><code>string | null</code></td><td>—</td><td>{t.no}</td><td>{t.descSize}</td></tr>
          <tr><td><code>bold</code></td><td><code>boolean | number | null</code></td><td>—</td><td>{t.no}</td><td>{t.descBold}</td></tr>
          <tr><td><code>color</code></td><td><code>string | null</code></td><td>—</td><td>{t.no}</td><td>{t.descColor}</td></tr>
          <tr><td><code>bar</code></td><td><code>boolean</code></td><td>false</td><td>{t.no}</td><td>{t.descBar}</td></tr>
          <tr><td><code>barColor</code></td><td><code>string | null</code></td><td>—</td><td>{t.no}</td><td>{t.descBarColor}</td></tr>
          <tr><td><code>inverted</code></td><td><code>boolean</code></td><td>false</td><td>{t.no}</td><td>{t.descInverted}</td></tr>
          <tr><td><code>invertedBackground</code></td><td><code>string | null</code></td><td>—</td><td>{t.no}</td><td>{t.descInvertedBg}</td></tr>
          <tr><td><code>logoUrl</code></td><td><code>string | null</code></td><td>—</td><td>{t.no}</td><td>{t.descLogoUrl}</td></tr>
          <tr><td><code>onLogoClick</code></td><td><code>() =&gt; void</code></td><td>—</td><td>{t.no}</td><td>{t.descOnLogoClick}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'bpm.titleBpm("Dashboard Production")'} language="python" />
      <CodeBlock code={'bpm.titleBpm("Section", level=2)'} language="python" />
      <CodeBlock code={'bpm.titleBpm("Encadré", level=3, bar=True)'} language="python" />
      <CodeBlock code={'bpm.titleBpm("Badge", inverted=True)'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
