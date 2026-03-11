"use client";

import React from "react";

export interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  height?: string | number;
  placeholder?: string;
  className?: string;
}

export function CodeEditor({
  value,
  onChange,
  readOnly = false,
  height = 300,
  placeholder = "",
  className = "",
}: CodeEditorProps) {
  const h = typeof height === "number" ? `${height}px` : height;

  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      readOnly={readOnly}
      placeholder={placeholder}
      className={className ? `bpm-code-editor ${className}`.trim() : "bpm-code-editor"}
      style={{
        width: "100%",
        height: h,
        padding: 12,
        border: "1px solid var(--bpm-border)",
        borderRadius: "var(--bpm-radius-sm)",
        fontFamily: "ui-monospace, monospace",
        fontSize: 13,
        lineHeight: 1.5,
        color: "var(--bpm-text-primary)",
        background: "var(--bpm-bg-primary)",
        resize: "vertical",
        boxSizing: "border-box",
      }}
    />
  );
}
