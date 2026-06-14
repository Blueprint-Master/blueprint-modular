"use client";

import { useState } from "react";
import Link from "next/link";
import { PdfViewer, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

/**
 * PDF d'une page « Devis DV-2026-104 » embarqué en data-URI :
 * aucune requête réseau, la démo fonctionne hors ligne.
 */
const DEVIS_PDF_BASE64 =
  "JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA1OTUgODQyXSAvUmVzb3VyY2VzIDw8IC9Gb250IDw8IC9GMSA0IDAgUiA+PiA+PiAvQ29udGVudHMgNSAwIFIgPj4KZW5kb2JqCjQgMCBvYmoKPDwgL1R5cGUgL0ZvbnQgL1N1YnR5cGUgL1R5cGUxIC9CYXNlRm9udCAvSGVsdmV0aWNhID4+CmVuZG9iago1IDAgb2JqCjw8IC9MZW5ndGggNDk2ID4+CnN0cmVhbQpCVCAvRjEgMTggVGYgNzIgNzgwIFRkIChEZXZpcyBEVi0yMDI2LTEwNCkgVGogRVQKQlQgL0YxIDExIFRmIDcyIDc1MCBUZCAoQmx1ZXByaW50IE1vZHVsYXIgLSBBZ2VuY2UgZGUgUGFyaXMpIFRqIEVUCkJUIC9GMSAxMSBUZiA3MiA3MjAgVGQgKENsaWVudCA6IFRyYW5zcG9ydHMgTW9yZWwgU0FTKSBUaiBFVApCVCAvRjEgMTEgVGYgNzIgNzAwIFRkIChEYXRlIDogMTIvMDYvMjAyNiAtIE9mZnJlIHZhbGFibGUgMzAgam91cnMpIFRqIEVUCkJUIC9GMSAxMSBUZiA3MiA2NjAgVGQgKE1haW50ZW5hbmNlIGRlIGxhIGZsb3R0ZSAtIGZvcmZhaXQgVDMgMjAyNikgVGogRVQKQlQgL0YxIDExIFRmIDcyIDYyMCBUZCAoVG90YWwgSFQgOiAgIDQgMjAwLDAwIEVVUikgVGogRVQKQlQgL0YxIDExIFRmIDcyIDYwMCBUZCAoVFZBIDIwJSA6ICAgICAgODQwLDAwIEVVUikgVGogRVQKQlQgL0YxIDEyIFRmIDcyIDU3NSBUZCAoVG90YWwgVFRDIDogIDUgMDQwLDAwIEVVUikgVGogRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyNDEgMDAwMDAgbiAKMDAwMDAwMDMxMSAwMDAwMCBuIAp0cmFpbGVyCjw8IC9TaXplIDYgL1Jvb3QgMSAwIFIgPj4Kc3RhcnR4cmVmCjg1NwolJUVPRgo=";

const DEVIS_DATA_URI = "data:application/pdf;base64," + DEVIS_PDF_BASE64;

const fr = {
  breadcrumb: "Composants",
  category: "Média",
  description:
    "Visionneuse PDF embarquée (iframe) : affichez contrats, devis, factures ou documents archivés directement dans l'application, sans forcer le téléchargement. La démo ci-dessous charge un vrai devis d'une page embarqué en data-URI (aucun appel réseau).",
  srcLabel: "src (document affiché)",
  srcOptionDevis: "Devis DV-2026-104 (PDF embarqué, hors ligne)",
  srcOptionCustom: "URL personnalisée",
  customUrlLabel: "URL du PDF",
  titleLabel: "title (accessibilité)",
  heightLabel: "height (px, 240 à 800)",
  widthLabel: "width (px ou CSS, ex. 100% / 640)",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  yes: "Oui",
  no: "Non",
  propSrc: "URL du document PDF (chemin serveur, URL ou data-URI).",
  propTitle: "Titre de l'iframe (accessibilité, lecteurs d'écran).",
  propWidth: "Largeur (px si nombre, sinon valeur CSS).",
  propHeight: "Hauteur (px si nombre, sinon valeur CSS).",
  propClassName: "Classes CSS additionnelles.",
  examplesTitle: "Exemples",
  whenTitle: "Quand l'utiliser",
  whenBody: (
    <>
      Consultation de documents finalisés : contrats à relire avant signature, devis et factures
      archivés, notices PDF. Le rendu est délégué au lecteur PDF natif du navigateur (zoom,
      recherche, impression inclus). Pour une simple image, préférer <code>bpm.image</code> ;
      pour un aperçu de fichier générique, <code>bpm.filePreview</code>.
    </>
  ),
};

const en: typeof fr = {
  breadcrumb: "Components",
  category: "Media",
  description:
    "Embedded PDF viewer (iframe): display contracts, quotes, invoices or archived documents directly in the application, without forcing a download. The demo below loads a real one-page quote embedded as a data-URI (no network request).",
  srcLabel: "src (displayed document)",
  srcOptionDevis: "Quote DV-2026-104 (embedded PDF, offline)",
  srcOptionCustom: "Custom URL",
  customUrlLabel: "PDF URL",
  titleLabel: "title (accessibility)",
  heightLabel: "height (px, 240 to 800)",
  widthLabel: "width (px or CSS, e.g. 100% / 640)",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  yes: "Yes",
  no: "No",
  propSrc: "URL of the PDF document (server path, URL or data-URI).",
  propTitle: "Title of the iframe (accessibility, screen readers).",
  propWidth: "Width (px if number, otherwise a CSS value).",
  propHeight: "Height (px if number, otherwise a CSS value).",
  propClassName: "Additional CSS classes.",
  examplesTitle: "Examples",
  whenTitle: "When to use it",
  whenBody: (
    <>
      Reading finalized documents: contracts to review before signing, archived quotes and
      invoices, PDF manuals. Rendering is delegated to the browser&apos;s native PDF reader (zoom,
      search and printing included). For a simple image, prefer <code>bpm.image</code>;
      for a generic file preview, use <code>bpm.filePreview</code>.
    </>
  ),
};

const L = { fr, en } as const;

export default function DocPdfViewerPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [srcMode, setSrcMode] = useState<"devis" | "custom">("devis");
  const [customSrc, setCustomSrc] = useState("/documents/rapport-annuel-2025.pdf");
  const [title, setTitle] = useState("Devis DV-2026-104");
  const [height, setHeight] = useState(480);
  const [width, setWidth] = useState("100%");

  // Preview : data-URI embarqué (aucun réseau) ou URL saisie par l'utilisateur.
  const previewSrc = srcMode === "devis" ? DEVIS_DATA_URI : customSrc;
  // Générateur : on montre un chemin de fichier crédible plutôt que le data-URI complet.
  const pySrc = srcMode === "devis" ? "/documents/devis-DV-2026-104.pdf" : customSrc;

  const parts: string[] = [`src="${pySrc.replace(/"/g, '\\"')}"`];
  if (title.trim() && title !== "PDF") parts.push(`title="${title.replace(/"/g, '\\"')}"`);
  if (width !== "100%") parts.push(/^\d+$/.test(width) ? `width=${width}` : `width="${width.replace(/"/g, '\\"')}"`);
  if (height !== 600) parts.push(`height=${height}`);
  const pythonCode = `bpm.pdfViewer(${parts.join(", ")})`;
  const { prev, next } = getPrevNext("pdfviewer");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/composants">{t.breadcrumb}</Link> → bpm.pdfViewer</div>
        <h1>bpm.pdfViewer</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview" style={{ minHeight: 300 }}>
          <PdfViewer src={previewSrc} title={title.trim() || "PDF"} width={width} height={height} />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>{t.srcLabel}</label>
            <select value={srcMode} onChange={(e) => setSrcMode(e.target.value as "devis" | "custom")}>
              <option value="devis">{t.srcOptionDevis}</option>
              <option value="custom">{t.srcOptionCustom}</option>
            </select>
          </div>
          {srcMode === "custom" && (
            <div className="sandbox-control-group">
              <label>{t.customUrlLabel}</label>
              <input
                type="text"
                value={customSrc}
                onChange={(e) => setCustomSrc(e.target.value)}
                placeholder="/documents/rapport.pdf"
              />
            </div>
          )}
          <div className="sandbox-control-group">
            <label>{t.titleLabel}</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>{t.heightLabel}</label>
            <input
              type="number"
              min={240}
              max={800}
              step={40}
              value={height}
              onChange={(e) => setHeight(Math.min(800, Math.max(240, Number(e.target.value) || 480)))}
            />
          </div>
          <div className="sandbox-control-group">
            <label>{t.widthLabel}</label>
            <input type="text" value={width} onChange={(e) => setWidth(e.target.value || "100%")} />
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
          <tr><td><code>title</code></td><td><code>string</code></td><td>PDF</td><td>{t.no}</td><td>{t.propTitle}</td></tr>
          <tr><td><code>width</code></td><td><code>number | string</code></td><td>100%</td><td>{t.no}</td><td>{t.propWidth}</td></tr>
          <tr><td><code>height</code></td><td><code>number | string</code></td><td>600px</td><td>{t.no}</td><td>{t.propHeight}</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.propClassName}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examplesTitle}</h2>
      <CodeBlock code={'bpm.pdfViewer(src="/documents/devis-DV-2026-104.pdf", title="Devis DV-2026-104")'} language="python" />
      <CodeBlock code={'bpm.pdfViewer(src=contrat_url, title="Contrat cadre 2026", height="80vh")'} language="python" />
      <CodeBlock code={'# Ouvrir directement la page 3 d\'un document multi-pages (selon le lecteur du navigateur)\nbpm.pdfViewer(src="/archives/rapport-annuel-2025.pdf#page=3", width=800, height=600)'} language="python" />

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.whenTitle}</h2>
      <p className="doc-description">{t.whenBody}</p>

      <nav className="doc-pagination">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
