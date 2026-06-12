"use client";

import { useState } from "react";
import Link from "next/link";
import { Title1, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocTitle1Page() {
  const [children, setChildren] = useState("Rapport annuel 2025");
  const [bold, setBold] = useState<string>("");
  const [color, setColor] = useState("");
  const [bar, setBar] = useState(false);
  const [barColor, setBarColor] = useState("");
  const [inverted, setInverted] = useState(false);
  const [invertedBackground, setInvertedBackground] = useState("");

  const boldProp = bold === "true" ? true : bold === "false" ? false : null;
  const colorProp = color.trim() || null;
  const barColorProp = barColor.trim() || null;
  const invertedBgProp = invertedBackground.trim() || null;

  const args: string[] = [`"${children.replace(/"/g, '\\"')}"`];
  if (bold === "true") args.push("bold=True");
  if (bold === "false") args.push("bold=False");
  if (colorProp) args.push(`color="${colorProp.replace(/"/g, '\\"')}"`);
  if (bar) args.push("bar=True");
  if (bar && barColorProp) args.push(`bar_color="${barColorProp.replace(/"/g, '\\"')}"`);
  if (inverted) args.push("inverted=True");
  if (inverted && invertedBgProp) args.push(`inverted_background="${invertedBgProp.replace(/"/g, '\\"')}"`);
  const pythonCode = `bpm.title1(${args.join(", ")})`;
  const { prev, next } = getPrevNext("title1");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">Composants</Link> → bpm.title1
        </div>
        <h1>bpm.title1</h1>
        <p className="doc-description">
          Titre de niveau 1 (h1, 1.875rem, gras 700). Raccourci de{" "}
          <Link href="/docs/components/title">bpm.title</Link> avec <code>level=1</code> préréglé :
          mêmes options (gras, couleur, barre, inversé), sans avoir à préciser le niveau.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Affichage de données</span>
          <span className="doc-reading-time">⏱ 1 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Title1
            bold={boldProp === null ? undefined : boldProp}
            color={colorProp}
            bar={bar}
            barColor={barColorProp}
            inverted={inverted}
            invertedBackground={invertedBgProp}
          >
            {children}
          </Title1>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>children</label>
            <input type="text" value={children} onChange={(e) => setChildren(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>bold (optionnel)</label>
            <select value={bold} onChange={(e) => setBold(e.target.value)}>
              <option value="">Défaut du niveau (700)</option>
              <option value="true">Oui (700)</option>
              <option value="false">Non (400)</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>color (optionnel)</label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="ex. var(--bpm-accent), #333"
            />
          </div>
          <div className="sandbox-control-group">
            <label>bar (optionnel)</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={bar} onChange={(e) => setBar(e.target.checked)} />
              Barre verticale à gauche
            </label>
          </div>
          <div className="sandbox-control-group">
            <label>inverted (optionnel)</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={inverted} onChange={(e) => setInverted(e.target.checked)} />
              Couleur inversée (blanc sur fond sombre)
            </label>
          </div>
          {bar && (
            <div className="sandbox-control-group">
              <label>barColor (optionnel)</label>
              <input
                type="text"
                value={barColor}
                onChange={(e) => setBarColor(e.target.value)}
                placeholder="ex. #048dc3, #1d1d1f"
              />
            </div>
          )}
          {inverted && (
            <div className="sandbox-control-group">
              <label>invertedBackground (optionnel)</label>
              <input
                type="text"
                value={invertedBackground}
                onChange={(e) => setInvertedBackground(e.target.value)}
                placeholder="ex. #1d1d1f, #048dc3"
              />
            </div>
          )}
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>Copier</button>
          </div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>

      <table className="props-table">
        <thead>
          <tr><th>Prop</th><th>Type</th><th>Défaut</th><th>Requis</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>children</code></td><td><code>ReactNode</code></td><td>—</td><td>Oui</td><td>Texte du titre.</td></tr>
          <tr><td><code>size</code></td><td><code>string</code></td><td>1.875rem</td><td>Non</td><td>Taille CSS — surcharge le défaut du niveau 1.</td></tr>
          <tr><td><code>bold</code></td><td><code>boolean | number</code></td><td>700</td><td>Non</td><td>Gras : true=700, false=400, ou nombre.</td></tr>
          <tr><td><code>color</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Couleur CSS du texte.</td></tr>
          <tr><td><code>bar</code></td><td><code>boolean</code></td><td>false</td><td>Non</td><td>Barre verticale sombre à gauche (style en-tête de section).</td></tr>
          <tr><td><code>barColor</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Couleur de la barre. Pris en compte si bar=True.</td></tr>
          <tr><td><code>inverted</code></td><td><code>boolean</code></td><td>false</td><td>Non</td><td>Fond sombre, texte blanc (style badge / scénario).</td></tr>
          <tr><td><code>invertedBackground</code></td><td><code>string</code></td><td>#1d1d1f</td><td>Non</td><td>Couleur de fond quand inverted=True.</td></tr>
          <tr><td><code>logoUrl</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>URL d&apos;un logo affiché à gauche (spécifique au niveau 1).</td></tr>
          <tr><td><code>onLogoClick</code></td><td><code>() =&gt; void</code></td><td>—</td><td>Non</td><td>Callback au clic sur le logo.</td></tr>
        </tbody>
      </table>
      <p className="text-sm mt-2">
        Toutes les props de <Link href="/docs/components/title">bpm.title</Link> s&apos;appliquent,
        à l&apos;exception de <code>level</code> qui est fixé à 1.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'bpm.title1("Rapport annuel 2025")'} language="python" />
      <CodeBlock code={'bpm.title1("Tableau de bord production", bar=True, bar_color="#048dc3")'} language="python" />
      <CodeBlock code={'# Équivalent explicite avec bpm.title\nbpm.title(level=1, content="Rapport annuel 2025")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
