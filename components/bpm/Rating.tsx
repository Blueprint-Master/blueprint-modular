"use client";

import React from "react";

export interface RatingProps {
  value?: number;
  max?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
}

const sizeClasses: Record<string, string> = { small: "text-lg", medium: "text-2xl", large: "text-3xl" };

export function Rating(props: RatingProps) {
  const { value = 0, max = 5, onChange, disabled = false, size = "medium" } = props;
  const v = Math.max(0, Math.min(max, Math.round(value)));
  const stars = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div className="bpm-rating flex gap-0.5 items-center" role="group" aria-label={"Note " + v + " sur " + max}>
      {stars.map((star) => {
        const filled = star <= v;
        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange && onChange(star)}
            className={"p-0.5 rounded transition-opacity " + (sizeClasses[size] || sizeClasses.medium)}
            style={{
              color: filled ? "var(--bpm-accent-cyan)" : "var(--bpm-border)",
              cursor: disabled ? "default" : "pointer",
            }}
            aria-pressed={filled}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
