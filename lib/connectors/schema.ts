/**
 * Validation runtime du ConnectorDescriptor (zod).
 *
 * Au-delà du typage structurel, le schéma FAIT RESPECTER l'invariant de sécurité :
 *  - `.strict()` sur CredentialField => toute propriété excédentaire (`value`,
 *    `default`, `secret`, …) est REJETÉE : impossible de déclarer un secret en dur.
 *  - un champ `secret` ne peut pas porter de `placeholder` (vecteur de fuite).
 *  - `hosts` non vide (allow-list d'egress obligatoire).
 *  - bloc `oauth2` présent si et seulement si method === "oauth2".
 *  - au moins une opération ; chaque pathTemplate commence par "/".
 *
 * Mirroir du style de packages/core/src/schema/spec-validator.ts.
 */
import { z } from "zod";
import type { ConnectorDescriptor } from "./types";

const i18nTextSchema = z
  .object({
    fr: z.string().min(1),
    en: z.string().min(1),
  })
  .strict();

const credentialFieldSchema = z
  .object({
    key: z.string().min(1),
    label: i18nTextSchema,
    type: z.enum(["secret", "text", "url"]),
    required: z.boolean(),
    placeholder: z.string().optional(),
  })
  // .strict() : refuse `value`, `default`, etc. — un secret ne se déclare jamais en dur.
  .strict()
  .superRefine((field, ctx) => {
    if (field.type === "secret" && field.placeholder !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `CredentialField "${field.key}": un champ "secret" ne peut pas porter de placeholder.`,
        path: ["placeholder"],
      });
    }
  });

const oauth2ConfigSchema = z
  .object({
    scopes: z.array(z.string().min(1)).min(1),
    authorizationUrl: z.string().url(),
    tokenUrl: z.string().url(),
    refresh: z.boolean(),
  })
  .strict();

const connectorAuthSchema = z
  .object({
    method: z.enum(["apiKey", "oauth2", "webhookSecret", "bearer"]),
    fields: z.array(credentialFieldSchema).min(1),
    oauth2: oauth2ConfigSchema.optional(),
  })
  .strict()
  .superRefine((auth, ctx) => {
    if (auth.method === "oauth2" && !auth.oauth2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'method "oauth2" exige un bloc "oauth2" (scopes, urls, refresh).',
        path: ["oauth2"],
      });
    }
    if (auth.method !== "oauth2" && auth.oauth2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `bloc "oauth2" interdit pour la méthode "${auth.method}".`,
        path: ["oauth2"],
      });
    }
  });

const operationInputSchema = z
  .object({
    type: z.enum(["string", "number"]),
    required: z.boolean(),
  })
  .strict();

const responseMappingRuleSchema = z
  .object({
    source: z.string().min(1),
    target: z.string().min(1),
    transform: z.string().min(1).optional(),
  })
  .strict();

const operationSchema = z
  .object({
    id: z.string().min(1),
    httpMethod: z.enum(["GET", "POST"]),
    pathTemplate: z.string().regex(/^\//, 'pathTemplate doit commencer par "/".'),
    inputSchema: z.record(z.string(), operationInputSchema),
    collectionPath: z.string().min(1).optional(),
    responseMapping: z.array(responseMappingRuleSchema).min(1),
    sampleResponse: z.unknown(),
  })
  .strict();

export const connectorDescriptorSchema = z
  .object({
    id: z
      .string()
      .min(1)
      .regex(/^[a-z0-9-]+$/, "id : minuscules, chiffres et tirets uniquement."),
    name: i18nTextSchema,
    category: z.enum(["generic", "data", "messaging", "payments"]),
    description: i18nTextSchema,
    auth: connectorAuthSchema,
    hosts: z.array(z.string().min(1)).min(1, "hosts (allow-list d'egress) ne peut pas être vide."),
    operations: z.array(operationSchema).min(1, "au moins une opération est requise."),
  })
  .strict();

export interface ValidationResult {
  ok: boolean;
  /** Messages d'erreur lisibles (vide si ok). */
  errors: string[];
}

/** Valide un descripteur ; ne lève pas — renvoie le verdict + les erreurs. */
export function validateConnectorDescriptor(input: unknown): ValidationResult {
  const parsed = connectorDescriptorSchema.safeParse(input);
  if (parsed.success) return { ok: true, errors: [] };
  return {
    ok: false,
    errors: parsed.error.issues.map((i) => `${i.path.join(".") || "<root>"}: ${i.message}`),
  };
}

/** Variante stricte : lève si invalide, sinon renvoie le descripteur typé. */
export function parseConnectorDescriptor(input: unknown): ConnectorDescriptor {
  return connectorDescriptorSchema.parse(input) as ConnectorDescriptor;
}
