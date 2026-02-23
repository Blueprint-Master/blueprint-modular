"use client";

import React from "react";

function toInputValue(d: Date | string | null | undefined): string {
  if (!d) return "";
  if (d instanceof Date) return d.toTimeString().slice(0, 5);
  const m = String(d).match(/(\d{1,2}):(\d{2})/);
  return m ? m[1].padStart(2, "0") + ":" + m[2] : "";
}

export interface TimeInputProps {
  label?: string;
  value?: Date | string | null;
  onChange?: (value: Date | null) => void;
  disabled?: boolean;
  min?: string;
  max?: string;
}

export function TimeInput(p: TimeInputProps) {
  const { label, value, onChange, disabled = false, min, max } = p;
  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onChange || disabled) return;
    const v = e.target.value;
    if (!v) { onChange(null); return; }
    const [h, m] = v.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m || 0, 0, 0);
    onChange(d);
  };
  return (
    <div className="bpm-time-input">
      {label && <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>{label}</label>}
      <input type="time" className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)", color: "var(--bpm-text-primary)" }} value={toInputValue(value)} onChange={handle} disabled={disabled} min={min} max={max} />
    </div>
  );
}
