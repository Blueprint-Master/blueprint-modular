"use client";

import { useState } from "react";
import Link from "next/link";
import { Spinner, Selectbox, Input, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

type SpinnerSize = "small" | "medium" | "large";
type SpinnerVariant = "circle" | "dot" | "wheel" | "pulse" | "bars" | "dualRing" | "dotsRing" | "isoBlocks" | "modularRings" | "hexSegments" | "modularGrid";

const VARIANT_OPTIONS: { value: SpinnerVariant; label: string }[] = [
  { value: "circle", label: "circle" },
  { value: "dot", label: "dot" },
  { value: "wheel", label: "wheel" },
  { value: "pulse", label: "pulse" },
  { value: "bars", label: "bars" },
  { value: "dualRing", label: "dualRing" },
  { value: "dotsRing", label: "dotsRing" },
  { value: "isoBlocks", label: "isoBlocks" },
  { value: "modularRings", label: "modularRings" },
  { value: "hexSegments", label: "hexSegments" },
  { value: "modularGrid", label: "modularGrid" },
];

const SIZE_OPTIONS: { value: SpinnerSize; label: string }[] = [
  { value: "small", label: "small" },
  { value: "medium", label: "medium" },
  { value: "large", label: "large" },
];

const fr = {
  breadcrumb: "Composants",
  description: "Indicateur de chargement : circle, dot, wheel, pulse, bars, dualRing, dotsRing, isoBlocks, modularRings, hexSegments, modularGrid. Tous utilisent la couleur d’accent (sauf neutral).",
  category: "Feedback",
  choose: "Choisir",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  no: "Non",
  examples: "Exemples",
  descVariant: "Style du spinner (couleur d’accent).",
  descText: "Texte sous le spinner.",
  descSize: "Taille du spinner.",
  descNeutral: "Si true, utilise la couleur texte (gris) au lieu de l’accent.",
  descClassName: "Classes CSS additionnelles.",
  defaultText: "Chargement...",
};
const en: typeof fr = {
  breadcrumb: "Components",
  description: "Loading indicator: circle, dot, wheel, pulse, bars, dualRing, dotsRing, isoBlocks, modularRings, hexSegments, modularGrid. All use the accent color (except neutral).",
  category: "Feedback",
  choose: "Choose",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  no: "No",
  examples: "Examples",
  descVariant: "Spinner style (accent color).",
  descText: "Text below the spinner.",
  descSize: "Spinner size.",
  descNeutral: "If true, uses the text color (gray) instead of the accent.",
  descClassName: "Additional CSS classes.",
  defaultText: "Loading...",
};
const L = { fr, en } as const;

export default function DocSpinnerPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [text, setText] = useState("Chargement...");
  const [size, setSize] = useState<SpinnerSize>("medium");
  const [variant, setVariant] = useState<SpinnerVariant>("circle");

  const pythonCode =
    "bpm.spinner(text=\"" + text.replace(/"/g, '\\"') + "\", size=\"" + size + "\", variant=\"" + variant + "\")";

  const { prev, next } = getPrevNext("spinner");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/composants">{t.breadcrumb}</Link> → bpm.spinner</div>
        <h1>bpm.spinner</h1>
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
        <div className="sandbox-preview sandbox-preview--spinner">
          <Spinner text={text} size={size} variant={variant} />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>Variant</label>
            <Selectbox
              options={VARIANT_OPTIONS}
              value={variant}
              onChange={(v) => setVariant(v as SpinnerVariant)}
              placeholder={t.choose}
            />
          </div>
          <div className="sandbox-control-group">
            <label>Text</label>
            <Input type="text" value={text} onChange={setText} />
          </div>
          <div className="sandbox-control-group">
            <label>Size</label>
            <Selectbox
              options={SIZE_OPTIONS}
              value={size}
              onChange={(v) => setSize(v as SpinnerSize)}
              placeholder={t.choose}
            />
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
          <tr>
            <td><code>variant</code></td>
            <td><code>&#39;circle&#39; | &#39;dot&#39; | &#39;wheel&#39; | &#39;pulse&#39; | &#39;bars&#39; | &#39;dualRing&#39; | &#39;dotsRing&#39; | &#39;isoBlocks&#39; | &#39;modularRings&#39; | &#39;hexSegments&#39; | &#39;modularGrid&#39;</code></td>
            <td><code>&#39;circle&#39;</code></td>
            <td>{t.no}</td>
            <td>{t.descVariant}</td>
          </tr>
          <tr>
            <td><code>text</code></td>
            <td><code>string</code></td>
            <td><code>&#39;{t.defaultText}&#39;</code></td>
            <td>{t.no}</td>
            <td>{t.descText}</td>
          </tr>
          <tr>
            <td><code>size</code></td>
            <td><code>&#39;small&#39; | &#39;medium&#39; | &#39;large&#39;</code></td>
            <td><code>&#39;medium&#39;</code></td>
            <td>{t.no}</td>
            <td>{t.descSize}</td>
          </tr>
          <tr>
            <td><code>neutral</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>{t.no}</td>
            <td>{t.descNeutral}</td>
          </tr>
          <tr>
            <td><code>className</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.descClassName}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'bpm.spinner(text="Analyse en cours...", size="large")'} language="python" />
      <CodeBlock code={'bpm.spinner(variant="dot", text="Chargement…")'} language="python" />
      <CodeBlock code={'bpm.spinner(variant="dualRing", size="medium")'} language="python" />
      <CodeBlock code={'bpm.spinner(variant="isoBlocks", text="Chargement…")'} language="python" />
      <CodeBlock code={'bpm.spinner(variant="modularGrid", size="large")'} language="python" />
      <CodeBlock code="bpm.spinner()  # Circle, texte par défaut, taille medium" language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
