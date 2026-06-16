"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Title,
  Text,
  Caption,
  Selectbox,
  Input,
  NumberInput,
  Toggle,
  Message,
  CodeBlock,
  Badge,
} from "@/components/bpm";
import type { PlaygroundComponentMeta, PropSpec } from "@/lib/playgroundProps";
import { PLAYGROUND_RENDERERS, hasRenderer, type PlaygroundProps } from "./playgroundRenderers";
import { useI18n } from "@/lib/i18n/LocaleProvider";

/**
 * Playground interactif (/playground) : sélection d'un composant bpm.*, édition
 * en direct de ses props (contrôles générés depuis les métadonnées llms.txt) et
 * aperçu live, plus les snippets React et Python reflétant les props courantes.
 *
 * Tout est additif : aucune page existante n'est modifiée. L'aperçu est isolé par
 * une ErrorBoundary — une combinaison de props invalide n'affecte jamais la page.
 */

const L = {
  fr: {
    eyebrow: "Playground",
    title: "Playground interactif",
    lead: "Choisissez un composant, modifiez ses props et voyez le rendu se mettre à jour en direct — sans installation.",
    pick: "Composant",
    search: "Filtrer les composants…",
    props: "Props",
    noEditable: "Aucune prop éditable détectée pour ce composant.",
    nonEditable: "Props non éditables (données, callbacks) — valeurs d'exemple utilisées :",
    preview: "Aperçu",
    previewError: "Rendu indisponible avec ces props.",
    noRenderer: "Aperçu live non disponible pour ce composant.",
    seeFiche: "Voir la fiche complète",
    snippetReact: "React",
    snippetPython: "Python",
    copy: "Copier",
    required: "requis",
  },
  en: {
    eyebrow: "Playground",
    title: "Interactive playground",
    lead: "Pick a component, tweak its props and watch the preview update live — no install required.",
    pick: "Component",
    search: "Filter components…",
    props: "Props",
    noEditable: "No editable props detected for this component.",
    nonEditable: "Non-editable props (data, callbacks) — sample values used:",
    preview: "Preview",
    previewError: "Render unavailable with these props.",
    noRenderer: "Live preview not available for this component.",
    seeFiche: "View full component page",
    snippetReact: "React",
    snippetPython: "Python",
    copy: "Copy",
    required: "required",
  },
} as const;

/** Garde-fou de rendu : une prop invalide n'écroule jamais la page. */
class PreviewBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidUpdate(prev: { children: React.ReactNode }) {
    // Réinitialise l'erreur quand l'aperçu change (nouveau composant / props).
    if (prev.children !== this.props.children && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

type PropValues = Record<string, string | number | boolean | undefined>;

/** Valeurs initiales dérivées des defaults des specs éditables. */
function initialValues(specs: PropSpec[]): PropValues {
  const out: PropValues = {};
  for (const s of specs) {
    if (!s.editable) continue;
    if (s.control === "boolean") out[s.name] = s.default === true;
    else if (s.control === "select") out[s.name] = (s.default as string) ?? s.options?.[0] ?? "";
    else if (s.control === "number") out[s.name] = s.default as number | undefined;
    else out[s.name] = (s.default as string) ?? "";
  }
  return out;
}

function jsValue(v: unknown): string {
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "boolean") return v ? "true" : "false";
  return String(v);
}

function pyValue(v: unknown): string {
  if (typeof v === "string") return `"${v.replace(/"/g, '\\"')}"`;
  if (typeof v === "boolean") return v ? "True" : "False";
  return String(v);
}

const PRIMARY_CONTENT = ["children", "label", "text", "title", "content", "value"];

/** Construit les snippets React et Python depuis les props courantes. */
function buildSnippets(
  meta: PlaygroundComponentMeta,
  values: PropValues
): { react: string; python: string } {
  const editable = meta.specs.filter((s) => s.editable);
  // Props à inclure : requises, ou modifiées par rapport au défaut.
  const included = editable.filter((s) => {
    const v = values[s.name];
    if (v === undefined || v === "") return s.required;
    return s.required || v !== s.default;
  });

  const reactEntries = included
    .map((s) => {
      const v = values[s.name];
      if (v === undefined || v === "") return null;
      return `${s.name}: ${jsValue(v)}`;
    })
    .filter(Boolean) as string[];
  const react = `${meta.name}({ ${reactEntries.join(", ")} })`;

  // Python : prop de contenu en positionnel, le reste en kwargs.
  const primary = included.find(
    (s) => s.control === "string" && PRIMARY_CONTENT.includes(s.name) && values[s.name]
  );
  const pyArgs: string[] = [];
  if (primary) pyArgs.push(pyValue(values[primary.name]));
  for (const s of included) {
    if (primary && s.name === primary.name) continue;
    const v = values[s.name];
    if (v === undefined || v === "") continue;
    pyArgs.push(`${s.name}=${pyValue(v)}`);
  }
  const python = `${meta.name}(${pyArgs.join(", ")})`;

  return { react, python };
}

export function Playground({ components }: { components: PlaygroundComponentMeta[] }) {
  const { locale } = useI18n();
  const t = L[locale];

  const sorted = useMemo(
    () => [...components].sort((a, b) => a.name.localeCompare(b.name)),
    [components]
  );
  const [query, setQuery] = useState("");
  const [slug, setSlug] = useState(
    sorted.find((c) => hasRenderer(c.slug))?.slug ?? sorted[0]?.slug ?? ""
  );

  const meta = useMemo(() => sorted.find((c) => c.slug === slug), [sorted, slug]);
  const [values, setValues] = useState<PropValues>(() =>
    meta ? initialValues(meta.specs) : {}
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }, [sorted, query]);

  function selectSlug(next: string) {
    const m = sorted.find((c) => c.slug === next);
    setSlug(next);
    setValues(m ? initialValues(m.specs) : {});
  }

  function setValue(name: string, value: string | number | boolean | undefined) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  if (!meta) return null;

  const editableSpecs = meta.specs.filter((s) => s.editable);
  const nonEditableSpecs = meta.specs.filter((s) => !s.editable);
  const renderer = PLAYGROUND_RENDERERS[meta.slug];
  const liveProps: PlaygroundProps = values;
  const { react, python } = buildSnippets(meta, values);

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/composants">{t.eyebrow}</Link> → {meta.name}
        </div>
        <h1>{t.title}</h1>
        <p className="doc-description">{t.lead}</p>
      </div>

      {/* Sélecteur de composant */}
      <div style={{ maxWidth: 520, marginBottom: 24, display: "flex", flexDirection: "column", gap: 12 }}>
        <Input
          type="search"
          value={query}
          onChange={setQuery}
          placeholder={t.search}
          aria-label={t.search}
        />
        <Selectbox
          label={t.pick}
          options={filtered.map((c) => ({ value: c.slug, label: c.name }))}
          value={slug}
          onChange={selectSlug}
        />
        <Caption>{meta.description}</Caption>
      </div>

      <div className="sandbox-container">
        {/* Aperçu live */}
        <div className="sandbox-preview">
          {renderer ? (
            <PreviewBoundary
              key={meta.slug}
              fallback={<Caption>{t.previewError}</Caption>}
            >
              {renderer(liveProps)}
            </PreviewBoundary>
          ) : (
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 8 }}>
              <Caption>{t.noRenderer}</Caption>
              <Link
                href={"/composants/" + meta.slug}
                style={{ fontSize: 13, fontWeight: 600, color: "var(--bpm-accent-cyan)" }}
              >
                {t.seeFiche} →
              </Link>
            </div>
          )}
        </div>

        {/* Contrôles générés */}
        <div className="sandbox-controls">
          <Title level={4}>{t.props}</Title>
          {editableSpecs.length === 0 && <Caption>{t.noEditable}</Caption>}
          {editableSpecs.map((s) => (
            <div className="sandbox-control-group" key={s.name}>
              {s.control === "boolean" ? (
                <Toggle
                  label={`${s.name}${s.required ? " *" : ""}`}
                  value={values[s.name] === true}
                  onChange={(v) => setValue(s.name, v)}
                />
              ) : s.control === "select" ? (
                <Selectbox
                  label={`${s.name}${s.required ? " *" : ""}`}
                  options={(s.options ?? []).map((o) => ({ value: o, label: o }))}
                  value={(values[s.name] as string) ?? ""}
                  onChange={(v) => setValue(s.name, v)}
                />
              ) : s.control === "number" ? (
                <NumberInput
                  label={`${s.name}${s.required ? " *" : ""}`}
                  value={(values[s.name] as number | undefined) ?? null}
                  onChange={(v) => setValue(s.name, v ?? undefined)}
                />
              ) : (
                <Input
                  label={`${s.name}${s.required ? " *" : ""}`}
                  value={(values[s.name] as string) ?? ""}
                  onChange={(v) => setValue(s.name, v)}
                />
              )}
            </div>
          ))}

          {nonEditableSpecs.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <Caption>{t.nonEditable}</Caption>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                {nonEditableSpecs.map((s) => (
                  <Badge key={s.name} variant="default" size="sm">
                    {s.name}: {s.type}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Snippets double surface */}
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>{t.snippetReact}</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(react)}>
              {t.copy}
            </button>
          </div>
          <pre>
            <code>{react}</code>
          </pre>
          <div className="sandbox-code-header" style={{ borderTop: "1px solid var(--bpm-border)" }}>
            <span>{t.snippetPython}</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(python)}>
              {t.copy}
            </button>
          </div>
          <pre>
            <code>{python}</code>
          </pre>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <Message type="info">
          <Text>
            {locale === "fr"
              ? "Les contrôles sont générés automatiquement depuis les signatures de props (public/llms.txt). Les props complexes (données, callbacks) utilisent des valeurs d'exemple."
              : "Controls are generated automatically from prop signatures (public/llms.txt). Complex props (data, callbacks) use sample values."}
          </Text>
        </Message>
      </div>
    </div>
  );
}

export default Playground;
