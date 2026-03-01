import "./industrial";
import "./financial";
import "./quality";
import { buildToolsDescription } from "./registry";

export type { ComputeFunction, ComputeResult, ParameterDef } from "./types";
export { getFunction, getAllFunctions, registerFunction, buildToolsDescription } from "./registry";

export function getComputeTools(): string {
  return buildToolsDescription();
}
