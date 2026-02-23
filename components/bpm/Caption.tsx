"use client";

import React from "react";

export interface CaptionProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Caption({ children, className = "", style = {} }: CaptionProps) {
  return (
    <p
      className={"bpm-caption text-sm " + className}
      style={{ color: "var(--bpm-text-secondary)", ...style }}
    >
      {children}
    </p>
  );
}
