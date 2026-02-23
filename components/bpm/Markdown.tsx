"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";

export interface MarkdownProps {
  /** Contenu Markdown. Utilisez `---` sur une ligne pour une ligne horizontale (hr). */
  text: string;
  className?: string;
}

export function Markdown({ text, className = "" }: MarkdownProps) {
  return (
    <div
      className={`bpm-markdown ${className}`.trim()}
      style={{ color: "var(--bpm-text-primary)" }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          hr: () => (
            <hr
              className="bpm-markdown-hr my-4 border-0 border-t"
              style={{ borderColor: "var(--bpm-border)" }}
            />
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
