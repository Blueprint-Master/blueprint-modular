"use client";

import React from "react";

export interface MapProps {
  iframeSrc?: string;
  lat?: number;
  lng?: number;
  width?: number | string;
  height?: number | string;
  className?: string;
}

export function Map(p: MapProps) {
  const { iframeSrc, lat, lng, width = "100%", height = 400, className = "" } = p;
  const w = typeof width === "number" ? width + "px" : width;
  const h = typeof height === "number" ? height + "px" : height;
  const src = iframeSrc ?? (lat != null && lng != null
    ? "https://www.openstreetmap.org/export/embed.html?bbox=" + (lng - 0.01) + "," + (lat - 0.01) + "," + (lng + 0.01) + "," + (lat + 0.01) + "&layer=mapnik"
    : "https://www.openstreetmap.org/export/embed.html?bbox=-0.2%2C43.5%2C0.2%2C43.7&layer=mapnik");

  return (
    <iframe
      src={src}
      title="Carte"
      className={"bpm-map border-0 rounded-lg " + className}
      style={{ width: w, height: h, background: "var(--bpm-bg-secondary)" }}
    />
  );
}
