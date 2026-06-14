"use client";

import { useState } from "react";
import Link from "next/link";
import { Popover, Button, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

type Placement = "top" | "bottom" | "left" | "right";

export default function DocPopoverPage() {
  const { locale } = useI18n();
  const fr = {
    breadcrumb: "Composants",
    description: "Contenu au clic sur un déclencheur (trigger).",
    category: "Mise en page",
    triggerLabelCtrl: "trigger (label)",
    childrenCtrl: "children (contenu)",
    contentPlaceholder: "Contenu…",
    copy: "Copier",
    paramsTitle: "Paramètres",
    head: { param: "Paramètre", type: "Type", def: "Défaut", req: "Requis", desc: "Description" },
    yes: "Oui",
    no: "Non",
    rows: {
      trigger: "Élément déclencheur (ex. bouton).",
      children: "Contenu affiché au clic.",
      placement: "Position du popover.",
    },
    exampleTitle: "Exemple",
    demoTrigger: "Ouvrir",
    demoContent: "Contenu du popover",
  };
  const en: typeof fr = {
    breadcrumb: "Components",
    description: "Content shown on click of a trigger.",
    category: "Layout",
    triggerLabelCtrl: "trigger (label)",
    childrenCtrl: "children (content)",
    contentPlaceholder: "Content…",
    copy: "Copy",
    paramsTitle: "Parameters",
    head: { param: "Parameter", type: "Type", def: "Default", req: "Required", desc: "Description" },
    yes: "Yes",
    no: "No",
    rows: {
      trigger: "Trigger element (e.g. a button).",
      children: "Content shown on click.",
      placement: "Popover position.",
    },
    exampleTitle: "Example",
    demoTrigger: "Open",
    demoContent: "Popover content",
  };
  const L = { fr, en } as const;
  const t = L[locale];

  const [triggerLabel, setTriggerLabel] = useState(t.demoTrigger);
  const [content, setContent] = useState(t.demoContent);
  const [placement, setPlacement] = useState<Placement>("bottom");

  const escapedTrigger = triggerLabel.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const escapedContent = content.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const pythonCode = "bpm.popover(trigger=bpm.button(\"" + escapedTrigger + "\"), content=bpm.text(\"" + escapedContent + "\"), placement=\"" + placement + "\")";
  const { prev, next } = getPrevNext("popover");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/composants">{t.breadcrumb}</Link> → bpm.popover</div>
        <h1>bpm.popover</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">{t.category}</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Popover
            placement={placement}
            trigger={<Button size="small">{triggerLabel || t.demoTrigger}</Button>}
          >
            <span className="text-sm" style={{ color: "var(--bpm-text-primary)" }}>{content || " "}</span>
          </Popover>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>{t.triggerLabelCtrl}</label>
            <input type="text" value={triggerLabel} onChange={(e) => setTriggerLabel(e.target.value)} placeholder={t.demoTrigger} />
          </div>
          <div className="sandbox-control-group">
            <label>{t.childrenCtrl}</label>
            <input type="text" value={content} onChange={(e) => setContent(e.target.value)} placeholder={t.contentPlaceholder} />
          </div>
          <div className="sandbox-control-group">
            <label>placement</label>
            <select value={placement} onChange={(e) => setPlacement(e.target.value as Placement)}>
              <option value="top">top</option>
              <option value="bottom">bottom</option>
              <option value="left">left</option>
              <option value="right">right</option>
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

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.paramsTitle}</h2>
      <table className="props-table w-full border-collapse text-sm">
        <thead><tr><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.head.param}</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.head.type}</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.head.def}</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.head.req}</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.head.desc}</th></tr></thead>
        <tbody>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>trigger</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>ReactNode</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>—</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.yes}</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.rows.trigger}</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>children</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>ReactNode</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>—</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.yes}</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.rows.children}</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>placement</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>top | bottom | left | right</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>bottom</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.no}</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.rows.placement}</td></tr>
        </tbody>
      </table>
      <h2 className="text-lg font-semibold mt-8 mb-2">{t.exampleTitle}</h2>
      <CodeBlock code={"bpm.popover(trigger=bpm.button(\"Ouvrir\"), content=bpm.text(\"Contenu\"))"} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
