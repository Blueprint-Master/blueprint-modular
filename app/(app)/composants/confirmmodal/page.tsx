"use client";

import { useState } from "react";
import Link from "next/link";
import { ConfirmModal, Button, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

type VariantOption = "danger" | "warning" | "info";

const fr = {
  components: "Composants",
  description: "Modal de confirmation pour actions destructives (danger, warning, info).",
  category: "Mise en page",
  defaultTitle: "Confirmer la suppression",
  defaultMessage: "Cette action est irréversible.",
  openButton: "Ouvrir la confirmation",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  thDescription: "Description",
  yes: "Oui",
  no: "Non",
  descIsOpen: "Contrôle l'affichage de la modal.",
  descOnConfirm: "Callback au clic Confirmer.",
  descOnCancel: "Callback Annuler / Escape.",
  descTitle: "Titre de la modal.",
  descMessage: "Message principal.",
  descVariant: "Style du bouton confirmer.",
  examples: "Exemples",
};

const en: typeof fr = {
  components: "Components",
  description: "Confirmation modal for destructive actions (danger, warning, info).",
  category: "Layout",
  defaultTitle: "Confirm deletion",
  defaultMessage: "This action is irreversible.",
  openButton: "Open confirmation",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  thDescription: "Description",
  yes: "Yes",
  no: "No",
  descIsOpen: "Controls the modal visibility.",
  descOnConfirm: "Callback on Confirm click.",
  descOnCancel: "Callback on Cancel / Escape.",
  descTitle: "Modal title.",
  descMessage: "Main message.",
  descVariant: "Confirm button style.",
  examples: "Examples",
};

const L = { fr, en } as const;

export default function DocConfirmModalPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState(t.defaultTitle);
  const [message, setMessage] = useState(t.defaultMessage);
  const [variant, setVariant] = useState<VariantOption>("danger");

  const pyTitle = title.replace(/"/g, '\\"');
  const pyMessage = message.replace(/"/g, '\\"');
  const pythonCode = `bpm.confirmModal(is_open=${isOpen}, on_confirm=fn, on_cancel=fn, title="${pyTitle}", message="${pyMessage}"${variant !== "danger" ? `, variant="${variant}"` : ""})`;
  const { prev, next } = getPrevNext("confirmmodal");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/composants">{t.components}</Link> → bpm.confirmModal</div>
        <h1>bpm.confirmModal</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Button onClick={() => setIsOpen(true)}>{t.openButton}</Button>
          <ConfirmModal
            isOpen={isOpen}
            onConfirm={() => setIsOpen(false)}
            onCancel={() => setIsOpen(false)}
            title={title}
            message={message}
            variant={variant}
          />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>message</label>
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>variant</label>
            <select value={variant} onChange={(e) => setVariant(e.target.value as VariantOption)}>
              <option value="danger">danger</option>
              <option value="warning">warning</option>
              <option value="info">info</option>
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
          <tr><th>Prop</th><th>Type</th><th>{t.thDefault}</th><th>{t.thRequired}</th><th>{t.thDescription}</th></tr>
        </thead>
        <tbody>
          <tr><td><code>isOpen</code></td><td><code>boolean</code></td><td>—</td><td>{t.yes}</td><td>{t.descIsOpen}</td></tr>
          <tr><td><code>onConfirm</code></td><td><code>() =&gt; void</code></td><td>—</td><td>{t.yes}</td><td>{t.descOnConfirm}</td></tr>
          <tr><td><code>onCancel</code></td><td><code>() =&gt; void</code></td><td>—</td><td>{t.yes}</td><td>{t.descOnCancel}</td></tr>
          <tr><td><code>title</code></td><td><code>string</code></td><td>—</td><td>{t.yes}</td><td>{t.descTitle}</td></tr>
          <tr><td><code>message</code></td><td><code>string</code></td><td>—</td><td>{t.yes}</td><td>{t.descMessage}</td></tr>
          <tr><td><code>variant</code></td><td><code>danger | warning | info</code></td><td>danger</td><td>{t.no}</td><td>{t.descVariant}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'bpm.confirmModal(is_open=True, on_confirm=fn, on_cancel=fn, title="Supprimer ?", message="Definitive.")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
