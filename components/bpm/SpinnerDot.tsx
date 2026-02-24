"use client";

import React from "react";

export interface SpinnerDotProps {
  className?: string;
  /** Taille : small (16px), medium (24px), large (32px). */
  size?: "small" | "medium" | "large";
}

const sizeMap = { small: "w-4 h-4 border-2", medium: "w-6 h-6 border-2", large: "w-8 h-8 border-[3px]" };

/**
 * Spinner compact type "points" / cercle tournant, pour indicateur de chargement inline
 * (ex. bulle assistant pendant la réponse).
 */
export function SpinnerDot({ className = "", size = "medium" }: SpinnerDotProps) {
  return (
    <div
      className={`bpm-spinner-dot rounded-full border-solid border-t-transparent animate-spin ${sizeMap[size]} ${className}`}
      style={{
        borderColor: "var(--bpm-border)",
        borderTopColor: "var(--bpm-accent-cyan)",
      }}
      aria-hidden
    />
  );
}
