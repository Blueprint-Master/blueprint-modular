export type LayoutType =
  | "kpi-overview" | "crud-table" | "kanban" | "calendar"
  | "detail" | "form" | "map-view" | "ai-assistant"
  | "analytics" | "notifications" | "custom"

export type FieldType =
  | "string" | "number" | "boolean" | "date" | "datetime"
  | "enum" | "relation" | "computed" | "json"

export interface EnumValue {
  value: string
  label: string
  color?: "default" | "info" | "success" | "warning" | "error"
}

export interface Field {
  name: string
  label: string
  type: FieldType
  required?: boolean
  enumValues?: EnumValue[]
  target?: string
  relationMany?: boolean
  unit?: string
  min?: number
  max?: number
  defaultValue?: unknown
  computed?: string
}

export interface Entity {
  name: string
  label: string
  labelPlural: string
  fields: Field[]
  seedCount?: number
}

export interface WorkflowState {
  value: string
  label: string
  color: "default" | "info" | "success" | "warning" | "error"
  terminal?: boolean
}

export interface Transition {
  from: string | string[]
  to: string
  label: string
  guard?: string
  sideEffect?: string
}

export interface Workflow {
  entity: string
  stateField: string
  states: WorkflowState[]
  transitions: Transition[]
}

export interface BusinessRule {
  id: string
  description: string
  entity: string
  type: "guard" | "validation" | "constraint"
  condition: string
}

export interface EventEffect {
  type: "notify" | "update_kpi" | "create_record" | "webhook"
  target?: string
  payload?: Record<string, unknown>
}

export interface DomainEvent {
  id: string
  trigger: string
  effects: EventEffect[]
}

export interface Section {
  key: string
  label: string
  icon: string
  layout: LayoutType
  entity?: string
  columns?: string[]
  groupBy?: string
  calendarDateField?: string
  filterFields?: string[]
  metricsRef?: string[]
  chartType?: "line" | "bar" | "pie" | "scatter"
  customPrompt?: string
  allowedComponents?: string[]
}

export interface KPIDefinition {
  id: string
  label: string
  formula: string
  unit?: string
  entity: string
  aggregation: "sum" | "avg" | "count" | "ratio" | "custom"
  deltaComparison?: "previous_period" | "target"
  target?: number
  thresholds?: { warning: number; critical: number }
}

export interface AIFeature {
  type: "anomaly_detection" | "prediction" | "assistant" | "classification"
  targetEntity: string
  targetField?: string
  description: string
  uiComponent: "chatInterface" | "streamingText" | "inlineInsight"
}

export interface ConnectorField {
  source: string
  target: string
  transform?: string
  alertThreshold?: number
}

export interface Connector {
  id: string
  protocol: "mqtt" | "opcua" | "modbus" | "rest" | "websocket"
  label: string
  endpoint?: string
  fields: ConnectorField[]
}

export interface Role {
  name: string
  label: string
  permissions: {
    entity: string
    actions: ("read" | "create" | "update" | "delete")[]
    stateRestrictions?: string[]
  }[]
}

export interface PermissionModel {
  enabled: boolean
  roles: Role[]
}

export interface AppSpecMeta {
  domain: string
  industry: string
  locale: "fr-FR" | "en-US" | "de-DE" | "es-ES"
  theme: "sidebar" | "topbar" | "minimal"
  expressedIntent: string
  inferredProblems: string[]
}

export interface AppSpec {
  meta: AppSpecMeta
  entities: Entity[]
  workflows: Workflow[]
  rules: BusinessRule[]
  events: DomainEvent[]
  sections: Section[]
  kpis: KPIDefinition[]
  aiFeatures?: AIFeature[]
  connectors?: Connector[]
  permissions?: PermissionModel
}
