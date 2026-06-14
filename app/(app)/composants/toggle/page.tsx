"use client";

import { useState } from "react";
import Link from "next/link";
import { Toggle, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  breadcrumb: "Composants",
  description: "Interrupteur on/off pour une option booléenne.",
  category: "Interaction",
  checkedLabel: "Coché",
  disabledLabel: "Désactivé",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  yes: "Oui",
  no: "Non",
  examples: "Exemples",
  descLabel: "Texte à côté du switch.",
  descValue: "État activé/désactivé.",
  descOnChange: "Callback au changement.",
  descDisabled: "Désactive le toggle.",
};
const en: typeof fr = {
  breadcrumb: "Components",
  description: "On/off switch for a boolean option.",
  category: "Interaction",
  checkedLabel: "Checked",
  disabledLabel: "Disabled",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  yes: "Yes",
  no: "No",
  examples: "Examples",
  descLabel: "Text next to the switch.",
  descValue: "On/off state.",
  descOnChange: "Callback on change.",
  descDisabled: "Disables the toggle.",
};
const L = { fr, en } as const;

export default function DocTogglePage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [label, setLabel] = useState("Activer les notifications");
  const [value, setValue] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const pythonCode =
    "bpm.toggle(label=\"" + label.replace(/"/g, "\\\"") + "\", checked=" + String(value) + ", disabled=" + String(disabled) + ")";

  const { prev, next } = getPrevNext("toggle");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/composants">{t.breadcrumb}</Link> → bpm.toggle</div>
        <h1>bpm.toggle</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Toggle label={label} value={value} onChange={setValue} disabled={disabled} />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>label</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>checked</label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setValue(e.target.checked)}
              />
              {t.checkedLabel}
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
          <tr>
            <td><code>label</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.descLabel}</td>
          </tr>
          <tr>
            <td><code>value</code></td>
            <td><code>boolean</code></td>
            <td>—</td>
            <td>{t.yes}</td>
            <td>{t.descValue}</td>
          </tr>
          <tr>
            <td><code>onChange</code></td>
            <td><code>function</code></td>
            <td>—</td>
            <td>{t.yes}</td>
            <td>{t.descOnChange}</td>
          </tr>
          <tr>
            <td><code>disabled</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>{t.no}</td>
            <td>{t.descDisabled}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'bpm.toggle(label="Activer", checked=state, onChange=set_state)'} language="python" />
      <CodeBlock code={'bpm.toggle(label="Option", checked=False, disabled=True)'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
