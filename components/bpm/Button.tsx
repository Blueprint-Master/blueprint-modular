"use client";

import React from "react";

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  type?: "button" | "submit";
  fullWidth?: boolean;
  className?: string;
}

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "medium",
  disabled = false,
  type = "button",
  fullWidth = false,
  className = "",
}: ButtonProps) {
  const isPrimary = variant === "primary";
  const sizeClass = size === "small" ? "px-2 py-1 text-sm" : size === "large" ? "px-6 py-3 text-lg" : "px-4 py-2";

  return (
    <button
      type={type}
      className={`rounded-lg font-medium transition ${sizeClass} ${fullWidth ? "w-full" : ""} ${className}`}
      style={{
        background: isPrimary ? "var(--bpm-accent)" : "transparent",
        color: isPrimary ? "#fff" : "var(--bpm-text-primary)",
        border: variant === "outline" ? "1px solid var(--bpm-border)" : "none",
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
