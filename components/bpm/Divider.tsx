"use client";

import React from "react";

export interface DividerProps {
  label?: string;
  orientation?: "horizontal" | "vertical";
  /** Épaisseur en pixels (défaut 1). */
  thickness?: number;
  /** Couleur de la ligne (CSS, ex. var(--bpm-border), #ccc, rgb(0,0,0)). */
  color?: string;
  className?: string;
}

export function Divider({
  label,
  orientation = "horizontal",
  thickness = 1,
  color = "var(--bpm-border)",
  className = "",
}: DividerProps) {
  const lineStyle: React.CSSProperties = {
    background: color,
    ...(orientation === "horizontal"
      ? { height: Math.max(0, thickness), minHeight: Math.max(0, thickness) }
      : { width: Math.max(0, thickness), minWidth: Math.max(0, thickness) }),
  };
  if (orientation === "vertical") {
    return (
      <div
        className={`bpm-divider self-stretch ${className}`.trim()}
        role="separator"
        aria-orientation="vertical"
        style={lineStyle}
      />
    );
  }
  return (
    <div
      className={`bpm-divider flex items-center gap-2 ${className}`.trim()}
      role="separator"
      aria-orientation="horizontal"
    >
      <span className="flex-1" style={{ ...lineStyle, height: Math.max(0, thickness) }} />
      {label != null && (
        <span className="text-sm px-2 shrink-0" style={{ color: "var(--bpm-text-secondary)" }}>{label}</span>
      )}
      <span className="flex-1" style={{ ...lineStyle, height: Math.max(0, thickness) }} />
    </div>
  );
}
