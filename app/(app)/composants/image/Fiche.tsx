"use client";

import { useState } from "react";
import Link from "next/link";
import { Image, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const SOURCES = [
  { id: "logo", src: "/img/logo-bpm.png" },
  { id: "logo-nom", src: "/Logo-BPM-nom.jpg" },
  { id: "icone", src: "/img/icon-pwa-512.png" },
  { id: "casse", src: "/img/produit-introuvable.jpg" },
] as const;

const fr = {
  breadcrumb: "Composants",
  category: "Média",
  description: (
    <>
      Affichage d&apos;image avec chargement différé (lazy) et contrôle du cadrage : visuels
      produits dans un catalogue, logos partenaires, avatars, illustrations ou captures dans
      une application data. Le texte <code>alt</code> est obligatoire — il sert
      d&apos;accessibilité et de repli si l&apos;image ne charge pas.
    </>
  ),
  sources: {
    logo: { label: "Logo produit (PNG)", alt: "Logo Blueprint Modular" },
    "logo-nom": { label: "Bannière avec nom (JPG)", alt: "Logo Blueprint Modular avec nom" },
    icone: { label: "Icône application 512 px (PNG)", alt: "Icône de l'application" },
    casse: { label: "Src cassé (démo d'erreur)", alt: "Visuel du produit indisponible" },
  },
  brokenNote: (
    <>
      Le fichier n&apos;existe pas : le navigateur affiche l&apos;icône d&apos;image cassée
      et le texte <code>alt</code> à la place du visuel. Prévoyez toujours un alt parlant.
    </>
  ),
  altLabel: "alt (obligatoire)",
  fitOptionContain: "contain (tout visible)",
  fitOptionCover: "cover (remplit, recadre)",
  fitOptionFill: "fill (déforme)",
  fitOptionNone: "none (taille native)",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  yes: "Oui",
  no: "Non",
  propSrc: "URL de l'image (chemin serveur ou URL absolue).",
  propAlt: "Texte alternatif : accessibilité et repli affiché si l'image ne charge pas.",
  propTitle: "Infobulle affichée au survol.",
  propWidth: "Largeur (px si nombre, sinon valeur CSS).",
  propHeight: "Hauteur (px si nombre, sinon valeur CSS).",
  propFit: "Mode d'ajustement (object-fit) dans la zone width × height.",
  propClassName: "Classes CSS additionnelles.",
  examplesTitle: "Exemples",
};

const en: typeof fr = {
  breadcrumb: "Components",
  category: "Media",
  description: (
    <>
      Image display with lazy loading and framing control: product visuals in a catalog,
      partner logos, avatars, illustrations or screenshots in a data application. The
      <code> alt</code> text is required — it provides accessibility and acts as a fallback
      if the image fails to load.
    </>
  ),
  sources: {
    logo: { label: "Product logo (PNG)", alt: "Blueprint Modular logo" },
    "logo-nom": { label: "Banner with name (JPG)", alt: "Blueprint Modular logo with name" },
    icone: { label: "App icon 512 px (PNG)", alt: "Application icon" },
    casse: { label: "Broken src (error demo)", alt: "Product visual unavailable" },
  },
  brokenNote: (
    <>
      The file does not exist: the browser shows the broken-image icon and the
      <code> alt</code> text instead of the visual. Always provide a meaningful alt.
    </>
  ),
  altLabel: "alt (required)",
  fitOptionContain: "contain (everything visible)",
  fitOptionCover: "cover (fills, crops)",
  fitOptionFill: "fill (distorts)",
  fitOptionNone: "none (native size)",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  yes: "Yes",
  no: "No",
  propSrc: "URL of the image (server path or absolute URL).",
  propAlt: "Alternative text: accessibility and the fallback shown if the image fails to load.",
  propTitle: "Tooltip shown on hover.",
  propWidth: "Width (px if number, otherwise a CSS value).",
  propHeight: "Height (px if number, otherwise a CSS value).",
  propFit: "Fit mode (object-fit) within the width × height area.",
  propClassName: "Additional CSS classes.",
  examplesTitle: "Examples",
};

const L = { fr, en } as const;

export default function DocImagePage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [srcId, setSrcId] = useState<(typeof SOURCES)[number]["id"]>("logo");
  const [alt, setAlt] = useState<string>(t.sources.logo.alt);
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(200);
  const [fit, setFit] = useState<"contain" | "cover" | "fill" | "none">("contain");

  const source = SOURCES.find((s) => s.id === srcId) ?? SOURCES[0];
  const isBroken = srcId === "casse";

  const parts: string[] = [
    `src="${source.src}"`,
    `alt="${alt.replace(/"/g, '\\"')}"`,
    `width=${width}`,
    `height=${height}`,
  ];
  if (fit !== "contain") parts.push(`fit="${fit}"`);
  const pythonCode = `bpm.image(${parts.join(", ")})`;
  const { prev, next } = getPrevNext("image");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/composants">{t.breadcrumb}</Link> → bpm.image</div>
        <h1>bpm.image</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div className="flex flex-col items-center gap-2">
            <div
              style={{
                width,
                height,
                border: "1px dashed var(--bpm-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                background: "var(--bpm-bg-secondary)",
              }}
            >
              <Image key={source.src} src={source.src} alt={alt} fit={fit} width={width} height={height} />
            </div>
            {isBroken && (
              <p className="text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: 360 }}>
                {t.brokenNote}
              </p>
            )}
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>src</label>
            <select
              value={srcId}
              onChange={(e) => {
                const id = e.target.value as typeof srcId;
                setSrcId(id);
                setAlt(t.sources[id].alt);
              }}
            >
              {SOURCES.map((s) => (
                <option key={s.id} value={s.id}>{t.sources[s.id].label}</option>
              ))}
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>{t.altLabel}</label>
            <input type="text" value={alt} onChange={(e) => setAlt(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>width (px)</label>
            <input
              type="number"
              min={80}
              max={560}
              step={20}
              value={width}
              onChange={(e) => setWidth(Math.min(560, Math.max(80, Number(e.target.value) || 300)))}
            />
          </div>
          <div className="sandbox-control-group">
            <label>height (px)</label>
            <input
              type="number"
              min={80}
              max={480}
              step={20}
              value={height}
              onChange={(e) => setHeight(Math.min(480, Math.max(80, Number(e.target.value) || 200)))}
            />
          </div>
          <div className="sandbox-control-group">
            <label>fit (object-fit)</label>
            <select value={fit} onChange={(e) => setFit(e.target.value as typeof fit)}>
              <option value="contain">{t.fitOptionContain}</option>
              <option value="cover">{t.fitOptionCover}</option>
              <option value="fill">{t.fitOptionFill}</option>
              <option value="none">{t.fitOptionNone}</option>
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
          <tr><td><code>src</code></td><td><code>string</code></td><td>—</td><td>{t.yes}</td><td>{t.propSrc}</td></tr>
          <tr><td><code>alt</code></td><td><code>string</code></td><td>—</td><td>{t.yes}</td><td>{t.propAlt}</td></tr>
          <tr><td><code>title</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.propTitle}</td></tr>
          <tr><td><code>width</code></td><td><code>number | string</code></td><td>—</td><td>{t.no}</td><td>{t.propWidth}</td></tr>
          <tr><td><code>height</code></td><td><code>number | string</code></td><td>—</td><td>{t.no}</td><td>{t.propHeight}</td></tr>
          <tr><td><code>fit</code></td><td><code>&quot;contain&quot; | &quot;cover&quot; | &quot;fill&quot; | &quot;none&quot;</code></td><td>contain</td><td>{t.no}</td><td>{t.propFit}</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.propClassName}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examplesTitle}</h2>
      <CodeBlock code={'# Visuel produit dans une fiche catalogue\nbpm.image(src="/img/produits/ref-4821.jpg", alt="Pompe hydraulique REF-4821", width=300, height=200, fit="cover")'} language="python" />
      <CodeBlock code={'# Logo partenaire, sans déformation\nbpm.image(src="/img/logo-bpm.png", alt="Logo Blueprint Modular", height=48)'} language="python" />
      <CodeBlock code={'# Illustration pleine largeur dans un rapport\nbpm.image(src=chart_png_url, alt="Évolution du CA 2025", width="100%")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
