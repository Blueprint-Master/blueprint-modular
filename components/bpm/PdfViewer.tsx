"use client";

import React from "react";

export interface PdfViewerProps {
  src: string;
  title?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
}

export function PdfViewer({ src, title, width = "100%", height = "600px", className = "" }: PdfViewerProps) {
  const w = typeof width === "number" ? `${width}px` : width;
  const h = typeof height === "number" ? `${height}px` : height;

  return (
    <iframe
      src={src}
      title={title ?? "PDF"}
      className={`bpm-pdf-viewer border-0 rounded-lg ${className}`.trim()}
      style={{
        width: w,
        height: h,
        background: "var(--bpm-bg-secondary)",
      }}
    />
  );
}
