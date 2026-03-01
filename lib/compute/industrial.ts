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

const industrial: ComputeFunction[] = [
  {
    name: "calculate_availability",
    description: "Disponibilité = (temps disponible - temps d'arrêt) / temps disponible × 100 (%)",
    parameters: {
      available_time: { type: "number", description: "Temps disponible (minutes)", required: true },
      stops_time: { type: "number", description: "Temps d'arrêt (minutes)", required: true },
    },
    execute: (p) => {
      const a = Number(p.available_time);
      const s = Number(p.stops_time);
      if (a <= 0) return res(0, "0 %", "%");
      const v = Math.max(0, Math.min(100, ((a - s) / a) * 100));
      return res(v, `${v.toFixed(2)} %`, "%", { available_time: a, stops_time: s });
    },
  },
  {
    name: "calculate_performance",
    description: "Performance = pièces produites / (cadence théorique × temps net) × 100 (%)",
    parameters: {
      produced_parts: { type: "number", description: "Nombre de pièces produites", required: true },
      theoretical_rate: { type: "number", description: "Cadence théorique (pièces/heure)", required: true },
      net_time: { type: "number", description: "Temps net (heures)", required: true },
    },
    execute: (p) => {
      const prod = Number(p.produced_parts);
      const rate = Number(p.theoretical_rate);
      const time = Number(p.net_time);
      if (rate <= 0 || time <= 0) return res(0, "0 %", "%");
      const v = Math.max(0, Math.min(100, (prod / (rate * time)) * 100));
      return res(v, `${v.toFixed(2)} %`, "%");
    },
  },
  {
    name: "calculate_quality",
    description: "Qualité = pièces conformes / pièces totales × 100 (%)",
    parameters: {
      good_parts: { type: "number", description: "Pièces conformes", required: true },
      total_parts: { type: "number", description: "Pièces totales", required: true },
    },
    execute: (p) => {
      const g = Number(p.good_parts);
      const t = Number(p.total_parts);
      if (t <= 0) return res(0, "0 %", "%");
      const v = Math.max(0, Math.min(100, (g / t) * 100));
      return res(v, `${v.toFixed(2)} %`, "%");
    },
  },
  {
    name: "calculate_trs",
    description: "TRS = Disponibilité × Performance × Qualité (en %)",
    parameters: {
      available_time: { type: "number", description: "Temps disponible (min)", required: true },
      stops_time: { type: "number", description: "Temps d'arrêt (min)", required: true },
      good_parts: { type: "number", description: "Pièces conformes", required: true },
      total_parts: { type: "number", description: "Pièces totales", required: true },
      produced_parts: { type: "number", description: "Pièces produites", required: true },
      theoretical_rate: { type: "number", description: "Cadence théorique (p/h)", required: true },
      net_time: { type: "number", description: "Temps net (h)", required: true },
    },
    execute: (p) => {
      const a = Number(p.available_time);
      const s = Number(p.stops_time);
      const g = Number(p.good_parts);
      const t = Number(p.total_parts);
      const prod = Number(p.produced_parts);
      const rate = Number(p.theoretical_rate);
      const time = Number(p.net_time);
      let availability = 0;
      if (a > 0) availability = Math.max(0, Math.min(100, ((a - s) / a) * 100));
      let performance = 0;
      if (rate > 0 && time > 0) performance = Math.max(0, Math.min(100, (prod / (rate * time)) * 100));
      let quality = 0;
      if (t > 0) quality = Math.max(0, Math.min(100, (g / t) * 100));
      const trs = (availability / 100) * (performance / 100) * (quality / 100) * 100;
      return res(trs, `${trs.toFixed(2)} %`, "%", {
        availability,
        performance,
        quality,
      });
    },
  },
  {
    name: "calculate_loss_rate",
    description: "Taux de perte = rebuts / total × 100 (%)",
    parameters: {
      total: { type: "number", description: "Quantité totale", required: true },
      rejects: { type: "number", description: "Nombre de rebuts", required: true },
    },
    execute: (p) => {
      const tot = Number(p.total);
      const rej = Number(p.rejects);
      if (tot <= 0) return res(0, "0 %", "%");
      const v = Math.max(0, Math.min(100, (rej / tot) * 100));
      return res(v, `${v.toFixed(2)} %`, "%");
    },
  },
  {
    name: "calculate_mtbf",
    description: "MTBF = temps de fonctionnement / nombre de pannes",
    parameters: {
      operating_time: { type: "number", description: "Temps de fonctionnement (heures)", required: true },
      failures_count: { type: "number", description: "Nombre de pannes", required: true },
    },
    execute: (p) => {
      const op = Number(p.operating_time);
      const n = Number(p.failures_count);
      if (n <= 0) return res(op, `${op} h`, "h", { failures_count: 0 });
      const mtbf = op / n;
      return res(mtbf, `${mtbf.toFixed(2)} h`, "h");
    },
  },
  {
    name: "calculate_mttr",
    description: "MTTR = temps total de réparation / nombre de pannes",
    parameters: {
      total_repair_time: { type: "number", description: "Temps total de réparation (heures)", required: true },
      failures_count: { type: "number", description: "Nombre de pannes", required: true },
    },
    execute: (p) => {
      const rep = Number(p.total_repair_time);
      const n = Number(p.failures_count);
      if (n <= 0) return res(0, "0 h", "h");
      const mttr = rep / n;
      return res(mttr, `${mttr.toFixed(2)} h`, "h");
    },
  },
];

industrial.forEach((fn) => registerFunction(fn));
