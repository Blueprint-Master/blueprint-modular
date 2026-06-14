"use client";

import Link from "next/link";
import { Badge, Chip, Divider, JsonViewer, Message, Table } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { getConnectorById } from "@/lib/connectors/catalog";
import { applyResponseMapping } from "@/lib/connectors/mapping";
import type { Operation } from "@/lib/connectors/types";
import { STR } from "../strings";

function SectionTitle({ children, lead }: { children: React.ReactNode; lead?: string }) {
  return (
    <div style={{ marginTop: 32 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--bpm-text-primary)", margin: 0 }}>
        {children}
      </h2>
      {lead && (
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--bpm-text-secondary)" }}>{lead}</p>
      )}
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

  const renderOperation = (op: Operation) => {
    const inputs =
      Object.entries(op.inputSchema)
        .map(([name, spec]) => `${name} (${spec.required ? S.required : S.optional})`)
        .join(", ") || S.none;

    const mappingRows = op.responseMapping.map((r) => ({
      source: r.source,
      target: r.target,
      transform: r.transform || S.none,
    }));

    let mapped: unknown;
    let mapError: string | null = null;
    try {
      mapped = applyResponseMapping(op.sampleResponse, op);
    } catch (e) {
      mapError = e instanceof Error ? e.message : String(e);
    }

    return (
      <div key={op.id} style={{ marginTop: 20 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <Badge variant="primary">{op.httpMethod}</Badge>
          <code style={{ fontSize: 13, color: "var(--bpm-text-primary)" }}>{op.pathTemplate}</code>
        </div>
        <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--bpm-text-secondary)" }}>
          <strong>{S.thInputs} :</strong> {inputs}
        </p>

        <SectionTitle>{S.secMapping}</SectionTitle>
        <Table
          columns={[
            { key: "source", label: S.thSource },
            { key: "target", label: S.thTarget },
            { key: "transform", label: S.thTransform },
          ]}
          data={mappingRows}
        />

        <SectionTitle lead={S.secDemoLead}>{S.secDemo}</SectionTitle>
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
              <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 600, color: "var(--bpm-text-secondary)" }}>
                {S.demoInput}
              </p>
              <JsonViewer data={op.sampleResponse} defaultExpandedLevel={2} maxHeight={320} />
            </div>
            <div>
              <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 600, color: "var(--bpm-text-secondary)" }}>
                {S.demoOutput}
              </p>
              <JsonViewer data={mapped} defaultExpandedLevel={3} maxHeight={320} />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="site-section">
      <div className="site-container" style={{ maxWidth: 920 }}>
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
        <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--bpm-text-secondary)", maxWidth: "70ch" }}>
          {connector.description[locale]}
        </p>

        <Message type="info">{S.securityNote}</Message>

        {/* Authentification */}
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

        {/* OAuth2 déclaré */}
        {connector.auth.oauth2 && (
          <>
            <SectionTitle>{S.secOauth}</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
              <div>
                <strong>{S.oauthScopes} :</strong>{" "}
                {connector.auth.oauth2.scopes.map((s) => (
                  <Chip key={s} variant="outline" label={s} />
                ))}
              </div>
              <div>
                <strong>{S.oauthRefresh} :</strong> {connector.auth.oauth2.refresh ? S.yes : S.no}
              </div>
              <div>
                <strong>{S.oauthAuthUrl} :</strong>{" "}
                <code>{connector.auth.oauth2.authorizationUrl}</code>
              </div>
              <div>
                <strong>{S.oauthTokenUrl} :</strong> <code>{connector.auth.oauth2.tokenUrl}</code>
              </div>
            </div>
          </>
        )}

        {/* Hôtes autorisés */}
        <SectionTitle lead={S.secHostsLead}>{S.secHosts}</SectionTitle>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {connector.hosts.map((h) => (
            <Chip key={h} variant="default" label={h} />
          ))}
        </div>

        {/* Opérations (méthode, chemin, mapping, démo) */}
        <SectionTitle>{S.secOps}</SectionTitle>
        {connector.operations.map(renderOperation)}

        <Divider />
        <p style={{ fontSize: 12, color: "var(--bpm-text-secondary)", lineHeight: 1.6 }}>
          {S.securityNote}
        </p>
      </div>
    </section>
  );
}
