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

export function ComponentShowcase({ dict }: { dict: Dictionary }) {
  const catalog = dict.home.catalog;
  const showcase = dict.home.showcase;
  const families = showcase.families;
  const tiles = showcase.tiles;
  const counts = familyCounts();

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
          <ShowcaseTile family={tiles.metric}>
            <Metric label={dict.homeDemo.revenue} value="142 500 €" delta={12} currency="%" />
          </ShowcaseTile>

          <ShowcaseTile family={tiles.status}>
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

          <ShowcaseTile family={tiles.gauge}>
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

          <ShowcaseTile family={tiles.progress}>
            <Progress value={74} max={100} label={showcase.progressLabel} showValue />
            <div className="site-showcase-badges">
              <Badge variant="success">{dict.homeDemo.statusOk}</Badge>
              <Badge variant="warning">{showcase.badgeReview}</Badge>
            </div>
          </ShowcaseTile>

          <ShowcaseTile family={tiles.approval}>
            <ApprovalFlow
              direction="vertical"
              steps={[
                { id: "1", approver: showcase.approver1, role: showcase.role1, status: "approved" },
                { id: "2", approver: showcase.approver2, role: showcase.role2, status: "pending" },
              ]}
            />
          </ShowcaseTile>

          <ShowcaseTile family={tiles.activity}>
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

          <ShowcaseTile family={tiles.anomaly}>
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

function ShowcaseTile({ family, children }: { family: string; children: React.ReactNode }) {
  return (
    <figure className="site-showcase-tile">
      <div className="site-demo-panel">{children}</div>
      <figcaption className="site-showcase-tile-caption">{family}</figcaption>
    </figure>
  );
}
