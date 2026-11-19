import { interpret } from "../../components/bpm/interpret";
import { componentsForBlock, type ArtifactSpec } from "./contract";

// The host can re-read the quantities and verify which facts ground a judgment.
export function describeArtifact(spec: ArtifactSpec) {
  const observations = spec.blocks.flatMap((block, index) => {
    if (!("context" in block) || !block.context) return [];
    const { reference, direction } = block.context;
    if (reference === undefined || direction === undefined) return [];
    const baseline = { reference, direction };
    const observation = (label: string, value: number) => ({
      block: index, component: componentsForBlock[block.kind],
      label, value, ...block.context, difference: Number((value - reference).toPrecision(14)),
      assessment: interpret(value, baseline).level.status,
    });
    if (block.kind === "indicator") return [observation(block.label, block.value)];
    return block.data.map(({ x, y }) => observation(x, y));
  });
  return { version: 1, spec, observations };
}
