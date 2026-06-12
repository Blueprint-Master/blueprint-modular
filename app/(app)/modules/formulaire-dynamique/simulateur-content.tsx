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

/* ------------------------------------------------------------------ */
/* Schéma de formulaire — le moteur est piloté par ces définitions.    */
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
  label: string;
}

interface FieldDef {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: FieldOption[];
  placeholder?: string;
  /** Suffixe d'affichage dans le récapitulatif (ex. "€"). */
  suffix?: string;
  /** Le champ n'est rendu (et validé) que si la condition est vraie. */
  visibleIf?: Condition;
}

interface ConditionalMessage {
  id: string;
  type: "info" | "warning" | "error";
  text: string;
  visibleIf: Condition;
}

interface FormSchema {
  id: string;
  title: string;
  description: string;
  fields: FieldDef[];
  messages?: ConditionalMessage[];
  /** Contrôle croisé optionnel : la date de fin doit suivre la date de début. */
  dateRange?: { start: string; end: string; message: string };
}

const FORM_SCHEMAS: FormSchema[] = [
  {
    id: "conges",
    title: "Demande de congés",
    description: "Absence planifiée : période, type de congé et commentaire pour le manager.",
    fields: [
      { id: "date_debut", label: "Début de la période", type: "date", required: true },
      { id: "date_fin", label: "Fin de la période", type: "date", required: true },
      {
        id: "type_conge",
        label: "Type de congé",
        type: "select",
        required: true,
        placeholder: "Choisir un type",
        options: [
          { value: "payes", label: "Congés payés" },
          { value: "rtt", label: "RTT" },
          { value: "sans_solde", label: "Congé sans solde" },
        ],
      },
      { id: "demi_journee", label: "Demi-journée uniquement", type: "checkbox" },
      {
        id: "commentaire",
        label: "Commentaire (optionnel)",
        type: "textarea",
        placeholder: "Contexte, passation, contacts pendant l'absence…",
      },
      {
        id: "justification",
        label: "Justification du congé sans solde",
        type: "textarea",
        required: true,
        placeholder: "Motif détaillé exigé par la DRH pour un congé sans solde.",
        visibleIf: { field: "type_conge", operator: "equals", value: "sans_solde" },
      },
    ],
    messages: [
      {
        id: "msg-sans-solde",
        type: "info",
        text: "Congé sans solde : la demande sera transmise à la DRH avec la justification.",
        visibleIf: { field: "type_conge", operator: "equals", value: "sans_solde" },
      },
    ],
    dateRange: {
      start: "date_debut",
      end: "date_fin",
      message: "La date de fin doit être postérieure ou égale à la date de début.",
    },
  },
  {
    id: "achat-materiel",
    title: "Achat de matériel",
    description: "Demande d'achat : catégorie, description du besoin et montant estimé.",
    fields: [
      {
        id: "categorie",
        label: "Catégorie",
        type: "select",
        required: true,
        placeholder: "Choisir une catégorie",
        options: [
          { value: "informatique", label: "Informatique" },
          { value: "mobilier", label: "Mobilier" },
          { value: "logiciel", label: "Logiciel" },
        ],
      },
      { id: "montant", label: "Montant estimé (€ HT)", type: "number", required: true, placeholder: "0", suffix: "€ HT" },
      {
        id: "description",
        label: "Description du besoin",
        type: "textarea",
        required: true,
        placeholder: "Matériel demandé, quantité, usage prévu…",
      },
      {
        id: "validation_directeur",
        label: "Validation directeur (montant > 1 000 €)",
        type: "select",
        required: true,
        placeholder: "Choisir le directeur approbateur",
        options: [
          { value: "c.moreau", label: "C. Moreau — Directeur des opérations" },
          { value: "a.petit", label: "A. Petit — Directrice financière" },
        ],
        visibleIf: { field: "montant", operator: "greaterThan", value: 1000 },
      },
    ],
    messages: [
      {
        id: "msg-seuil",
        type: "warning",
        text: "Montant supérieur à 1 000 € HT : une validation de niveau directeur est obligatoire avant commande.",
        visibleIf: { field: "montant", operator: "greaterThan", value: 1000 },
      },
    ],
  },
  {
    id: "acces-applicatif",
    title: "Accès applicatif",
    description: "Ouverture de droits sur une application interne, avec contrôle renforcé pour le profil admin.",
    fields: [
      {
        id: "application",
        label: "Application",
        type: "select",
        required: true,
        placeholder: "Choisir une application",
        options: [
          { value: "erp", label: "ERP" },
          { value: "crm", label: "CRM" },
          { value: "dwh", label: "Datawarehouse" },
        ],
      },
      {
        id: "profil",
        label: "Profil demandé",
        type: "radio",
        required: true,
        options: [
          { value: "lecture", label: "Lecture" },
          { value: "ecriture", label: "Écriture" },
          { value: "admin", label: "Administrateur" },
        ],
      },
      {
        id: "motif",
        label: "Motif de l'accès administrateur",
        type: "textarea",
        required: true,
        placeholder: "Justifiez le besoin d'un accès admin (mission, périmètre).",
        visibleIf: { field: "profil", operator: "equals", value: "admin" },
      },
      {
        id: "duree",
        label: "Durée de l'accès admin",
        type: "select",
        required: true,
        placeholder: "Durée limitée obligatoire",
        options: [
          { value: "30j", label: "30 jours" },
          { value: "90j", label: "90 jours" },
        ],
        visibleIf: { field: "profil", operator: "equals", value: "admin" },
      },
    ],
    messages: [
      {
        id: "msg-admin",
        type: "warning",
        text: "Profil administrateur : accès limité dans le temps et motif obligatoire (revue sécurité trimestrielle).",
        visibleIf: { field: "profil", operator: "equals", value: "admin" },
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Moteur générique : évaluation des conditions, validation, rendu.   */
/* ------------------------------------------------------------------ */

type FieldValue = string | boolean | Date | null;
type FormValues = Record<string, FieldValue>;

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

function validateSchema(schema: FormSchema, values: FormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of schema.fields) {
    if (!isFieldVisible(field, values)) continue;
    const value = values[field.id];
    if (field.required && isEmptyValue(value)) {
      errors[field.id] = "Ce champ est requis.";
      continue;
    }
    if (field.type === "number" && typeof value === "string" && value.trim() !== "") {
      const n = parseFloat(value.replace(",", "."));
      if (!Number.isFinite(n) || n < 0) {
        errors[field.id] = "Saisissez un montant valide (nombre positif).";
      }
    }
  }
  if (schema.dateRange) {
    const start = values[schema.dateRange.start];
    const end = values[schema.dateRange.end];
    if (start instanceof Date && end instanceof Date && end.getTime() < start.getTime() && !errors[schema.dateRange.end]) {
      errors[schema.dateRange.end] = schema.dateRange.message;
    }
  }
  return errors;
}

function formatFieldValue(field: FieldDef, value: FieldValue): string {
  if (isEmptyValue(value)) return "—";
  if (field.type === "checkbox") return value === true ? "Oui" : "Non";
  if (value instanceof Date) return value.toLocaleDateString("fr-FR");
  if ((field.type === "select" || field.type === "radio") && typeof value === "string") {
    const opt = field.options?.find((o) => o.value === value);
    return opt ? opt.label : value;
  }
  const text = String(value);
  return field.suffix ? `${text} ${field.suffix}` : text;
}

/* ------------------------------------------------------------------ */
/* Demandes soumises (seed déterministe).                              */
/* ------------------------------------------------------------------ */

interface SubmittedRequest {
  id: string;
  type: string;
  demandeur: string;
  date: string;
  statut: "Approuvée" | "En cours d'examen" | "Soumise";
}

const INITIAL_REQUESTS: SubmittedRequest[] = [
  { id: "dem-1", type: "Achat de matériel", demandeur: "S. Bernard", date: "2026-06-02", statut: "Approuvée" },
  { id: "dem-2", type: "Demande de congés", demandeur: "M. Lefèvre", date: "2026-06-09", statut: "En cours d'examen" },
];

const STATUT_VARIANT: Record<SubmittedRequest["statut"], "success" | "warning" | "primary"> = {
  Approuvée: "success",
  "En cours d'examen": "warning",
  Soumise: "primary",
};

const CONDITIONAL_FIELDS_COUNT = FORM_SCHEMAS.reduce(
  (sum, schema) => sum + schema.fields.filter((f) => f.visibleIf).length,
  0
);

const TYPE_OPTIONS = FORM_SCHEMAS.map((s) => ({ value: s.id, label: s.title }));

interface RecapEntry {
  label: string;
  value: string;
}

interface Submission {
  formTitle: string;
  entries: RecapEntry[];
}

/* ------------------------------------------------------------------ */
/* Composant.                                                          */
/* ------------------------------------------------------------------ */

export default function FormulaireDynamiqueSimulateur() {
  const { showToast } = useToast();
  const [schemaId, setSchemaId] = useState<string | null>(null);
  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
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

  const handleSubmit = () => {
    if (!schema) return;
    const validationErrors = validateSchema(schema, values);
    setErrors(validationErrors);
    const errorCount = Object.keys(validationErrors).length;
    if (errorCount > 0) {
      setLastSubmission(null);
      showToast(
        `${errorCount} champ${errorCount > 1 ? "s" : ""} à corriger avant soumission.`,
        "error",
        4000,
        "Validation échouée",
        "Formulaire dynamique",
        null
      );
      return;
    }
    const entries = schema.fields
      .filter((f) => isFieldVisible(f, values))
      .map((f) => ({ label: f.label, value: formatFieldValue(f, values[f.id]) }));
    const now = new Date();
    setRequests((prev) => [
      {
        id: `dem-${now.getTime()}`,
        type: schema.title,
        demandeur: "Vous",
        date: now.toISOString().slice(0, 10),
        statut: "Soumise",
      },
      ...prev,
    ]);
    setLastSubmission({ formTitle: schema.title, entries });
    setValues(initialValuesFor(schema));
    showToast(
      `Demande « ${schema.title} » soumise au guichet interne.`,
      "success",
      5000,
      "Demande soumise",
      "Formulaire dynamique",
      null
    );
  };

  const renderField = (field: FieldDef) => {
    const value = values[field.id];
    const error = errors[field.id];
    const requiredMark = field.required ? " *" : "";
    const label = `${field.label}${requiredMark}`;
    const wide = field.type === "textarea" || field.type === "radio";

    let control: React.ReactNode;
    switch (field.type) {
      case "text":
        control = (
          <Input
            label={label}
            value={typeof value === "string" ? value : ""}
            onChange={(v) => setFieldValue(field.id, v)}
            placeholder={field.placeholder ?? ""}
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
            placeholder={field.placeholder ?? "0"}
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
            options={field.options ?? []}
            value={typeof value === "string" ? value : null}
            onChange={(v) => setFieldValue(field.id, v)}
            placeholder={field.placeholder ?? "Sélectionner…"}
          />
        );
        break;
      case "radio":
        control = (
          <RadioGroup
            name={field.id}
            label={label}
            options={field.options ?? []}
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
              label={field.label}
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
            placeholder={field.placeholder ?? ""}
            rows={3}
          />
        );
        break;
    }

    return (
      <div key={field.id} className={wide ? "md:col-span-2" : ""}>
        {control}
        {error && (
          <p className="mt-1 text-xs" role="alert" style={{ color: "var(--bpm-error, #dc2626)" }}>
            {error}
          </p>
        )}
      </div>
    );
  };

  const columns = [
    { key: "type", label: "Type de demande" },
    { key: "demandeur", label: "Demandeur" },
    { key: "date", label: "Date" },
    {
      key: "statut",
      label: "Statut",
      render: (value: unknown) => (
        <Badge variant={STATUT_VARIANT[value as SubmittedRequest["statut"]] ?? "default"}>{String(value)}</Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <MetricRow>
        <Metric label="Types de formulaires" value={String(FORM_SCHEMAS.length)} />
        <Metric label="Demandes soumises" value={String(requests.length)} />
        <Metric label="Champs conditionnels" value={String(CONDITIONAL_FIELDS_COUNT)} />
      </MetricRow>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel variant="info" title="Nouvelle demande interne">
            <Selectbox
              label="Type de demande"
              options={TYPE_OPTIONS}
              value={schemaId}
              onChange={selectType}
              placeholder="Choisir le type de demande"
            />

            {!schema && (
              <div className="mt-4">
                <Message type="info">
                  Sélectionnez un type de demande : les champs du formulaire sont générés à partir du schéma JSON
                  correspondant (visible dans le panneau de droite).
                </Message>
              </div>
            )}

            {schema && (
              <>
                <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
                  {schema.description}
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">{visibleFields.map(renderField)}</div>
                {activeMessages.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {activeMessages.map((m) => (
                      <Message key={m.id} type={m.type}>
                        {m.text}
                      </Message>
                    ))}
                  </div>
                )}
                <p className="mt-3 text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
                  * champs requis — la liste des champs requis évolue selon vos réponses.
                </p>
                <Button className="mt-3" variant="primary" onClick={handleSubmit}>
                  Soumettre la demande
                </Button>
              </>
            )}
          </Panel>

          {lastSubmission && (
            <Panel variant="success" title={`Récapitulatif — ${lastSubmission.formTitle}`}>
              <p className="mb-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
                Demande enregistrée et ajoutée au tableau « Demandes soumises ».
              </p>
              <div className="space-y-2">
                {lastSubmission.entries.map((entry) => (
                  <LabelValue key={entry.label} label={entry.label} value={entry.value} valueStyle="bold" />
                ))}
              </div>
            </Panel>
          )}

          <Panel variant="info" title="Demandes soumises">
            <Table columns={columns} data={requests as unknown as Record<string, unknown>[]} striped hover />
          </Panel>
        </div>

        <div className="lg:col-span-1">
          <Panel variant="info" title="Schéma JSON">
            {schema ? (
              <>
                <p className="mb-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
                  Définition pilotant le formulaire « {schema.title} » : chaque champ déclare son type, son caractère
                  requis et, le cas échéant, sa condition <code>visibleIf</code>.
                </p>
                <JsonViewer data={schema} defaultExpandedLevel={2} maxHeight={520} />
              </>
            ) : (
              <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
                Choisissez un type de demande pour afficher son schéma.
              </p>
            )}
            <div className="mt-4">
              <Expander title="Comment lit-on ce schéma ?">
                <ul className="list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
                  <li>
                    <code>fields[].type</code> — mappe vers un composant bpm (select, radio, date, textarea…).
                  </li>
                  <li>
                    <code>fields[].visibleIf</code> — le champ n&apos;apparaît (et n&apos;est validé) que si la
                    condition est vraie.
                  </li>
                  <li>
                    <code>messages[]</code> — bandeaux contextuels affichés selon les mêmes conditions.
                  </li>
                </ul>
              </Expander>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
