import "./industrial";
import "./financial";
import "./quality";
import { buildToolsDescription } from "./registry";

export type { ComputeFunction, ComputeResult, ParameterDef } from "./types";
export { getFunction, getAllFunctions, registerFunction, buildToolsDescription } from "./registry";
export {
  calculateTRS,
  calculateAvailability,
  calculatePerformance,
  calculateQuality,
  calculateLossRate,
} from "./production-helpers";

export function getComputeTools(): string {
  return buildToolsDescription();
}
