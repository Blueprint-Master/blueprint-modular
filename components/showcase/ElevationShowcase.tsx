"use client";

/**
 * Section « Élévation » de /components — rend toutes les entrées du registre,
 * groupées par classe (INSTRUMENT, DATA, STRUCTURAL, INTERACTIF).
 */
import React from "react";
import { SHOWCASE, type ShowcaseClass, type ShowcaseEntry } from "./registry";

const CLASS_ORDER: ShowcaseClass[] = ["INSTRUMENT", "DATA", "STRUCTURAL", "INTERACTIF"];

const CLASS_LABEL: Record<ShowcaseClass, string> = {
  INSTRUMENT: "Instruments — portent un jugement (interpret)",
  DATA: "Data — tables, listes, flux",
  STRUCTURAL: "Structural — layout, conteneurs",
  INTERACTIF: "Interactif — saisie, actions",
};

function EntryCard({ entry }: { entry: ShowcaseEntry }) {
  return (
    <section
      id={`elevated-${entry.key}`}
      className="rounded-lg border p-4"
      style={{ borderColor: "var(--bpm-border, #e5e7eb)", background: "var(--bpm-surface, #fff)" }}
    >
      <div className="flex items-baseline gap-2 mb-3">
        <h3 className="font-mono text-sm font-semibold" style={{ color: "var(--bpm-text-primary, #111827)" }}>
          bpm.{entry.key}
        </h3>
        <span
          className="text-[10px] uppercase tracking-wide rounded px-1.5 py-0.5"
          style={{ background: "var(--bpm-surface-secondary, #f3f4f6)", color: "var(--bpm-text-secondary, #6b7280)" }}
        >
          {entry.class}
        </span>
      </div>
      <div className="flex flex-col gap-4">
        {entry.examples.map((ex) => (
          <figure key={ex.name} className="m-0">
            <figcaption
              className="text-xs mb-1.5"
              style={{ color: "var(--bpm-text-secondary, #6b7280)" }}
            >
              <span className="font-medium">{ex.name}</span>
              {ex.note ? <span> — {ex.note}</span> : null}
            </figcaption>
            <div
              className="rounded border border-dashed p-3 overflow-x-auto"
              style={{ borderColor: "var(--bpm-border, #e5e7eb)" }}
            >
              {ex.render()}
            </div>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function ElevationShowcase() {
  if (SHOWCASE.length === 0) return null;
  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold mb-1" style={{ color: "var(--bpm-text-primary, #111827)" }}>
        Élévation — jugement &amp; états
      </h2>
      <p className="text-sm mb-6" style={{ color: "var(--bpm-text-secondary, #6b7280)" }}>
        Chaque composant élevé est montré en trois états : défaut (rendu historique inchangé),
        déviant (un <code>context</code> est fourni → le composant révèle son jugement) et
        trajectoire (une série v(t) expose niveau + tendance). {SHOWCASE.length} composant(s) traité(s).
      </p>
      {CLASS_ORDER.map((cls) => {
        const entries = SHOWCASE.filter((e) => e.class === cls);
        if (entries.length === 0) return null;
        return (
          <div key={cls} className="mb-10">
            <h3 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--bpm-text-secondary, #6b7280)" }}>
              {CLASS_LABEL[cls]} ({entries.length})
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {entries.map((e) => (
                <EntryCard key={e.key} entry={e} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
