"use client";

import { useState } from "react";
import Link from "next/link";
import { ScrollContainer, CodeBlock, Text } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

type DirectionOption = "vertical" | "horizontal" | "both";

export default function DocScrollContainerPage() {
  const { locale } = useI18n();
  const fr = {
    breadcrumb: "Composants",
    description: "Conteneur avec défilement interne (hauteur max, scrollbar optionnelle).",
    category: "Mise en page",
    copy: "Copier",
    head: { prop: "Prop", type: "Type", def: "Défaut", req: "Requis", desc: "Description" },
    yes: "Oui",
    no: "Non",
    rows: {
      children: "Contenu scrollable.",
      height: "Hauteur du conteneur.",
      maxHeight: "Hauteur max pour activer le scroll.",
      direction: "Direction du défilement.",
      hideScrollbar: "Masquer la scrollbar visuelle.",
    },
    examples: "Exemples",
    line: "Ligne de contenu",
  };
  const en: typeof fr = {
    breadcrumb: "Components",
    description: "Container with internal scrolling (max height, optional scrollbar).",
    category: "Layout",
    copy: "Copy",
    head: { prop: "Prop", type: "Type", def: "Default", req: "Required", desc: "Description" },
    yes: "Yes",
    no: "No",
    rows: {
      children: "Scrollable content.",
      height: "Container height.",
      maxHeight: "Max height to enable scrolling.",
      direction: "Scroll direction.",
      hideScrollbar: "Hide the visual scrollbar.",
    },
    examples: "Examples",
    line: "Content line",
  };
  const L = { fr, en } as const;
  const t = L[locale];

  const [maxHeight, setMaxHeight] = useState(180);
  const [direction, setDirection] = useState<DirectionOption>("vertical");
  const [hideScrollbar, setHideScrollbar] = useState(false);

  const pyMaxHeight = `max_height=${maxHeight}`;
  const pyDirection = direction !== "vertical" ? `, direction="${direction}"` : "";
  const pyHide = hideScrollbar ? ", hide_scrollbar=True" : "";
  const pythonCode = `bpm.scrollContainer(${pyMaxHeight}${pyDirection}${pyHide})`;
  const { prev, next } = getPrevNext("scrollcontainer");

  const sampleContent = (
    <div style={{ padding: 8 }}>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} style={{ padding: "8px 0", borderBottom: "1px solid var(--bpm-border)" }}>
          <Text>{t.line} {i}</Text>
        </div>
      ))}
    </div>
  );

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/composants">{t.breadcrumb}</Link> → bpm.scrollContainer</div>
        <h1>bpm.scrollContainer</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <ScrollContainer maxHeight={maxHeight} direction={direction} hideScrollbar={hideScrollbar}>
            {sampleContent}
          </ScrollContainer>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>maxHeight (px)</label>
            <input type="number" min={80} value={maxHeight} onChange={(e) => setMaxHeight(Number(e.target.value) || 180)} />
          </div>
          <div className="sandbox-control-group">
            <label>direction</label>
            <select value={direction} onChange={(e) => setDirection(e.target.value as DirectionOption)}>
              <option value="vertical">vertical</option>
              <option value="horizontal">horizontal</option>
              <option value="both">both</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>hideScrollbar</label>
            <select value={hideScrollbar ? "true" : "false"} onChange={(e) => setHideScrollbar(e.target.value === "true")}>
              <option value="false">false</option>
              <option value="true">true</option>
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
          <tr><th>{t.head.prop}</th><th>{t.head.type}</th><th>{t.head.def}</th><th>{t.head.req}</th><th>{t.head.desc}</th></tr>
        </thead>
        <tbody>
          <tr><td><code>children</code></td><td><code>ReactNode</code></td><td>—</td><td>{t.yes}</td><td>{t.rows.children}</td></tr>
          <tr><td><code>height</code></td><td><code>string | number</code></td><td>100%</td><td>{t.no}</td><td>{t.rows.height}</td></tr>
          <tr><td><code>maxHeight</code></td><td><code>string | number</code></td><td>—</td><td>{t.no}</td><td>{t.rows.maxHeight}</td></tr>
          <tr><td><code>direction</code></td><td><code>vertical | horizontal | both</code></td><td>vertical</td><td>{t.no}</td><td>{t.rows.direction}</td></tr>
          <tr><td><code>hideScrollbar</code></td><td><code>boolean</code></td><td>false</td><td>{t.no}</td><td>{t.rows.hideScrollbar}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={"bpm.scrollContainer(max_height=200)  # contenu avec scroll vertical"} language="python" />
      <CodeBlock code={'bpm.scrollContainer(max_height=150, hide_scrollbar=True)'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
