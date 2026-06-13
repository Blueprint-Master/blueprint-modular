"use client";

import { useState } from "react";
import Link from "next/link";
import { LoadingBar, Selectbox, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

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
  const { locale } = useI18n();
  const fr = {
    breadcrumb: "Composants",
    description: (
      <>
        Barre de chargement : sweep, blocks, iso, stacked, arc, dots. Variant <code>iso</code> peut être déterminé (value 0–100) ou indéterminé.
      </>
    ),
    valueLabel: "Value (0–100, vide = indéterminé)",
    valuePlaceholder: "vide",
    choose: "Choisir",
    copy: "Copier",
    head: { prop: "Prop", type: "Type", def: "Défaut", req: "Requis", desc: "Description" },
    no: "Non",
    rows: {
      variant: "Style de la barre (sweep = balayage, blocks = segments, iso = barre linéaire, etc.).",
      value: (
        <>
          Pour <code>iso</code> : 0–100 = barre déterminée ; absent = indéterminé.
        </>
      ),
      size: "Hauteur : thin (6px), default (8px), thick (12px).",
      animated: (
        <>
          Désactive l&apos;animation si false (screenshots, prefers-reduced-motion).
        </>
      ),
      className: "Classes CSS additionnelles.",
    },
    examples: "Exemples",
  };
  const en: typeof fr = {
    breadcrumb: "Components",
    description: (
      <>
        Loading bar: sweep, blocks, iso, stacked, arc, dots. The <code>iso</code> variant can be determinate (value 0–100) or indeterminate.
      </>
    ),
    valueLabel: "Value (0–100, empty = indeterminate)",
    valuePlaceholder: "empty",
    choose: "Choose",
    copy: "Copy",
    head: { prop: "Prop", type: "Type", def: "Default", req: "Required", desc: "Description" },
    no: "No",
    rows: {
      variant: "Bar style (sweep = sweep, blocks = segments, iso = linear bar, etc.).",
      value: (
        <>
          For <code>iso</code>: 0–100 = determinate bar; absent = indeterminate.
        </>
      ),
      size: "Height: thin (6px), default (8px), thick (12px).",
      animated: (
        <>
          Disables the animation when false (screenshots, prefers-reduced-motion).
        </>
      ),
      className: "Additional CSS classes.",
    },
    examples: "Examples",
  };
  const L = { fr, en } as const;
  const t = L[locale];

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
          <Link href="/docs/components">{t.breadcrumb}</Link> → bpm.loadingbar
        </div>
        <h1>bpm.loadingbar</h1>
        <p className="doc-description">{t.description}</p>
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
              placeholder={t.choose}
            />
          </div>
          <div className="sandbox-control-group">
            <label>Size</label>
            <Selectbox
              options={SIZE_OPTIONS}
              value={size}
              onChange={(v) => setSize(v as LoadingBarSize)}
              placeholder={t.choose}
            />
          </div>
          {showValueControl && (
            <div className="sandbox-control-group">
              <label>{t.valueLabel}</label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={t.valuePlaceholder}
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
              {t.copy}
            </button>
          </div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>

      <table className="props-table">
        <thead>
          <tr>
            <th>{t.head.prop}</th>
            <th>{t.head.type}</th>
            <th>{t.head.def}</th>
            <th>{t.head.req}</th>
            <th>{t.head.desc}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>variant</code></td>
            <td><code>&#39;sweep&#39; | &#39;blocks&#39; | &#39;iso&#39; | &#39;stacked&#39; | &#39;arc&#39; | &#39;dots&#39;</code></td>
            <td><code>&#39;sweep&#39;</code></td>
            <td>{t.no}</td>
            <td>{t.rows.variant}</td>
          </tr>
          <tr>
            <td><code>value</code></td>
            <td><code>number</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.rows.value}</td>
          </tr>
          <tr>
            <td><code>size</code></td>
            <td><code>&#39;thin&#39; | &#39;default&#39; | &#39;thick&#39;</code></td>
            <td><code>&#39;default&#39;</code></td>
            <td>{t.no}</td>
            <td>{t.rows.size}</td>
          </tr>
          <tr>
            <td><code>animated</code></td>
            <td><code>boolean</code></td>
            <td><code>true</code></td>
            <td>{t.no}</td>
            <td>{t.rows.animated}</td>
          </tr>
          <tr>
            <td><code>className</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.rows.className}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
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
