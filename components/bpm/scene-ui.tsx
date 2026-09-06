"use client";
import React from "react";

export const sceneControl: React.CSSProperties = { minHeight: 44, border: "1px solid var(--bpm-border, #334155)",
  borderRadius: "var(--bpm-radius, 8px)", background: "var(--bpm-surface, #0f172a)", color: "var(--bpm-text-primary, #e2e8f0)",
  padding: "8px 12px", font: "inherit", cursor: "pointer", maxWidth: "100%" };

export function SceneFrame({ title, subtitle, controls, children, footer, className = "", style }: {
  title: string; subtitle?: React.ReactNode; controls?: React.ReactNode; children?: React.ReactNode;
  footer?: React.ReactNode; className?: string; style?: React.CSSProperties;
}) {
  return <section aria-label={title} className={className} style={{ minWidth: 0, border: "1px solid var(--bpm-border, #334155)",
    borderRadius: "var(--bpm-radius, 16px)", background: "var(--bpm-surface, #0f172a)", color: "var(--bpm-text-primary, #e2e8f0)",
    overflow: "hidden", ...style }}>
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, padding: 18 }}>
      <div style={{ flex: "1 1 170px", minWidth: 0 }}><strong>{title}</strong>{subtitle && <div style={{ fontSize: 12,
        marginTop: 6, color: "var(--bpm-text-secondary, #94a3b8)" }}>{subtitle}</div>}</div>
      {controls}
    </div>
    {children}
    {footer && <div style={{ padding: 16, display: "grid", gap: 12, overflowWrap: "anywhere", fontSize: 13 }}>{footer}</div>}
  </section>;
}

/** Only starts a clock after an explicit play action; reduced-motion changes stop it. */
export function useSceneClock(initial: number, rate: number, onTimeChange?: (time: number) => void) {
  const [time, setValue] = React.useState(initial);
  const latest = React.useRef(initial);
  const setTime = React.useCallback((next: number) => { latest.current = next; setValue(next); }, []);
  const [playing, setPlaying] = React.useState(false);
  const callback = React.useRef(onTimeChange);
  React.useEffect(() => { callback.current = onTimeChange; }, [onTimeChange]);
  React.useEffect(() => {
    if (!playing || typeof window === "undefined") return;
    const motion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const stop = () => { if (motion?.matches) setPlaying(false); };
    motion?.addEventListener?.("change", stop);
    let previous: number | undefined, raf: number;
    let current = latest.current;
    const frame = (now: number) => {
      if (previous !== undefined) {
        current += Math.min((now - previous) / 1000, 0.1) * rate;
        setTime(current);
        callback.current?.(current);
      }
      previous = now;
      raf = window.requestAnimationFrame(frame);
    };
    raf = window.requestAnimationFrame(frame);
    return () => { window.cancelAnimationFrame(raf); motion?.removeEventListener?.("change", stop); };
  }, [playing, initial, rate, setTime]);
  return { time, playing, setPlaying, setTime };
}
