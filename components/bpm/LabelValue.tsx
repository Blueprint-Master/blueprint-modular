"use client";

import React, { useCallback, useState } from "react";

export interface LabelValueProps {
  label: string;
  value: string | number | React.ReactNode;
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
  valueStyle?: "default" | "bold" | "accent" | "muted";
  copyable?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { labelSize: 10, valueSize: 12 },
  md: { labelSize: 11, valueSize: 14 },
  lg: { labelSize: 12, valueSize: 16 },
};

export function LabelValue({
  label,
  value,
  orientation = "horizontal",
  size = "md",
  valueStyle = "default",
  copyable = false,
  className = "",
}: LabelValueProps) {
  const [copied, setCopied] = useState(false);
  const { labelSize, valueSize } = sizeMap[size];

  const valueColor =
    valueStyle === "accent"
      ? "var(--bpm-accent)"
      : valueStyle === "muted"
        ? "var(--bpm-text-muted)"
        : "var(--bpm-text-primary)";
  const valueWeight = valueStyle === "bold" ? 600 : 400;

  const handleCopy = useCallback(() => {
    const text = typeof value === "string" || typeof value === "number" ? String(value) : "";
    if (!text) return;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    }
  }, [value]);

  const valueNode = (
    <span
      style={{
        fontSize: valueSize,
        fontWeight: valueWeight,
        color: valueColor,
      }}
    >
      {value}
    </span>
  );

  const labelNode = (
    <span
      style={{
        fontSize: labelSize,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        color: "var(--bpm-text-muted)",
      }}
    >
      {label}
    </span>
  );

  if (orientation === "vertical") {
    return (
      <div
        className={className ? `bpm-label-value ${className}`.trim() : "bpm-label-value"}
        style={{ display: "flex", flexDirection: "column", gap: 4 }}
      >
        {labelNode}
        {copyable && (typeof value === "string" || typeof value === "number") ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {valueNode}
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copier"
              style={{
                padding: 4,
                border: "none",
                background: "transparent",
                color: "var(--bpm-text-muted)",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              {copied ? "Copié" : "Copier"}
            </button>
          </div>
        ) : (
          valueNode
        )}
      </div>
    );
  }

  return (
    <div
      className={className ? `bpm-label-value ${className}`.trim() : "bpm-label-value"}
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 8,
      }}
    >
      {labelNode}
      {copyable && (typeof value === "string" || typeof value === "number") ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {valueNode}
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copier"
            style={{
              padding: 4,
              border: "none",
              background: "transparent",
              color: "var(--bpm-text-muted)",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            {copied ? "Copié" : "Copier"}
          </button>
        </div>
      ) : (
        valueNode
      )}
    </div>
  );
}
