"use client";

import React, { useState, useEffect } from "react";

/**
 * @component bpm.numberInput
 * @description Champ de saisie numérique avec validation min/max et formatage au blur.
 * @example
 * bpm.numberInput({ label: "Quantité", value: 10, onChange: setQty, min: 0, max: 100, step: 1 })
 *
 * @param {object} props
 * @param {string} [props.label] - Label affiché au-dessus. Optionnel.
 * @param {number|null} [props.value] - Valeur contrôlée. Optionnel.
 * @param {function} [props.onChange] - Callback (number | null). Optionnel.
 * @param {number|null} [props.min] - Valeur minimale autorisée. Optionnel.
 * @param {number|null} [props.max] - Valeur maximale autorisée. Optionnel.
 * @param {number} [props.step=1] - Pas d'incrémentation. Optionnel.
 * @param {boolean} [props.disabled=false] - Désactive le champ. Optionnel.
 * @param {string} [props.help] - Texte d'aide au survol. Optionnel.
 * @param {string} [props.placeholder=""] - Placeholder. Optionnel.
 * @param {string|null} [props.error=null] - Message d'erreur du champ : contour rouge + message sous le champ. Optionnel.
 *
 * @parent bpm.modal, bpm.panel
 * @associated bpm.input, bpm.slider
 * @forbidden Valeur non numérique — utiliser bpm.input
 */
export interface NumberInputProps {
  label?: string;
  value?: number | null;
  onChange?: (value: number | null) => void;
  min?: number | null;
  max?: number | null;
  step?: number;
  disabled?: boolean;
  help?: string | null;
  placeholder?: string;
  /** Message d'erreur du CHAMP : contour rouge + message sous le champ (role=alert, aria-invalid). Additif : défaut null = rendu inchangé. */
  error?: string | null;
}

export function NumberInput({
  label,
  value,
  onChange,
  min = null,
  max = null,
  step = 1,
  disabled = false,
  help = null,
  placeholder = "",
  error = null,
}: NumberInputProps) {
  const [displayString, setDisplayString] = useState(() =>
    value !== undefined && value != null ? String(value) : ""
  );
  const isControlled = value !== undefined;

  useEffect(() => {
    if (!isControlled) return;
    setDisplayString(value != null ? String(value) : "");
  }, [isControlled, value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    const allowed = /^[-+]?(\d*\.?\d*|\.\d*)(e[-+]?\d*)?$/i;
    if (v !== "" && !allowed.test(v)) return;
    setDisplayString(v);
    const num = v === "" ? null : parseFloat(v);
    if (onChange && !disabled) onChange(Number.isNaN(num as number) ? null : num);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    /* Le blur RESTAURE l'état du champ, il ne le remet pas à neuf : sans cette
       branche, quitter un champ en erreur en effacerait le contour rouge alors
       que l'erreur, elle, reste affichée dessous. */
    e.target.style.borderColor = error ? "var(--bpm-error, #dc2626)" : "var(--bpm-border)";
    e.target.style.boxShadow = "none";
    let val: number | null = displayString === "" ? null : parseFloat(displayString);
    if (val != null && !Number.isNaN(val)) {
      if (min != null && val < min) val = min;
      if (max != null && val > max) val = max;
    }
    const normalized = val != null ? String(val) : "";
    setDisplayString(normalized);
    if (onChange && !disabled) onChange(val);
  };

  return (
    <div className="bpm-number-input-container">
      {label && (
        <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
          {label}
          {help && <span className="ml-1 opacity-70" title={help}>ⓘ</span>}
        </label>
      )}
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        className="bpm-number-input w-full px-3 py-2 rounded-lg border text-sm min-h-[40px]"
        style={{ borderColor: error ? "var(--bpm-error, #dc2626)" : "var(--bpm-border)", background: "var(--bpm-bg-primary)", color: "var(--bpm-text-primary)", minHeight: 40, boxSizing: "border-box" }}
        value={displayString}
        aria-invalid={error ? true : undefined}
        onChange={handleChange}
        onFocus={(e) => {
          e.target.style.outline = "none";
          e.target.style.borderColor = "var(--bpm-accent)";
          e.target.style.boxShadow = "var(--bpm-focus-ring)";
        }}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
      />
      {error && (
        <p
          role="alert"
          className="bpm-number-input-error mt-1 text-sm"
          style={{ color: "var(--bpm-error, #dc2626)", fontSize: "var(--bpm-font-size-sm)" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
