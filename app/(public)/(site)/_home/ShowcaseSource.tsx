"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface ShowcaseSourceProps {
  /** Ligne(s) de source Python qui produisent le composant rendu au-dessus. */
  source: string;
  /** Famille de la tuile, pour nommer le bouton « copier » à l'oreille (a11y). */
  label: string;
  /** Libellés i18n du bouton « copier » (FR/EN). */
  copyLabel: string;
  copiedLabel: string;
}

/**
 * Surface Python d'une tuile de la galerie : la source exacte qui produit le rendu.
 *
 * La source est toujours lisible (jamais masquée). Le bouton « copier » est discret :
 * révélé au survol de la tuile (desktop) ou au focus clavier, et visible en permanence
 * sur tactile (cf. .site-showcase-source* dans globals.css). Le survol ne fait que copier.
 */
export function ShowcaseSource({ source, label, copyLabel, copiedLabel }: ShowcaseSourceProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Presse-papiers indisponible : la source reste lisible et sélectionnable. */
    }
  };

  return (
    <div className="site-showcase-source">
      <code className="site-showcase-source-code">{source}</code>
      <button
        type="button"
        className="site-showcase-source-copy"
        onClick={copy}
        aria-label={`${copied ? copiedLabel : copyLabel} — ${label}`}
      >
        {copied ? <Check size={13} aria-hidden /> : <Copy size={13} aria-hidden />}
        <span>{copied ? copiedLabel : copyLabel}</span>
      </button>
    </div>
  );
}
