import Link from "next/link";
import {
  Badge,
  LiveGauge,
  Metric,
  MetricRow,
  StatusTracker,
} from "@/components/bpm";
import type { Dictionary } from "@/lib/i18n";
import { fmt } from "@/lib/i18n";
import { COMPONENT_COUNT } from "./data";

export function Hero({ dict }: { dict: Dictionary }) {
  const home = dict.home;
  const demo = dict.homeDemo;

  return (
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
          <p className="site-hero-install">
            <span className="site-kbd-line">{dict.common.installCommand}</span>
          </p>
        </div>
        <div>
          <div className="site-demo-panel">
            <div className="site-demo-panel-head">
              <Badge variant="success">{demo.statusOk}</Badge>
              <span className="site-mono site-demo-panel-tag">bpm.*</span>
            </div>
            <MetricRow>
              <Metric label={demo.revenue} value="142 500 €" delta={12} currency="%" />
              <Metric label={demo.orders} value="1 284" delta={-3} currency="%" />
            </MetricRow>
            <div className="site-demo-panel-block">
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
            <div className="site-demo-panel-gauge">
              <LiveGauge
                value={76}
                min={0}
                max={100}
                warningAbove={70}
                criticalAbove={90}
                label={demo.gaugeLabel}
                size="sm"
              />
            </div>
          </div>
          <span className="site-demo-caption">{home.hero.demoCaption}</span>
        </div>
      </div>
    </section>
  );
}
