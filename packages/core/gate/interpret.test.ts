/**
 * Tests d'assertion de la primitive interpret(value, context).
 * Garantit la sémantique du jugement partagé par tous les instruments bpm.*.
 */
import { describe, it, expect } from "vitest";
import { interpret } from "../../../components/bpm/interpret";

describe("interpret — niveau (gap orienté)", () => {
  it("valeur >> reference & higher_is_better → favorable, gap > 0", () => {
    const j = interpret(150, { reference: 100, direction: "higher_is_better" });
    expect(j.level.status).toBe("favorable");
    expect(j.level.gap).toBe(50);
    expect(j.severity).toBe(0);
  });

  it("valeur >> reference & lower_is_better → unfavorable (orientation inversée)", () => {
    const j = interpret(150, { reference: 100, direction: "lower_is_better" });
    expect(j.level.status).toBe("unfavorable");
    expect(j.level.gap).toBe(-50);
    expect(j.severity).toBeGreaterThan(0);
  });

  it("valeur << reference & lower_is_better → favorable", () => {
    const j = interpret(40, { reference: 100, direction: "lower_is_better" });
    expect(j.level.status).toBe("favorable");
    expect(j.level.gap).toBe(60);
  });

  it("valeur ≈ reference (dans la bande neutre ±2 %) → neutral", () => {
    const j = interpret(101, { reference: 100, direction: "higher_is_better" });
    expect(j.level.status).toBe("neutral");
  });

  it("neutralBand personnalisable", () => {
    const j = interpret(108, { reference: 100, direction: "higher_is_better", neutralBand: 0.1 });
    expect(j.level.status).toBe("neutral");
  });
});

describe("interpret — tendance (trajectoire v(t))", () => {
  const down = [
    { t: 0, v: 100 },
    { t: 1, v: 80 },
    { t: 2, v: 60 },
  ];
  const up = [
    { t: 0, v: 60 },
    { t: 1, v: 80 },
    { t: 2, v: 100 },
  ];

  it("pente < 0 vs higher_is_better → worsening", () => {
    const j = interpret(down, { reference: 50, direction: "higher_is_better" });
    expect(j.trend?.status).toBe("worsening");
    expect(j.trend!.slope).toBeLessThan(0);
  });

  it("pente < 0 vs lower_is_better → improving", () => {
    const j = interpret(down, { reference: 50, direction: "lower_is_better" });
    expect(j.trend?.status).toBe("improving");
  });

  it("pente > 0 vs higher_is_better → improving", () => {
    const j = interpret(up, { reference: 50, direction: "higher_is_better" });
    expect(j.trend?.status).toBe("improving");
  });

  it("trajectoire plate → flat", () => {
    const j = interpret(
      [
        { t: 0, v: 100 },
        { t: 1, v: 100 },
      ],
      { reference: 100, direction: "higher_is_better" }
    );
    expect(j.trend?.status).toBe("flat");
  });

  it("current = dernier point ; points non triés acceptés ; Date acceptée", () => {
    const j = interpret(
      [
        { t: new Date("2026-01-03"), v: 30 },
        { t: new Date("2026-01-01"), v: 10 },
        { t: new Date("2026-01-02"), v: 20 },
      ],
      { reference: 0, direction: "higher_is_better" }
    );
    expect(j.current).toBe(30);
    expect(j.trend?.status).toBe("improving");
  });

  it("scalaire → pas de tendance", () => {
    const j = interpret(42, { reference: 10, direction: "higher_is_better" });
    expect(j.trend).toBeUndefined();
  });
});

describe("interpret — anomalie (comparisonFrame)", () => {
  it("valeur > 2σ du cadre → abnormal", () => {
    const j = interpret(200, {
      reference: 100,
      direction: "higher_is_better",
      comparisonFrame: [98, 100, 102, 99, 101],
    });
    expect(j.anomaly?.status).toBe("abnormal");
  });

  it("valeur dans le cadre → normal", () => {
    const j = interpret(100, {
      reference: 100,
      direction: "higher_is_better",
      comparisonFrame: [98, 100, 102, 99, 101],
    });
    expect(j.anomaly?.status).toBe("normal");
  });

  it("sans comparisonFrame → pas d'anomalie", () => {
    const j = interpret(100, { reference: 100, direction: "higher_is_better" });
    expect(j.anomaly).toBeUndefined();
  });
});

describe("interpret — sévérité combinée", () => {
  it("severity ∈ [0,1] et croît avec le cumul des écarts", () => {
    const ok = interpret(120, { reference: 100, direction: "higher_is_better" });
    const bad = interpret(
      [
        { t: 0, v: 90 },
        { t: 1, v: 70 },
        { t: 2, v: 50 },
      ],
      {
        reference: 100,
        direction: "higher_is_better",
        comparisonFrame: [98, 100, 102, 99, 101],
      }
    );
    expect(ok.severity).toBe(0);
    expect(bad.severity).toBeGreaterThan(0.5);
    expect(bad.severity).toBeLessThanOrEqual(1);
  });
});

describe("interpret — échelle du repère", () => {
  it.each([0.2, -0.2])("conserve niveau, tendance et sévérité pour le repère %s exprimé dans deux unités", (reference) => {
    const read = (factor: number) => interpret(
      [{ t: 0, v: reference * factor }, { t: 1, v: (reference + 0.01) * factor }],
      { reference: reference * factor, direction: "lower_is_better" }
    );
    const euros = read(1);
    const cents = read(100);
    expect(euros.level.status).toBe("unfavorable");
    expect(cents.level.status).toBe(euros.level.status);
    expect(euros.trend?.status).toBe("worsening");
    expect(cents.trend?.status).toBe(euros.trend?.status);
    expect(cents.severity).toBeCloseTo(euros.severity, 10);
  });

  it.each([1, 100])("inclut les deux bornes décimales à l'échelle %s", (factor) => {
    const reference = 0.20 * factor;
    const judge = (value: number) => interpret([{ t: 0, v: reference }, { t: 1, v: value * factor }],
      { reference, direction: "lower_is_better" });
    for (const value of [0.196, 0.204]) {
      expect(judge(value).level.status).toBe("neutral");
      expect(judge(value).trend?.status).toBe("flat");
    }
    expect(judge(0.1959).level.status).toBe("favorable");
    expect(judge(0.2041).level.status).toBe("unfavorable");
  });

  it("classe les mêmes valeurs décimales pour 99 prix en euros et en centimes", () => {
    for (let cents = 1; cents <= 99; cents++) {
      for (const reference of [cents / 100, cents]) {
        for (const percent of [-5, -2.05, -2, -1, 1, 2, 2.05, 5]) {
          const value = Number((reference * (1 + percent / 100)).toFixed(8));
          const expected = Math.abs(percent) <= 2 ? "neutral" : percent < 0 ? "favorable" : "unfavorable";
          expect(interpret(value, { reference, direction: "lower_is_better" }).level.status).toBe(expected);
        }
      }
    }
  });

  it("conserve une bande nulle ou inférieure à la résolution du repère", () => {
    for (const neutralBand of [0, Number.EPSILON / 10]) {
      const j = interpret(1 + Number.EPSILON, { reference: 1, direction: "higher_is_better", neutralBand });
      expect(j.level.status).toBe("favorable");
    }
  });

  it("conserve la tolérance absolue historique au repère zéro", () => {
    const atZero = { reference: 0, direction: "higher_is_better" as const };
    expect(interpret(0.01, atZero).level.status).toBe("neutral");
    expect(interpret(-0.03, atZero).level.status).toBe("unfavorable");
  });
});
