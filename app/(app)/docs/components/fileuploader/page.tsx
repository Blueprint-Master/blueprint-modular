"use client";

import { useState } from "react";
import Link from "next/link";
import { FileUploader, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocFileUploaderPage() {
  const [label, setLabel] = useState("Choisir un fichier");
  const [accept, setAccept] = useState("");
  const [multiple, setMultiple] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [lastFiles, setLastFiles] = useState<string>("");

  const onFiles = (files: File[]) => {
    setLastFiles(files.length ? files.map((f) => f.name + " (" + f.size + " o)").join(", ") : "");
  };

  const pythonCode = "bpm.fileuploader(label=\"" + label.replace(/"/g, '\\"') + "\", accept=\"" + accept.replace(/"/g, '\\"') + "\", multiple=" + multiple + ", disabled=" + disabled + ")";
  const { prev, next } = getPrevNext("fileuploader");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.fileuploader</div>
        <h1>bpm.fileuploader</h1>
        <p className="doc-description">Sélection de fichier(s) (bouton + input file caché).</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Saisie</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <FileUploader
            label={label || "Choisir un fichier"}
            accept={accept || undefined}
            multiple={multiple}
            disabled={disabled}
            onFiles={onFiles}
          />
          {lastFiles && (
            <p className="text-xs mt-2" style={{ color: "var(--bpm-text-secondary)" }}>
              Sélectionné : {lastFiles}
            </p>
          )}
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>label</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Choisir un fichier" />
          </div>
          <div className="sandbox-control-group">
            <label>accept (ex: .pdf, image/*)</label>
            <input type="text" value={accept} onChange={(e) => setAccept(e.target.value)} placeholder="vide = tous" />
          </div>
          <div className="sandbox-control-group">
            <label>multiple</label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={multiple} onChange={(e) => setMultiple(e.target.checked)} />
              Plusieurs fichiers
            </label>
          </div>
          <div className="sandbox-control-group">
            <label>disabled</label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} />
              Désactivé
            </label>
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

      <h2 className="text-lg font-semibold mt-8 mb-2">Paramètres</h2>
      <table className="props-table w-full border-collapse text-sm">
        <thead><tr><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Paramètre</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Type</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Défaut</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Requis</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Description</th></tr></thead>
        <tbody>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>label</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>string</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>—</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Non</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Libellé ou texte de la zone de dépôt.</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>accept</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>string</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>—</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Non</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Types acceptés (ex. &quot;.pdf,.doc&quot;).</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>multiple</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>boolean</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>false</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Non</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Autoriser plusieurs fichiers.</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>disabled</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>boolean</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>false</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Non</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Désactive l&apos;upload.</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>onFiles</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>function</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>—</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Non</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Callback (fichiers sélectionnés).</td></tr>
        </tbody>
      </table>
      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={"bpm.fileuploader(label=\"Choisir un fichier\")"} language="python" />
      <CodeBlock code={"bpm.fileuploader(accept=\".pdf\", multiple=True)"} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
