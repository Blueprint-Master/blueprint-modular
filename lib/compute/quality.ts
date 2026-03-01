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

const quality: ComputeFunction[] = [
  {
    name: "calculate_cpk",
    description: "Cpk = indice de capabilité processus (min par rapport à USL et LSL)",
    parameters: {
      values: { type: "array", description: "Échantillon de valeurs", required: true },
      usl: { type: "number", description: "Limite supérieure de spécification", required: true },
      lsl: { type: "number", description: "Limite inférieure de spécification", required: true },
    },
    execute: (p) => {
      const values = (p.values as number[]) ?? [];
      const usl = Number(p.usl);
      const lsl = Number(p.lsl);
      if (values.length === 0 || usl <= lsl) return res(0, "0", undefined);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((s, x) => s + (x - mean) ** 2, 0) / values.length;
      const sigma = Math.sqrt(variance) || 1e-10;
      const cpu = (usl - mean) / (3 * sigma);
      const cpl = (mean - lsl) / (3 * sigma);
      const cpk = Math.min(cpu, cpl);
      return res(cpk, cpk.toFixed(2), undefined, { cpu, cpl });
    },
  },
  {
    name: "calculate_defect_rate",
    description: "Taux de défauts = défauts / total × 100 (%)",
    parameters: {
      defects: { type: "number", description: "Nombre de défauts", required: true },
      total: { type: "number", description: "Total inspecté", required: true },
    },
    execute: (p) => {
      const d = Number(p.defects);
      const t = Number(p.total);
      if (t <= 0) return res(0, "0 %", "%");
      const v = Math.min(100, (d / t) * 100);
      return res(v, `${v.toFixed(2)} %`, "%");
    },
  },
  {
    name: "calculate_yield",
    description: "Rendement = bonnes unités / total × 100 (%)",
    parameters: {
      good: { type: "number", description: "Unités conformes", required: true },
      total: { type: "number", description: "Total", required: true },
    },
    execute: (p) => {
      const g = Number(p.good);
      const t = Number(p.total);
      if (t <= 0) return res(0, "0 %", "%");
      const v = Math.min(100, (g / t) * 100);
      return res(v, `${v.toFixed(2)} %`, "%");
    },
  },
  {
    name: "calculate_sigma_level",
    description: "Niveau sigma à partir du taux de défauts (DPMO → sigma)",
    parameters: {
      defect_rate: { type: "number", description: "Taux de défauts (en %, ex: 0.1 pour 0.1%)", required: true },
    },
    execute: (p) => {
      const dr = Number(p.defect_rate) / 100;
      if (dr <= 0 || dr >= 1) return res(0, "0 σ", "σ");
      const dpmo = dr * 1_000_000;
      let sigma = 0;
      if (dpmo <= 3.4) sigma = 6;
      else if (dpmo <= 233) sigma = 5;
      else if (dpmo <= 6210) sigma = 4;
      else if (dpmo <= 66807) sigma = 3;
      else if (dpmo <= 308538) sigma = 2;
      else if (dpmo <= 691462) sigma = 1;
      return res(sigma, `${sigma} σ`, "σ", { dpmo });
    },
  },
];

quality.forEach((fn) => registerFunction(fn));
