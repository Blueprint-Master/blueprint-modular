"use client";

import { useState } from "react";
import Link from "next/link";
import { Theme, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

type ThemeVariant = "toggle" | "select";

const fr = {
  breadcrumb: "Composants",
  category: "Interaction",
  copy: "Copier",
  thDefault: "Défaut",
  descVariant: "Interrupteur (toggle) ou liste déroulante (select).",
  descLabel: "Label à côté du toggle (variant toggle). Si absent, affiche le libellé du thème actuel.",
  descLight: "Libellé de l'option clair.",
  descDark: "Libellé de l'option sombre.",
  propsHeading: "Props (React)",
  integrationHeading: "Intégration",
  ctaText: "Tester en direct dans le sandbox :",
  ctaButton: "Ouvrir dans le sandbox",
};
const en: typeof fr = {
  breadcrumb: "Components",
  category: "Interaction",
  copy: "Copy",
  thDefault: "Default",
  descVariant: "Switch (toggle) or dropdown list (select).",
  descLabel: "Label next to the toggle (toggle variant). If omitted, shows the current theme's label.",
  descLight: "Label of the light option.",
  descDark: "Label of the dark option.",
  propsHeading: "Props (React)",
  integrationHeading: "Integration",
  ctaText: "Try it live in the sandbox:",
  ctaButton: "Open in the sandbox",
};
const L = { fr, en } as const;

export default function DocThemePage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [variant, setVariant] = useState<ThemeVariant>("toggle");
  const [lightLabel, setLightLabel] = useState("Clair");
  const [darkLabel, setDarkLabel] = useState("Sombre");

  const parts: string[] = [];
  if (variant !== "toggle") parts.push('variant="select"');
  if (lightLabel !== "Clair") parts.push(`light_label="${lightLabel.replace(/"/g, '\\"')}"`);
  if (darkLabel !== "Sombre") parts.push(`dark_label="${darkLabel.replace(/"/g, '\\"')}"`);
  const pythonCode = `bpm.theme(${parts.length ? parts.join(", ") : ""})`;

  const { prev, next } = getPrevNext("theme");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/composants">{t.breadcrumb}</Link> → bpm.theme
        </div>
        <h1>bpm.theme</h1>
        <p className="doc-description">
          {locale === "fr" ? (
            <>Bascule entre thème clair et thème sombre. Persiste le choix dans <code>localStorage</code> (clé <code>bpm-theme</code>) et applique <code>data-theme</code> sur la racine du document.</>
          ) : (
            <>Toggles between light and dark theme. Persists the choice in <code>localStorage</code> (key <code>bpm-theme</code>) and applies <code>data-theme</code> on the document root.</>
          )}
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">{t.category}</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Theme
            variant={variant}
            lightLabel={lightLabel}
            darkLabel={darkLabel}
          />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>variant</label>
            <select value={variant} onChange={(e) => setVariant(e.target.value as ThemeVariant)}>
              <option value="toggle">toggle</option>
              <option value="select">select</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>lightLabel</label>
            <input
              type="text"
              value={lightLabel}
              onChange={(e) => setLightLabel(e.target.value)}
            />
          </div>
          <div className="sandbox-control-group">
            <label>darkLabel</label>
            <input
              type="text"
              value={darkLabel}
              onChange={(e) => setDarkLabel(e.target.value)}
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

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.propsHeading}</h2>
      <table className="props-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>{t.thDefault}</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>variant</code></td>
            <td><code>toggle | select</code></td>
            <td>toggle</td>
            <td>{t.descVariant}</td>
          </tr>
          <tr>
            <td><code>label</code></td>
            <td><code>ReactNode</code></td>
            <td>—</td>
            <td>{t.descLabel}</td>
          </tr>
          <tr>
            <td><code>lightLabel</code></td>
            <td><code>string</code></td>
            <td>Clair</td>
            <td>{t.descLight}</td>
          </tr>
          <tr>
            <td><code>darkLabel</code></td>
            <td><code>string</code></td>
            <td>Sombre</td>
            <td>{t.descDark}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.integrationHeading}</h2>
      <p className="mb-2" style={{ color: "var(--bpm-text-secondary)" }}>
        {locale === "fr" ? (
          <>Le composant utilise le <code>ThemeProvider</code> de l’app lorsqu’il est monté ; sinon il lit et écrit <code>data-theme</code> et <code>localStorage</code> directement. Les variables CSS BPM (<code>--bpm-bg-primary</code>, etc.) sont définies dans <code>globals.css</code> pour <code>[data-theme=&quot;dark&quot;]</code>.</>
        ) : (
          <>The component uses the app’s <code>ThemeProvider</code> when mounted; otherwise it reads and writes <code>data-theme</code> and <code>localStorage</code> directly. The BPM CSS variables (<code>--bpm-bg-primary</code>, etc.) are defined in <code>globals.css</code> for <code>[data-theme=&quot;dark&quot;]</code>.</>
        )}
      </p>
      <CodeBlock code={'# Toggle (défaut)\nbpm.theme()\n\n# Liste déroulante\nbpm.theme(variant="select", light_label="Clair", dark_label="Sombre")'} language="python" />

      <div className="mt-6 p-4 rounded-xl border" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>
        <p className="text-sm mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
          {t.ctaText}
        </p>
        <Link href="/sandbox?component=theme" className="doc-cta inline-block">
          {t.ctaButton}
        </Link>
      </div>

      <nav className="doc-pagination mt-12">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
