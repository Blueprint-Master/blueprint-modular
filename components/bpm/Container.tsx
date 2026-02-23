"use client";

import React from "react";

export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Container({ children, className = "", style = {} }: ContainerProps) {
  return <div className={"bpm-container " + className} style={style}>{children}</div>;
}
