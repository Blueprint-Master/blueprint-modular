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
          <figure className="site-hero-signature">
            {/* Panneau de code sombre : le snippet bpm qui produit la carte ci-dessous */}
            <div className="site-code-pane">
              <div className="site-code-bar" aria-hidden="true">
                <span className="site-code-dot" />
                <span className="site-code-dot" />
                <span className="site-code-dot" />
                <span className="site-code-file site-mono">app.py</span>
              </div>
              <pre>
                <code>
                  <span className="tok-kw">import</span> bpm{"\n\n"}
                  bpm.<span className="tok-fn">metric</span>(<span className="tok-str">&quot;{demo.revenue}&quot;</span>, <span className="tok-str">&quot;142 500 €&quot;</span>, delta=<span className="tok-num">12</span>){"\n"}
                  bpm.<span className="tok-fn">status_tracker</span>(stages=[<span className="tok-str">&quot;{demo.stageValidation}&quot;</span>, …]){"\n"}
                  bpm.<span className="tok-fn">live_gauge</span>(value=<span className="tok-num">76</span>, label=<span className="tok-str">&quot;{demo.gaugeLabel}&quot;</span>){"\n"}
                </code>
              </pre>
            </div>
            <div className="site-code-arrow" aria-hidden="true">
              ↓&nbsp;&nbsp;{dict.common.rendered}&nbsp;&nbsp;↓
            </div>
            {/* Rendu réel : composants bpm du package (non remplacés) */}
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
          </figure>
          <span className="site-demo-caption">{home.hero.demoCaption}</span>
        </div>
      </div>
    </section>
  );
}
