"use client";

import { useState } from "react";
import Link from "next/link";
import { FileUploader, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  components: "Composants",
  description: "Sélection de fichier(s) (bouton + input file caché).",
  category: "Saisie",
  selected: "Sélectionné : ",
  phLabel: "Choisir un fichier",
  phAccept: "vide = tous",
  multipleLabel: "Plusieurs fichiers",
  disabledLabel: "Désactivé",
  copy: "Copier",
  parameters: "Paramètres",
  thParameter: "Paramètre",
  thDefault: "Défaut",
  thRequired: "Requis",
  no: "Non",
  examples: "Exemples",
  d_label: "Libellé ou texte de la zone de dépôt.",
  d_accept: "Types acceptés (ex. ",
  d_accept2: ").",
  d_multiple: "Autoriser plusieurs fichiers.",
  d_disabled: "Désactive l’upload.",
  d_onFiles: "Callback (fichiers sélectionnés).",
};

const en: typeof fr = {
  components: "Components",
  description: "File selection (button + hidden file input).",
  category: "Inputs",
  selected: "Selected: ",
  phLabel: "Choose a file",
  phAccept: "empty = all",
  multipleLabel: "Multiple files",
  disabledLabel: "Disabled",
  copy: "Copy",
  parameters: "Parameters",
  thParameter: "Parameter",
  thDefault: "Default",
  thRequired: "Required",
  no: "No",
  examples: "Examples",
  d_label: "Label or text of the drop zone.",
  d_accept: "Accepted types (e.g. ",
  d_accept2: ").",
  d_multiple: "Allow multiple files.",
  d_disabled: "Disables the upload.",
  d_onFiles: "Callback (selected files).",
};

const L = { fr, en } as const;

export default function DocFileUploaderPage() {
  const { locale } = useI18n();
  const t = L[locale];
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
        <div className="doc-breadcrumb"><Link href="/composants">{t.components}</Link> → bpm.fileuploader</div>
        <h1>bpm.fileuploader</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">{t.category}</span>
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
              {t.selected}{lastFiles}
            </p>
          )}
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>label</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder={t.phLabel} />
          </div>
          <div className="sandbox-control-group">
            <label>accept (ex: .pdf, image/*)</label>
            <input type="text" value={accept} onChange={(e) => setAccept(e.target.value)} placeholder={t.phAccept} />
          </div>
          <div className="sandbox-control-group">
            <label>multiple</label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={multiple} onChange={(e) => setMultiple(e.target.checked)} />
              {t.multipleLabel}
            </label>
          </div>
          <div className="sandbox-control-group">
            <label>disabled</label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} />
              {t.disabledLabel}
            </label>
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

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.parameters}</h2>
      <table className="props-table w-full border-collapse text-sm">
        <thead><tr><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.thParameter}</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Type</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.thDefault}</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.thRequired}</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Description</th></tr></thead>
        <tbody>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>label</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>string</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>—</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.no}</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.d_label}</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>accept</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>string</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>—</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.no}</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.d_accept}<code>&quot;.pdf,.doc&quot;</code>{t.d_accept2}</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>multiple</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>boolean</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>false</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.no}</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.d_multiple}</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>disabled</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>boolean</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>false</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.no}</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.d_disabled}</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>onFiles</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>function</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>—</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.no}</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.d_onFiles}</td></tr>
        </tbody>
      </table>
      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={"bpm.fileuploader(label=\"Choisir un fichier\")"} language="python" />
      <CodeBlock code={"bpm.fileuploader(accept=\".pdf\", multiple=True)"} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
