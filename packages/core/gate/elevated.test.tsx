/**
 * Tests d'élévation des instruments — pour chaque instrument élevé :
 *  1. l'appel historique (fixture) reste rendu à l'identique (pas de marqueur de jugement),
 *  2. avec `context`, le composant révèle le jugement (data-judgment / role=status),
 *  3. avec une trajectoire v(t), la tendance est exposée.
 */
import { render, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import React from "react";
import { Metric } from "../../../components/bpm";

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
