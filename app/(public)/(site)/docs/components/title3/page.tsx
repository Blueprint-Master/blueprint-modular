"use client";

import { useState } from "react";
import Link from "next/link";
import { Title3, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  breadcrumb: "Composants",
  desc1: "Titre de niveau 3 (h3, 1.25rem, gras 600). Raccourci de ",
  desc2: " avec ",
  desc3: " préréglé : mêmes options (gras, couleur, barre, inversé), sans avoir à préciser le niveau.",
  category: "Affichage de données",
  demoTitle: "Détail par région",
  boldLabel: "bold (optionnel)",
  boldDefault: "Défaut du niveau (600)",
  boldYes: "Oui (700)",
  boldNo: "Non (400)",
  colorLabel: "color (optionnel)",
  colorPlaceholder: "ex. var(--bpm-accent), #333",
  barLabel: "bar (optionnel)",
  barText: "Barre verticale à gauche",
  invertedLabel: "inverted (optionnel)",
  invertedText: "Couleur inversée (blanc sur fond sombre)",
  barColorLabel: "barColor (optionnel)",
  barColorPlaceholder: "ex. #048dc3, #1d1d1f",
  invertedBackgroundLabel: "invertedBackground (optionnel)",
  invertedBackgroundPlaceholder: "ex. #1d1d1f, #048dc3",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  thDescription: "Description",
  yes: "Oui",
  no: "Non",
  childrenDesc: "Texte du titre.",
  sizeDesc: "Taille CSS — surcharge le défaut du niveau 3.",
  boldDesc: "Gras : true=700, false=400, ou nombre.",
  colorDesc: "Couleur CSS du texte.",
  barDesc: "Barre verticale sombre à gauche (style en-tête de section).",
  barColorDesc: "Couleur de la barre. Pris en compte si bar=True.",
  invertedDesc: "Fond sombre, texte blanc (style badge / scénario).",
  invertedBackgroundDesc: "Couleur de fond quand inverted=True.",
  note1: "Toutes les props de ",
  note2: " s'appliquent, à l'exception de ",
  note3: " qui est fixé à 3 (et de ",
  note4: ", réservé au niveau 1).",
  examples: "Exemples",
};

const en: typeof fr = {
  breadcrumb: "Components",
  desc1: "Level 3 heading (h3, 1.25rem, weight 600). Shorthand for ",
  desc2: " with ",
  desc3: " preset: same options (bold, color, bar, inverted), without having to specify the level.",
  category: "Data display",
  demoTitle: "Breakdown by region",
  boldLabel: "bold (optional)",
  boldDefault: "Level default (600)",
  boldYes: "Yes (700)",
  boldNo: "No (400)",
  colorLabel: "color (optional)",
  colorPlaceholder: "e.g. var(--bpm-accent), #333",
  barLabel: "bar (optional)",
  barText: "Vertical bar on the left",
  invertedLabel: "inverted (optional)",
  invertedText: "Inverted color (white on a dark background)",
  barColorLabel: "barColor (optional)",
  barColorPlaceholder: "e.g. #048dc3, #1d1d1f",
  invertedBackgroundLabel: "invertedBackground (optional)",
  invertedBackgroundPlaceholder: "e.g. #1d1d1f, #048dc3",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  thDescription: "Description",
  yes: "Yes",
  no: "No",
  childrenDesc: "Heading text.",
  sizeDesc: "CSS size — overrides the level 3 default.",
  boldDesc: "Bold: true=700, false=400, or a number.",
  colorDesc: "CSS color of the text.",
  barDesc: "Dark vertical bar on the left (section header style).",
  barColorDesc: "Bar color. Applied when bar=True.",
  invertedDesc: "Dark background, white text (badge / scenario style).",
  invertedBackgroundDesc: "Background color when inverted=True.",
  note1: "All props of ",
  note2: " apply, except ",
  note3: ", which is fixed to 3 (and ",
  note4: ", reserved for level 1).",
  examples: "Examples",
};

const L = { fr, en } as const;

export default function DocTitle3Page() {
  const { locale } = useI18n();
  const t = L[locale];
  const [children, setChildren] = useState<string | null>(null);
  const [bold, setBold] = useState<string>("");
  const [color, setColor] = useState("");
  const [bar, setBar] = useState(false);
  const [barColor, setBarColor] = useState("");
  const [inverted, setInverted] = useState(false);
  const [invertedBackground, setInvertedBackground] = useState("");

  const text = children ?? t.demoTitle;
  const boldProp = bold === "true" ? true : bold === "false" ? false : null;
  const colorProp = color.trim() || null;
  const barColorProp = barColor.trim() || null;
  const invertedBgProp = invertedBackground.trim() || null;

  const args: string[] = [`"${text.replace(/"/g, '\\"')}"`];
  if (bold === "true") args.push("bold=True");
  if (bold === "false") args.push("bold=False");
  if (colorProp) args.push(`color="${colorProp.replace(/"/g, '\\"')}"`);
  if (bar) args.push("bar=True");
  if (bar && barColorProp) args.push(`bar_color="${barColorProp.replace(/"/g, '\\"')}"`);
  if (inverted) args.push("inverted=True");
  if (inverted && invertedBgProp) args.push(`inverted_background="${invertedBgProp.replace(/"/g, '\\"')}"`);
  const pythonCode = `bpm.title3(${args.join(", ")})`;
  const { prev, next } = getPrevNext("title3");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">{t.breadcrumb}</Link> → bpm.title3
        </div>
        <h1>bpm.title3</h1>
        <p className="doc-description">
          {t.desc1}
          <Link href="/docs/components/title">bpm.title</Link>
          {t.desc2}
          <code>level=3</code>
          {t.desc3}
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 1 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Title3
            bold={boldProp === null ? undefined : boldProp}
            color={colorProp}
            bar={bar}
            barColor={barColorProp}
            inverted={inverted}
            invertedBackground={invertedBgProp}
          >
            {text}
          </Title3>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>children</label>
            <input type="text" value={text} onChange={(e) => setChildren(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>{t.boldLabel}</label>
            <select value={bold} onChange={(e) => setBold(e.target.value)}>
              <option value="">{t.boldDefault}</option>
              <option value="true">{t.boldYes}</option>
              <option value="false">{t.boldNo}</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>{t.colorLabel}</label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder={t.colorPlaceholder}
            />
          </div>
          <div className="sandbox-control-group">
            <label>{t.barLabel}</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={bar} onChange={(e) => setBar(e.target.checked)} />
              {t.barText}
            </label>
          </div>
          <div className="sandbox-control-group">
            <label>{t.invertedLabel}</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={inverted} onChange={(e) => setInverted(e.target.checked)} />
              {t.invertedText}
            </label>
          </div>
          {bar && (
            <div className="sandbox-control-group">
              <label>{t.barColorLabel}</label>
              <input
                type="text"
                value={barColor}
                onChange={(e) => setBarColor(e.target.value)}
                placeholder={t.barColorPlaceholder}
              />
            </div>
          )}
          {inverted && (
            <div className="sandbox-control-group">
              <label>{t.invertedBackgroundLabel}</label>
              <input
                type="text"
                value={invertedBackground}
                onChange={(e) => setInvertedBackground(e.target.value)}
                placeholder={t.invertedBackgroundPlaceholder}
              />
            </div>
          )}
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
          <tr><th>Prop</th><th>Type</th><th>{t.thDefault}</th><th>{t.thRequired}</th><th>{t.thDescription}</th></tr>
        </thead>
        <tbody>
          <tr><td><code>children</code></td><td><code>ReactNode</code></td><td>—</td><td>{t.yes}</td><td>{t.childrenDesc}</td></tr>
          <tr><td><code>size</code></td><td><code>string</code></td><td>1.25rem</td><td>{t.no}</td><td>{t.sizeDesc}</td></tr>
          <tr><td><code>bold</code></td><td><code>boolean | number</code></td><td>600</td><td>{t.no}</td><td>{t.boldDesc}</td></tr>
          <tr><td><code>color</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.colorDesc}</td></tr>
          <tr><td><code>bar</code></td><td><code>boolean</code></td><td>false</td><td>{t.no}</td><td>{t.barDesc}</td></tr>
          <tr><td><code>barColor</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.barColorDesc}</td></tr>
          <tr><td><code>inverted</code></td><td><code>boolean</code></td><td>false</td><td>{t.no}</td><td>{t.invertedDesc}</td></tr>
          <tr><td><code>invertedBackground</code></td><td><code>string</code></td><td>#1d1d1f</td><td>{t.no}</td><td>{t.invertedBackgroundDesc}</td></tr>
        </tbody>
      </table>
      <p className="text-sm mt-2">
        {t.note1}
        <Link href="/docs/components/title">bpm.title</Link>
        {t.note2}
        <code>level</code>
        {t.note3}
        <code>logoUrl</code>
        {t.note4}
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'bpm.title3("Détail par région")'} language="python" />
      <CodeBlock code={'bpm.title3("SCÉNARIO 2", inverted=True, inverted_background="#048dc3")'} language="python" />
      <CodeBlock code={'# Équivalent explicite avec bpm.title\nbpm.title(level=3, content="Détail par région")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
