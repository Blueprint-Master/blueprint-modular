"use client";

import { useState } from "react";
import Link from "next/link";
import { FilePreview, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  components: "Composants",
  description: "Aperçu de fichier (image, PDF, texte/code).",
  category: "Média",
  phUrl: "URL du fichier",
  phFilename: "nom.png",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  yes: "Oui",
  no: "Non",
  examples: "Exemples",
  d_url: "URL du fichier.",
  d_filename: "Nom du fichier (pour type MIME et téléchargement).",
  d_mimeType: "Type MIME (inféré depuis l’extension si absent).",
  d_height: "Hauteur de l’aperçu.",
  d_showDownload: "Afficher le lien Télécharger.",
  d_className: "Classes CSS.",
};

const en: typeof fr = {
  components: "Components",
  description: "File preview (image, PDF, text/code).",
  category: "Media",
  phUrl: "File URL",
  phFilename: "name.png",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  yes: "Yes",
  no: "No",
  examples: "Examples",
  d_url: "File URL.",
  d_filename: "File name (for MIME type and download).",
  d_mimeType: "MIME type (inferred from the extension if absent).",
  d_height: "Preview height.",
  d_showDownload: "Show the Download link.",
  d_className: "CSS classes.",
};

const L = { fr, en } as const;

export default function DocFilePreviewPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [url, setUrl] = useState("https://via.placeholder.com/300x200");
  const [filename, setFilename] = useState("image.png");
  const [height, setHeight] = useState<string | number>(400);
  const [showDownload, setShowDownload] = useState(true);

  const pyHeight = height !== 400 ? (typeof height === "number" ? `, height=${height}` : `, height="${height}"`) : "";
  const pyShowDownload = !showDownload ? ", showDownload=False" : "";
  const pythonCode = `bpm.filePreview(url="${url.replace(/"/g, '\\"')}", filename="${filename.replace(/"/g, '\\"')}"${pyHeight}${pyShowDownload})`;
  const { prev, next } = getPrevNext("filepreview");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/composants">{t.components}</Link> → bpm.filePreview</div>
        <h1>bpm.filePreview</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <FilePreview
            url={url}
            filename={filename}
            height={height}
            showDownload={showDownload}
          />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>url</label>
            <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder={t.phUrl} />
          </div>
          <div className="sandbox-control-group">
            <label>filename</label>
            <input type="text" value={filename} onChange={(e) => setFilename(e.target.value)} placeholder={t.phFilename} />
          </div>
          <div className="sandbox-control-group">
            <label>height</label>
            <input type="text" value={height} onChange={(e) => setHeight(e.target.value === "" ? 400 : e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>showDownload</label>
            <select value={showDownload ? "true" : "false"} onChange={(e) => setShowDownload(e.target.value === "true")}>
              <option value="true">true</option>
              <option value="false">false</option>
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
          <tr><td><code>url</code></td><td><code>string</code></td><td>—</td><td>{t.yes}</td><td>{t.d_url}</td></tr>
          <tr><td><code>filename</code></td><td><code>string</code></td><td>—</td><td>{t.yes}</td><td>{t.d_filename}</td></tr>
          <tr><td><code>mimeType</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.d_mimeType}</td></tr>
          <tr><td><code>height</code></td><td><code>string | number</code></td><td>400</td><td>{t.no}</td><td>{t.d_height}</td></tr>
          <tr><td><code>showDownload</code></td><td><code>boolean</code></td><td>true</td><td>{t.no}</td><td>{t.d_showDownload}</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.d_className}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'bpm.filePreview(url=file_url, filename="rapport.pdf")'} language="python" />
      <CodeBlock code={'bpm.filePreview(url=img_url, filename="photo.png", height=300)'} language="python" />
      <CodeBlock code={'bpm.filePreview(url=url, filename="data.json", showDownload=False)'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
