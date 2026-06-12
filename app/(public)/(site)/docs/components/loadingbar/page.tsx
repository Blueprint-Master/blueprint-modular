"use client";

import { useState } from "react";
import Link from "next/link";
import { LoadingBar, Selectbox, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

type LoadingBarVariant = "sweep" | "blocks" | "iso" | "stacked" | "arc" | "dots";
type LoadingBarSize = "thin" | "default" | "thick";

const VARIANT_OPTIONS: { value: LoadingBarVariant; label: string }[] = [
  { value: "sweep", label: "sweep" },
  { value: "blocks", label: "blocks" },
  { value: "iso", label: "iso" },
  { value: "stacked", label: "stacked" },
  { value: "arc", label: "arc" },
  { value: "dots", label: "dots" },
];

const SIZE_OPTIONS: { value: LoadingBarSize; label: string }[] = [
  { value: "thin", label: "thin" },
  { value: "default", label: "default" },
  { value: "thick", label: "thick" },
];

export default function DocLoadingBarPage() {
  const [variant, setVariant] = useState<LoadingBarVariant>("sweep");
  const [size, setSize] = useState<LoadingBarSize>("default");
  const [value, setValue] = useState<string>("");
  const [animated, setAnimated] = useState(true);

  const valueNum = value === "" ? undefined : Math.min(100, Math.max(0, Number(value) || 0));
  const showValueControl = variant === "iso";

  const pythonCode =
    "bpm.loadingbar(variant=\"" +
    variant +
    "\", size=\"" +
    size +
    "\"" +
    (showValueControl && valueNum != null ? `, value=${valueNum}` : "") +
    (animated ? "" : ", animated=False") +
    ")";

  const { prev, next } = getPrevNext("loadingbar");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">Composants</Link> → bpm.loadingbar
        </div>
        <h1>bpm.loadingbar</h1>
        <p className="doc-description">
          Barre de chargement : sweep, blocks, iso, stacked, arc, dots. Variant <code>iso</code> peut être déterminé (value 0–100) ou indéterminé.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Feedback</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview sandbox-preview--loadingbar">
          <div style={{ width: "100%", maxWidth: 320 }}>
            <LoadingBar
              variant={variant}
              size={size}
              value={valueNum}
              animated={animated}
            />
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>Variant</label>
            <Selectbox
              options={VARIANT_OPTIONS}
              value={variant}
              onChange={(v) => setVariant(v as LoadingBarVariant)}
              placeholder="Choisir"
            />
          </div>
          <div className="sandbox-control-group">
            <label>Size</label>
            <Selectbox
              options={SIZE_OPTIONS}
              value={size}
              onChange={(v) => setSize(v as LoadingBarSize)}
              placeholder="Choisir"
            />
          </div>
          {showValueControl && (
            <div className="sandbox-control-group">
              <label>Value (0–100, vide = indéterminé)</label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="vide"
                className="w-full px-3 py-2 rounded border text-sm"
                style={{
                  borderColor: "var(--bpm-border)",
                  background: "var(--bpm-bg-primary)",
                  color: "var(--bpm-text-primary)",
                }}
              />
            </div>
          )}
          <div className="sandbox-control-group">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={animated}
                onChange={(e) => setAnimated(e.target.checked)}
              />
              Animated
            </label>
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>
              Copier
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
            <th>Défaut</th>
            <th>Requis</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>variant</code></td>
            <td><code>&#39;sweep&#39; | &#39;blocks&#39; | &#39;iso&#39; | &#39;stacked&#39; | &#39;arc&#39; | &#39;dots&#39;</code></td>
            <td><code>&#39;sweep&#39;</code></td>
            <td>Non</td>
            <td>Style de la barre (sweep = balayage, blocks = segments, iso = barre linéaire, etc.).</td>
          </tr>
          <tr>
            <td><code>value</code></td>
            <td><code>number</code></td>
            <td>—</td>
            <td>Non</td>
            <td>Pour <code>iso</code> : 0–100 = barre déterminée ; absent = indéterminé.</td>
          </tr>
          <tr>
            <td><code>size</code></td>
            <td><code>&#39;thin&#39; | &#39;default&#39; | &#39;thick&#39;</code></td>
            <td><code>&#39;default&#39;</code></td>
            <td>Non</td>
            <td>Hauteur : thin (6px), default (8px), thick (12px).</td>
          </tr>
          <tr>
            <td><code>animated</code></td>
            <td><code>boolean</code></td>
            <td><code>true</code></td>
            <td>Non</td>
            <td>Désactive l&apos;animation si false (screenshots, prefers-reduced-motion).</td>
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

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'bpm.loadingbar(variant="sweep")'} language="python" />
      <CodeBlock code={'bpm.loadingbar(variant="iso", value=45)'} language="python" />
      <CodeBlock code={'bpm.loadingbar(variant="dots", size="thick")'} language="python" />
      <CodeBlock code={'bpm.loadingbar(variant="blocks", animated=False)'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
