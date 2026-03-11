"use client";

import React, { useCallback, useEffect, useState } from "react";
import { CodeBlock } from "./CodeBlock";

export interface JsonEditorProps {
  value: string;
  onChange: (value: string, isValid: boolean) => void;
  readOnly?: boolean;
  height?: string | number;
  showValidation?: boolean;
  className?: string;
}

function tryParseJson(str: string): { valid: boolean; error?: string; position?: number } {
  if (str.trim() === "") return { valid: true };
  try {
    JSON.parse(str);
    return { valid: true };
  } catch (e) {
    const err = e as Error & { position?: number };
    return {
      valid: false,
      error: err.message ?? "JSON invalide",
      position: err.position,
    };
  }
}

function formatJson(str: string): string {
  const r = tryParseJson(str);
  if (!r.valid) return str;
  try {
    return JSON.stringify(JSON.parse(str), null, 2);
  } catch {
    return str;
  }
}

export function JsonEditor({
  value,
  onChange,
  readOnly = false,
  height = 300,
  showValidation = true,
  className = "",
}: JsonEditorProps) {
  const [localValue, setLocalValue] = useState(value);
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  const validation = tryParseJson(localValue);
  const h = typeof height === "number" ? `${height}px` : height;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const v = e.target.value;
      setLocalValue(v);
      onChange(v, tryParseJson(v).valid);
    },
    [onChange]
  );

  const handleBlur = useCallback(() => {
    const formatted = formatJson(localValue);
    if (formatted !== localValue) {
      setLocalValue(formatted);
      onChange(formatted, true);
    }
  }, [localValue, onChange]);

  if (readOnly) {
    return (
      <div
        className={className ? `bpm-json-editor ${className}`.trim() : "bpm-json-editor"}
        style={{ height: h }}
      >
        <CodeBlock code={value} language="json" />
      </div>
    );
  }

  return (
    <div
      className={className ? `bpm-json-editor ${className}`.trim() : "bpm-json-editor"}
      style={{ display: "flex", flexDirection: "column", gap: 8 }}
    >
      <textarea
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        spellCheck={false}
        style={{
          width: "100%",
          height: h,
          padding: 12,
          border: `1px solid ${validation.valid ? "var(--bpm-border)" : "var(--bpm-error)"}`,
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
      {showValidation && (
        <div
          style={{
            fontSize: 12,
            color: validation.valid ? "var(--bpm-success)" : "var(--bpm-error)",
          }}
        >
          {validation.valid ? "JSON valide" : validation.error}
          {validation.position != null && ` (position ${validation.position})`}
        </div>
      )}
    </div>
  );
}
