"use client";

import React from "react";

export type SkeletonVariant = "rectangular" | "circular" | "text";

export type SkeletonRounded = "sm" | "md" | "lg" | "full";

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  className?: string;
  /** Désactive l'animation pulse (utile pour screenshots, tests, prefers-reduced-motion). */
  animated?: boolean;
  /** Animation shimmer (dégradé balayant) en alternative au pulse. */
  shimmer?: boolean;
  /** Contrôle le rayon des bords (ignoré si variant === "circular"). */
  rounded?: SkeletonRounded;
  /** Nombre de lignes de skeleton empilées (variant text). Default: 1. */
  lines?: number;
}

/**
 * @component bpm.skeleton
 * @description Placeholder anime (rectangles, cercles) pendant le chargement de contenu pour eviter layout shift.
 * @example
 * bpm.skeleton({ width: 200, height: 20, variant: "text" })
 * @props
 * - variant ('rectangular' | 'circular' | 'text', optionnel) — Forme. Default: 'rectangular'.
 * - width (number | string, optionnel) — Largeur.
 * - height (number | string, optionnel) — Hauteur.
 * - className (string, optionnel) — Classes CSS.
 * - animated (boolean, optionnel) — Animation pulse. Default: true.
 * - shimmer (boolean, optionnel) — Animation shimmer. Default: false.
 * - rounded ('sm' | 'md' | 'lg' | 'full', optionnel) — Bords arrondis. Default: 'md'.
 * - lines (number, optionnel) — Nombre de lignes empilées. Default: 1.
 * @usage Chargement liste, fiche produit, tableau.
 * @context PARENT: bpm.panel | bpm.card. ASSOCIATED: bpm.spinner, bpm.table. FORBIDDEN: aucun.
 */
const roundedClass: Record<SkeletonRounded, string> = {
  sm: "rounded-sm",
  md: "rounded",
  lg: "rounded-lg",
  full: "rounded-full",
};

export function Skeleton({
  variant = "rectangular",
  width,
  height,
  className = "",
  animated = true,
  shimmer = false,
  rounded = "md",
  lines = 1,
}: SkeletonProps) {
  const style: React.CSSProperties = { width: "100%", maxWidth: "100%", display: "block" };
  if (width != null) style.width = typeof width === "number" ? `${width}px` : width;
  if (height != null) style.height = typeof height === "number" ? `${height}px` : height;
  const roundClass = variant === "circular" ? "rounded-full" : roundedClass[rounded];
  const animationClass = shimmer ? "bpm-skeleton--shimmer" : animated ? "animate-pulse" : "";
  const single = (
    <span
      className={`bpm-skeleton block ${animationClass} ${roundClass} ${className}`.trim()}
      style={{
        ...style,
        background: "var(--bpm-skeleton-bg, var(--bpm-bg-secondary))",
      }}
      aria-hidden
    />
  );
  if (lines <= 1) return single;
  const lineHeight = height ?? 16;
  const lineStyle = { ...style, height: typeof lineHeight === "number" ? `${lineHeight}px` : lineHeight };
  return (
    <span className="bpm-skeleton-lines block" style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: "100%" }}>
      {Array.from({ length: lines }, (_, i) => (
        <span
          key={i}
          className={`bpm-skeleton block ${animationClass} ${roundClass}`.trim()}
          style={{
            ...lineStyle,
            background: "var(--bpm-skeleton-bg, var(--bpm-bg-secondary))",
          }}
          aria-hidden
        />
      ))}
    </span>
  );
}
