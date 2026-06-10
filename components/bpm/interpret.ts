/**
 * interpret(value, context) — primitive partagée de jugement.
 *
 * Un composant-instrument ne doit pas seulement AFFICHER une valeur mais
 * PORTER UN JUGEMENT : écart au repère (niveau), mouvement (tendance),
 * position dans un cadre de comparaison (anomalie), sévérité combinée.
 *
 * Cette primitive est construite UNE fois ici et réutilisée par tous les
 * composants bpm.* de classe INSTRUMENT via une prop optionnelle `context`
 * (additive : sans `context`, le rendu existant est inchangé).
 *
 * Pure, sans dépendance React — SSR-safe par construction.
 */

/** Point d'une trajectoire v(t). `t` accepte timestamp numérique ou Date. */
export interface TrajectoryPoint {
  t: number | Date;
  v: number;
}

/** Valeur interprétable : scalaire ou trajectoire v(t). */
export type InterpretValue = number | TrajectoryPoint[];

/** Sens d'amélioration : la valeur doit-elle monter ou descendre ? */
export type InterpretDirection = "higher_is_better" | "lower_is_better";

/** Contexte de jugement fourni par l'appelant. */
export interface InterpretContext {
  /** Repère contre lequel la valeur est jugée (cible, seuil, budget…). */
  reference: number;
  /** Orientation : higher_is_better (CA, uptime) ou lower_is_better (coût, latence). */
  direction: InterpretDirection;
  /** Cadre de comparaison (pairs, historique) pour la détection d'anomalie. */
  comparisonFrame?: number[];
  /**
   * Tolérance relative de la zone neutre autour du repère (défaut 0.02 = ±2 %).
   * En dessous de cet écart relatif, le niveau est jugé "neutral".
   */
  neutralBand?: number;
}

export type LevelStatus = "favorable" | "neutral" | "unfavorable";
export type TrendStatus = "improving" | "flat" | "worsening";
export type AnomalyStatus = "normal" | "abnormal";

/** Jugement porté sur la valeur. */
export interface Judgment {
  /** Écart au repère, orienté par direction (gap > 0 = favorable). */
  level: { gap: number; status: LevelStatus };
  /** Tendance (si trajectoire) : signe(dv/dt) orienté par direction. */
  trend?: { slope: number; status: TrendStatus };
  /** Position dans comparisonFrame (si fourni) : > 2 écarts-types = abnormal. */
  anomaly?: { status: AnomalyStatus };
  /** Sévérité combinée normalisée [0, 1] (0 = rien à signaler). */
  severity: number;
  /** Valeur courante effectivement jugée (scalaire, ou dernier point de la trajectoire). */
  current: number;
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

function toMs(t: number | Date): number {
  return t instanceof Date ? t.getTime() : t;
}

/** Pente par moindres carrés de v sur t (t normalisé pour la stabilité numérique). */
function leastSquaresSlope(points: TrajectoryPoint[]): number {
  const n = points.length;
  const t0 = toMs(points[0].t);
  const span = toMs(points[n - 1].t) - t0 || 1;
  let sx = 0,
    sy = 0,
    sxx = 0,
    sxy = 0;
  for (const p of points) {
    const x = (toMs(p.t) - t0) / span; // t ∈ [0, 1]
    sx += x;
    sy += p.v;
    sxx += x * x;
    sxy += x * p.v;
  }
  const denom = n * sxx - sx * sx;
  if (denom === 0) return 0;
  return (n * sxy - sx * sy) / denom;
}

/**
 * Porte un jugement sur `value` relativement à `context`.
 *
 * - level : gap orienté (higher_is_better → v − reference ; lower_is_better → reference − v).
 *   |gap| ≤ neutralBand × max(|reference|, 1) → neutral.
 * - trend : si trajectoire (≥ 2 points), pente orientée par direction.
 * - anomaly : si comparisonFrame (≥ 3 valeurs), |v − μ| > 2σ → abnormal.
 * - severity : 0.5 × écart-défavorable-normalisé + 0.25 × worsening + 0.25 × abnormal.
 */
export function interpret(value: InterpretValue, context: InterpretContext): Judgment {
  const { reference, direction, comparisonFrame } = context;
  const neutralBand = context.neutralBand ?? 0.02;
  const sign = direction === "higher_is_better" ? 1 : -1;

  const trajectory = Array.isArray(value)
    ? value.filter((p) => p && Number.isFinite(p.v)).slice()
    : null;
  if (trajectory) trajectory.sort((a, b) => toMs(a.t) - toMs(b.t));

  const current = trajectory
    ? trajectory.length > 0
      ? trajectory[trajectory.length - 1].v
      : NaN
    : (value as number);

  // ── Niveau : écart au repère, orienté ────────────────────────────────────
  const scale = Math.max(Math.abs(reference), 1);
  const gap = Number.isFinite(current) ? sign * (current - reference) : 0;
  const levelStatus: LevelStatus =
    Math.abs(gap) <= neutralBand * scale ? "neutral" : gap > 0 ? "favorable" : "unfavorable";

  const judgment: Judgment = {
    level: { gap, status: levelStatus },
    severity: 0,
    current,
  };

  // ── Tendance : pente orientée (si trajectoire) ───────────────────────────
  if (trajectory && trajectory.length >= 2) {
    const slope = leastSquaresSlope(trajectory);
    const orientedSlope = sign * slope;
    // Zone plate : pente relative au repère sous la bande neutre.
    const flatBand = neutralBand * scale;
    const trendStatus: TrendStatus =
      Math.abs(orientedSlope) <= flatBand ? "flat" : orientedSlope > 0 ? "improving" : "worsening";
    judgment.trend = { slope, status: trendStatus };
  }

  // ── Anomalie : position dans le cadre de comparaison ─────────────────────
  if (comparisonFrame && comparisonFrame.length >= 3 && Number.isFinite(current)) {
    const n = comparisonFrame.length;
    const mean = comparisonFrame.reduce((a, b) => a + b, 0) / n;
    const variance = comparisonFrame.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
    const std = Math.sqrt(variance);
    const abnormal = std === 0 ? current !== mean : Math.abs(current - mean) > 2 * std;
    judgment.anomaly = { status: abnormal ? "abnormal" : "normal" };
  }

  // ── Sévérité combinée [0, 1] ──────────────────────────────────────────────
  const levelSev = levelStatus === "unfavorable" ? clamp01(Math.abs(gap) / scale) : 0;
  const trendSev = judgment.trend?.status === "worsening" ? 1 : 0;
  const anomalySev = judgment.anomaly?.status === "abnormal" ? 1 : 0;
  judgment.severity = clamp01(0.5 * levelSev + 0.25 * trendSev + 0.25 * anomalySev);

  return judgment;
}

// ─────────────────────────────────────────────────────────────────────────────
// Aides visuelles partagées (pures) — pour que chaque instrument révèle le
// jugement avec les mêmes conventions (couleur, symbole, libellé).
// ─────────────────────────────────────────────────────────────────────────────

/** Couleur CSS (design tokens bpm) associée au statut de niveau. */
export function judgmentColor(j: Judgment): string {
  if (j.level.status === "favorable") return "var(--bpm-success, #16a34a)";
  if (j.level.status === "unfavorable") return "var(--bpm-error, #dc2626)";
  return "var(--bpm-text-secondary, #6b7280)";
}

/** Flèche de tendance : ↗ improving, → flat, ↘ worsening (ou "" sans tendance). */
export function trendArrow(j: Judgment): string {
  if (!j.trend) return "";
  return j.trend.status === "improving" ? "↗" : j.trend.status === "worsening" ? "↘" : "→";
}

/** Libellé court du jugement, ex. "▲ +12 vs repère · tendance ↘ · anomalie". */
export function judgmentLabel(j: Judgment): string {
  const arrow = j.level.status === "favorable" ? "▲" : j.level.status === "unfavorable" ? "▼" : "•";
  const gapAbs = Math.abs(j.level.gap);
  const gapStr = gapAbs >= 100 ? Math.round(gapAbs).toString() : gapAbs.toFixed(gapAbs >= 10 ? 1 : 2).replace(/\.?0+$/, "");
  const parts = [`${arrow} ${j.level.gap >= 0 ? "+" : "−"}${gapStr} vs repère`];
  if (j.trend) parts.push(`tendance ${trendArrow(j)}`);
  if (j.anomaly?.status === "abnormal") parts.push("anomalie");
  return parts.join(" · ");
}
