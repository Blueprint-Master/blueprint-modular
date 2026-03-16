import { z } from "zod";
import type { AppSpec } from "./app-spec";

const layoutType = z.enum([
  "kpi-overview", "crud-table", "kanban", "calendar",
  "detail", "form", "map-view", "ai-assistant",
  "analytics", "notifications", "custom",
]);

const fieldType = z.enum([
  "string", "number", "boolean", "date", "datetime",
  "enum", "relation", "computed", "json",
]);

const enumValueSchema = z.object({
  value: z.string(),
  label: z.string(),
  color: z.enum(["default", "info", "success", "warning", "error"]).optional(),
});

const fieldSchema = z.object({
  name: z.string(),
  label: z.string(),
  type: fieldType,
  required: z.boolean().optional(),
  enumValues: z.array(enumValueSchema).optional(),
  target: z.string().optional(),
  relationMany: z.boolean().optional(),
  unit: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  defaultValue: z.unknown().optional(),
  computed: z.string().optional(),
});

const entitySchema = z.object({
  name: z.string(),
  label: z.string(),
  labelPlural: z.string(),
  fields: z.array(fieldSchema),
  seedCount: z.number().int().min(0).optional(),
});

const workflowStateSchema = z.object({
  value: z.string(),
  label: z.string(),
  color: z.enum(["default", "info", "success", "warning", "error"]).optional(),
  terminal: z.boolean().optional(),
});

const transitionSchema = z.object({
  from: z.union([z.string(), z.array(z.string())]),
  to: z.string(),
  label: z.string(),
  guard: z.string().optional(),
  sideEffect: z.string().optional(),
});

const workflowSchema = z.object({
  entity: z.string(),
  stateField: z.string(),
  states: z.array(workflowStateSchema),
  transitions: z.array(transitionSchema),
});

const businessRuleSchema = z.object({
  id: z.string(),
  description: z.string(),
  entity: z.string(),
  type: z.enum(["guard", "validation", "constraint"]),
  condition: z.string(),
});

const eventEffectSchema = z.object({
  type: z.enum(["notify", "update_kpi", "create_record", "webhook"]),
  target: z.string().optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

const domainEventSchema = z.object({
  id: z.string(),
  trigger: z.string(),
  effects: z.array(eventEffectSchema),
});

const sectionSchema = z.object({
  key: z.string(),
  label: z.string(),
  icon: z.string().optional(),
  layout: layoutType,
  entity: z.string().optional(),
  columns: z.array(z.string()).optional(),
  groupBy: z.string().optional(),
  calendarDateField: z.string().optional(),
  filterFields: z.array(z.string()).optional(),
  metricsRef: z.array(z.string()).optional(),
  chartType: z.enum(["line", "bar", "pie", "scatter"]).optional(),
  customPrompt: z.string().optional(),
  allowedComponents: z.array(z.string()).optional(),
});

const kpiDefinitionSchema = z.object({
  id: z.string(),
  label: z.string(),
  formula: z.string(),
  unit: z.string().optional(),
  entity: z.string(),
  aggregation: z.enum(["sum", "avg", "count", "ratio", "custom"]),
  deltaComparison: z.enum(["previous_period", "target"]).optional(),
  target: z.number().optional(),
  thresholds: z.object({
    warning: z.number(),
    critical: z.number(),
  }).optional(),
});

const aiFeatureSchema = z.object({
  type: z.enum(["anomaly_detection", "prediction", "assistant", "classification"]),
  targetEntity: z.string(),
  targetField: z.string().optional(),
  description: z.string(),
  uiComponent: z.enum(["chatInterface", "streamingText", "inlineInsight"]),
});

const connectorFieldSchema = z.object({
  source: z.string(),
  target: z.string(),
  transform: z.string().optional(),
  alertThreshold: z.number().optional(),
});

const connectorSchema = z.object({
  id: z.string(),
  protocol: z.enum(["mqtt", "opcua", "modbus", "rest", "websocket"]),
  label: z.string(),
  endpoint: z.string().optional(),
  fields: z.array(connectorFieldSchema),
});

const roleSchema = z.object({
  name: z.string(),
  label: z.string(),
  permissions: z.array(z.object({
    entity: z.string(),
    actions: z.array(z.enum(["read", "create", "update", "delete"])),
    stateRestrictions: z.array(z.string()).optional(),
  })),
});

const permissionModelSchema = z.object({
  enabled: z.boolean(),
  roles: z.array(roleSchema),
});

const appSpecMetaSchema = z.object({
  domain: z.string(),
  industry: z.string(),
  locale: z.enum(["fr-FR", "en-US", "de-DE", "es-ES"]),
  theme: z.enum(["sidebar", "topbar", "minimal"]),
  expressedIntent: z.string(),
  inferredProblems: z.array(z.string()),
});

const appSpecSchema = z.object({
  meta: appSpecMetaSchema,
  entities: z.array(entitySchema),
  workflows: z.array(workflowSchema),
  rules: z.array(businessRuleSchema),
  events: z.array(domainEventSchema),
  sections: z.array(sectionSchema),
  kpis: z.array(kpiDefinitionSchema),
  aiFeatures: z.array(aiFeatureSchema).optional(),
  connectors: z.array(connectorSchema).optional(),
  permissions: permissionModelSchema.optional(),
});

/**
 * Valide la structure avec Zod, enrichit les valeurs par défaut,
 * vérifie les références croisées (workflow.entity, section.entity, section.metricsRef).
 * @throws Error avec message précis si invalide
 */
export function validateAndEnrichSpec(raw: unknown): AppSpec {
  const parsed = appSpecSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const path = first.path.length ? first.path.join(".") : "racine";
    throw new Error(`AppSpec invalide : ${path} — ${first.message}`);
  }

  const spec = parsed.data;
  const entityNames = new Set(spec.entities.map((e) => e.name));
  const kpiIds = new Set(spec.kpis.map((k) => k.id));

  for (const w of spec.workflows) {
    if (!entityNames.has(w.entity)) {
      throw new Error(`AppSpec invalide : workflow.entity "${w.entity}" n'existe pas dans entities[].name`);
    }
  }

  for (const s of spec.sections) {
    if (s.entity != null && !entityNames.has(s.entity)) {
      throw new Error(`AppSpec invalide : section.entity "${s.entity}" n'existe pas dans entities[].name`);
    }
    if (s.metricsRef) {
      for (const id of s.metricsRef) {
        if (!kpiIds.has(id)) {
          throw new Error(`AppSpec invalide : section.metricsRef "${id}" n'existe pas dans kpis[].id`);
        }
      }
    }
  }

  return {
    ...spec,
    entities: spec.entities.map((e) => ({
      ...e,
      seedCount: e.seedCount ?? 5,
    })),
    workflows: spec.workflows.map((w) => ({
      ...w,
      states: w.states.map((st) => ({
        ...st,
        color: st.color ?? "default",
      })),
    })),
    sections: spec.sections.map((s) => ({
      ...s,
      icon: s.icon ?? "widgets",
    })),
  } as AppSpec;
}
