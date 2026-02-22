"use client";

import React, { useState } from "react";

export interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export function CodeBlock({ code, language = "text", className = "" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre
        className={`p-4 rounded-lg overflow-x-auto text-sm ${className}`}
        style={{
          background: "var(--bpm-code-bg)",
          border: "1px solid var(--bpm-code-border)",
          color: "var(--bpm-text-primary)",
        }}
      >
        <code>{code}</code>
      </pre>
      <button
        type="button"
        onClick={copy}
        className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium opacity-80 group-hover:opacity-100"
        style={{ background: "var(--bpm-accent)", color: "#fff" }}
      >
        {copied ? "Copié" : "Copier"}
      </button>
    </div>
  );
}
