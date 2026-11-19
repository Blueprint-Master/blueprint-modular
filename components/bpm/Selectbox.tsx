"use client";

import React, { useLayoutEffect, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useBpmLocale } from "./i18n";

const STRINGS = {
  fr: { placeholderDefault: "Sélectionner...", noOptions: "Aucune option disponible" },
  en: { placeholderDefault: "Select...", noOptions: "No option available" },
} as const;

export type SelectboxOption = string | { value: string; label: string };

/**
 * @component bpm.selectbox
 * @description Liste déroulante avec dropdown portalé, support clavier et placeholder.
 * @example
 * bpm.selectbox({ label: "Pays", options: ["France", "Belgique", "Suisse"], value: selected, onChange: setSelected })
 *
 * @param {object} props
 * @param {string} [props.label] - Label affiché au-dessus. Optionnel.
 * @param {SelectboxOption[]} [props.options=[]] - Options (string ou { value, label }). Optionnel.
 * @param {string|null} [props.value] - Valeur sélectionnée. Optionnel.
 * @param {function} [props.onChange] - Callback au changement. Optionnel.
 * @param {boolean} [props.disabled=false] - Désactive le composant. Optionnel.
 * @param {string} [props.help] - Texte d'aide au survol. Optionnel.
 * @param {string} [props.placeholder="Sélectionner..."] - Placeholder. Optionnel.
 * @param {boolean} [props.required=false] - Champ obligatoire. Optionnel.
 * @param {string|null} [props.error=null] - Message d'erreur du champ : contour rouge + message sous le champ. Optionnel.
 * @param {number} [props.triggerHeight] - Hauteur du trigger en pixels. Optionnel.
 *
 * @parent bpm.panel, bpm.modal, bpm.card
 * @associated bpm.input, bpm.radioGroup, bpm.autocomplete
 */
export interface SelectboxProps {
  /** PARENT: bpm.panel | bpm.modal (formulaire) | bpm.card. INTERDIT: options=[] sans placeholder — UI bloquée. ASSOCIÉ: bpm.input (filtres combinés), bpm.table (filtre colonne), bpm.button. */
  /** Label affiché au-dessus. */
  label?: string;
  /** Liste d'options. Format : string[] ou [{value, label}]. */
  options?: SelectboxOption[];
  /** Valeur sélectionnée (contrôlé). */
  value?: string | null;
  /** Callback — reçoit la valeur string sélectionnée. */
  onChange?: (value: string) => void;
  disabled?: boolean;
  help?: string | null;
  placeholder?: string;
  required?: boolean;
  /** Message d'erreur du CHAMP : contour rouge + message sous le champ (role=alert, aria-invalid). Additif : défaut null = rendu inchangé. */
  error?: string | null;
  /** Hauteur du trigger (px) pour alignement avec d'autres champs (ex. FilterPanel). */
  triggerHeight?: number;
}

function getOptionValue(opt: SelectboxOption): string {
  return typeof opt === "string" ? opt : opt.value;
}
function getOptionLabel(opt: SelectboxOption): string {
  return typeof opt === "string" ? opt : opt.label;
}

export function Selectbox({
  label,
  options = [],
  value,
  onChange,
  disabled = false,
  help = null,
  placeholder,
  required = false,
  error = null,
  triggerHeight,
}: SelectboxProps) {
  const bpmLocale = useBpmLocale();
  const t = STRINGS[bpmLocale];
  const effPlaceholder = placeholder ?? t.placeholderDefault;
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const selectboxRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current?.contains(e.target as Node) ||
        selectboxRef.current?.contains(e.target as Node)
      )
        return;
      setIsOpen(false);
    };
    const t = setTimeout(() => document.addEventListener("click", handleClickOutside, true), 100);
    return () => {
      clearTimeout(t);
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    const update = () => {
      if (!selectboxRef.current || !dropdownRef.current) return;
      const rect = selectboxRef.current.getBoundingClientRect();
      const margin = 8;
      const gap = 4;
      const viewHeight = window.innerHeight;
      const viewWidth = window.innerWidth;
      const width = Math.min(Math.max(rect.width, 220), Math.max(0, viewWidth - 2 * margin));
      const below = Math.max(0, viewHeight - rect.bottom - gap - margin);
      const above = Math.max(0, rect.top - gap - margin);
      const menuHeight = Math.min(280, dropdownRef.current.scrollHeight + 2);
      const openAbove = below < menuHeight && above > below;
      setDropdownStyle({
        position: "fixed",
        ...(openAbove ? { bottom: viewHeight - rect.top + gap } : { top: rect.bottom + gap }),
        left: Math.max(margin, Math.min(rect.left, viewWidth - width - margin)),
        width,
        maxHeight: Math.min(280, openAbove ? above : below),
        zIndex: 10002,
        overflow: "auto",
      });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [isOpen, options.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
  }, [isOpen]);

  const selectedOption = options.find((o) => getOptionValue(o) === value);
  const displayValue = selectedOption
    ? getOptionLabel(selectedOption)
    : effPlaceholder && !required
      ? effPlaceholder
      : "";

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsOpen((prev) => !prev);
  };

  const handleSelect = (optionValue: string) => {
    if (disabled) return;
    onChange?.(optionValue);
    setIsOpen(false);
  };

  const dropdownContent = isOpen && !disabled && (
    <div
      ref={dropdownRef as React.RefObject<HTMLDivElement>}
      className="bpm-selectbox-dropdown overflow-auto"
      style={{
        ...dropdownStyle,
        background: "var(--bpm-surface)",
        border: "1px solid var(--bpm-border)",
        borderRadius: "var(--bpm-radius)",
        boxShadow: "var(--bpm-shadow)",
        padding: "4px 0",
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {options.length > 0 ? (
        options.map((opt, idx) => {
          const optValue = getOptionValue(opt);
          const optLabel = getOptionLabel(opt);
          const isSelected = optValue === value;
          return (
            <div
              key={idx}
              role="option"
              aria-selected={isSelected}
              className="bpm-selectbox-option cursor-pointer"
              data-value={optValue}
              style={{
                padding: "8px 12px",
                paddingLeft: optValue && ["pending", "analyzing", "done", "error"].includes(optValue) ? "28px" : "12px",
                fontSize: "var(--bpm-font-size-base)",
                background: isSelected ? "var(--bpm-accent)" : "transparent",
                color: isSelected ? "var(--bpm-accent-contrast)" : "var(--bpm-text)",
                transition: "var(--bpm-transition)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                position: "relative",
              }}
              onClick={() => handleSelect(optValue)}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.background = "var(--bpm-bg-secondary)";
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.background = "transparent";
              }}
            >
              {optLabel}
            </div>
          );
        })
      ) : (
        <div style={{ padding: "8px 12px", fontSize: "var(--bpm-font-size-base)", color: "var(--bpm-text-muted)" }}>
          {t.noOptions}
        </div>
      )}
    </div>
  );

  return (
    <div className="bpm-selectbox-container" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
          {label}
          {help && <span className="ml-1 opacity-70" title={help}>ⓘ</span>}
        </label>
      )}
      <div className="bpm-selectbox-wrapper relative">
        <div
          ref={selectboxRef}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className={`bpm-selectbox flex items-center justify-between gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm ${
            disabled ? "opacity-60 cursor-not-allowed" : ""
          } ${isOpen ? "ring-2 ring-offset-1" : ""}`}
          aria-invalid={error ? true : undefined}
          style={{
            borderColor: error ? "var(--bpm-error, #dc2626)" : "var(--bpm-border)",
            background: "var(--bpm-bg-primary)",
            color: displayValue && displayValue !== effPlaceholder ? "var(--bpm-text-primary)" : "var(--bpm-text-secondary)",
            minHeight: triggerHeight ?? 40,
            height: triggerHeight ?? 40,
            boxSizing: "border-box",
          }}
          onClick={handleToggle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleToggle(e as unknown as React.MouseEvent);
            }
          }}
        >
          <span className="truncate">{displayValue}</span>
        </div>
        {typeof document !== "undefined" && dropdownContent && createPortal(dropdownContent, document.body)}
      </div>
      {error && (
        <p
          role="alert"
          className="bpm-selectbox-error mt-1 text-sm"
          style={{ color: "var(--bpm-error, #dc2626)", fontSize: "var(--bpm-font-size-sm)" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
