"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm/CodeBlock";
import { Metric } from "@/components/bpm/Metric";
import registry from "@/lib/generated/bpm-components.json";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { fmt } from "@/lib/i18n";

export default function GettingStartedPage() {
  const { dict } = useI18n();
  const gs = dict.gettingStarted;
  const count = registry.components.length;

  // Surface React/JSX — live, publiée npm, exposée par le MCP (chemin mis en avant).
  const reactInstall = "npm i @blueprint-modular/core";
  const reactUsage = `import { bpm } from "@blueprint-modular/core";
import "@blueprint-modular/core/dist/style.css";

export default function Dashboard() {
  return bpm.metric({ label: "${dict.homeDemo.revenue}", value: "142 500 €", delta: 12 });
}`;

  // Surface Python — publiée PyPI, CLI bpm (chemin secondaire, réel).
  const pythonSteps: { code: string; lang: "bash" | "python" }[] = [
    { code: "pip install blueprint-modular", lang: "bash" },
    { code: "bpm init --name mon-app\ncd mon-app", lang: "bash" },
    { code: `import bpm\n\nbpm.metric("${dict.homeDemo.revenue}", 142500, delta=3200)\n\n# bpm run app.py`, lang: "python" },
  ];

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <h1>{gs.title}</h1>
        <p className="doc-description">{gs.lead}</p>
      </div>

      {/* Surface Python — tête d'affiche (pip + bpm run), chemin réel */}
      <section className="site-step" style={{ maxWidth: 720, marginBottom: 28 }}>
        <h3>{gs.pythonTrack.label}</h3>
        <p style={{ marginBottom: 14 }}>{gs.pythonTrack.body}</p>
        <ol className="site-steps" style={{ gridTemplateColumns: "1fr", margin: 0 }}>
          {gs.steps.map((step, i) => (
            <li className="site-step" key={step.title} style={{ border: "none", padding: 0 }}>
              <h4 style={{ margin: "0 0 6px" }}>{step.title}</h4>
              <p style={{ marginBottom: 10 }}>{step.body}</p>
              <CodeBlock code={pythonSteps[i]?.code ?? ""} language={pythonSteps[i]?.lang ?? "bash"} />
              {i === 2 && (
                <div style={{ marginTop: 14 }}>
                  <span className="site-pane-label">{gs.previewLabel}</span>
                  <div
                    style={{
                      border: "1px solid var(--bpm-border)",
                      borderRadius: "var(--bpm-radius)",
                      background: "var(--bpm-bg-secondary)",
                      padding: 20,
                    }}
                  >
                    <Metric label={dict.homeDemo.revenue} value="142 500" delta={3200} />
                  </div>
                </div>
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* Surface React/JSX — co-équale (même objet bpm, exposée au MCP) */}
      <section className="site-step" style={{ maxWidth: 720, marginBottom: 28 }}>
        <h3>{gs.reactTrack.label}</h3>
        <p style={{ marginBottom: 14 }}>{gs.reactTrack.body}</p>
        <CodeBlock code={reactInstall} language="bash" />
        <div style={{ marginTop: 12 }}>
          <CodeBlock code={reactUsage} language="tsx" />
        </div>
        <p style={{ margin: "10px 0 0", fontSize: 13.5, color: "var(--bpm-text-secondary)" }}>
          {gs.reactTrack.usageNote}
        </p>
      </section>

      <section style={{ maxWidth: 720 }}>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--bpm-text-primary)" }}>
          {gs.next.title}
        </h2>
        <ul style={{ display: "grid", gap: 8, padding: 0, listStyle: "none", margin: 0 }}>
          <li style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--bpm-text-secondary)" }}>
            <Link href="/composants" style={{ color: "var(--bpm-color-link)" }}>
              {fmt(gs.next.catalog, { count })}
            </Link>
          </li>
          <li style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--bpm-text-secondary)" }}>
            <a href="/llms.txt" style={{ color: "var(--bpm-color-link)" }}>
              {gs.next.llms}
            </a>
          </li>
        </ul>
      </section>

      <p className="mt-8 text-sm">
        <Link href="/docs" className="hover:underline" style={{ color: "var(--bpm-accent-cyan)", textDecoration: "none" }}>
          {gs.backToDocs}
        </Link>
      </p>
    </div>
  );
}
