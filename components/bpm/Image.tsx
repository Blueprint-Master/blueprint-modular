"use client";

import React from "react";

export interface ImageProps {
  src: string;
  alt: string;
  title?: string;
  width?: number | string;
  height?: number | string;
  fit?: "contain" | "cover" | "fill" | "none";
  className?: string;
}

export function Image({
  src,
  alt,
  title,
  width,
  height,
  fit = "contain",
  className = "",
}: ImageProps) {
  const style: React.CSSProperties = {
    maxWidth: "100%",
    objectFit: fit,
  };
  if (width != null) style.width = typeof width === "number" ? `${width}px` : width;
  if (height != null) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <img
      src={src}
      alt={alt}
      title={title}
      className={`bpm-image ${className}`.trim()}
      style={style}
      loading="lazy"
    />
  );
}
