"use client";

import React, { useRef } from "react";
import { Button } from "@/components/bpm";

export interface WikiEditorToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const COLORS = [
  { name: "Rouge", value: "#c62828" },
  { name: "Bleu", value: "#1565c0" },
  { name: "Vert", value: "#2e7d32" },
  { name: "Orange", value: "#e65100" },
  { name: "Violet", value: "#6a1b9a" },
  { name: "Gris", value: "#546e7a" },
];

export function WikiEditorToolbar({
  textareaRef,
  value,
  onChange,
  disabled = false,
}: WikiEditorToolbarProps) {
  const colorPopoverRef = useRef<HTMLDivElement>(null);

  const applyWrap = (before: string, after: string, placeholder?: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end);
    const text = selected || (placeholder ?? "texte");
    const newValue = value.slice(0, start) + before + text + after + value.slice(end);
    const newStart = start + before.length;
    const newEnd = newStart + text.length;
    onChange(newValue);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(newStart, newEnd);
    });
  };

  /** Insère un préfixe au début de la ligne courante (ex. # , - ). */
  const applyLinePrefix = (prefix: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const newValue = value.slice(0, lineStart) + prefix + value.slice(lineStart);
    onChange(newValue);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(lineStart + prefix.length, lineStart + prefix.length);
    });
  };

  const handleBold = () => applyWrap("**", "**");
  const handleItalic = () => applyWrap("*", "*");
  const handleHeading = (level: 1 | 2 | 3) => applyLinePrefix("#".repeat(level) + " ");
  const handleBulletList = () => applyLinePrefix("- ");
  const handleNumberedList = () => applyLinePrefix("1. ");
  const handleColor = (hex: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end) || "texte";
    const before = `<span style="color:${hex}">`;
    const after = "</span>";
    const newValue = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(newValue);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  return (
    <div
      className="flex flex-wrap items-center gap-1 p-2 rounded-t border border-b-0"
      style={{
        borderColor: "var(--bpm-border)",
        background: "var(--bpm-bg)",
      }}
    >
      <span title="Gras">
        <Button
          type="button"
          variant="outline"
          size="small"
          disabled={disabled}
          onClick={handleBold}
        >
          <strong>G</strong>
        </Button>
      </span>
      <span title="Italique">
        <Button
          type="button"
          variant="outline"
          size="small"
          disabled={disabled}
          onClick={handleItalic}
        >
          <em>I</em>
        </Button>
      </span>
      <span className="w-px self-stretch" style={{ background: "var(--bpm-border)" }} aria-hidden />
      <span title="Titre 1">
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={() => handleHeading(1)}>
          H1
        </Button>
      </span>
      <span title="Titre 2">
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={() => handleHeading(2)}>
          H2
        </Button>
      </span>
      <span title="Titre 3">
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={() => handleHeading(3)}>
          H3
        </Button>
      </span>
      <span title="Liste à puces">
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={handleBulletList}>
          •
        </Button>
      </span>
      <span title="Liste numérotée">
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={handleNumberedList}>
          1.
        </Button>
      </span>
      <span className="w-px self-stretch" style={{ background: "var(--bpm-border)" }} aria-hidden />
      <div className="relative inline-block" ref={colorPopoverRef}>
        <span title="Couleur du texte">
          <Button
            type="button"
            variant="outline"
            size="small"
            disabled={disabled}
            onClick={() => {
            const el = colorPopoverRef.current?.querySelector(".wiki-toolbar-colors");
            if (el instanceof HTMLElement) el.hidden = !el.hidden;
          }}
        >
          <span className="underline" style={{ color: "var(--bpm-accent)" }}>
            A
          </span>
        </Button>
        </span>
        <div
          className="wiki-toolbar-colors absolute left-0 top-full mt-1 p-2 rounded border shadow z-10 hidden"
          style={{
            borderColor: "var(--bpm-border)",
            background: "var(--bpm-surface)",
          }}
        >
          <div className="text-xs mb-1" style={{ color: "var(--bpm-text-secondary)" }}>
            Couleur
          </div>
          <div className="flex flex-wrap gap-1">
            {COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                title={c.name}
                className="w-6 h-6 rounded border"
                style={{
                  borderColor: "var(--bpm-border)",
                  backgroundColor: c.value,
                }}
                onClick={() => {
                  handleColor(c.value);
                  const el = colorPopoverRef.current?.querySelector(".wiki-toolbar-colors");
                  if (el instanceof HTMLElement) el.hidden = true;
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
