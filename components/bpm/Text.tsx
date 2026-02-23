"use client";

import React from "react";

export interface TextProps {
  children: React.ReactNode;
  /** Style inline comme st.text (monospace). */
  mono?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** Texte simple (équivalent st.write / st.text). */
export function Text({ children, mono = false, className = "", style = {} }: TextProps) {
  return (
    <span
      className={`bpm-text ${mono ? "font-mono text-sm" : ""} ${className}`.trim()}
      style={{ color: "var(--bpm-text-primary)", ...style }}
    >
      {children}
    </span>
  );
}
