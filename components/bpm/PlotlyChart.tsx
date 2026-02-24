"use client";

import React from "react";

export interface PlotlyChartProps {
  iframeSrc?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
}

export function PlotlyChart(props: PlotlyChartProps) {
  const iframeSrc = props.iframeSrc;
  const width = props.width ?? "100%";
  const height = props.height ?? 400;
  const className = props.className ?? "";
  const w = typeof width === "number" ? width + "px" : width;
  const h = typeof height === "number" ? height + "px" : height;

  if (iframeSrc) {
    return (
      <iframe
        src={iframeSrc}
        title="Plotly"
        className={"bpm-plotly " + className}
        style={{ width: w, height: h, border: 0, borderRadius: 8, background: "var(--bpm-bg-secondary)" }}
      />
    );
  }

  return (
    <div
      className={"bpm-plotly-placeholder " + className}
      style={{ width: w, height: h, border: "1px solid var(--bpm-border)", borderRadius: 8, background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <p className="text-sm">Plotly: passer iframeSrc ou intégrer react-plotly.js</p>
    </div>
  );
}
