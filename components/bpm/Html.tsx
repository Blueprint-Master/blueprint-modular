"use client";

import React from "react";

export interface HtmlProps {
  /** HTML brut à afficher (équivalent st.html). À n'utiliser qu'avec du contenu de confiance ou sanitized. */
  html: string;
  className?: string;
  style?: React.CSSProperties;
}

export function Html({ html, className = "", style = {} }: HtmlProps) {
  return (
    <div
      className={"bpm-html " + className}
      style={{ color: "var(--bpm-text-primary)", ...style }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
