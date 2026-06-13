"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Checkbox,
  DateInput,
  Expander,
  Input,
  JsonViewer,
  LabelValue,
  Message,
  Metric,
  MetricRow,
  Panel,
  RadioGroup,
  Selectbox,
  Table,
  Textarea,
  useToast,
} from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n";
import { getStrings, L, lt, rich, type LocalizedText } from "./strings";

/* ------------------------------------------------------------------ */
/* Schéma de formulaire — le moteur est piloté par ces définitions.    */
/* Les ids de champs et les valeurs techniques des options sont        */
/* invariants ; seuls les labels affichés ({fr, en}) sont localisés.   */
/* ------------------------------------------------------------------ */

type FieldType = "text" | "number" | "date" | "select" | "radio" | "checkbox" | "textarea";

type ConditionOperator = "equals" | "greaterThan";

interface Condition {
  /** Identifiant du champ observé. */
  field: string;
  operator: ConditionOperator;
  value: string | number | boolean;
}

interface FieldOption {
  value: string;
  label: LocalizedText;
}

interface FieldDef {
  id: string;
  label: LocalizedText;
  type: FieldType;
  required?: boolean;
  options?: FieldOption[];
  placeholder?: LocalizedText;
  /** Suffixe d'affichage dans le récapitulatif (ex. "€ HT"). */
  suffix?: LocalizedText;
  /** Le champ n'est rendu (et validé) que si la condition est vraie. */
  visibleIf?: Condition;
}

interface ConditionalMessage {
  id: string;
  type: "info" | "warning" | "error";
  text: LocalizedText;
  visibleIf: Condition;
}

interface FormSchema {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  fields: FieldDef[];
  messages?: ConditionalMessage[];
  /** Contrôle croisé optionnel : la date de fin doit suivre la date de début. */
  dateRange?: { start: string; end: string; message: LocalizedText };
}

const FORM_SCHEMAS: FormSchema[] = [
  {
    id: "conges",
    title: L("Demande de congés", "Leave request"),
    description: L(
      "Absence planifiée : période, type de congé et commentaire pour le manager.",
      "Planned absence: period, leave type and a comment for the manager."
    ),
    fields: [
      { id: "date_debut", label: L("Début de la période", "Period start"), type: "date", required: true },
      { id: "date_fin", label: L("Fin de la période", "Period end"), type: "date", required: true },
      {
        id: "type_conge",
        label: L("Type de congé", "Leave type"),
        type: "select",
        required: true,
        placeholder: L("Choisir un type", "Choose a type"),
        options: [
          { value: "payes", label: L("Congés payés", "Paid leave") },
          { value: "rtt", label: L("RTT", "RTT") },
          { value: "sans_solde", label: L("Congé sans solde", "Unpaid leave") },
        ],
      },
      { id: "demi_journee", label: L("Demi-journée uniquement", "Half-day only"), type: "checkbox" },
      {
        id: "commentaire",
        label: L("Commentaire (optionnel)", "Comment (optional)"),
        type: "textarea",
        placeholder: L(
          "Contexte, passation, contacts pendant l'absence…",
          "Context, handover, contacts during the absence…"
        ),
      },
      {
        id: "justification",
        label: L("Justification du congé sans solde", "Justification for unpaid leave"),
        type: "textarea",
        required: true,
        placeholder: L(
          "Motif détaillé exigé par la DRH pour un congé sans solde.",
          "Detailed reason required by HR for unpaid leave."
        ),
        visibleIf: { field: "type_conge", operator: "equals", value: "sans_solde" },
      },
    ],
    messages: [
      {
        id: "msg-sans-solde",
        type: "info",
        text: L(
          "Congé sans solde : la demande sera transmise à la DRH avec la justification.",
          "Unpaid leave: the request will be forwarded to HR along with the justification."
        ),
        visibleIf: { field: "type_conge", operator: "equals", value: "sans_solde" },
      },
    ],
    dateRange: {
      start: "date_debut",
      end: "date_fin",
      message: L(
        "La date de fin doit être postérieure ou égale à la date de début.",
        "The end date must be on or after the start date."
      ),
    },
  },
  {
    id: "achat-materiel",
    title: L("Achat de matériel", "Equipment purchase"),
    description: L(
      "Demande d'achat : catégorie, description du besoin et montant estimé.",
      "Purchase request: category, description of the need and estimated amount."
    ),
    fields: [
      {
        id: "categorie",
        label: L("Catégorie", "Category"),
        type: "select",
        required: true,
        placeholder: L("Choisir une catégorie", "Choose a category"),
        options: [
          { value: "informatique", label: L("Informatique", "IT hardware") },
          { value: "mobilier", label: L("Mobilier", "Furniture") },
          { value: "logiciel", label: L("Logiciel", "Software") },
        ],
      },
      {
        id: "montant",
        label: L("Montant estimé (€ HT)", "Estimated amount (€ excl. VAT)"),
        type: "number",
        required: true,
        placeholder: L("0", "0"),
        suffix: L("€ HT", "€ excl. VAT"),
      },
      {
        id: "description",
        label: L("Description du besoin", "Description of the need"),
        type: "textarea",
        required: true,
        placeholder: L(
          "Matériel demandé, quantité, usage prévu…",
          "Equipment requested, quantity, intended use…"
        ),
      },
      {
        id: "validation_directeur",
        label: L("Validation directeur (montant > 1 000 €)", "Director approval (amount > €1,000)"),
        type: "select",
        required: true,
        placeholder: L("Choisir le directeur approbateur", "Choose the approving director"),
        options: [
          {
            value: "c.moreau",
            label: L("C. Moreau — Directeur des opérations", "C. Moreau — Director of Operations"),
          },
          {
            value: "a.petit",
            label: L("A. Petit — Directrice financière", "A. Petit — Chief Financial Officer"),
          },
        ],
        visibleIf: { field: "montant", operator: "greaterThan", value: 1000 },
      },
    ],
    messages: [
      {
        id: "msg-seuil",
        type: "warning",
        text: L(
          "Montant supérieur à 1 000 € HT : une validation de niveau directeur est obligatoire avant commande.",
          "Amount above €1,000 excl. VAT: director-level approval is mandatory before ordering."
        ),
        visibleIf: { field: "montant", operator: "greaterThan", value: 1000 },
      },
    ],
  },
  {
    id: "acces-applicatif",
    title: L("Accès applicatif", "Application access"),
    description: L(
      "Ouverture de droits sur une application interne, avec contrôle renforcé pour le profil admin.",
      "Granting rights on an internal application, with tighter controls for the admin profile."
    ),
    fields: [
      {
        id: "application",
        label: L("Application", "Application"),
        type: "select",
        required: true,
        placeholder: L("Choisir une application", "Choose an application"),
        options: [
          { value: "erp", label: L("ERP", "ERP") },
          { value: "crm", label: L("CRM", "CRM") },
          { value: "dwh", label: L("Datawarehouse", "Data warehouse") },
        ],
      },
      {
        id: "profil",
        label: L("Profil demandé", "Requested profile"),
        type: "radio",
        required: true,
        options: [
          { value: "lecture", label: L("Lecture", "Read") },
          { value: "ecriture", label: L("Écriture", "Write") },
          { value: "admin", label: L("Administrateur", "Administrator") },
        ],
      },
      {
        id: "motif",
        label: L("Motif de l'accès administrateur", "Reason for administrator access"),
        type: "textarea",
        required: true,
        placeholder: L(
          "Justifiez le besoin d'un accès admin (mission, périmètre).",
          "Justify the need for admin access (assignment, scope)."
        ),
        visibleIf: { field: "profil", operator: "equals", value: "admin" },
      },
      {
        id: "duree",
        label: L("Durée de l'accès admin", "Admin access duration"),
        type: "select",
        required: true,
        placeholder: L("Durée limitée obligatoire", "Limited duration required"),
        options: [
          { value: "30j", label: L("30 jours", "30 days") },
          { value: "90j", label: L("90 jours", "90 days") },
        ],
        visibleIf: { field: "profil", operator: "equals", value: "admin" },
      },
    ],
    messages: [
      {
        id: "msg-admin",
        type: "warning",
        text: L(
          "Profil administrateur : accès limité dans le temps et motif obligatoire (revue sécurité trimestrielle).",
          "Administrator profile: time-limited access and mandatory reason (quarterly security review)."
        ),
        visibleIf: { field: "profil", operator: "equals", value: "admin" },
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Moteur générique : évaluation des conditions, validation, rendu.   */
/* Les conditions visibleIf opèrent sur les valeurs techniques —      */
/* jamais sur les labels localisés.                                   */
/* ------------------------------------------------------------------ */

type FieldValue = string | boolean | Date | null;
type FormValues = Record<string, FieldValue>;

/** Codes d'erreur — traduits au rendu pour suivre la locale active. */
type ErrorCode = "required" | "number" | "dateRange";

function evalCondition(cond: Condition, values: FormValues): boolean {
  const current = values[cond.field];
  if (cond.operator === "equals") return current === cond.value;
  if (cond.operator === "greaterThan") {
    const n =
      typeof current === "string" ? parseFloat(current.replace(",", ".")) : typeof current === "number" ? current : NaN;
    return Number.isFinite(n) && n > Number(cond.value);
  }
  return false;
}

function isFieldVisible(field: FieldDef, values: FormValues): boolean {
  return !field.visibleIf || evalCondition(field.visibleIf, values);
}

function initialValuesFor(schema: FormSchema): FormValues {
  const values: FormValues = {};
  for (const field of schema.fields) {
    values[field.id] = field.type === "checkbox" ? false : field.type === "text" || field.type === "number" || field.type === "textarea" ? "" : null;
  }
  return values;
}

function isEmptyValue(value: FieldValue): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  return false;
}

function validateSchema(schema: FormSchema, values: FormValues): Record<string, ErrorCode> {
  const errors: Record<string, ErrorCode> = {};
  for (const field of schema.fields) {
    if (!isFieldVisible(field, values)) continue;
    const value = values[field.id];
    if (field.required && isEmptyValue(value)) {
      errors[field.id] = "required";
      continue;
    }
    if (field.type === "number" && typeof value === "string" && value.trim() !== "") {
      const n = parseFloat(value.replace(",", "."));
      if (!Number.isFinite(n) || n < 0) {
        errors[field.id] = "number";
      }
    }
  }
  if (schema.dateRange) {
    const start = values[schema.dateRange.start];
    const end = values[schema.dateRange.end];
    if (start instanceof Date && end instanceof Date && end.getTime() < start.getTime() && !errors[schema.dateRange.end]) {
      errors[schema.dateRange.end] = "dateRange";
    }
  }
  return errors;
}

function dateLocaleFor(locale: Locale): string {
  return locale === "fr" ? "fr-FR" : "en-GB";
}

function formatFieldValue(
  field: FieldDef,
  value: FieldValue,
  locale: Locale,
  yes: string,
  no: string
): string {
  if (isEmptyValue(value)) return "—";
  if (field.type === "checkbox") return value === true ? yes : no;
  if (value instanceof Date) return value.toLocaleDateString(dateLocaleFor(locale));
  if ((field.type === "select" || field.type === "radio") && typeof value === "string") {
    const opt = field.options?.find((o) => o.value === value);
    return opt ? lt(opt.label, locale) : value;
  }
  const text = String(value);
  return field.suffix ? `${text} ${lt(field.suffix, locale)}` : text;
}

/** Schéma résolu dans la locale active pour le panneau « Schéma JSON ». */
function localizeSchema(schema: FormSchema, locale: Locale): Record<string, unknown> {
  return {
    id: schema.id,
    title: lt(schema.title, locale),
    description: lt(schema.description, locale),
    fields: schema.fields.map((field) => ({
      id: field.id,
      label: lt(field.label, locale),
      type: field.type,
      ...(field.required !== undefined ? { required: field.required } : {}),
      ...(field.placeholder ? { placeholder: lt(field.placeholder, locale) } : {}),
      ...(field.options
        ? { options: field.options.map((o) => ({ value: o.value, label: lt(o.label, locale) })) }
        : {}),
      ...(field.suffix ? { suffix: lt(field.suffix, locale) } : {}),
      ...(field.visibleIf ? { visibleIf: field.visibleIf } : {}),
    })),
    ...(schema.messages
      ? {
          messages: schema.messages.map((m) => ({
            id: m.id,
            type: m.type,
            text: lt(m.text, locale),
            visibleIf: m.visibleIf,
          })),
        }
      : {}),
    ...(schema.dateRange
      ? {
          dateRange: {
            start: schema.dateRange.start,
            end: schema.dateRange.end,
            message: lt(schema.dateRange.message, locale),
          },
        }
      : {}),
  };
}

/* ------------------------------------------------------------------ */
/* Demandes soumises (seed déterministe, valeurs techniques).          */
/* ------------------------------------------------------------------ */

type RequestStatus = "approved" | "in_review" | "submitted";

interface SubmittedRequest {
  id: string;
  /** Identifiant du schéma — le titre est résolu par locale au rendu. */
  schemaId: string;
  /** Nom du demandeur, ou null pour l'utilisateur courant (« Vous »). */
  requester: string | null;
  /** Date ISO (yyyy-mm-dd), formatée par locale au rendu. */
  date: string;
  status: RequestStatus;
}

const INITIAL_REQUESTS: SubmittedRequest[] = [
  { id: "dem-1", schemaId: "achat-materiel", requester: "S. Bernard", date: "2026-06-02", status: "approved" },
  { id: "dem-2", schemaId: "conges", requester: "M. Lefèvre", date: "2026-06-09", status: "in_review" },
];

const STATUS_VARIANT: Record<RequestStatus, "success" | "warning" | "primary"> = {
  approved: "success",
  in_review: "warning",
  submitted: "primary",
};

const CONDITIONAL_FIELDS_COUNT = FORM_SCHEMAS.reduce(
  (sum, schema) => sum + schema.fields.filter((f) => f.visibleIf).length,
  0
);

function schemaTitle(schemaId: string, locale: Locale): string {
  const schema = FORM_SCHEMAS.find((s) => s.id === schemaId);
  return schema ? lt(schema.title, locale) : schemaId;
}

interface Submission {
  schemaId: string;
  values: FormValues;
}

/* ------------------------------------------------------------------ */
/* Composant.                                                          */
/* ------------------------------------------------------------------ */

export default function FormulaireDynamiqueSimulateur() {
  const { showToast } = useToast();
  const { locale } = useI18n();
  const t = getStrings(locale);
  const [schemaId, setSchemaId] = useState<string | null>(null);
  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<Record<string, ErrorCode>>({});
  const [requests, setRequests] = useState<SubmittedRequest[]>(INITIAL_REQUESTS);
  const [lastSubmission, setLastSubmission] = useState<Submission | null>(null);

  const schema = useMemo(() => FORM_SCHEMAS.find((s) => s.id === schemaId) ?? null, [schemaId]);

  const visibleFields = useMemo(
    () => (schema ? schema.fields.filter((f) => isFieldVisible(f, values)) : []),
    [schema, values]
  );

  const activeMessages = useMemo(
    () => (schema?.messages ?? []).filter((m) => evalCondition(m.visibleIf, values)),
    [schema, values]
  );

  const localizedSchema = useMemo(
    () => (schema ? localizeSchema(schema, locale) : null),
    [schema, locale]
  );

  /** Récapitulatif recalculé par locale : labels et valeurs suivent la langue active. */
  const recap = useMemo(() => {
    if (!lastSubmission) return null;
    const submitted = FORM_SCHEMAS.find((s) => s.id === lastSubmission.schemaId);
    if (!submitted) return null;
    return {
      title: lt(submitted.title, locale),
      entries: submitted.fields
        .filter((f) => isFieldVisible(f, lastSubmission.values))
        .map((f) => ({
          label: lt(f.label, locale),
          value: formatFieldValue(f, lastSubmission.values[f.id], locale, t.sim.yes, t.sim.no),
        })),
    };
  }, [lastSubmission, locale, t]);

  const typeOptions = useMemo(
    () => FORM_SCHEMAS.map((s) => ({ value: s.id, label: lt(s.title, locale) })),
    [locale]
  );

  const selectType = (id: string) => {
    const next = FORM_SCHEMAS.find((s) => s.id === id);
    setSchemaId(id);
    setValues(next ? initialValuesFor(next) : {});
    setErrors({});
    setLastSubmission(null);
  };

  const setFieldValue = (fieldId: string, value: FieldValue) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    setErrors((prev) => {
      if (!(fieldId in prev)) return prev;
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  };

  const errorText = (code: ErrorCode): string => {
    if (code === "required") return t.sim.errorRequired;
    if (code === "number") return t.sim.errorNumber;
    return schema?.dateRange ? lt(schema.dateRange.message, locale) : "";
  };

  const handleSubmit = () => {
    if (!schema) return;
    const validationErrors = validateSchema(schema, values);
    setErrors(validationErrors);
    const errorCount = Object.keys(validationErrors).length;
    if (errorCount > 0) {
      setLastSubmission(null);
      showToast(
        t.sim.toastValidationBody(errorCount),
        "error",
        4000,
        t.sim.toastValidationTitle,
        t.sim.toastSource,
        null
      );
      return;
    }
    const now = new Date();
    setRequests((prev) => [
      {
        id: `dem-${now.getTime()}`,
        schemaId: schema.id,
        requester: null,
        date: now.toISOString().slice(0, 10),
        status: "submitted",
      },
      ...prev,
    ]);
    setLastSubmission({ schemaId: schema.id, values });
    setValues(initialValuesFor(schema));
    showToast(
      t.sim.toastSubmittedBody(lt(schema.title, locale)),
      "success",
      5000,
      t.sim.toastSubmittedTitle,
      t.sim.toastSource,
      null
    );
  };

  const renderField = (field: FieldDef) => {
    const value = values[field.id];
    const errorCode = errors[field.id];
    const requiredMark = field.required ? " *" : "";
    const fieldLabel = lt(field.label, locale);
    const label = `${fieldLabel}${requiredMark}`;
    const placeholder = field.placeholder ? lt(field.placeholder, locale) : undefined;
    const wide = field.type === "textarea" || field.type === "radio";
    const localizedOptions = (field.options ?? []).map((o) => ({
      value: o.value,
      label: lt(o.label, locale),
    }));

    let control: React.ReactNode;
    switch (field.type) {
      case "text":
        control = (
          <Input
            label={label}
            value={typeof value === "string" ? value : ""}
            onChange={(v) => setFieldValue(field.id, v)}
            placeholder={placeholder ?? ""}
          />
        );
        break;
      case "number":
        control = (
          <Input
            label={label}
            type="number"
            value={typeof value === "string" ? value : ""}
            onChange={(v) => setFieldValue(field.id, v)}
            placeholder={placeholder ?? "0"}
          />
        );
        break;
      case "date":
        control = (
          <DateInput
            label={label}
            value={value instanceof Date ? value : null}
            onChange={(d) => setFieldValue(field.id, d)}
          />
        );
        break;
      case "select":
        control = (
          <Selectbox
            label={label}
            options={localizedOptions}
            value={typeof value === "string" ? value : null}
            onChange={(v) => setFieldValue(field.id, v)}
            placeholder={placeholder ?? t.sim.selectPlaceholderDefault}
          />
        );
        break;
      case "radio":
        control = (
          <RadioGroup
            name={field.id}
            label={label}
            options={localizedOptions}
            value={typeof value === "string" ? value : undefined}
            onChange={(v) => setFieldValue(field.id, v)}
            layout="horizontal"
          />
        );
        break;
      case "checkbox":
        control = (
          <div className="pt-6">
            <Checkbox
              label={fieldLabel}
              checked={value === true}
              onChange={(checked) => setFieldValue(field.id, checked)}
            />
          </div>
        );
        break;
      case "textarea":
        control = (
          <Textarea
            label={label}
            value={typeof value === "string" ? value : ""}
            onChange={(v) => setFieldValue(field.id, v)}
            placeholder={placeholder ?? ""}
            rows={3}
          />
        );
        break;
    }

    return (
      <div key={field.id} className={wide ? "md:col-span-2" : ""}>
        {control}
        {errorCode && (
          <p className="mt-1 text-xs" role="alert" style={{ color: "var(--bpm-error, #dc2626)" }}>
            {errorText(errorCode)}
          </p>
        )}
      </div>
    );
  };

  const tableRows = useMemo(
    () =>
      requests.map((req) => ({
        id: req.id,
        type: schemaTitle(req.schemaId, locale),
        requester: req.requester ?? t.sim.you,
        date: new Date(`${req.date}T00:00:00`).toLocaleDateString(dateLocaleFor(locale)),
        status: req.status,
      })),
    [requests, locale, t]
  );

  const columns = [
    { key: "type", label: t.sim.columnType },
    { key: "requester", label: t.sim.columnRequester },
    { key: "date", label: t.sim.columnDate },
    {
      key: "status",
      label: t.sim.columnStatus,
      render: (value: unknown) => {
        const status = value as RequestStatus;
        return (
          <Badge variant={STATUS_VARIANT[status] ?? "default"}>{t.sim.status[status] ?? String(value)}</Badge>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <MetricRow>
        <Metric label={t.sim.metricFormTypes} value={String(FORM_SCHEMAS.length)} />
        <Metric label={t.sim.metricSubmitted} value={String(requests.length)} />
        <Metric label={t.sim.metricConditionalFields} value={String(CONDITIONAL_FIELDS_COUNT)} />
      </MetricRow>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel variant="info" title={t.sim.newRequestPanel}>
            <Selectbox
              label={t.sim.requestTypeLabel}
              options={typeOptions}
              value={schemaId}
              onChange={selectType}
              placeholder={t.sim.requestTypePlaceholder}
            />

            {!schema && (
              <div className="mt-4">
                <Message type="info">{t.sim.selectTypeHint}</Message>
              </div>
            )}

            {schema && (
              <>
                <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
                  {lt(schema.description, locale)}
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">{visibleFields.map(renderField)}</div>
                {activeMessages.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {activeMessages.map((m) => (
                      <Message key={m.id} type={m.type}>
                        {lt(m.text, locale)}
                      </Message>
                    ))}
                  </div>
                )}
                <p className="mt-3 text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
                  {t.sim.requiredNote}
                </p>
                <Button className="mt-3" variant="primary" onClick={handleSubmit}>
                  {t.sim.submitButton}
                </Button>
              </>
            )}
          </Panel>

          {recap && (
            <Panel variant="success" title={t.sim.recapPanelTitle(recap.title)}>
              <p className="mb-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
                {t.sim.recapSaved}
              </p>
              <div className="space-y-2">
                {recap.entries.map((entry) => (
                  <LabelValue key={entry.label} label={entry.label} value={entry.value} valueStyle="bold" />
                ))}
              </div>
            </Panel>
          )}

          <Panel variant="info" title={t.sim.submittedPanel}>
            <Table columns={columns} data={tableRows as unknown as Record<string, unknown>[]} striped hover />
          </Panel>
        </div>

        <div className="lg:col-span-1">
          <Panel variant="info" title={t.sim.schemaPanel}>
            {schema && localizedSchema ? (
              <>
                <p className="mb-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
                  {rich(t.sim.schemaIntro(lt(schema.title, locale)))}
                </p>
                <JsonViewer data={localizedSchema} defaultExpandedLevel={2} maxHeight={520} />
              </>
            ) : (
              <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
                {t.sim.schemaEmpty}
              </p>
            )}
            <div className="mt-4">
              <Expander title={t.sim.expanderTitle}>
                <ul className="list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
                  {t.sim.expanderItems.map((item, i) => (
                    <li key={i}>{rich(item)}</li>
                  ))}
                </ul>
              </Expander>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
