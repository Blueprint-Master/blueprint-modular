/**
 * Tests d'élévation des instruments — pour chaque instrument élevé :
 *  1. l'appel historique (fixture) reste rendu à l'identique (pas de marqueur de jugement),
 *  2. avec `context`, le composant révèle le jugement (data-judgment / role=status),
 *  3. avec une trajectoire v(t), la tendance est exposée.
 */
import { render, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import React from "react";
import {
  HighlightBox,
  LabelValue,
  LiveGauge,
  Metric,
  Progress,
  ProgressRing,
  Sparkline,
  StatusBox,
} from "../../../components/bpm";

afterEach(cleanup);

const CTX_HIB = { reference: 100, direction: "higher_is_better" as const };

const TRAJ_DOWN = [
  { t: 1, v: 118 },
  { t: 2, v: 105 },
  { t: 3, v: 88 },
];

describe("elevate(instrument): metric", () => {
  it("sans context → aucun marqueur de jugement (rendu historique)", () => {
    const { container } = render(<Metric label="CA" value={42} />);
    expect(container.querySelector("[data-judgment]")).toBeNull();
  });

  it("avec context, valeur sous le repère → jugement unfavorable révélé", () => {
    const { container } = render(<Metric label="CA" value={60} context={CTX_HIB} />);
    const el = container.querySelector("[data-judgment]");
    expect(el?.getAttribute("data-judgment")).toBe("unfavorable");
    expect(container.querySelector('[role="status"]')).not.toBeNull();
  });

  it("avec trajectoire descendante → tendance révélée (sparkline) + dernier point affiché", () => {
    const { container } = render(<Metric label="CA" value={TRAJ_DOWN} currency="" context={CTX_HIB} />);
    expect(container.querySelector("[data-judgment]")?.getAttribute("data-judgment")).toBe(
      "unfavorable"
    );
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.textContent).toContain("88");
  });
});

describe("elevate(instrument): progressRing", () => {
  it("sans context → stroke accent, pas de jugement", () => {
    const { container } = render(<ProgressRing value={75} />);
    expect(container.querySelector("[data-judgment]")).toBeNull();
  });

  it("avec context défavorable → data-judgment=unfavorable", () => {
    const { container } = render(
      <ProgressRing value={55} context={CTX_HIB} max={100} />
    );
    expect(container.querySelector("[data-judgment]")?.getAttribute("data-judgment")).toBe(
      "unfavorable"
    );
  });

  it("trajectoire → flèche de tendance au centre", () => {
    const { container } = render(<ProgressRing value={TRAJ_DOWN} context={CTX_HIB} max={120} />);
    expect(container.querySelector("text")?.textContent).toBe("↘");
  });
});

describe("elevate(instrument): progress", () => {
  it("sans context → pas de jugement", () => {
    const { container } = render(<Progress value={0.5} />);
    expect(container.querySelector("[data-judgment]")).toBeNull();
  });

  it("avec context favorable → data-judgment=favorable + ligne status", () => {
    const { container } = render(
      <Progress value={0.9} max={1} context={{ reference: 0.8, direction: "higher_is_better" }} />
    );
    expect(container.querySelector("[data-judgment]")?.getAttribute("data-judgment")).toBe(
      "favorable"
    );
    expect(container.querySelector('[role="status"]')).not.toBeNull();
  });
});

describe("elevate(instrument): liveGauge", () => {
  it("sans context → pas de jugement", () => {
    const { container } = render(<LiveGauge value={62} />);
    expect(container.querySelector("[data-judgment]")).toBeNull();
  });

  it("lower_is_better, valeur au-dessus du repère → unfavorable", () => {
    const { container } = render(
      <LiveGauge value={85} context={{ reference: 60, direction: "lower_is_better" }} />
    );
    expect(container.querySelector("[data-judgment]")?.getAttribute("data-judgment")).toBe(
      "unfavorable"
    );
  });

  it("trajectoire montante & lower_is_better → worsening (↘) + dernier point", () => {
    const { container } = render(
      <LiveGauge
        value={[
          { t: 1, v: 40 },
          { t: 2, v: 55 },
          { t: 3, v: 72 },
        ]}
        context={{ reference: 60, direction: "lower_is_better" }}
      />
    );
    expect(container.textContent).toContain("72");
    expect(container.textContent).toContain("↘");
  });
});

describe("elevate(instrument): sparkline", () => {
  it("sans context → aria-hidden, pas de jugement", () => {
    const { container } = render(<Sparkline values={[1, 2, 3]} />);
    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector("[data-judgment]")).toBeNull();
  });

  it("avec context → data-judgment + ligne de repère + aria-label", () => {
    const { container } = render(
      <Sparkline values={[105, 98, 90]} context={CTX_HIB} />
    );
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("data-judgment")).toBe("unfavorable");
    expect(svg.getAttribute("role")).toBe("img");
    expect(svg.querySelectorAll("line").length).toBe(1);
  });

  it("points v(t) explicites → jugement sur la trajectoire", () => {
    const { container } = render(
      <Sparkline
        values={[]}
        points={[
          { t: 0, v: 40 },
          { t: 60, v: 66 },
        ]}
        context={{ reference: 50, direction: "higher_is_better" }}
      />
    );
    expect(container.querySelector("svg")?.getAttribute("data-judgment")).toBe("favorable");
  });
});

describe("elevate(instrument): labelValue", () => {
  it("sans context → pas de jugement", () => {
    const { container } = render(<LabelValue label="Réf" value="REF-001" />);
    expect(container.querySelector("[data-judgment]")).toBeNull();
  });

  it("valeur numérique sous le repère → unfavorable + suffixe ▼", () => {
    const { container } = render(
      <LabelValue label="Stock" value={12} context={CTX_HIB} />
    );
    expect(container.querySelector("[data-judgment]")?.getAttribute("data-judgment")).toBe(
      "unfavorable"
    );
    expect(container.textContent).toContain("▼");
  });

  it("trajectory descendante → tendance ↘ en suffixe", () => {
    const { container } = render(
      <LabelValue label="Stock" value={12} trajectory={TRAJ_DOWN} context={CTX_HIB} />
    );
    expect(container.textContent).toContain("↘");
  });

  it("valeur non numérique + context → pas de jugement (pas de NaN)", () => {
    const { container } = render(<LabelValue label="Réf" value="REF-001" context={CTX_HIB} />);
    expect(container.querySelector("[data-judgment]")).toBeNull();
  });
});

describe("elevate(instrument): statusBox", () => {
  it("sans value/context → pas de jugement", () => {
    const { container } = render(<StatusBox label="Sync" state="complete" />);
    expect(container.querySelector("[data-judgment]")).toBeNull();
  });

  it("value au-dessus du repère & lower_is_better → unfavorable + verdict", () => {
    const { container } = render(
      <StatusBox label="Queue" value={340} context={{ reference: 200, direction: "lower_is_better" }} />
    );
    expect(container.querySelector("[data-judgment]")?.getAttribute("data-judgment")).toBe(
      "unfavorable"
    );
    expect(container.querySelector('[role="status"]')).not.toBeNull();
  });

  it("trajectoire descendante & lower_is_better → improving", () => {
    const { container } = render(
      <StatusBox
        label="Queue"
        value={[
          { t: 1, v: 410 },
          { t: 2, v: 180 },
        ]}
        context={{ reference: 200, direction: "lower_is_better" }}
      />
    );
    expect(container.textContent).toContain("↗");
  });
});

describe("elevate(instrument): highlightBox", () => {
  it("sans measure/context → pas de jugement", () => {
    const { container } = render(<HighlightBox value={1} label="DAILY" title="Objectif" />);
    expect(container.querySelector("[data-judgment]")).toBeNull();
  });

  it("measure sous le repère & higher_is_better → unfavorable + verdict", () => {
    const { container } = render(
      <HighlightBox
        value={2}
        label="KPI"
        title="Conversion"
        measure={3.1}
        context={{ reference: 4.5, direction: "higher_is_better" }}
      />
    );
    expect(container.querySelector("[data-judgment]")?.getAttribute("data-judgment")).toBe(
      "unfavorable"
    );
    expect(container.querySelector('[role="status"]')).not.toBeNull();
  });
});
