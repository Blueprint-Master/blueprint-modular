/**
 * Helpers pour les routes API production — tous les calculs passent par le registry.
 * Ne jamais recalculer TRS / disponibilité / pertes inline dans les routes.
 */
import { getFunction } from "./registry";

function run(name: string, params: Record<string, number>): number {
  const fn = getFunction(name);
  if (!fn) throw new Error(`Compute function ${name} not registered`);
  const result = fn.execute(params as Record<string, unknown>);
  return Number(result.value);
}

export function calculateTRS(params: {
  available_time: number;
  stops_time: number;
  good_parts: number;
  total_parts: number;
  produced_parts: number;
  theoretical_rate: number;
  net_time: number;
}): number {
  return run("calculate_trs", params);
}

export function calculateAvailability(params: {
  available_time: number;
  stops_time: number;
}): number {
  return run("calculate_availability", params);
}

export function calculatePerformance(params: {
  produced_parts: number;
  theoretical_rate: number;
  net_time: number;
}): number {
  return run("calculate_performance", params);
}

export function calculateQuality(params: {
  good_parts: number;
  total_parts: number;
}): number {
  return run("calculate_quality", params);
}

export function calculateLossRate(params: { total: number; rejects: number }): number {
  return run("calculate_loss_rate", params);
}
