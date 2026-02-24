"use client";

import React from "react";

export interface FABProps {
  icon?: React.ReactNode;
  label?: string;
  onClick?: () => void;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  className?: string;
}

export function FAB({ icon, label, onClick, position = "bottom-right", className = "" }: FABProps) {
  const style: React.CSSProperties = {
    background: "var(--bpm-accent-cyan)",
    color: "#fff",
  };
  if (position === "bottom-right") { style.bottom = 24; style.right = 24; }
  else if (position === "bottom-left") { style.bottom = 24; style.left = 24; }
  else if (position === "top-right") { style.top = 24; style.right = 24; }
  else { style.top = 24; style.left = 24; }

  return (
    <button
      type="button"
      onClick={onClick}
      className={"bpm-fab fixed z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg border-0 cursor-pointer " + className}
      style={style}
      title={label}
      aria-label={label ?? "Action"}
    >
      {icon ?? <span className="text-2xl leading-none">+</span>}
    </button>
  );
}
