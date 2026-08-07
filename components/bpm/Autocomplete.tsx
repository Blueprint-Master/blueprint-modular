"use client";

import React, { useState, useRef, useEffect } from "react";

export interface AutocompleteOption {
  value: string;
  label: string;
}

/**
 * @component bpm.autocomplete
 * @description Champ de saisie avec suggestions.
 */
export interface AutocompleteProps {
  label?: string;
  placeholder?: string;
  value?: string;
  /** Texte SAISI — appelé à chaque frappe ET à la sélection. Ne distingue pas les deux : voir `onSelect`. */
  onChange?: (value: string) => void;
  /**
   * Appelé UNIQUEMENT quand une option est réellement choisie (clic ou Entrée),
   * avec l'option entière.
   *
   * Sans lui, `onChange` est le seul signal disponible et il CONFOND deux
   * événements : « l'utilisateur tape » et « l'utilisateur a choisi ». Un
   * consommateur qui stocke une clé étrangère ne peut donc pas savoir si ce
   * qu'il reçoit est un identifiant ou du texte libre — et s'il affiche
   * `value`, il montre l'identifiant brut après la sélection au lieu du
   * libellé.
   *
   * Avec `onSelect`, le consommateur tient deux états séparés : le TEXTE
   * affiché (`value` / `onChange`) et la VALEUR choisie (ici). Taper après
   * avoir choisi invalide le choix — c'est à l'appelant de le décider, mais il
   * a désormais de quoi.
   *
   * Additif : absent = comportement inchangé à l'octet.
   */
  onSelect?: (option: AutocompleteOption) => void;
  options: AutocompleteOption[];
  /** Message d'erreur du CHAMP : contour rouge + message sous le champ (role=alert, aria-invalid). Additif : défaut null. */
  error?: string | null;
  className?: string;
}

/**
 * @component bpm.autocomplete
 * @description Champ de saisie avec autocomplétion filtrant les options selon la valeur entrée.
 * @example
 * bpm.autocomplete({ label: "Ville", options: [{ value: "paris", label: "Paris" }], onChange: (v) => console.log(v) })
 *
 * @param {object} props
 * @param {string} [props.label] - Libellé du champ. Optionnel.
 * @param {string} [props.placeholder=""] - Texte d'aide. Optionnel.
 * @param {string} [props.value=""] - Valeur courante. Optionnel.
 * @param {function} [props.onChange] - Callback appelé à chaque modification (frappe ET sélection). Optionnel.
 * @param {function} [props.onSelect] - Callback appelé UNIQUEMENT à la sélection d'une option, avec l'option entière. Optionnel.
 * @param {string|null} [props.error=null] - Message d'erreur du champ : contour rouge + message sous le champ. Optionnel.
 * @param {AutocompleteOption[]} props.options - Liste des options {value, label}. Obligatoire.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 *
 * @parent bpm.form
 * @associated bpm.select, bpm.input, bpm.combobox
 * @forbidden Liste figée courte — utiliser bpm.selectbox
 */
export function Autocomplete(props: AutocompleteProps) {
  const { label, placeholder = "", value = "", onChange, onSelect, options, error = null, className = "" } = props;
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const q = value.trim().toLowerCase();
  const filtered = q
    ? options.filter((o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)).slice(0, 20)
    : options.slice(0, 20);

  useEffect(() => { setHighlight(0); }, [value, open]);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const select = (opt: AutocompleteOption) => {
    /* `onChange` reste appelé pour ne rien casser chez les consommateurs qui
       n'écoutent que lui. `onSelect` s'y AJOUTE et porte l'information que
       `onChange` ne peut pas porter : c'est un CHOIX, pas une frappe. */
    if (onChange) onChange(opt.value);
    if (onSelect) onSelect(opt);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className={"bpm-autocomplete relative " + className}>
      {label ? <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>{label}</label> : null}
      <input
        type="text"
        value={value}
        onChange={(e) => { if (onChange) onChange(e.target.value); setOpen(true); }}
        onFocus={(e) => {
          e.target.style.outline = "none";
          e.target.style.borderColor = "var(--bpm-accent)";
          e.target.style.boxShadow = "var(--bpm-focus-ring)";
          setOpen(true);
        }}
        aria-invalid={error ? true : undefined}
        onBlur={(e) => {
          /* Le blur RESTAURE l'état du champ, il ne le remet pas à neuf. */
          e.target.style.borderColor = error ? "var(--bpm-error, #dc2626)" : "var(--bpm-border)";
          e.target.style.boxShadow = "none";
        }}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border text-sm min-h-[40px]"
        style={{ background: "var(--bpm-bg-primary)", borderColor: error ? "var(--bpm-error, #dc2626)" : "var(--bpm-border)", color: "var(--bpm-text-primary)", minHeight: 40, boxSizing: "border-box" }}
      />
      {open && filtered.length > 0 ? (
        <ul className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border shadow-lg list-none m-0 p-1" style={{ background: "var(--bpm-bg-primary)", borderColor: "var(--bpm-border)" }}>
          {filtered.map((opt, i) => (
            <li
              key={opt.value}
              className="px-3 py-2 rounded cursor-pointer text-sm"
              style={{ background: i === highlight ? "var(--bpm-accent)" : "transparent", color: i === highlight ? "var(--bpm-accent-contrast)" : "var(--bpm-text)" }}
              onMouseDown={() => select(opt)}
              onMouseEnter={() => setHighlight(i)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="bpm-autocomplete-error mt-1 text-sm"
          style={{ color: "var(--bpm-error, #dc2626)", fontSize: "var(--bpm-font-size-sm)" }}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
