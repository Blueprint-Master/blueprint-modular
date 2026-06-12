"use client";

import React from "react";
import { splitHighlight } from "@/lib/wiki/highlight";

/**
 * Affiche `text` en surlignant les occurrences de `term`, sans jamais passer
 * par `dangerouslySetInnerHTML`. Le texte utilisateur est rendu comme des
 * nœuds React (donc échappé par défaut) : une charge XSS dans le titre ou
 * l'extrait d'un article reste inerte. Cf. T1_BACKLOG #2b.
 */
export interface HighlightedTextProps {
  text: string;
  term: string;
  className?: string;
  style?: React.CSSProperties;
}

export function HighlightedText({ text, term, className, style }: HighlightedTextProps) {
  const segments = splitHighlight(text ?? "", term ?? "");
  return (
    <span className={className} style={style}>
      {segments.map((seg, i) =>
        seg.match ? (
          <mark key={i} style={{ background: "var(--bpm-accent-mint)", color: "inherit" }}>
            {seg.text}
          </mark>
        ) : (
          <React.Fragment key={i}>{seg.text}</React.Fragment>
        )
      )}
    </span>
  );
}
