"use client";

import React from "react";

export interface VideoProps {
  src: string;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  className?: string;
}

export function Video(p: VideoProps) {
  const { src, controls = true, loop = false, muted = false, className = "" } = p;
  return <video src={src} controls={controls} loop={loop} muted={muted} className={"bpm-video max-w-full " + className} />;
}
