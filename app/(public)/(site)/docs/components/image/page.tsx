"use client";

import { useState } from "react";
import Link from "next/link";
import { Image, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

const SOURCES = [
  { id: "logo", label: "Logo produit (PNG)", src: "/img/logo-bpm.png", alt: "Logo Blueprint Modular" },
  { id: "logo-nom", label: "Bannière avec nom (JPG)", src: "/Logo-BPM-nom.jpg", alt: "Logo Blueprint Modular avec nom" },
  { id: "icone", label: "Icône application 512 px (PNG)", src: "/img/icon-pwa-512.png", alt: "Icône de l'application" },
  { id: "casse", label: "Src cassé (démo d'erreur)", src: "/img/produit-introuvable.jpg", alt: "Visuel du produit indisponible" },
] as const;

export default function DocImagePage() {
  const [srcId, setSrcId] = useState<(typeof SOURCES)[number]["id"]>("logo");
  const [alt, setAlt] = useState<string>(SOURCES[0].alt);
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
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.image</div>
        <h1>bpm.image</h1>
        <p className="doc-description">
          Affichage d&apos;image avec chargement différé (lazy) et contrôle du cadrage : visuels
          produits dans un catalogue, logos partenaires, avatars, illustrations ou captures dans
          une application data. Le texte <code>alt</code> est obligatoire — il sert
          d&apos;accessibilité et de repli si l&apos;image ne charge pas.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Média</span>
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
                Le fichier n&apos;existe pas : le navigateur affiche l&apos;icône d&apos;image cassée
                et le texte <code>alt</code> à la place du visuel. Prévoyez toujours un alt parlant.
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
                const s = SOURCES.find((x) => x.id === id);
                if (s) setAlt(s.alt);
              }}
            >
              {SOURCES.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>alt (obligatoire)</label>
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
              <option value="contain">contain (tout visible)</option>
              <option value="cover">cover (remplit, recadre)</option>
              <option value="fill">fill (déforme)</option>
              <option value="none">none (taille native)</option>
            </select>
          </div>
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
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Défaut</th>
            <th>Requis</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>src</code></td><td><code>string</code></td><td>—</td><td>Oui</td><td>URL de l&apos;image (chemin serveur ou URL absolue).</td></tr>
          <tr><td><code>alt</code></td><td><code>string</code></td><td>—</td><td>Oui</td><td>Texte alternatif : accessibilité et repli affiché si l&apos;image ne charge pas.</td></tr>
          <tr><td><code>title</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Infobulle affichée au survol.</td></tr>
          <tr><td><code>width</code></td><td><code>number | string</code></td><td>—</td><td>Non</td><td>Largeur (px si nombre, sinon valeur CSS).</td></tr>
          <tr><td><code>height</code></td><td><code>number | string</code></td><td>—</td><td>Non</td><td>Hauteur (px si nombre, sinon valeur CSS).</td></tr>
          <tr><td><code>fit</code></td><td><code>&quot;contain&quot; | &quot;cover&quot; | &quot;fill&quot; | &quot;none&quot;</code></td><td>contain</td><td>Non</td><td>Mode d&apos;ajustement (object-fit) dans la zone width × height.</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Classes CSS additionnelles.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'# Visuel produit dans une fiche catalogue\nbpm.image(src="/img/produits/ref-4821.jpg", alt="Pompe hydraulique REF-4821", width=300, height=200, fit="cover")'} language="python" />
      <CodeBlock code={'# Logo partenaire, sans déformation\nbpm.image(src="/img/logo-bpm.png", alt="Logo Blueprint Modular", height=48)'} language="python" />
      <CodeBlock code={'# Illustration pleine largeur dans un rapport\nbpm.image(src=chart_png_url, alt="Évolution du CA 2025", width="100%")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
