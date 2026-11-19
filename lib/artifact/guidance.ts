import { componentsForBlock } from "./contract";

export const artifactGuide = {
  format: "standalone-html",
  renderer: "https://blueprint-modular.com/artifacts/bpm-artifact.cjs",
  runtime: "https://blueprint-modular.com/artifacts/bpm.min.js",
  components: componentsForBlock,
  instructions: [
    "Download the renderer in the authoring environment. Run node bpm-artifact.cjs --example for an example and --schema for its JSON Schema.",
    "Translate the brief into ordered blocks. Use trend for time, comparison for categories, status for a supplied label. Preserve quantities, units and precision.",
    "Only supply context.reference and context.direction when grounded in the brief. The component computes the variance against that reference.",
    "Run node bpm-artifact.cjs spec.json > artifact.html locally. Deliver the HTML after opening it offline and checking visible values, badges and series.",
    "For browser updates, embed the runtime locally and call BlueprintModular.mount(element, spec). Use view.refresh(load) to supply connected data through the host, with the same contract.",
    "For a follow-up question, run node bpm-artifact.cjs --inspect artifact.html to recover source values, references and computed observations. Financial or operational causes require additional evidence.",
  ],
  scope: "Static indicators, status labels, categorical comparisons, trends and paragraphs. For interactive Plotly use the optional @blueprint-modular/core/artifact/plotly entry with its peers bundled locally.",
};

export const artifactComponents = new Set<string>(Object.values(componentsForBlock).filter((name): name is NonNullable<typeof name> => name !== null));
