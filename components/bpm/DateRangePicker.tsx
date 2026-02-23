"use client";

import React from "react";

function toInputValue(d: Date | string | null | undefined): string {
  if (!d) return "";
  if (d instanceof Date) return d.toISOString().split("T")[0];
  return String(d).split("T")[0];
}

export interface DateRangePickerProps {
  label?: string;
  start?: Date | string | null;
  end?: Date | string | null;
  onChange?: (start: Date | null, end: Date | null) => void;
  disabled?: boolean;
  min?: Date | string | null;
  max?: Date | string | null;
}

export function DateRangePicker(p: DateRangePickerProps) {
  const { label, start, end, onChange, disabled = false, min = null, max = null } = p;
  const onStart = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onChange) return;
    const v = e.target.value;
    const endVal = end instanceof Date ? end : end ? new Date(end) : null;
    onChange(v ? new Date(v) : null, endVal);
  };
  const onEnd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onChange) return;
    const v = e.target.value;
    const startVal = start instanceof Date ? start : start ? new Date(start) : null;
    onChange(startVal, v ? new Date(v) : null);
  };
  const inputStyle = {
    borderColor: "var(--bpm-border)",
    background: "var(--bpm-bg-primary)",
    color: "var(--bpm-text-primary)",
  };
  return (
    <div className="bpm-date-range-picker">
      {label && (
        <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
          {label}
        </label>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          className="px-3 py-2 rounded-lg border text-sm flex-1 min-w-0"
          style={inputStyle}
          value={toInputValue(start)}
          onChange={onStart}
          disabled={disabled}
          min={toInputValue(min) || undefined}
          max={toInputValue(max) || undefined}
        />
        <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          –
        </span>
        <input
          type="date"
          className="px-3 py-2 rounded-lg border text-sm flex-1 min-w-0"
          style={inputStyle}
          value={toInputValue(end)}
          onChange={onEnd}
          disabled={disabled}
          min={toInputValue(start) || toInputValue(min) || undefined}
          max={toInputValue(max) || undefined}
        />
      </div>
    </div>
  );
}
