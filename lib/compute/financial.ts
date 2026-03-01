import type { ComputeFunction, ComputeResult } from "./types";
import { registerFunction } from "./registry";

function res(
  value: number | string,
  formatted: string,
  unit?: string,
  metadata?: Record<string, unknown>
): ComputeResult {
  return { value, formatted, unit, metadata };
}

const financial: ComputeFunction[] = [
  {
    name: "calculate_portfolio_return",
    description: "Rendement du portefeuille = (valeur actuelle - valeur initiale) / valeur initiale × 100 (%)",
    parameters: {
      current_value: { type: "number", description: "Valeur actuelle", required: true },
      initial_value: { type: "number", description: "Valeur initiale", required: true },
    },
    execute: (p) => {
      const cur = Number(p.current_value);
      const init = Number(p.initial_value);
      if (init === 0) return res(0, "0 %", "%");
      const v = ((cur - init) / init) * 100;
      return res(v, `${v.toFixed(2)} %`, "%");
    },
  },
  {
    name: "calculate_weighted_return",
    description: "Rendement pondéré du portefeuille à partir des positions (value, return)",
    parameters: {
      positions: {
        type: "array",
        description: "Tableau de { value: number, return: number }",
        required: true,
      },
    },
    execute: (p) => {
      const positions = (p.positions as Array<{ value: number; return: number }>) ?? [];
      const total = positions.reduce((s, x) => s + Number(x.value), 0);
      if (total === 0) return res(0, "0 %", "%");
      const weighted = positions.reduce(
        (s, x) => s + (Number(x.value) / total) * Number((x as { return?: number }).return ?? 0),
        0
      );
      return res(weighted, `${weighted.toFixed(2)} %`, "%");
    },
  },
  {
    name: "calculate_volatility",
    description: "Écart-type des rendements (volatilité)",
    parameters: {
      returns: { type: "array", description: "Liste des rendements (ex: [0.02, -0.01, 0.03])", required: true },
    },
    execute: (p) => {
      const returns = (p.returns as number[]) ?? [];
      if (returns.length === 0) return res(0, "0 %", "%");
      const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
      const variance = returns.reduce((s, r) => s + (r - mean) ** 2, 0) / returns.length;
      const vol = Math.sqrt(variance) * 100;
      return res(vol, `${vol.toFixed(2)} %`, "%");
    },
  },
  {
    name: "calculate_sharpe_ratio",
    description: "Ratio de Sharpe = (rendement moyen - taux sans risque) / volatilité",
    parameters: {
      returns: { type: "array", description: "Liste des rendements", required: true },
      risk_free_rate: { type: "number", description: "Taux sans risque (ex: 0.02 pour 2%)", required: true },
    },
    execute: (p) => {
      const returns = (p.returns as number[]) ?? [];
      const rf = Number(p.risk_free_rate);
      if (returns.length === 0) return res(0, "0", undefined);
      const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
      const variance = returns.reduce((s, r) => s + (r - mean) ** 2, 0) / returns.length;
      const vol = Math.sqrt(variance);
      if (vol === 0) return res(0, "0", undefined);
      const sharpe = (mean - rf) / vol;
      return res(sharpe, sharpe.toFixed(2), undefined);
    },
  },
  {
    name: "calculate_drawdown",
    description: "Drawdown maximum (en %) à partir de la série de valeurs",
    parameters: {
      values: { type: "array", description: "Série de valeurs (ex: [100, 105, 98, 110])", required: true },
    },
    execute: (p) => {
      const values = (p.values as number[]) ?? [];
      if (values.length === 0) return res(0, "0 %", "%");
      let peak = values[0];
      let maxDd = 0;
      for (const v of values) {
        if (v > peak) peak = v;
        const dd = peak > 0 ? ((peak - v) / peak) * 100 : 0;
        if (dd > maxDd) maxDd = dd;
      }
      return res(maxDd, `${maxDd.toFixed(2)} %`, "%");
    },
  },
  {
    name: "calculate_leverage_ratio",
    description: "Ratio de levier = total actif / capitaux propres",
    parameters: {
      total_assets: { type: "number", description: "Total actif", required: true },
      equity: { type: "number", description: "Capitaux propres", required: true },
    },
    execute: (p) => {
      const assets = Number(p.total_assets);
      const eq = Number(p.equity);
      if (eq === 0) return res(0, "—", undefined);
      const ratio = assets / eq;
      return res(ratio, ratio.toFixed(2), undefined);
    },
  },
];

financial.forEach((fn) => registerFunction(fn));
