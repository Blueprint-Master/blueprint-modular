export type {
  AppSpec,
  AppSpecMeta,
  Entity,
  Field,
  FieldType,
  EnumValue,
  Workflow,
  WorkflowState,
  Transition,
  BusinessRule,
  DomainEvent,
  EventEffect,
  Section,
  LayoutType,
  KPIDefinition,
  AIFeature,
  Connector,
  ConnectorField,
  PermissionModel,
  Role,
} from "./app-spec";

export { validateAndEnrichSpec } from "./spec-validator";
