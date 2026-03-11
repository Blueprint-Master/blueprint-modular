"use client";

import React from "react";

export type BadgeVariant = "default" | "primary" | "success" | "warning" | "error";

export interface BadgeProps {
  /** PARENT: bpm.table (colonne statut) | bpm.metric | bpm.card. INTERDIT: texte long >20 chars — utiliser bpm.chip. ASSOCIÉ: bpm.table, bpm.metric, bpm.statusBox. */
  children: React.ReactNode;
  /** Style / couleur du badge. Valeurs : 'default' | 'primary' | 'success' | 'warning' | 'error'. Default: 'default'. */
  variant?: BadgeVariant;
  className?: string;
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

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`bpm-badge bpm-badge-${variant} inline-block font-medium px-2 py-0.5 ${className}`.trim()}
      style={{ ...variantStyles[variant], fontSize: "var(--bpm-font-size-sm)" }}
    >
      {children}
    </span>
  );
}
