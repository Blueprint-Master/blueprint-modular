"use client";

import Link from "next/link";
import { Badge, Caption, Chip, Divider, JsonViewer, LabelValue, Message, Table, Tabs, Title } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { getConnectorById } from "@/lib/connectors/catalog";
import { applyResponseMapping } from "@/lib/connectors/mapping";
import type { Operation } from "@/lib/connectors/types";
import { STR } from "../strings";

function SectionTitle({ children, lead }: { children: React.ReactNode; lead?: string }) {
  return (
    <div style={{ marginTop: 32 }}>
      <Title level={2}>{children}</Title>
      {lead && <Caption style={{ marginTop: 4 }}>{lead}</Caption>}
    </div>
  );
}

/** En-tête d'opération (méthode + chemin), partagé Documentation / Simulateur. */
function OperationHeading({ op }: { op: Operation }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <Badge variant="primary">{op.httpMethod}</Badge>
      <code style={{ fontSize: 13, color: "var(--bpm-text-primary)" }}>{op.pathTemplate}</code>
    </div>
  );
}

export function ConnecteurFicheContent({ id }: { id: string }) {
  const { locale } = useI18n();
  const S = STR[locale];
  const connector = getConnectorById(id);
  if (!connector) return null;

  const fieldRows = connector.auth.fields.map((f) => ({
    field: f.label[locale],
    type: S.fieldType[f.type],
    required: f.required ? S.yes : S.no,
    example: f.type === "secret" ? S.secretLocked : f.placeholder || S.none,
  }));

  // ----- Documentation : référence statique d'une opération (entrées + mapping) -----
  const renderOperationDoc = (op: Operation) => {
    const inputs =
      Object.entries(op.inputSchema)
        .map(([name, spec]) => `${name} (${spec.required ? S.required : S.optional})`)
        .join(", ") || S.none;

    const mappingRows = op.responseMapping.map((r) => ({
      source: r.source,
      target: r.target,
      transform: r.transform || S.none,
    }));

    return (
      <div key={op.id} style={{ marginTop: 20 }}>
        <OperationHeading op={op} />
        <Caption style={{ marginTop: 8 }}>
          <strong>{S.thInputs} :</strong> {inputs}
        </Caption>
        <SectionTitle>{S.secMapping}</SectionTitle>
        <Table
          columns={[
            { key: "source", label: S.thSource },
            { key: "target", label: S.thTarget },
            { key: "transform", label: S.thTransform },
          ]}
          data={mappingRows}
        />
      </div>
    );
  };

  // ----- Simulateur : démo live du mapping de réponse (fixture → sortie normalisée) -----
  const renderOperationDemo = (op: Operation) => {
    let mapped: unknown;
    let mapError: string | null = null;
    try {
      mapped = applyResponseMapping(op.sampleResponse, op);
    } catch (e) {
      mapError = e instanceof Error ? e.message : String(e);
    }

    return (
      <div key={op.id} style={{ marginTop: 24 }}>
        <OperationHeading op={op} />
        {mapError ? (
          <Message type="error">{mapError}</Message>
        ) : (
          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              marginTop: 12,
            }}
          >
            <div>
              <Caption style={{ marginBottom: 6, fontWeight: 600 }}>{S.demoInput}</Caption>
              <JsonViewer data={op.sampleResponse} defaultExpandedLevel={2} maxHeight={320} />
            </div>
            <div>
              <Caption style={{ marginBottom: 6, fontWeight: 600 }}>{S.demoOutput}</Caption>
              <JsonViewer data={mapped} defaultExpandedLevel={3} maxHeight={320} />
            </div>
          </div>
        )}
      </div>
    );
  };

  // ----- Onglet Documentation : auth, OAuth, hôtes, opérations (référence) -----
  const documentation = (
    <>
      <Message type="info">{S.securityNote}</Message>

      <SectionTitle lead={S.secAuthLead}>{S.secAuth}</SectionTitle>
      <Table
        columns={[
          { key: "field", label: S.thField },
          { key: "type", label: S.thType },
          { key: "required", label: S.thRequired },
          { key: "example", label: S.thExample },
        ]}
        data={fieldRows}
      />

      {connector.auth.oauth2 && (
        <>
          <SectionTitle>{S.secOauth}</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <LabelValue
              label={S.oauthScopes}
              size="sm"
              value={connector.auth.oauth2.scopes.map((s) => (
                <Chip key={s} variant="outline" label={s} />
              ))}
            />
            <LabelValue label={S.oauthRefresh} size="sm" value={connector.auth.oauth2.refresh ? S.yes : S.no} />
            <LabelValue label={S.oauthAuthUrl} size="sm" value={<code>{connector.auth.oauth2.authorizationUrl}</code>} />
            <LabelValue label={S.oauthTokenUrl} size="sm" value={<code>{connector.auth.oauth2.tokenUrl}</code>} />
          </div>
        </>
      )}

      <SectionTitle lead={S.secHostsLead}>{S.secHosts}</SectionTitle>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {connector.hosts.map((h) => (
          <Chip key={h} variant="default" label={h} />
        ))}
      </div>

      <SectionTitle>{S.secOps}</SectionTitle>
      {connector.operations.map(renderOperationDoc)}

      <Divider />
      <Caption style={{ lineHeight: 1.6 }}>{S.securityNote}</Caption>
    </>
  );

  // ----- Onglet Simulateur : démos live de mapping -----
  const simulateur = (
    <>
      <SectionTitle lead={S.secDemoLead}>{S.secDemo}</SectionTitle>
      <Caption style={{ marginTop: 4 }}>{S.simulatorLead}</Caption>
      {connector.operations.map(renderOperationDemo)}
    </>
  );

  return (
    <section className="site-section">
      <div className="site-container">
        <div className="site-eyebrow" style={{ marginBottom: 8 }}>
          <Link href="/connecteurs" style={{ color: "var(--bpm-accent-cyan)" }}>
            {S.breadcrumb}
          </Link>{" "}
          → {connector.name[locale]}
        </div>

        <h1 style={{ margin: "0 0 8px" }}>{connector.name[locale]}</h1>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          <Badge variant="success">{S.authMethod[connector.auth.method]}</Badge>
          <Badge variant="default">{S.category[connector.category]}</Badge>
        </div>
        <Caption style={{ lineHeight: 1.7, maxWidth: "70ch" }}>
          {connector.description[locale]}
        </Caption>

        <div style={{ marginTop: 20 }}>
          <Tabs
            tabs={[
              { label: S.tabDocumentation, content: documentation },
              { label: S.tabSimulator, content: simulateur },
            ]}
            defaultTab={0}
          />
        </div>
      </div>
    </section>
  );
}
