"use client";

import React, { useRef, useEffect, useState } from "react";
import { Button, Modal, Input } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";

export interface WikiEditorToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  onSave?: () => void;
  onTogglePreview?: () => void;
  showPreview?: boolean;
}

const COLORS = [
  { key: "red", value: "#c62828" },
  { key: "blue", value: "#1565c0" },
  { key: "green", value: "#2e7d32" },
  { key: "orange", value: "#e65100" },
  { key: "purple", value: "#6a1b9a" },
  { key: "gray", value: "#546e7a" },
] as const;

const CONTENT = {
  fr: {
    undo: "Annuler",
    redo: "Rétablir",
    heading: "Titre",
    quote: "Citation",
    bold: "Gras",
    italic: "Italique",
    underline: "Souligné",
    strikethrough: "Barré",
    inlineCode: "Code inline",
    bulletList: "Liste à puces",
    numberedList: "Liste numérotée",
    taskList: "Liste de tâches",
    linkTip: "Lien (modale)",
    imageTip: "Image (modale)",
    tableTip: "Tableau (modale)",
    codeBlock: "Bloc de code",
    wikiLinkTip: "Lien wiki [[slug]] (modale)",
    preview: "Prévisualisation",
    save: "Sauvegarder",
    textColor: "Couleur du texte",
    editBtn: "Éditer",
    previewBtn: "Aperçu",
    saveBtn: "Sauvegarder",
    colorLabel: "Couleur",
    colors: { red: "Rouge", blue: "Bleu", green: "Vert", orange: "Orange", purple: "Violet", gray: "Gris" },
    insertLink: "Insérer un lien",
    urlLabel: "URL",
    linkTextLabel: "Texte du lien",
    displayedText: "texte affiché",
    cancel: "Annuler",
    insert: "Insérer",
    insertImage: "Insérer une image",
    imageUrlLabel: "URL de l'image",
    altTextLabel: "Texte alternatif",
    descriptionPlaceholder: "description",
    insertTable: "Insérer un tableau",
    rows: "Lignes",
    columns: "Colonnes",
    wikiLinkTitle: "Lien wiki [[slug]]",
    slugLabel: "Slug de l'article",
    slugPlaceholder: "mon-article",
    labelOptional: "Libellé (optionnel)",
    defText: "texte",
    defCode: "code",
    defLink: "lien",
    defImage: "image",
    colHeader: "Colonne",
  },
  en: {
    undo: "Undo",
    redo: "Redo",
    heading: "Heading",
    quote: "Quote",
    bold: "Bold",
    italic: "Italic",
    underline: "Underline",
    strikethrough: "Strikethrough",
    inlineCode: "Inline code",
    bulletList: "Bullet list",
    numberedList: "Numbered list",
    taskList: "Task list",
    linkTip: "Link (dialog)",
    imageTip: "Image (dialog)",
    tableTip: "Table (dialog)",
    codeBlock: "Code block",
    wikiLinkTip: "Wiki link [[slug]] (dialog)",
    preview: "Preview",
    save: "Save",
    textColor: "Text color",
    editBtn: "Edit",
    previewBtn: "Preview",
    saveBtn: "Save",
    colorLabel: "Color",
    colors: { red: "Red", blue: "Blue", green: "Green", orange: "Orange", purple: "Purple", gray: "Gray" },
    insertLink: "Insert link",
    urlLabel: "URL",
    linkTextLabel: "Link text",
    displayedText: "displayed text",
    cancel: "Cancel",
    insert: "Insert",
    insertImage: "Insert image",
    imageUrlLabel: "Image URL",
    altTextLabel: "Alt text",
    descriptionPlaceholder: "description",
    insertTable: "Insert table",
    rows: "Rows",
    columns: "Columns",
    wikiLinkTitle: "Wiki link [[slug]]",
    slugLabel: "Article slug",
    slugPlaceholder: "my-article",
    labelOptional: "Label (optional)",
    defText: "text",
    defCode: "code",
    defLink: "link",
    defImage: "image",
    colHeader: "Column",
  },
} as const;

type InsertModal = null | "link" | "image" | "table" | "wikilink";

export function WikiEditorToolbar({
  textareaRef,
  value,
  onChange,
  disabled = false,
  onSave,
  onTogglePreview,
  showPreview = false,
}: WikiEditorToolbarProps) {
  const { locale } = useI18n();
  const t = CONTENT[locale];
  const colorPopoverRef = useRef<HTMLDivElement>(null);
  const [insertModal, setInsertModal] = useState<InsertModal>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [wikiSlug, setWikiSlug] = useState("");
  const [wikiLabel, setWikiLabel] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key === "s") {
        e.preventDefault();
        onSave?.();
      }
      if (mod && e.shiftKey && e.key === "p") {
        e.preventDefault();
        onTogglePreview?.();
      }
      if (mod && e.key === "k") {
        e.preventDefault();
        handleLink();
      }
      if (mod && e.key === "/") {
        e.preventDefault();
        handleCodeBlock();
      }
      if (mod && e.key === "b") {
        e.preventDefault();
        handleBold();
      }
      if (mod && e.key === "i") {
        e.preventDefault();
        handleItalic();
      }
      if (mod && e.shiftKey && e.key === "8") {
        e.preventDefault();
        handleBulletList();
      }
      if (mod && e.shiftKey && e.key === "7") {
        e.preventDefault();
        handleNumberedList();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [disabled, onSave, onTogglePreview]);

  const applyWrap = (before: string, after: string, placeholder?: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end);
    const text = selected || (placeholder ?? t.defText);
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
  const handleUnderline = () => applyWrap("<u>", "</u>", t.defText);
  const handleStrikethrough = () => applyWrap("~~", "~~");
  const handleCodeInline = () => applyWrap("`", "`", t.defCode);
  const handleHeading = (level: 1 | 2 | 3 | 4) => applyLinePrefix("#".repeat(level) + " ");
  const handleBlockquote = () => applyLinePrefix("> ");
  const handleCodeBlock = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end).trim() || t.defCode;
    const before = "\n```\n";
    const after = "\n```\n";
    const newValue = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(newValue);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };
  /** Insère une chaîne à la position du curseur (remplace la sélection). */
  const insertAtCursor = (str: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newValue = value.slice(0, start) + str + value.slice(end);
    onChange(newValue);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + str.length, start + str.length);
    });
  };

  const handleLink = () => {
    setLinkText(value.slice(textareaRef.current?.selectionStart ?? 0, textareaRef.current?.selectionEnd ?? 0).trim() || t.defLink);
    setLinkUrl("");
    setInsertModal("link");
  };
  const handleLinkSubmit = () => {
    if (!linkUrl.trim()) return;
    insertAtCursor(`[${linkText.trim() || linkUrl}](${linkUrl.trim()})`);
    setInsertModal(null);
  };

  const handleImageClick = () => {
    setImageUrl("");
    setImageAlt("");
    setInsertModal("image");
  };
  const handleImageSubmit = () => {
    if (!imageUrl.trim()) return;
    insertAtCursor(`![${imageAlt.trim() || t.defImage}](${imageUrl.trim()})`);
    setInsertModal(null);
  };

  const handleTableClick = () => {
    setTableRows(3);
    setTableCols(3);
    setInsertModal("table");
  };
  const handleTableSubmit = () => {
    const r = Math.max(1, Math.min(20, tableRows));
    const c = Math.max(1, Math.min(10, tableCols));
    const header = "| " + Array(c).fill(t.colHeader).map((x, i) => `${x} ${i + 1}`).join(" | ") + " |\n";
    const sep = "| " + Array(c).fill("---").join(" | ") + " |\n";
    const body = Array(r - 1).fill("| " + Array(c).fill("").join(" | ") + " |\n").join("");
    insertAtCursor(header + sep + body);
    setInsertModal(null);
  };

  const handleWikiLinkClick = () => {
    const sel = value.slice(textareaRef.current?.selectionStart ?? 0, textareaRef.current?.selectionEnd ?? 0).trim();
    setWikiSlug(sel || "");
    setWikiLabel("");
    setInsertModal("wikilink");
  };
  const handleWikiLinkSubmit = () => {
    const slug = wikiSlug.trim().toLowerCase().replace(/\s+/g, "-");
    if (!slug) return;
    insertAtCursor(wikiLabel.trim() ? `[[${slug}|${wikiLabel.trim()}]]` : `[[${slug}]]`);
    setInsertModal(null);
  };
  const handleBulletList = () => applyLinePrefix("- ");
  const handleNumberedList = () => applyLinePrefix("1. ");
  const handleTaskList = () => applyLinePrefix("- [ ] ");
  const handleColor = (hex: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end) || t.defText;
    const before = `<span style="color:${hex}">`;
    const after = "</span>";
    const newValue = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(newValue);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const modKey = isMac ? "⌘" : "Ctrl";

  return (
    <div
      className="sticky top-0 z-10 flex flex-wrap items-center gap-1 p-2 rounded-t border border-b-0"
      style={{
        borderColor: "var(--bpm-border)",
        background: "var(--bpm-bg)",
      }}
    >
      {/* Groupe 1 — Historique */}
      <span title={`${t.undo} (${modKey}+Z)`}>
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={() => document.execCommand("undo")}>
          ↩
        </Button>
      </span>
      <span title={`${t.redo} (${modKey}+Shift+Z)`}>
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={() => document.execCommand("redo")}>
          ↪
        </Button>
      </span>
      <span className="w-px self-stretch" style={{ background: "var(--bpm-border)" }} aria-hidden />
      {/* Groupe 2 — Style */}
      <span title={`${t.heading} 1`}>
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={() => handleHeading(1)}>H1</Button>
      </span>
      <span title={`${t.heading} 2`}>
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={() => handleHeading(2)}>H2</Button>
      </span>
      <span title={`${t.heading} 3`}>
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={() => handleHeading(3)}>H3</Button>
      </span>
      <span title={`${t.heading} 4`}>
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={() => handleHeading(4)}>H4</Button>
      </span>
      <span title={t.quote}>
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={handleBlockquote}>»</Button>
      </span>
      <span className="w-px self-stretch" style={{ background: "var(--bpm-border)" }} aria-hidden />
      {/* Groupe 3 — Caractère */}
      <span title={`${t.bold} (${modKey}+B)`}>
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={handleBold}><strong>G</strong></Button>
      </span>
      <span title={`${t.italic} (${modKey}+I)`}>
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={handleItalic}><em>I</em></Button>
      </span>
      <span title={t.underline}>
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={handleUnderline}><u>U</u></Button>
      </span>
      <span title={t.strikethrough}>
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={handleStrikethrough}><s>S</s></Button>
      </span>
      <span title={`${t.inlineCode} (${modKey}+E)`}>
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={handleCodeInline}>&lt;/&gt;</Button>
      </span>
      <span className="w-px self-stretch" style={{ background: "var(--bpm-border)" }} aria-hidden />
      {/* Listes */}
      <span title={`${t.bulletList} (${modKey}+Shift+8)`}>
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={handleBulletList}>•</Button>
      </span>
      <span title={`${t.numberedList} (${modKey}+Shift+7)`}>
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={handleNumberedList}>1.</Button>
      </span>
      <span title={t.taskList}>
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={handleTaskList}>☐</Button>
      </span>
      <span className="w-px self-stretch" style={{ background: "var(--bpm-border)" }} aria-hidden />
      {/* Insertions */}
      <span title={t.linkTip}>
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={handleLink}>🔗</Button>
      </span>
      <span title={t.imageTip}>
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={handleImageClick}>🖼</Button>
      </span>
      <span title={t.tableTip}>
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={handleTableClick}>▦</Button>
      </span>
      <span title={`${t.codeBlock} (${modKey}+/)`}>
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={handleCodeBlock}>{"</>"}</Button>
      </span>
      <span title={t.wikiLinkTip}>
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={handleWikiLinkClick}>[[ ]]</Button>
      </span>
      {onTogglePreview && (
        <>
          <span className="w-px self-stretch" style={{ background: "var(--bpm-border)" }} aria-hidden />
          <span title={`${t.preview} (${modKey}+Shift+P)`}>
            <Button
              type="button"
              variant={showPreview ? "primary" : "outline"}
              size="small"
              disabled={disabled}
              onClick={onTogglePreview}
            >
              {showPreview ? t.editBtn : t.previewBtn}
            </Button>
          </span>
        </>
      )}
      {onSave && (
        <span title={`${t.save} (${modKey}+S)`}>
          <Button type="button" variant="outline" size="small" disabled={disabled} onClick={onSave}>
            {t.saveBtn}
          </Button>
        </span>
      )}
      <span className="w-px self-stretch" style={{ background: "var(--bpm-border)" }} aria-hidden />
      <div className="relative inline-block" ref={colorPopoverRef}>
        <span title={t.textColor}>
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
            <span className="underline" style={{ color: "var(--bpm-accent)" }}>A</span>
          </Button>
        </span>
        <div
          className="wiki-toolbar-colors absolute left-0 top-full mt-1 p-2 rounded border shadow z-10 hidden"
          style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)" }}
        >
          <div className="text-xs mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{t.colorLabel}</div>
          <div className="flex flex-wrap gap-1">
            {COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                title={t.colors[c.key]}
                className="w-6 h-6 rounded border"
                style={{ borderColor: "var(--bpm-border)", backgroundColor: c.value }}
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

      {insertModal === "link" && (
        <Modal isOpen title={t.insertLink} onClose={() => setInsertModal(null)} size="small">
          <div className="space-y-3">
            <Input label={t.urlLabel} value={linkUrl} onChange={setLinkUrl} placeholder="https://..." />
            <Input label={t.linkTextLabel} value={linkText} onChange={setLinkText} placeholder={t.displayedText} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="small" onClick={() => setInsertModal(null)}>{t.cancel}</Button>
              <Button size="small" onClick={handleLinkSubmit} disabled={!linkUrl.trim()}>{t.insert}</Button>
            </div>
          </div>
        </Modal>
      )}
      {insertModal === "image" && (
        <Modal isOpen title={t.insertImage} onClose={() => setInsertModal(null)} size="small">
          <div className="space-y-3">
            <Input label={t.imageUrlLabel} value={imageUrl} onChange={setImageUrl} placeholder="https://..." />
            <Input label={t.altTextLabel} value={imageAlt} onChange={setImageAlt} placeholder={t.descriptionPlaceholder} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="small" onClick={() => setInsertModal(null)}>{t.cancel}</Button>
              <Button size="small" onClick={handleImageSubmit} disabled={!imageUrl.trim()}>{t.insert}</Button>
            </div>
          </div>
        </Modal>
      )}
      {insertModal === "table" && (
        <Modal isOpen title={t.insertTable} onClose={() => setInsertModal(null)} size="small">
          <div className="space-y-3">
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>{t.rows}</span>
                <input type="number" min={1} max={20} value={tableRows} onChange={(e) => setTableRows(parseInt(e.target.value, 10) || 3)} className="w-16 px-2 py-1 rounded border text-sm" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }} />
              </label>
              <label className="flex items-center gap-2">
                <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>{t.columns}</span>
                <input type="number" min={1} max={10} value={tableCols} onChange={(e) => setTableCols(parseInt(e.target.value, 10) || 3)} className="w-16 px-2 py-1 rounded border text-sm" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }} />
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="small" onClick={() => setInsertModal(null)}>{t.cancel}</Button>
              <Button size="small" onClick={handleTableSubmit}>{t.insert}</Button>
            </div>
          </div>
        </Modal>
      )}
      {insertModal === "wikilink" && (
        <Modal isOpen title={t.wikiLinkTitle} onClose={() => setInsertModal(null)} size="small">
          <div className="space-y-3">
            <Input label={t.slugLabel} value={wikiSlug} onChange={setWikiSlug} placeholder={t.slugPlaceholder} />
            <Input label={t.labelOptional} value={wikiLabel} onChange={setWikiLabel} placeholder={t.displayedText} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="small" onClick={() => setInsertModal(null)}>{t.cancel}</Button>
              <Button size="small" onClick={handleWikiLinkSubmit} disabled={!wikiSlug.trim()}>{t.insert}</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
