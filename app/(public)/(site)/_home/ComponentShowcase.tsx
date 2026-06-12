import Link from "next/link";
import {
  ActivityFeed,
  AnomalyAlert,
  ApprovalFlow,
  Badge,
  LiveGauge,
  Metric,
  Progress,
  StatusTracker,
} from "@/components/bpm";
import type { Dictionary } from "@/lib/i18n";
import { fmt } from "@/lib/i18n";
import { COMPONENT_COUNT, FAMILY_ORDER, familyCounts } from "./data";
import { ShowcaseSource } from "./ShowcaseSource";

export function ComponentShowcase({ dict }: { dict: Dictionary }) {
  const catalog = dict.home.catalog;
  const showcase = dict.home.showcase;
  const demo = dict.homeDemo;
  const families = showcase.families;
  const tiles = showcase.tiles;
  const counts = familyCounts();

  // Surface Python : la ligne exacte qui produit chaque tuile. Les libellés sont
  // tirés du même dictionnaire que le rendu → fidélité garantie et parité FR/EN.
  const source = {
    metric: `bpm.metric(label="${demo.revenue}", value="142 500 €", delta=12)`,
    status: `bpm.status_tracker(stages=[("${demo.stageCreated}", "completed"), ("${demo.stageValidation}", "current"), ("${demo.stageClosed}", "pending")])`,
    gauge: `bpm.live_gauge(value=76, warning_above=70, critical_above=90, label="${demo.gaugeLabel}")`,
    progress: `bpm.progress(value=74, label="${showcase.progressLabel}", show_value=True)\nbpm.badge("${demo.statusOk}", variant="success")\nbpm.badge("${showcase.badgeReview}", variant="warning")`,
    approval: `bpm.approval_flow(steps=[("${showcase.approver1}", "${showcase.role1}", "approved"), ("${showcase.approver2}", "${showcase.role2}", "pending")])`,
    activity: `bpm.activity_feed(activities=[("${showcase.approver1}", "${showcase.activityAction}", "${showcase.activityTarget}")])`,
    anomaly: `bpm.anomaly_alert(title="${showcase.anomalyTitle}", expected="${showcase.anomalyExpected}", actual="${showcase.anomalyActual}", severity="warning")`,
  };

  const copyLabels = { copy: showcase.copy, copied: showcase.copied };

  return (
    <section className="site-section site-section-bordered">
      <div className="site-container">
        <h2>{fmt(catalog.title, { count: COMPONENT_COUNT })}</h2>
        <p className="site-section-body">{catalog.body}</p>

        {/* Familles : compteurs réels issus du registre généré */}
        <ul className="site-family-grid">
          {FAMILY_ORDER.map(({ key, category }) => (
            <li className="site-family-card" key={key}>
              <span className="site-family-count">{counts.get(category) ?? 0}</span>
              <span className="site-family-label">{families[key]}</span>
            </li>
          ))}
        </ul>

        {/* Rendu réel de quelques composants, par famille */}
        <h3 className="site-showcase-subtitle">{showcase.liveTitle}</h3>
        <p className="site-section-body">{showcase.liveBody}</p>
        <div className="site-showcase-grid">
          <ShowcaseTile family={tiles.metric} source={source.metric} copy={copyLabels}>
            <Metric label={dict.homeDemo.revenue} value="142 500 €" delta={12} currency="%" />
          </ShowcaseTile>

          <ShowcaseTile family={tiles.status} source={source.status} copy={copyLabels}>
            <StatusTracker
              compact
              direction="horizontal"
              stages={[
                { label: dict.homeDemo.stageCreated, status: "completed" },
                { label: dict.homeDemo.stageValidation, status: "current" },
                { label: dict.homeDemo.stageClosed, status: "pending" },
              ]}
            />
          </ShowcaseTile>

          <ShowcaseTile family={tiles.gauge} source={source.gauge} copy={copyLabels}>
            <div className="site-showcase-center">
              <LiveGauge
                value={76}
                min={0}
                max={100}
                warningAbove={70}
                criticalAbove={90}
                label={dict.homeDemo.gaugeLabel}
                size="sm"
              />
            </div>
          </ShowcaseTile>

          <ShowcaseTile family={tiles.progress} source={source.progress} copy={copyLabels}>
            <Progress value={74} max={100} label={showcase.progressLabel} showValue />
            <div className="site-showcase-badges">
              <Badge variant="success">{dict.homeDemo.statusOk}</Badge>
              <Badge variant="warning">{showcase.badgeReview}</Badge>
            </div>
          </ShowcaseTile>

          <ShowcaseTile family={tiles.approval} source={source.approval} copy={copyLabels}>
            <ApprovalFlow
              direction="vertical"
              steps={[
                { id: "1", approver: showcase.approver1, role: showcase.role1, status: "approved" },
                { id: "2", approver: showcase.approver2, role: showcase.role2, status: "pending" },
              ]}
            />
          </ShowcaseTile>

          <ShowcaseTile family={tiles.activity} source={source.activity} copy={copyLabels}>
            <ActivityFeed
              compact
              activities={[
                {
                  id: "1",
                  actor: showcase.approver1,
                  action: showcase.activityAction,
                  target: showcase.activityTarget,
                  timestamp: "2026-06-11T09:00:00.000Z",
                  color: "success",
                },
              ]}
            />
          </ShowcaseTile>

          <ShowcaseTile family={tiles.anomaly} source={source.anomaly} copy={copyLabels}>
            <AnomalyAlert
              title={showcase.anomalyTitle}
              expected={showcase.anomalyExpected}
              actual={showcase.anomalyActual}
              severity="warning"
            />
          </ShowcaseTile>
        </div>

        <div className="site-hero-actions">
          <Link href="/components" className="site-cta-primary">
            {catalog.ctaGallery}
          </Link>
          <Link href="/docs/components" className="site-cta-secondary">
            {catalog.ctaCatalog}
          </Link>
        </div>
      </div>
    </section>
  );
}

function ShowcaseTile({
  family,
  source,
  copy,
  children,
}: {
  family: string;
  source: string;
  copy: { copy: string; copied: string };
  children: React.ReactNode;
}) {
  return (
    <figure className="site-showcase-tile">
      <div className="site-demo-panel">{children}</div>
      <figcaption className="site-showcase-tile-caption">{family}</figcaption>
      <ShowcaseSource source={source} label={family} copyLabel={copy.copy} copiedLabel={copy.copied} />
    </figure>
  );
}
