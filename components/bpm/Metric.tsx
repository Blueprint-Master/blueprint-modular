"use client";

import React from "react";

export interface MetricProps {
  label: string;
  value: string | number;
  delta?: number | string | null;
  deltaType?: "normal" | "inverse";
  help?: string | null;
  deltaDecimals?: number;
  currency?: string;
}

export function Metric({
  label,
  value,
  delta,
  deltaType = "normal",
  help = null,
  deltaDecimals = 0,
  currency = "EUR",
}: MetricProps) {
  const symbols: Record<string, string> = {
    EUR: "€",
    USD: "$",
    GBP: "£",
    JPY: "¥",
    CHF: "CHF",
  };
  const sym = currency ? (symbols[currency] ?? currency) : "";
  const formatDelta = (d: number) => {
    if (typeof d !== "number" || !Number.isFinite(d)) return "";
    const sign = d > 0 ? "+" : "";
    const fmt = Math.abs(d).toLocaleString("fr-FR", {
      minimumFractionDigits: deltaDecimals,
      maximumFractionDigits: deltaDecimals,
    });
    return currency === "" ? `${sign}${fmt}%` : `${sign}${fmt} ${sym}`;
  };
  const deltaNum = typeof delta === "string" ? parseFloat(delta) : delta;
  const hasDelta = deltaNum != null && !Number.isNaN(deltaNum);
  const positive = hasDelta && (deltaType === "inverse" ? deltaNum < 0 : deltaNum > 0);
  const negative = hasDelta && (deltaType === "inverse" ? deltaNum > 0 : deltaNum < 0);

  return (
    <div
      className="inline-block p-4 rounded-lg border min-w-[140px]"
      style={{
        background: "var(--bpm-surface)",
        borderColor: "var(--bpm-border)",
        color: "var(--bpm-text-primary)",
      }}
    >
      <div className="text-sm mb-1" style={{ color: "var(--bpm-text-secondary)" }}>
        {label}
        {help && (
          <span className="ml-1" title={help}>
            ⓘ
          </span>
        )}
      </div>
      <div className="text-xl font-bold">{value}</div>
      <div
        className={`text-sm mt-1 ${hasDelta ? (positive ? "text-green-600" : negative ? "text-red-600" : "") : "opacity-0"}`}
      >
        {hasDelta ? (
          <>
            {deltaNum! > 0 ? "▲" : deltaNum! < 0 ? "▼" : "—"}
            {formatDelta(deltaNum!)}
          </>
        ) : (
          "\u00A0"
        )}
      </div>
    </div>
  );
}
