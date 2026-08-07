"use client";

import React, { useId } from "react";

/**
 * @component bpm.input
 * @description Champ de saisie texte avec label optionnel. Supporte différents types HTML (text, email, password, etc.).
 * @example
 * bpm.input({ label: "Email", value: email, onChange: setEmail, type: "email", placeholder: "exemple@mail.com" })
 *
 * @param {object} props
 * @param {string} [props.label] - Label affiché au-dessus du champ. Optionnel.
 * @param {string} [props.value=""] - Valeur contrôlée. Optionnel.
 * @param {function} [props.onChange] - Callback recevant la valeur string directement. Optionnel.
 * @param {string} [props.placeholder=""] - Texte indicatif. Optionnel.
 * @param {"text"|"email"|"password"|"number"|"search"|"date"} [props.type="text"] - Type HTML du champ. Optionnel.
 * @param {boolean} [props.disabled=false] - Désactive le champ. Optionnel.
 * @param {string|null} [props.error=null] - Message d'erreur du champ : contour rouge + message sous le champ. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 *
 * @parent bpm.modal, bpm.panel, bpm.card
 * @associated bpm.button, bpm.selectbox
 */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  /** PARENT: bpm.modal (formulaire) | bpm.panel | bpm.card. INTERDIT: onChange absent sur champ contrôlé. ASSOCIÉ: bpm.button (submit), bpm.selectbox (filtres), bpm.modal. */
  /** Label affiché au-dessus du champ. */
  label?: string;
  /** Valeur contrôlée. */
  value?: string;
  /** Callback — reçoit la valeur string, pas un Event. Ex: (v) => setValue(v) */
  onChange?: (value: string) => void;
  placeholder?: string;
  /** Type HTML. Default: 'text'. */
  type?: "text" | "email" | "password" | "number" | "search" | "date";
  /** Désactive le champ. */
  disabled?: boolean;
  /** Message d'erreur du CHAMP : contour rouge + message sous le champ (role=alert, aria-invalid). Additif : défaut null = rendu inchangé. */
  error?: string | null;
  className?: string;
}

export function Input({
  label,
  value = "",
  onChange,
  placeholder = "",
  type = "text",
  disabled = false,
  error = null,
  className = "",
  id: idProp,
  ...props
}: InputProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const { style: propsStyle, ...restProps } = props;
  const errorId = error ? `${id}-error` : undefined;
  const inputStyle: React.CSSProperties = {
    borderColor: error ? "var(--bpm-error, #dc2626)" : "var(--bpm-border)",
    background: "var(--bpm-bg-primary)",
    color: "var(--bpm-text)",
    borderRadius: "var(--bpm-radius)",
    fontSize: "var(--bpm-font-size-sm)",
    ...propsStyle,
  };
  return (
    <div className={`bpm-input-wrap ${className}`.trim()}>
      {label && (
        <label
          htmlFor={id}
          className="bpm-input-label block text-sm font-medium mb-1"
          style={{ color: "var(--bpm-text)", fontSize: "var(--bpm-font-size-sm)" }}
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className="bpm-input w-full px-3 py-2 border min-h-[40px]"
        style={inputStyle}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        onFocus={(e) => {
          e.target.style.outline = "none";
          e.target.style.borderColor = "var(--bpm-accent)";
          e.target.style.boxShadow = "var(--bpm-focus-ring)";
        }}
        onBlur={(e) => {
          /* Le blur RESTAURE l'état du champ, il ne le remet pas à neuf : sans
             cette branche, quitter un champ en erreur en effacerait le contour
             rouge alors que l'erreur, elle, reste affichée dessous. */
          e.target.style.borderColor = error ? "var(--bpm-error, #dc2626)" : "var(--bpm-border)";
          e.target.style.boxShadow = "none";
        }}
        {...restProps}
      />
      {error && (
        <p
          id={errorId}
          role="alert"
          className="bpm-input-error mt-1 text-sm"
          style={{ color: "var(--bpm-error, #dc2626)", fontSize: "var(--bpm-font-size-sm)" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
