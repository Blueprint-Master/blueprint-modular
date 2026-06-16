"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, Chip, CodeBlock, Input, Message } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { fmt } from "@/lib/i18n";
import { MCP_ENDPOINT, MCP_TOOLS } from "@/lib/mcp/tools";
import {
  DEMO_PROMPT,
  FALLBACK_RESULT,
  type DemoResult,
  type DemoSuggestion,
  type SuggestResponse,
} from "@/lib/built-for-ai/types";
import { COMPONENT_COUNT } from "../_home/data";
import { PREVIEWS, hasPreview } from "./previews";

const DEMO_LIMIT = 8;

export function BuiltForAiContent() {
  const { dict } = useI18n();
  const t = dict.builtForAI;

  return (
    <>
      {/* HERO */}
      <section className="site-hero">
        <div className="site-container">
          <span className="site-eyebrow">{t.eyebrow}</span>
          <h1>{t.title}</h1>
          <p className="site-lead">{fmt(t.lead, { count: COMPONENT_COUNT })}</p>
          <div className="site-mcp-endpoint">
            <span className="site-pane-label">{t.endpointLabel}</span>
            <code className="site-endpoint">{MCP_ENDPOINT}</code>
          </div>
          <div className="site-hero-actions">
            <a href="#demo" className="site-cta-primary">
              {t.ctaTry}
            </a>
            <Link href="/mcp" className="site-cta-secondary">
              {t.ctaMcp}
            </Link>
          </div>
        </div>
      </section>

      {/* TOOLS */}
      <section className="site-section site-section-bordered">
        <div className="site-container">
          <h2>{t.toolsTitle}</h2>
          <p className="site-section-body">{t.toolsBody}</p>
          <ul className="site-tool-grid">
            {MCP_TOOLS.map((tool) => (
              <li className="site-tool-card" key={tool.name}>
                <code className="site-tool-name">
                  {tool.name}
                  <span className="site-tool-sig">({tool.sig})</span>
                </code>
                <p>{dict.mcp.tools[tool.name]}</p>
              </li>
            ))}
          </ul>
          <p className="site-section-body" style={{ marginTop: 16 }}>
            {t.toolsConnectNote}
          </p>
        </div>
      </section>

      {/* DEMO */}
      <section id="demo" className="site-section site-section-bordered">
        <div className="site-container">
          <h2>{t.demoTitle}</h2>
          <p className="site-section-body">{t.demoBody}</p>
          <Demo />
        </div>
      </section>

      {/* DIFFERENTIATOR */}
      <section className="site-section site-section-bordered">
        <div className="site-container">
          <h2>{t.diffTitle}</h2>
          <p className="site-section-body">{t.diffBody}</p>
        </div>
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------
// Démo interactive
// ---------------------------------------------------------------------------

function Demo() {
  const { dict } = useI18n();
  const t = dict.builtForAI;

  const [need, setNeed] = useState(DEMO_PROMPT);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DemoResult | null>(null);
  const [source, setSource] = useState<SuggestResponse["source"] | null>(null);
  const [reqEcho, setReqEcho] = useState<{ need: string; limit: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const didInit = useRef(false);

  const run = useCallback(async (rawNeed: string) => {
    const q = rawNeed.trim();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/built-for-ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ need: q, limit: DEMO_LIMIT }),
      });
      const json = (await res.json()) as SuggestResponse | { ok: false; error?: string };
      if (!res.ok || json.ok === false) {
        setResult(null);
        setSource(null);
        setReqEcho(null);
        setError(("error" in json && json.error) || dict.builtForAI.errorTitle);
        return;
      }
      setResult(json.result);
      setSource(json.source);
      setReqEcho(json.request);
    } catch {
      // Réseau / route indisponible : repli pré-capturé — la démo ne casse jamais.
      setResult(FALLBACK_RESULT);
      setSource("fallback");
      setReqEcho({ need: q || DEMO_PROMPT, limit: DEMO_LIMIT });
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [dict.builtForAI.errorTitle]);

  // Démo pré-remplie au chargement : crédibilité immédiate.
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    void run(DEMO_PROMPT);
  }, [run]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loading) void run(need);
  };

  return (
    <div className="site-demo-panel" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Saisie */}
      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Input
          label={t.demoInputLabel}
          value={need}
          onChange={setNeed}
          placeholder={t.demoPlaceholder}
          type="search"
        />
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Button type="submit" loading={loading} disabled={loading}>
            {loading ? t.demoSubmitting : t.demoSubmit}
          </Button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span className="site-pane-label">{t.presetsLabel}</span>
          {t.presets.map((p) => (
            <Chip key={p} label={p} variant="outline" onClick={() => { setNeed(p); void run(p); }} />
          ))}
        </div>
      </form>

      {error && (
        <Message type="warning">
          <strong>{t.errorTitle}</strong> — {t.errorBody}
        </Message>
      )}

      {source === "fallback" && <Message type="info">{t.fallbackNotice}</Message>}

      {reqEcho && (
        <div>
          <span className="site-pane-label">{t.requestLabel}</span>
          <CodeBlock
            language="javascript"
            code={`suggest_composition(${JSON.stringify({ need: reqEcho.need, limit: reqEcho.limit }, null, 2)})`}
          />
        </div>
      )}

      {result && (
        <>
          {/* Réponse brute de l'outil */}
          <div>
            <span className="site-pane-label">{t.responseLabel}</span>
            <CodeBlock language="json" code={JSON.stringify(toolResponse(result), null, 2)} />
            {source && (
              <p className="site-section-body" style={{ marginTop: 6, fontSize: "0.85em" }}>
                {source === "fallback" ? t.sourceFallback : t.sourceLive}
              </p>
            )}
          </div>

          {/* Composition suggérée */}
          <div>
            <h3 className="site-showcase-subtitle">{t.compositionTitle}</h3>
            <p className="site-section-body">
              {fmt(t.compositionBody, { count: result.count, need: result.need })}
            </p>
            <ul className="site-tool-grid">
              {result.suggestions.map((s) => (
                <SuggestionCard key={s.name} s={s} whyLabel={t.whyLabel} verifiedLabel={t.verifiedLabel} />
              ))}
            </ul>
          </div>

          {/* Rendu live des composants bpm.* */}
          <div>
            <h3 className="site-showcase-subtitle">{t.renderTitle}</h3>
            <p className="site-section-body">{t.renderBody}</p>
            <div className="site-showcase-grid">
              {result.suggestions.map((s) => (
                <RenderTile key={s.name} s={s} liveLabel={t.livePreview} catalogLabel={t.catalogOnly} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/** Projection « réponse outil » : exactement les champs catalogue qu'un agent reçoit. */
function toolResponse(r: DemoResult) {
  return {
    need: r.need,
    count: r.count,
    suggestions: r.suggestions.map((s) => ({
      name: s.name,
      category: s.category,
      description: s.description,
      why: s.why,
      ...(s.meaning ? { meaning: s.meaning } : {}),
    })),
  };
}

function SuggestionCard({
  s,
  whyLabel,
  verifiedLabel,
}: {
  s: DemoSuggestion;
  whyLabel: string;
  verifiedLabel: string;
}) {
  return (
    <li className="site-tool-card">
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <code className="site-tool-name">{s.name}</code>
        {s.verified && (
          <Badge variant="success" size="sm">
            ✓ {verifiedLabel}
          </Badge>
        )}
      </div>
      <p style={{ marginTop: 4 }}>{s.description}</p>
      <p style={{ marginTop: 4, fontSize: "0.85em", color: "var(--bpm-text-secondary)" }}>
        <strong>{whyLabel}</strong> : {s.why} · {s.category}
      </p>
      {s.meaning && s.meaning.pairWith.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
          {s.meaning.pairWith.map((p) => (
            <Chip key={p} label={p} variant="default" />
          ))}
        </div>
      )}
    </li>
  );
}

function RenderTile({
  s,
  liveLabel,
  catalogLabel,
}: {
  s: DemoSuggestion;
  liveLabel: string;
  catalogLabel: string;
}) {
  const live = hasPreview(s.slug);
  return (
    <figure className="site-showcase-tile">
      <div className="site-demo-panel" style={{ minHeight: 96 }}>
        {live ? (
          PREVIEWS[s.slug]()
        ) : (
          <Card title={s.name} subtitle={s.category}>
            {s.description}
          </Card>
        )}
      </div>
      <figcaption
        className="site-showcase-tile-caption"
        style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" }}
      >
        <code>{s.name}</code>
        <Badge variant={live ? "primary" : "default"} size="sm">
          {live ? liveLabel : catalogLabel}
        </Badge>
      </figcaption>
    </figure>
  );
}
