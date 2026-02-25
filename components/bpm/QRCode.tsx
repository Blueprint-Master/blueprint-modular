"use client";

import React from "react";

export interface QRCodeProps {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  className?: string;
}

export function QRCode({ value, size = 128, fgColor = "var(--bpm-text-primary)", bgColor = "var(--bpm-bg-primary)", className = "" }: QRCodeProps) {
  if (!value) {
    return (
      <div className={"bpm-qrcode " + className} style={{ width: size, height: size, background: "var(--bpm-bg-secondary)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--bpm-text-secondary)", fontSize: 11 }}>
        Pas de valeur
      </div>
    );
  }
  const n = 12;
  const cs = size / n;
  const h = value.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0);
  return (
    <div className={"bpm-qrcode " + className} style={{ display: "inline-block", padding: 8, background: bgColor, borderRadius: 4 }}>
      <svg width={size} height={size} xmlns="http://www.w3.org/2000/svg">
        {Array.from({ length: n }, (_, y) =>
          Array.from({ length: n }, (_, x) => (
            <rect key={y * n + x} x={x * cs} y={y * cs} width={cs} height={cs} fill={((h + x * 7 + y * 13) % 3) === 0 ? fgColor : bgColor} />
          ))
        )}
      </svg>
      <div style={{ fontSize: 10, textAlign: "center", marginTop: 4, color: "var(--bpm-text-secondary)", maxWidth: size }} title={value}>{value.length > 24 ? value.slice(0, 24) + "…" : value}</div>
    </div>
  );
}
