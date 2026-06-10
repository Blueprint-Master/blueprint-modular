/**
 * Tests d'élévation des instruments — pour chaque instrument élevé :
 *  1. l'appel historique (fixture) reste rendu à l'identique (pas de marqueur de jugement),
 *  2. avec `context`, le composant révèle le jugement (data-judgment / role=status),
 *  3. avec une trajectoire v(t), la tendance est exposée.
 */
import { render, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import React from "react";
import { LiveGauge, Metric, Progress, ProgressRing } from "../../../components/bpm";

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
