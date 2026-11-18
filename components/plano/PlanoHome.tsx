"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import registry from "@/lib/generated/bpm-components.json";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { featured } from "@/lib/plano/families";
import { PlanoTile } from "@/components/plano/PlanoTile";
import { livePreviewFor } from "@/components/site/ComponentsCatalogue";
import type { DemoSuggestion, SuggestResponse } from "@/lib/built-for-ai/types";

/**
 * Accueil de la planothèque, IDENTIQUE pour le visiteur et l'utilisateur
 * connecté (vitrine et app ne font qu'un). Le compositeur appelle la VRAIE
 * logique `suggest_composition` du connecteur MCP (`/api/built-for-ai/suggest`,
 * lecture seule) : chaque pièce proposée existe au registre et ouvre sa fiche.
 * Aucune valeur inventée : le nombre de pièces est lu dans le registre.
 */

const STRINGS = {
  fr: {
    title: "Que voulez-vous afficher ?",
    placeholder: "Un suivi de commandes, avec une alerte quand une livraison dérape…",
    label: "Décrivez l'écran que vous voulez construire",
    pieces: (n: number) => `${n} pièces`,
    send: "Composer",
    examplesLabel: "Exemples",
    examples: [
      "Un tableau de bord commercial",
      "Le suivi des interventions d'une équipe terrain",
      "Une alerte quand un stock passe sous un seuil",
    ],
    library: "La planothèque",
    seeAll: (n: number) => `Tout voir · ${n}`,
    assembling: "Je cherche les pièces…",
    assembled: (n: number) => `J'assemble ${n} pièce${n > 1 ? "s" : ""}`,
    verified: "Chaque pièce est vérifiée au registre du package.",
    fallback: "Le connecteur n'a pas répondu : voici une composition de démonstration enregistrée.",
    nothing: "Aucune pièce ne correspond. Essayez de décrire ce que l'écran doit montrer.",
    error: "La composition a échoué. Réessayez dans un instant.",
    because: "répond à",
    developed: (a: number, b: number) => `${a} / ${b}`,
    developedLabel: "pièces développées",
  },
  en: {
    title: "What do you want to show?",
    placeholder: "Order tracking, with an alert when a delivery slips…",
    label: "Describe the screen you want to build",
    pieces: (n: number) => `${n} components`,
    send: "Compose",
    examplesLabel: "Examples",
    examples: [
      "A sales dashboard",
      "Field team intervention tracking",
      "An alert when stock drops below a threshold",
    ],
    library: "The plan library",
    seeAll: (n: number) => `See all · ${n}`,
    assembling: "Looking for components…",
    assembled: (n: number) => `Assembling ${n} component${n > 1 ? "s" : ""}`,
    verified: "Every component is checked against the package registry.",
    fallback: "The connector did not answer: here is a recorded demo composition.",
    nothing: "No component matches. Try describing what the screen should show.",
    error: "Composition failed. Try again in a moment.",
    because: "answers",
    developed: (a: number, b: number) => `${a} / ${b}`,
    developedLabel: "components developed",
  },
} as const;

type State =
  | { kind: "idle" }
  | { kind: "loading"; need: string }
  | { kind: "done"; need: string; suggestions: DemoSuggestion[]; fallback: boolean }
  | { kind: "error" };

/** Pas de développement des pièces : mouvement réduit ⇒ tout est développé d'emblée. */
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function PlanoHome() {
  const { locale } = useI18n();
  const t = STRINGS[locale === "en" ? "en" : "fr"];
  const total = registry.components.length;
  const [need, setNeed] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const [developed, setDeveloped] = useState(0);
  const resultRef = useRef<HTMLElement>(null);

  async function compose(text: string) {
    const value = text.trim();
    if (!value) return;
    setState({ kind: "loading", need: value });
    setDeveloped(0);
    try {
      const res = await fetch("/api/built-for-ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ need: value, limit: 6 }),
      });
      const data = (await res.json()) as SuggestResponse | { ok: false };
      if (!res.ok || !("result" in data)) {
        setState({ kind: "error" });
        return;
      }
      setState({
        kind: "done",
        need: value,
        suggestions: data.result.suggestions.filter((s) => s.verified),
        fallback: data.source === "fallback",
      });
    } catch {
      setState({ kind: "error" });
    }
  }

  // Les pièces se développent une à une (plan → pièce vivante).
  useEffect(() => {
    if (state.kind !== "done") return;
    const n = state.suggestions.length;
    if (prefersReducedMotion()) {
      setDeveloped(n);
      return;
    }
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setDeveloped(i);
      if (i >= n) window.clearInterval(id);
    }, 420);
    resultRef.current?.focus({ preventScroll: true });
    return () => window.clearInterval(id);
  }, [state]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void compose(need);
  }

  const shown = featured(registry.components, 4);

  return (
    <div className="plano-home">
      <h1 className="plano-greeting">{t.title}</h1>

      <form className="plano-composer" onSubmit={onSubmit}>
        <label htmlFor="plano-need" className="plano-sr">
          {t.label}
        </label>
        <textarea
          id="plano-need"
          className="plano-composer-input"
          value={need}
          rows={3}
          placeholder={t.placeholder}
          onChange={(e) => setNeed(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void compose(need);
            }
          }}
        />
        <div className="plano-composer-bar">
          <Link href="/composants" className="plano-pill">
            {t.pieces(total)}
          </Link>
          <button type="submit" className="plano-send" aria-label={t.send} disabled={!need.trim() || state.kind === "loading"}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </form>

      <ul className="plano-chips" aria-label={t.examplesLabel}>
        {t.examples.map((ex) => (
          <li key={ex}>
            <button
              type="button"
              className="plano-chip"
              onClick={() => {
                setNeed(ex);
                void compose(ex);
              }}
            >
              {ex}
            </button>
          </li>
        ))}
      </ul>

      <section
        ref={resultRef}
        tabIndex={-1}
        className="plano-composition"
        aria-live="polite"
        aria-busy={state.kind === "loading"}
        hidden={state.kind === "idle"}
      >
        {state.kind === "loading" ? <p className="plano-status">{t.assembling}</p> : null}
        {state.kind === "error" ? <p className="plano-status plano-status--error">{t.error}</p> : null}
        {state.kind === "done" && state.suggestions.length === 0 ? <p className="plano-status">{t.nothing}</p> : null}
        {state.kind === "done" && state.suggestions.length > 0 ? (
          <>
            <div className="plano-composition-head">
              <p className="plano-composition-count">
                <span className="plano-numeral">{t.developed(Math.min(developed, state.suggestions.length), state.suggestions.length)}</span>
                <span>{t.developedLabel}</span>
              </p>
              <p className="plano-status">
                {t.assembled(state.suggestions.length)}. {state.fallback ? t.fallback : t.verified}
              </p>
            </div>
            <ul className="plano-grid plano-grid--composition">
              {state.suggestions.map((s, i) => (
                <PlanoTile
                  key={s.name}
                  slug={s.slug}
                  name={s.name}
                  category={s.category}
                  preview={livePreviewFor(s.slug)}
                  developed={i < developed}
                  note={s.why ? `${t.because} : ${s.why}` : undefined}
                />
              ))}
            </ul>
          </>
        ) : null}
      </section>

      <section className="plano-library" aria-labelledby="plano-library-title">
        <div className="plano-library-head">
          <h2 id="plano-library-title">{t.library}</h2>
          <Link href="/composants" className="plano-link">
            {t.seeAll(total)}
          </Link>
        </div>
        <ul className="plano-grid plano-grid--four">
          {shown.map((c) => (
            <PlanoTile key={c.slug} slug={c.slug} name={c.name} category={c.category} preview={livePreviewFor(c.slug)} />
          ))}
        </ul>
      </section>
    </div>
  );
}
