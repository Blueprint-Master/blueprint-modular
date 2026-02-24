"use client";

import React from "react";

export interface AltairChartProps {
  /** Spécification Vega-Lite / Altair (JSON). À fournir côté app. */
  spec?: Record<string, unknown>;
  /** Ou URL d'un fichier JSON ou d'une vue compilée. */
  iframeSrc?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
}

export function AltairChart({
  spec,
  iframeSrc,
  width = "100%",
  height = 400,
  className = "",
}: AltairChartProps) {
  const w = typeof width === "number" ? `${width}px` : width;
  const h = typeof height === "number" ? `${height}px` : height;

  if (iframeSrc) {
    return (
      <iframe
        src={iframeSrc}
        title="Graphique Altair"
        className={"bpm-altair-iframe border-0 rounded-lg " + className}
        style={{ width: w, height: h, background: "var(--bpm-bg-secondary)" }}
      />
    );
  }

  return (
    <div
      className={"bpm-altair-placeholder flex items-center justify-center rounded-lg border " + className}
      style={{
        width: w,
        height: h,
        borderColor: "var(--bpm-border)",
        background: "var(--bpm-bg-secondary)",
        color: "var(--bpm-text-secondary)",
      }}
    >
      <p className="text-sm text-center px-4">
        Graphique Altair / Vega-Lite. Passez <code>spec</code> (JSON) ou <code>iframeSrc</code> après avoir intégré vega-embed dans votre app.
      </p>
    </div>
  );
}
