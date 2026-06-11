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
  const stepCodes = [
    "pip install blueprint-modular",
    "bpm init --name mon-app\ncd mon-app",
    `import bpm\n\nbpm.metric("${dict.homeDemo.revenue}", 142500, delta=3200)\n\n# bpm run app.py`,
  ];

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <h1>{gs.title}</h1>
        <p className="doc-description">{gs.lead}</p>
      </div>

      <ol className="site-steps" style={{ gridTemplateColumns: "1fr", maxWidth: 720 }}>
        {gs.steps.map((step, i) => (
          <li className="site-step" key={step.title}>
            <h3>{step.title}</h3>
            <p style={{ marginBottom: 14 }}>{step.body}</p>
            <CodeBlock code={stepCodes[i] ?? ""} language={i === 2 ? "python" : "bash"} />
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

      <section style={{ maxWidth: 720 }}>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--bpm-text-primary)" }}>
          {gs.next.title}
        </h2>
        <ul style={{ display: "grid", gap: 8, padding: 0, listStyle: "none", margin: 0 }}>
          <li style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--bpm-text-secondary)" }}>
            <Link href="/docs/components" style={{ color: "var(--bpm-color-link)" }}>
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
