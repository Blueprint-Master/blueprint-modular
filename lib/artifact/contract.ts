import { z } from "zod/v3";

const text = z.string().trim().min(1).max(500);
const number = z.number().finite();
const context = z.object({
  reference: number,
  referenceLabel: text.optional(),
  direction: z.enum(["higher_is_better", "lower_is_better"]),
}).strict();

const metric = z.object({
  kind: z.literal("indicator"),
  label: text,
  unit: text.optional().describe("Unit of value and reference, e.g. %, EUR or orders."),
  value: number,
  decimals: z.number().int().min(0).max(12).optional(),
  delta: text.describe("Display text, e.g. -1,2 pt or +1 234,5 €. Unrecognized text is shown neutrally.").optional(),
  context: context.describe("Only use a reference and direction grounded in the brief.").optional(),
}).strict();

const badge = z.object({
  kind: z.literal("status"),
  text,
  variant: z.enum(["default", "primary", "success", "warning", "error", "info"]).default("default"),
}).strict();

const point = z.object({ x: text, y: number }).strict();
const chart = z.object({
  title: text,
  unit: text.optional(),
  data: z.array(point).min(1).max(250),
  context: context.optional(),
}).strict();

export const artifactSpec = z.object({
  title: text,
  period: text.optional(),
  source: text.optional(),
  locale: z.enum(["fr-FR", "en-US", "de-DE"]).default("fr-FR"),
  blocks: z.array(z.discriminatedUnion("kind", [
    metric, badge,
    chart.extend({ kind: z.literal("trend"), data: z.array(point).min(2).max(250) }),
    chart.extend({ kind: z.literal("comparison") }),
    z.object({ kind: z.literal("paragraph"), text }).strict(),
  ])).min(1).max(60),
}).strict();

export type ArtifactSpec = z.infer<typeof artifactSpec>;
export const componentsForBlock = {
  indicator: "bpm.metric", status: "bpm.badge", trend: "bpm.lineChart",
  comparison: "bpm.barChart", paragraph: null,
} as const satisfies Record<ArtifactSpec["blocks"][number]["kind"], string | null>;
