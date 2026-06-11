"use client";

import Link from "next/link";
import {
  Badge,
  CodeBlock,
  LiveGauge,
  Metric,
  MetricRow,
  StatusTracker,
} from "@/components/bpm";
import registry from "@/lib/generated/bpm-components.json";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { fmt } from "@/lib/i18n";

const COMPONENT_COUNT = registry.components.length;

function categoriesWithCounts(): { name: string; count: number }[] {
  const byCat = new Map<string, number>();
  for (const c of registry.components) {
    byCat.set(c.category, (byCat.get(c.category) ?? 0) + 1);
  }
  return Array.from(byCat.entries()).map(([name, count]) => ({ name, count }));
}

export function HomeContent() {
  const { dict } = useI18n();
  const home = dict.home;
  const demo = dict.homeDemo;
  const categories = categoriesWithCounts();

  const sampleCode = `import bpm\n\nbpm.metric("${demo.revenue}", 142500, delta=3200)`;

  return (
    <div>
      {/* Hero */}
      <section className="site-hero">
        <div className="site-container site-split">
          <div>
            <h1>{home.hero.title}</h1>
            <p className="site-lead">{fmt(home.hero.lead, { count: COMPONENT_COUNT })}</p>
            <div className="site-hero-actions">
              <Link href="/docs/getting-started" className="site-cta-primary">
                {home.hero.ctaPrimary}
              </Link>
              <Link href="/components" className="site-cta-secondary">
                {home.hero.ctaSecondary}
              </Link>
            </div>
            <p style={{ marginTop: 24 }}>
              <span className="site-kbd-line">{dict.common.installCommand}</span>
            </p>
          </div>
          <div>
            <div className="site-demo-panel">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <Badge variant="success">{demo.statusOk}</Badge>
                <span className="site-mono" style={{ fontSize: 12, color: "var(--bpm-text-muted)" }}>
                  bpm.*
                </span>
              </div>
              <MetricRow>
                <Metric label={demo.revenue} value="142 500 €" delta={12} currency="%" />
                <Metric label={demo.orders} value="1 284" delta={-3} currency="%" />
              </MetricRow>
              <div style={{ margin: "20px 0" }}>
                <StatusTracker
                  compact
                  direction="horizontal"
                  stages={[
                    { label: demo.stageCreated, status: "completed" },
                    { label: demo.stageAnalysis, status: "completed" },
                    { label: demo.stageValidation, status: "current" },
                    { label: demo.stageClosed, status: "pending" },
                  ]}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <LiveGauge value={76} min={0} max={100} warningAbove={70} criticalAbove={90} label={demo.gaugeLabel} size="sm" />
              </div>
            </div>
            <span className="site-demo-caption">{home.hero.demoCaption}</span>
          </div>
        </div>
      </section>

      {/* Pourquoi */}
      <section className="site-section" style={{ borderTop: "1px solid var(--bpm-border)" }}>
        <div className="site-container">
          <h2>{home.why.title}</h2>
          <ul className="site-points">
            {home.why.points.map((point) => (
              <li className="site-point" key={point.title}>
                <h3>{point.title}</h3>
                <p>{point.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Code → rendu */}
      <section className="site-section" style={{ borderTop: "1px solid var(--bpm-border)" }}>
        <div className="site-container">
          <h2>{home.codeDemo.title}</h2>
          <p className="site-section-body">{home.codeDemo.body}</p>
          <div className="site-split">
            <div>
              <span className="site-pane-label">{dict.common.code}</span>
              <CodeBlock code={sampleCode} language="python" />
            </div>
            <div>
              <span className="site-pane-label">{dict.common.rendered}</span>
              <div className="site-demo-panel">
                <Metric label={demo.revenue} value="142 500 €" delta={3200} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agents / llms.txt */}
      <section className="site-section" style={{ borderTop: "1px solid var(--bpm-border)" }}>
        <div className="site-container">
          <h2>{home.agents.title}</h2>
          <p className="site-section-body">{home.agents.body}</p>
          <a href="/llms.txt" className="site-cta-secondary site-mono">
            {home.agents.cta}
          </a>
        </div>
      </section>

      {/* Catalogue */}
      <section className="site-section" style={{ borderTop: "1px solid var(--bpm-border)" }}>
        <div className="site-container">
          <h2>{fmt(home.catalog.title, { count: COMPONENT_COUNT })}</h2>
          <p className="site-section-body">{home.catalog.body}</p>
          <div className="site-category-grid">
            {categories.map((cat) => (
              <div className="site-category-card" key={cat.name}>
                <span className="count">{cat.count}</span>
                <span className="label">{cat.name}</span>
              </div>
            ))}
          </div>
          <div className="site-hero-actions">
            <Link href="/components" className="site-cta-primary">
              {home.catalog.ctaGallery}
            </Link>
            <Link href="/docs/components" className="site-cta-secondary">
              {home.catalog.ctaCatalog}
            </Link>
          </div>
        </div>
      </section>

      {/* Installation */}
      <section className="site-section" style={{ borderTop: "1px solid var(--bpm-border)" }}>
        <div className="site-container">
          <h2>{home.install.title}</h2>
          <ol className="site-steps">
            {home.install.steps.map((step) => (
              <li className="site-step" key={step.title}>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
          <Link href="/docs/getting-started" className="site-cta-primary">
            {home.install.cta}
          </Link>
        </div>
      </section>
    </div>
  );
}
