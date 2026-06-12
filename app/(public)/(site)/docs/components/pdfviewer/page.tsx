"use client";

import { useState } from "react";
import Link from "next/link";
import { PdfViewer, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

/**
 * PDF d'une page « Devis DV-2026-104 » embarqué en data-URI :
 * aucune requête réseau, la démo fonctionne hors ligne.
 */
const DEVIS_PDF_BASE64 =
  "JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA1OTUgODQyXSAvUmVzb3VyY2VzIDw8IC9Gb250IDw8IC9GMSA0IDAgUiA+PiA+PiAvQ29udGVudHMgNSAwIFIgPj4KZW5kb2JqCjQgMCBvYmoKPDwgL1R5cGUgL0ZvbnQgL1N1YnR5cGUgL1R5cGUxIC9CYXNlRm9udCAvSGVsdmV0aWNhID4+CmVuZG9iago1IDAgb2JqCjw8IC9MZW5ndGggNDk2ID4+CnN0cmVhbQpCVCAvRjEgMTggVGYgNzIgNzgwIFRkIChEZXZpcyBEVi0yMDI2LTEwNCkgVGogRVQKQlQgL0YxIDExIFRmIDcyIDc1MCBUZCAoQmx1ZXByaW50IE1vZHVsYXIgLSBBZ2VuY2UgZGUgUGFyaXMpIFRqIEVUCkJUIC9GMSAxMSBUZiA3MiA3MjAgVGQgKENsaWVudCA6IFRyYW5zcG9ydHMgTW9yZWwgU0FTKSBUaiBFVApCVCAvRjEgMTEgVGYgNzIgNzAwIFRkIChEYXRlIDogMTIvMDYvMjAyNiAtIE9mZnJlIHZhbGFibGUgMzAgam91cnMpIFRqIEVUCkJUIC9GMSAxMSBUZiA3MiA2NjAgVGQgKE1haW50ZW5hbmNlIGRlIGxhIGZsb3R0ZSAtIGZvcmZhaXQgVDMgMjAyNikgVGogRVQKQlQgL0YxIDExIFRmIDcyIDYyMCBUZCAoVG90YWwgSFQgOiAgIDQgMjAwLDAwIEVVUikgVGogRVQKQlQgL0YxIDExIFRmIDcyIDYwMCBUZCAoVFZBIDIwJSA6ICAgICAgODQwLDAwIEVVUikgVGogRVQKQlQgL0YxIDEyIFRmIDcyIDU3NSBUZCAoVG90YWwgVFRDIDogIDUgMDQwLDAwIEVVUikgVGogRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyNDEgMDAwMDAgbiAKMDAwMDAwMDMxMSAwMDAwMCBuIAp0cmFpbGVyCjw8IC9TaXplIDYgL1Jvb3QgMSAwIFIgPj4Kc3RhcnR4cmVmCjg1NwolJUVPRgo=";

const DEVIS_DATA_URI = "data:application/pdf;base64," + DEVIS_PDF_BASE64;

export default function DocPdfViewerPage() {
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
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.pdfViewer</div>
        <h1>bpm.pdfViewer</h1>
        <p className="doc-description">
          Visionneuse PDF embarquée (iframe) : affichez contrats, devis, factures ou documents archivés
          directement dans l&apos;application, sans forcer le téléchargement. La démo ci-dessous charge un
          vrai devis d&apos;une page embarqué en data-URI (aucun appel réseau).
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Média</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview" style={{ minHeight: 300 }}>
          <PdfViewer src={previewSrc} title={title.trim() || "PDF"} width={width} height={height} />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>src (document affiché)</label>
            <select value={srcMode} onChange={(e) => setSrcMode(e.target.value as "devis" | "custom")}>
              <option value="devis">Devis DV-2026-104 (PDF embarqué, hors ligne)</option>
              <option value="custom">URL personnalisée</option>
            </select>
          </div>
          {srcMode === "custom" && (
            <div className="sandbox-control-group">
              <label>URL du PDF</label>
              <input
                type="text"
                value={customSrc}
                onChange={(e) => setCustomSrc(e.target.value)}
                placeholder="/documents/rapport.pdf"
              />
            </div>
          )}
          <div className="sandbox-control-group">
            <label>title (accessibilité)</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>height (px, 240 à 800)</label>
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
            <label>width (px ou CSS, ex. 100% / 640)</label>
            <input type="text" value={width} onChange={(e) => setWidth(e.target.value || "100%")} />
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
          <tr><td><code>src</code></td><td><code>string</code></td><td>—</td><td>Oui</td><td>URL du document PDF (chemin serveur, URL ou data-URI).</td></tr>
          <tr><td><code>title</code></td><td><code>string</code></td><td>PDF</td><td>Non</td><td>Titre de l&apos;iframe (accessibilité, lecteurs d&apos;écran).</td></tr>
          <tr><td><code>width</code></td><td><code>number | string</code></td><td>100%</td><td>Non</td><td>Largeur (px si nombre, sinon valeur CSS).</td></tr>
          <tr><td><code>height</code></td><td><code>number | string</code></td><td>600px</td><td>Non</td><td>Hauteur (px si nombre, sinon valeur CSS).</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Classes CSS additionnelles.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'bpm.pdfViewer(src="/documents/devis-DV-2026-104.pdf", title="Devis DV-2026-104")'} language="python" />
      <CodeBlock code={'bpm.pdfViewer(src=contrat_url, title="Contrat cadre 2026", height="80vh")'} language="python" />
      <CodeBlock code={'# Ouvrir directement la page 3 d\'un document multi-pages (selon le lecteur du navigateur)\nbpm.pdfViewer(src="/archives/rapport-annuel-2025.pdf#page=3", width=800, height=600)'} language="python" />

      <h2 className="text-lg font-semibold mt-8 mb-2">Quand l&apos;utiliser</h2>
      <p className="doc-description">
        Consultation de documents finalisés : contrats à relire avant signature, devis et factures
        archivés, notices PDF. Le rendu est délégué au lecteur PDF natif du navigateur (zoom,
        recherche, impression inclus). Pour une simple image, préférer <code>bpm.image</code> ;
        pour un aperçu de fichier générique, <code>bpm.filePreview</code>.
      </p>

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
