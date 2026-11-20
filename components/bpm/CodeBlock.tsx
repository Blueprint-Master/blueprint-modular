"use client";

import React, { useState } from "react";

/**
 * @component bpm.codeBlock
 * @description Bloc de code avec syntaxe colorée et bouton Copier.
 */
export interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

/**
 * @component bpm.codeBlock
 * @description Affiche un bloc de code avec coloration syntaxique et bouton Copier pour documentation technique ou procédures.
 * @example
 * bpm.codeBlock({ code: "npm install @blueprint-modular/core", language: "bash" })
 * @props
 * - code (string) — Contenu du bloc de code.
 * - language (string, optionnel) — Langage pour coloration (bash, json, typescript…). Default: 'text'.
 * - className (string, optionnel) — Classes CSS.
 * @usage Documentation API, procédures d'installation, exemples de requêtes.
 * @context PARENT: bpm.panel | bpm.card. ASSOCIATED: bpm.markdown, bpm.title. FORBIDDEN: aucun.
 */
export function CodeBlock({ code, language = "text", className = "" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* Le bouton vit dans une barre d'en-tête, jamais par-dessus le code : posé en
     absolu, il masquait la fin des lignes longues (défilement horizontal sur
     mobile) et ne ressemblait pas au bouton du bac à sable de la même page. */
  return (
    <div
      className="bpm-codeblock"
      style={{
        border: "1px solid var(--bpm-border)",
        borderRadius: "var(--bpm-radius-md, 8px)",
        background: "var(--bpm-code-bg)",
        overflow: "hidden",
        margin: "0 0 12px",
      }}
    >
      <div
        className="bpm-codeblock-header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: "6px 12px 6px 16px",
          borderBottom: "1px solid var(--bpm-border)",
          color: "var(--bpm-text-muted, var(--bpm-text-secondary))",
          fontSize: "var(--bpm-font-size-sm, 13px)",
        }}
      >
        <span>{language !== "text" ? language : ""}</span>
        <button
          type="button"
          onClick={copy}
          aria-live="polite"
          style={{
            background: "transparent",
            border: "1px solid var(--bpm-border)",
            color: "inherit",
            padding: "4px 10px",
            borderRadius: "var(--bpm-radius-sm, 4px)",
            cursor: "pointer",
            font: "inherit",
          }}
        >
          {copied ? "Copié" : "Copier"}
        </button>
      </div>
      <pre
        className={`p-4 overflow-x-auto text-sm ${className}`}
        style={{ margin: 0, color: "var(--bpm-text-primary)" }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}
