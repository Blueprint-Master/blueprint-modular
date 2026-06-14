import Link from "next/link";
import { notFound } from "next/navigation";
import registry from "@/lib/generated/bpm-components.json";
import { getPrevNext } from "@/lib/docPages";
import { getLlmsPropsBlock } from "@/lib/llmsDoc";
import { getSemantics } from "@/lib/semantics";
import { getDict } from "@/lib/i18n/server";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = registry.components.find((c) => c.slug === slug);
  if (!entry) return {};
  const url = `https://blueprint-modular.com/composants/${slug}`;
  return {
    title: { absolute: `${entry.name} — Composants — Blueprint Modular` },
    description: entry.description,
    alternates: { canonical: url },
  };
}

/** Ligne label → contenu de la couche sémantique. */
function SemanticRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
      <span
        style={{
          flex: "0 0 160px",
          fontSize: 12,
          fontWeight: 600,
          color: "var(--bpm-text-secondary)",
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 13, color: "var(--bpm-text-primary)", lineHeight: 1.6 }}>
        {children}
      </span>
    </div>
  );
}

export default async function DocComponentSlugPage({ params }: Props) {
  const { slug } = await params;
  const entry = registry.components.find((c) => c.slug === slug);
  if (!entry) notFound();

  const { dict } = await getDict();
  const { prev, next } = getPrevNext(slug);
  const propsBlock = getLlmsPropsBlock(entry.name);
  const semantics = getSemantics(slug);

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/composants">{dict.catalog.breadcrumb}</Link> → {entry.name}
        </div>
        <h1>{entry.name}</h1>
        <p className="doc-description">{entry.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">{entry.category}</span>
          {semantics && (
            <>
              <span className="doc-badge doc-badge-category">{semantics.semanticRole}</span>
              <span className="doc-badge doc-badge-category">Ω {semantics.frame}</span>
            </>
          )}
        </div>
      </div>

      {semantics && (
        <section style={{ marginTop: 24, maxWidth: 760 }}>
          <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--bpm-text-primary)" }}>
            {dict.componentPage.semanticTitle}
          </h2>
          <p className="text-sm mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
            {dict.componentPage.semanticNote}
          </p>
          <div
            style={{
              border: "1px solid var(--bpm-border)",
              borderRadius: "var(--bpm-radius)",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <SemanticRow label={dict.componentPage.semanticRole}>
              {semantics.semanticRole}
            </SemanticRow>
            <SemanticRow label={dict.componentPage.semanticFrame}>{semantics.frame}</SemanticRow>
            {semantics.indicator && (
              <>
                <SemanticRow label={dict.componentPage.semanticIndicatorType}>
                  {semantics.indicator.indicatorType.join(", ")}
                </SemanticRow>
                <SemanticRow label={dict.componentPage.semanticDirectionality}>
                  {semantics.indicator.directionality}
                </SemanticRow>
                <SemanticRow label={dict.componentPage.semanticTemporality}>
                  {semantics.indicator.temporality}
                </SemanticRow>
              </>
            )}
            <SemanticRow label={dict.componentPage.semanticGuidanceUse}>
              {semantics.agentGuidance.use}
            </SemanticRow>
            {semantics.agentGuidance.pairWith.length > 0 && (
              <SemanticRow label={dict.componentPage.semanticGuidancePair}>
                {semantics.agentGuidance.pairWith.join(", ")}
              </SemanticRow>
            )}
            <SemanticRow label={dict.componentPage.semanticGuidanceAvoid}>
              {semantics.agentGuidance.avoid}
            </SemanticRow>
            {semantics.indicatorRelations && semantics.indicatorRelations.length > 0 && (
              <SemanticRow label={dict.componentPage.semanticRelations}>
                {semantics.indicatorRelations
                  .map((r) => `${r.type} → ${r.target}${r.note ? ` (${r.note})` : ""}`)
                  .join(" · ")}
              </SemanticRow>
            )}
            <SemanticRow label={dict.componentPage.semanticContext}>
              {semantics.contextHints.join(" ")}
            </SemanticRow>
            <SemanticRow label={dict.componentPage.semanticStatus}>
              {semantics.status}
            </SemanticRow>
            {semantics.curationQuestion && (
              <SemanticRow label={dict.componentPage.semanticCurationQuestion}>
                {semantics.curationQuestion}
              </SemanticRow>
            )}
          </div>
        </section>
      )}

      {propsBlock && (
        <section style={{ marginTop: 24, maxWidth: 760 }}>
          <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--bpm-text-primary)" }}>
            {dict.componentPage.apiTitle}
          </h2>
          <p className="text-sm mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
            {dict.componentPage.apiNote}
          </p>
          <pre
            style={{
              background: "var(--bpm-code-bg)",
              border: "1px solid var(--bpm-code-border)",
              borderRadius: "var(--bpm-radius)",
              padding: 16,
              fontSize: 13,
              lineHeight: 1.6,
              overflowX: "auto",
              fontFamily: "var(--site-font-mono)",
              color: "var(--bpm-text-primary)",
            }}
          >
            <code>{propsBlock}</code>
          </pre>
        </section>
      )}

      <nav className="doc-pagination mt-12">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
