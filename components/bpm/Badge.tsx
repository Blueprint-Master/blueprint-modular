"use client";

import React from "react";

export type BadgeVariant = "default" | "primary" | "success" | "warning" | "error";

/**
 * @component bpm.badge
 * @description Badge / étiquette (success, warning, etc.).
 */
export interface BadgeProps {
  /** PARENT: bpm.table (colonne statut) | bpm.metric | bpm.card. INTERDIT: texte long >20 chars — utiliser bpm.chip. ASSOCIÉ: bpm.table, bpm.metric, bpm.statusBox. */
  children: React.ReactNode;
  /** Style / couleur du badge. Valeurs : 'default' | 'primary' | 'success' | 'warning' | 'error'. Default: 'default'. */
  variant?: BadgeVariant;
  className?: string;
  /** Taille du badge. 'sm' (défaut) | 'md' | 'lg'. Additif — n'affecte pas le rendu existant. */
  size?: "sm" | "md" | "lg";
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  default: {
    background: "var(--bpm-bg-secondary)",
    color: "var(--bpm-text)",
    border: "1px solid var(--bpm-border)",
    borderRadius: "var(--bpm-radius-sm)",
  },
  primary: {
    background: "var(--bpm-accent)",
    color: "var(--bpm-accent-contrast)",
    border: "none",
    borderRadius: "var(--bpm-radius-sm)",
  },
  success: {
    background: "var(--bpm-success-soft)",
    color: "var(--bpm-success-text)",
    border: "1px solid var(--bpm-success)",
    borderRadius: "var(--bpm-radius-sm)",
  },
  warning: {
    background: "var(--bpm-warning-soft)",
    color: "var(--bpm-warning-text)",
    border: "1px solid var(--bpm-warning)",
    borderRadius: "var(--bpm-radius-sm)",
  },
  error: {
    background: "var(--bpm-error-soft)",
    color: "var(--bpm-error-text)",
    border: "1px solid var(--bpm-error)",
    borderRadius: "var(--bpm-radius-sm)",
  },
};

/**
 * @component bpm.badge
 * @description Étiquette compacte pour afficher un statut, une catégorie ou un compteur avec variantes de couleur.
 * @example
 * bpm.badge({ children: "En cours", variant: "warning" })
 *
 * @param {object} props
 * @param {ReactNode} props.children - Contenu du badge. Obligatoire.
 * @param {"default"|"primary"|"success"|"warning"|"error"} [props.variant="default"] - Style du badge. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 *
 * @parent bpm.table, bpm.card, bpm.metric
 * @associated bpm.chip, bpm.statusBox
 * @forbidden Texte long >20 caractères — utiliser bpm.chip
 */
const sizeStyles: Record<"sm" | "md" | "lg", React.CSSProperties> = {
  sm: { fontSize: "var(--bpm-font-size-sm)", padding: "0 6px" },
  md: { fontSize: "var(--bpm-font-size-base)", padding: "2px 8px" },
  lg: { fontSize: "var(--bpm-font-size-lg, 1rem)", padding: "4px 12px" },
};

export function Badge({
  children,
  variant = "default",
  className = "",
  size = "sm",
}: BadgeProps) {
  return (
    <span
      className={`bpm-badge bpm-badge-${variant} inline-block font-medium ${className}`.trim()}
      style={{ ...variantStyles[variant], ...sizeStyles[size] }}
    >
      {children}
    </span>
  );
}
