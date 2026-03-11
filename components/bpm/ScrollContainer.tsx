"use client";

import React from "react";

export interface ScrollContainerProps {
  children: React.ReactNode;
  /** Hauteur du conteneur (défaut '100%'). */
  height?: string | number;
  /** Hauteur max pour limiter le scroll. */
  maxHeight?: string | number;
  /** Direction du scroll (défaut 'vertical'). */
  direction?: "vertical" | "horizontal" | "both";
  /** Masquer la scrollbar visuelle (défaut false). */
  hideScrollbar?: boolean;
  className?: string;
}

const normalizeSize = (v: string | number | undefined): string | undefined => {
  if (v === undefined) return undefined;
  return typeof v === "number" ? `${v}px` : v;
};

export function ScrollContainer({
  children,
  height = "100%",
  maxHeight,
  direction = "vertical",
  hideScrollbar = false,
  className = "",
}: ScrollContainerProps) {
  const h = normalizeSize(height);
  const mh = normalizeSize(maxHeight);
  const overflowY = direction === "horizontal" ? "hidden" : "auto";
  const overflowX = direction === "vertical" ? "hidden" : "auto";
  const overflow = direction === "both" ? "auto" : undefined;

  const baseClass = "bpm-scroll-container" + (hideScrollbar ? " bpm-scroll-container-hide-sb" : "");

  return (
    <div
      className={className ? `${baseClass} ${className}`.trim() : baseClass.trim()}
      style={{
        height: h,
        maxHeight: mh ?? (direction === "horizontal" ? "none" : undefined),
        overflow: overflow ?? undefined,
        overflowX: overflow ? undefined : overflowX,
        overflowY: overflow ? undefined : overflowY,
        scrollbarWidth: hideScrollbar ? "none" : undefined,
        msOverflowStyle: hideScrollbar ? "none" : undefined,
      }}
    >
      {hideScrollbar && (
        <style>{`.bpm-scroll-container-hide-sb::-webkit-scrollbar { display: none; }`}</style>
      )}
      {children}
    </div>
  );
}
