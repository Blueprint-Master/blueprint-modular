"use client";

import { useState } from "react";
import Link from "next/link";
import { Transition, Selectbox, Button, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

type TransitionVariant = "fade" | "shimmer" | "border" | "grid";

const VARIANT_OPTIONS: { value: TransitionVariant; label: string }[] = [
  { value: "fade", label: "fade" },
  { value: "shimmer", label: "shimmer" },
  { value: "border", label: "border" },
  { value: "grid", label: "grid" },
];

const fr = {
  breadcrumb: "Composants",
  description: "Transition entre vues : fade (slide + opacity), shimmer (ligne lumineuse), border (contour animé), grid (masque en grille).",
  category: "Mise en page",
  page1Content: "Contenu de la première vue.",
  page2Content: "Contenu de la deuxième vue.",
  page3Content: "Contenu de la troisième vue.",
  chooser: "Choisir",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  yes: "Oui",
  no: "Non",
  examples: "Exemples",
  descActiveIndex: "Index de la vue active (0-based).",
  descChildren: "Tableau de nœuds (une « page » par entrée).",
  descVariant: "Type d'animation entre les vues.",
  descDuration: "Durée de la transition fade (ms).",
  descOnTransitionEnd: "Callback à la fin de la transition.",
  descClassName: "Classes CSS additionnelles.",
};
const en: typeof fr = {
  breadcrumb: "Components",
  description: "Transition between views: fade (slide + opacity), shimmer (light line), border (animated outline), grid (grid mask).",
  category: "Layout",
  page1Content: "Content of the first view.",
  page2Content: "Content of the second view.",
  page3Content: "Content of the third view.",
  chooser: "Choose",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  yes: "Yes",
  no: "No",
  examples: "Examples",
  descActiveIndex: "Index of the active view (0-based).",
  descChildren: "Array of nodes (one \"page\" per entry).",
  descVariant: "Animation type between views.",
  descDuration: "Duration of the fade transition (ms).",
  descOnTransitionEnd: "Callback at the end of the transition.",
  descClassName: "Additional CSS classes.",
};
const L = { fr, en } as const;

export default function DocTransitionPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const PAGES = [
    <div key="1" className="p-6 rounded-lg text-center" style={{ background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)" }}>
      <strong>Page 1</strong>
      <p className="mt-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>{t.page1Content}</p>
    </div>,
    <div key="2" className="p-6 rounded-lg text-center" style={{ background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)" }}>
      <strong>Page 2</strong>
      <p className="mt-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>{t.page2Content}</p>
    </div>,
    <div key="3" className="p-6 rounded-lg text-center" style={{ background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)" }}>
      <strong>Page 3</strong>
      <p className="mt-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>{t.page3Content}</p>
    </div>,
  ];
  const [activeIndex, setActiveIndex] = useState(0);
  const [variant, setVariant] = useState<TransitionVariant>("fade");

  const pythonCode =
    "bpm.transition(active_index=" + activeIndex + ", variant=\"" + variant + "\", children=[...])";

  const { prev, next } = getPrevNext("transition");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">{t.breadcrumb}</Link> → bpm.transition
        </div>
        <h1>bpm.transition</h1>
        <p className="doc-description">
          {t.description}
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview sandbox-preview--transition">
          <div style={{ minHeight: 120, position: "relative", overflow: "hidden" }}>
            <Transition activeIndex={activeIndex} variant={variant}>
              {PAGES}
            </Transition>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {[0, 1, 2].map((i) => (
              <Button
                key={i}
                size="small"
                variant={activeIndex === i ? "primary" : "secondary"}
                onClick={() => setActiveIndex(i)}
              >
                Page {i + 1}
              </Button>
            ))}
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>Variant</label>
            <Selectbox
              options={VARIANT_OPTIONS}
              value={variant}
              onChange={(v) => setVariant(v as TransitionVariant)}
              placeholder={t.chooser}
            />
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>
              {t.copy}
            </button>
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
            <td><code>activeIndex</code></td>
            <td><code>number</code></td>
            <td>—</td>
            <td>{t.yes}</td>
            <td>{t.descActiveIndex}</td>
          </tr>
          <tr>
            <td><code>children</code></td>
            <td><code>ReactNode[]</code></td>
            <td>—</td>
            <td>{t.yes}</td>
            <td>{t.descChildren}</td>
          </tr>
          <tr>
            <td><code>variant</code></td>
            <td><code>&#39;fade&#39; | &#39;shimmer&#39; | &#39;border&#39; | &#39;grid&#39;</code></td>
            <td><code>&#39;fade&#39;</code></td>
            <td>{t.no}</td>
            <td>{t.descVariant}</td>
          </tr>
          <tr>
            <td><code>duration</code></td>
            <td><code>number</code></td>
            <td><code>380</code></td>
            <td>{t.no}</td>
            <td>{t.descDuration}</td>
          </tr>
          <tr>
            <td><code>onTransitionEnd</code></td>
            <td><code>() =&gt; void</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.descOnTransitionEnd}</td>
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
      <CodeBlock code={'bpm.transition(active_index=0, variant="fade", children=[page1, page2])'} language="python" />
      <CodeBlock code={'bpm.transition(active_index=1, variant="shimmer", children=[...])'} language="python" />
      <CodeBlock code={'bpm.transition(active_index=0, variant="border", duration=400, children=[...])'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
