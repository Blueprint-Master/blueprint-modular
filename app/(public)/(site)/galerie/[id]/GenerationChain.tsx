"use client";

import type { CuratedApp, CuratedAppSpec } from "@/lib/gallery/types";
import { Card } from "@/components/bpm/Card";
import { Table, type TableColumn } from "@/components/bpm/Table";
import { Badge } from "@/components/bpm/Badge";
import { Chip } from "@/components/bpm/Chip";

export interface GenerationChainLabels {
  /** Étapes narratives. */
  stepPromptTitle: string;
  stepStructureTitle: string;
  stepAppTitle: string;
  narrative: string;
  /** Sous-sections structure. */
  entitiesTitle: string;
  modulesTitle: string;
  kpisTitle: string;
  /** Colonnes champs. */
  fieldColLabel: string;
  fieldColType: string;
  fieldColRequired: string;
  requiredYes: string;
  requiredNo: string;
  fieldsCount: string; // ex. "{n} champs"
  /** Colonnes modules. */
  moduleColLabel: string;
  moduleColEntity: string;
  noEntity: string;
  /** Capture. */
  screenshotAlt: string;
  noShot: string;
}

/**
 * Rend la chaîne de génération d'une app : prompt → structure → capture.
 * Composant client ('use client') : compose des composants bpm.* (Card, Table,
 * Badge, Chip) pour un rendu LISIBLE — jamais de JSON brut. La page reste un
 * Server Component qui passe des données déjà assainies + des libellés i18n.
 *
 * Le bloc « structure » n'apparaît que si `app.appSpec` est non nul : pour une
 * app sans AppSpec exploitable, seules les étapes prompt + capture s'affichent
 * (pas de section vide, pas de « 0 entité »).
 */
export function GenerationChain({
  app,
  labels,
}: {
  app: CuratedApp;
  labels: GenerationChainLabels;
}) {
  const spec = app.appSpec;

  return (
    <ol className="gen-chain">
      {/* ÉTAPE 1 — la demande en langage naturel */}
      <li className="gen-chain-step">
        <ChainHeader index={1} title={labels.stepPromptTitle} />
        <blockquote className="gen-chain-prompt">{app.prompt}</blockquote>
      </li>

      {/* ÉTAPE 2 — la structure générée (uniquement si AppSpec exploitable) */}
      {spec ? (
        <li className="gen-chain-step">
          <ChainHeader index={2} title={labels.stepStructureTitle} />
          <p className="gen-chain-narrative">{labels.narrative}</p>
          <StructureView spec={spec} labels={labels} />
        </li>
      ) : null}

      {/* ÉTAPE finale — la capture de l'app */}
      <li className="gen-chain-step">
        <ChainHeader index={spec ? 3 : 2} title={labels.stepAppTitle} />
        <div className="gen-chain-shot">
          {app.screenshotUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={app.screenshotUrl} alt={`${labels.screenshotAlt} — ${app.title}`} loading="lazy" />
          ) : (
            <span className="gen-chain-noshot">{labels.noShot}</span>
          )}
        </div>
      </li>
    </ol>
  );
}

function ChainHeader({ index, title }: { index: number; title: string }) {
  return (
    <div className="gen-chain-head">
      <span className="gen-chain-num" aria-hidden="true">
        {index}
      </span>
      <h2 className="gen-chain-title">{title}</h2>
    </div>
  );
}

function StructureView({
  spec,
  labels,
}: {
  spec: CuratedAppSpec;
  labels: GenerationChainLabels;
}) {
  const fieldColumns: TableColumn[] = [
    { key: "label", label: labels.fieldColLabel },
    {
      key: "type",
      label: labels.fieldColType,
      render: (v) => <Chip label={String(v)} variant="outline" />,
    },
    {
      key: "required",
      label: labels.fieldColRequired,
      align: "center",
      render: (v) =>
        v === true ? (
          <Badge variant="primary" size="sm">
            {labels.requiredYes}
          </Badge>
        ) : (
          <span className="gen-chain-muted">{labels.requiredNo}</span>
        ),
    },
  ];

  const moduleColumns: TableColumn[] = [
    { key: "label", label: labels.moduleColLabel },
    {
      key: "entity",
      label: labels.moduleColEntity,
      render: (v) =>
        typeof v === "string" && v.length > 0 ? (
          <Chip label={v} variant="default" />
        ) : (
          <span className="gen-chain-muted">{labels.noEntity}</span>
        ),
    },
  ];

  return (
    <div className="gen-chain-structure">
      {/* Entités + leurs champs */}
      {spec.entities.length > 0 ? (
        <section className="gen-chain-block">
          <h3 className="gen-chain-block-title">{labels.entitiesTitle}</h3>
          <div className="gen-chain-entities">
            {spec.entities.map((entity) => (
              <Card
                key={entity.name}
                variant="outlined"
                title={entity.label}
                subtitle={labels.fieldsCount.replace("{n}", String(entity.fields.length))}
              >
                <Table
                  columns={fieldColumns}
                  data={entity.fields.map((f) => ({
                    label: f.label,
                    type: f.type,
                    required: f.required,
                  }))}
                  striped
                  hover={false}
                />
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {/* Modules de navigation */}
      {spec.modules.length > 0 ? (
        <section className="gen-chain-block">
          <h3 className="gen-chain-block-title">{labels.modulesTitle}</h3>
          <Table
            columns={moduleColumns}
            data={spec.modules.map((m) => ({ label: m.label, entity: m.entity }))}
            striped
            hover={false}
          />
        </section>
      ) : null}

      {/* KPIs */}
      {spec.kpis.length > 0 ? (
        <section className="gen-chain-block">
          <h3 className="gen-chain-block-title">{labels.kpisTitle}</h3>
          <div className="gen-chain-kpis">
            {spec.kpis.map((kpi, i) => (
              <Card
                key={`${kpi.label}-${i}`}
                variant="outlined"
                title={kpi.label}
                subtitle={kpi.unit ? `${kpi.aggregation} · ${kpi.unit}` : kpi.aggregation}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
