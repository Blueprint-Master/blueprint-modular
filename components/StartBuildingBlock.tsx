"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const COMMAND = "pip install blueprint-modular";

/** Chaînes bilingues locales — portée : StartBuildingBlock uniquement. */
const CONTENT = {
  fr: {
    heading: "Commencer à construire votre application avec",
    copied: "Copié",
    copy: "Copier",
    copyCommand: "Copier la commande",
    pasteBefore: "Collez la commande dans votre terminal, ou consultez la ",
    docLink: "documentation",
    pasteAfter: ".",
  },
  en: {
    heading: "Start building your application with",
    copied: "Copied",
    copy: "Copy",
    copyCommand: "Copy the command",
    pasteBefore: "Paste the command into your terminal, or check the ",
    docLink: "documentation",
    pasteAfter: ".",
  },
} as const;

export function StartBuildingBlock() {
  const { locale } = useI18n();
  const t = CONTENT[locale];
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(COMMAND);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select and copy
      const el = document.getElementById("start-building-command");
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  }, []);

  return (
    <div
      className="rounded-xl p-8 mb-12 max-w-2xl mx-auto text-center mt-[4rem] md:mt-[8rem]"
      style={{
        background: "var(--bpm-bg-primary)",
      }}
    >
      <h2 className="font-bold mt-[6.5rem] md:mt-[6rem]" style={{ color: "var(--bpm-text-primary)", fontSize: "3rem", lineHeight: "3rem", marginBottom: "2rem" }}>
        {t.heading} <code className="px-2.5 py-1.5 rounded align-middle text-xl font-medium" style={{ background: "var(--bpm-bg-secondary)" }}>bpm.*</code>
      </h2>
      <div
        className="group flex items-center justify-center gap-3 rounded-lg px-4 py-3 font-mono text-sm mx-auto max-w-md"
        style={{
          background: "var(--bpm-bg-secondary)",
          color: "var(--bpm-text-primary)",
        }}
      >
        <code id="start-building-command" className="break-all" style={{ paddingTop: ".5rem", paddingBottom: ".5rem", maxWidth: "20rem" }}>
          {COMMAND}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className={`shrink-0 p-2 rounded-md transition ${copied ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
          style={{
            background: copied ? "var(--bpm-accent)" : "transparent",
            color: copied ? "#fff" : "var(--bpm-text-secondary)",
          }}
          title={copied ? t.copied : t.copy}
          aria-label={copied ? t.copied : t.copyCommand}
        >
          {copied ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      </div>
      <p className="text-sm mt-3" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.pasteBefore}
        <Link href="/docs/getting-started" className="underline" style={{ color: "var(--bpm-accent-cyan)" }}>
          {t.docLink}
        </Link>
        {t.pasteAfter}
      </p>
    </div>
  );
}
