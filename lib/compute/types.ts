/**
 * Types pour la bibliothèque de calcul métier (tool use / function calling).
 */

export interface ParameterDef {
  type: "number" | "string" | "array";
  description: string;
  required: boolean;
}

export interface ComputeResult {
  value: number | string;
  unit?: string;
  formatted: string;
  metadata?: Record<string, unknown>;
}

export interface ComputeFunction {
  name: string;
  description: string;
  parameters: Record<string, ParameterDef>;
  execute: (params: Record<string, unknown>) => ComputeResult;
}
