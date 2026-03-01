/**
 * Types pour le module d'export d'applications générées (App Builder).
 * Cohérent avec le modèle Prisma GeneratedApp (Prompt 5).
 */

export interface TableDef {
  name: string;
  columns: { name: string; type: string; nullable?: boolean }[];
  primaryKey?: string[];
}

export interface RelationDef {
  from: string; // table
  to: string;
  fromKey: string;
  toKey: string;
}

export interface DBSchema {
  tables: TableDef[];
  relations: RelationDef[];
}

export interface GeneratedApp {
  id: string;
  title: string;
  description: string;
  code: string;
  schema: DBSchema;
  migrations: string[];
  computeFunctions: string[];
  components: string[];
  createdAt: string;
  organizationId: string;
  previewUrl?: string;
  expiresAt?: string;
}

export interface ExportPackage {
  appId: string;
  bundlePath: string;
  checksum: string;
  size: number;
  createdAt: string;
}
