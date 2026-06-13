"use client";

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Button, Textarea } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR, SEED_POSTITS, type ColumnId, type SeedContent } from "../strings";

export type { ColumnId } from "../strings";

/** Icônes conformes à la charte Blueprint (stroke, couleur accent) */
const IconEdit = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--bpm-accent)" }} aria-hidden>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconTrash = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--bpm-accent)" }} aria-hidden>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);
const IconArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--bpm-accent)", marginRight: 2 }} aria-hidden>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const COLUMNS: { id: ColumnId; color: string; cardBg: string }[] = [
  { id: "bien", color: "#166534", cardBg: "rgba(34,197,94,0.15)" },
  { id: "ameliorer", color: "#b45309", cardBg: "rgba(251,146,60,0.2)" },
  { id: "action", color: "#1e40af", cardBg: "rgba(59,130,246,0.15)" },
];

type Author = { id: string; displayName: string };

type PostIt = {
  id: string;
  /** Chaîne saisie par l'utilisateur, ou contenu seedé bilingue résolu au render. */
  content: string | SeedContent;
  column: ColumnId;
  author: Author;
  createdAt: string; // ISO
  order: number;
};

const currentUser: Author = { id: "current", displayName: "Marie Dupont" };

/** Démo : post-it répartis dans les 3 colonnes, avec auteur et date */
function buildInitialPostIts(): PostIt[] {
  return SEED_POSTITS.map((s) => ({
    id: s.id,
    content: s.content,
    column: s.column,
    author: { id: s.authorId, displayName: s.authorName },
    createdAt: s.createdAt,
    order: s.order,
  }));
}

export default function TableauBlancSimulateurPage() {
  const { locale } = useI18n();
  const t = STR[locale];
  const [postIts, setPostIts] = useState<PostIt[]>(buildInitialPostIts);
  const [newContent, setNewContent] = useState("");
  const [newColumn, setNewColumn] = useState<ColumnId>("bien");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const newCardRef = useRef<HTMLDivElement>(null);

  const resolveContent = (content: string | SeedContent): string =>
    typeof content === "string" ? content : content[locale];

  const trimmed = newContent.trim();
  const canAdd = trimmed.length > 0;

  const handleAdd = useCallback(() => {
    if (!trimmed) return;
    const id = `post-${Date.now()}`;
    const maxOrder = Math.max(0, ...postIts.filter((p) => p.column === newColumn).map((p) => p.order));
    const newPost: PostIt = {
      id,
      content: trimmed,
      column: newColumn,
      author: currentUser,
      createdAt: new Date().toISOString(),
      order: maxOrder + 1,
    };
    setPostIts((prev) => [...prev, newPost]);
    setNewContent("");
    setHighlightId(id);
    setTimeout(() => setHighlightId(null), 2000);
    requestAnimationFrame(() => newCardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  }, [trimmed, newColumn, postIts]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleDelete = (id: string) => {
    setPostIts((prev) => prev.filter((p) => p.id !== id));
    setEditingId(null);
  };

  const handleEdit = (id: string, content: string) => {
    setEditingId(id);
    setEditContent(content);
  };

  const handleSaveEdit = () => {
    if (editingId && editContent.trim()) {
      setPostIts((prev) => prev.map((p) => (p.id === editingId ? { ...p, content: editContent.trim() } : p)));
      setEditingId(null);
      setEditContent("");
    }
  };

  const handleMove = (id: string, targetColumn: ColumnId) => {
    const maxOrder = Math.max(0, ...postIts.filter((p) => p.column === targetColumn).map((p) => p.order));
    setPostIts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, column: targetColumn, order: maxOrder + 1 } : p))
    );
    setEditingId(null);
  };

  const byColumn = COLUMNS.map((col) => ({
    ...col,
    label: t.columnLabels[col.id],
    items: [...postIts.filter((p) => p.column === col.id)].sort((a, b) => a.order - b.order),
  }));

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/tableau-blanc">{t.moduleName}</Link> → {t.breadcrumbSimulator}
        </div>
        <h1>{t.simulatorTitle}</h1>
        <p className="doc-description">
          {t.simulatorDescription}
        </p>
      </div>

      {/* Conteneur épuré sans Panel — espace atelier */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)" }}
      >
        {/* En-tête avec compteur — pas d'icône ℹ */}
        <div className="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-sidebar-bg)" }}>
          <h2 className="text-base font-semibold m-0" style={{ color: "var(--bpm-text-primary)" }}>
            {t.boardHeading(postIts.length)}
          </h2>
        </div>

        {/* Zone de saisie séparée (au-dessus du tableau) */}
        <div className="px-4 py-3 border-b" style={{ borderColor: "var(--bpm-border)" }}>
          <p className="text-xs font-medium mb-2" style={{ color: "var(--bpm-text-secondary)" }}>{t.newPostItLabel}</p>
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
            <div className="flex-1 min-w-0">
              <Textarea
                placeholder={t.inputPlaceholder}
                value={newContent}
                onChange={setNewContent}
                onKeyDown={handleKeyDown}
                rows={2}
                className="resize-y"
                style={{ minHeight: 56 }}
              />
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <label className="text-xs font-medium shrink-0" style={{ color: "var(--bpm-text-secondary)" }}>
                {t.columnSelectLabel}
              </label>
              <select
                value={newColumn}
                onChange={(e) => setNewColumn(e.target.value as ColumnId)}
                className="px-2 py-1.5 rounded border text-sm"
                style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)", color: "var(--bpm-text-primary)" }}
              >
                {COLUMNS.map((c) => (
                  <option key={c.id} value={c.id}>{t.columnLabels[c.id]}</option>
                ))}
              </select>
              <Button size="small" onClick={handleAdd} disabled={!canAdd}>
                {t.addButton}
              </Button>
            </div>
          </div>
        </div>

        {/* Tableau en 3 colonnes */}
        <div className="p-4 grid gap-4" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
          {byColumn.map((col) => (
            <div key={col.id} className="flex flex-col min-h-[200px] rounded-lg border" style={{ borderColor: col.color + "44", background: col.cardBg }}>
              <div className="px-3 py-2 rounded-t-lg font-semibold text-sm text-center" style={{ background: col.color, color: "#fff" }}>
                {col.label}
              </div>
              <div className="p-2 flex-1 flex flex-col gap-2 min-h-0">
                {col.items.map((p) => {
                  const isEditing = editingId === p.id;
                  const isHighlight = highlightId === p.id;
                  const content = resolveContent(p.content);
                  return (
                    <div
                      key={p.id}
                      ref={p.id === highlightId ? newCardRef : undefined}
                      className="group relative rounded border p-3 text-sm min-h-[72px] flex flex-col"
                      style={{
                        background: isHighlight ? "#fef9c3" : "#fefce8",
                        borderColor: isHighlight ? "var(--bpm-accent-cyan)" : "var(--bpm-border)",
                        boxShadow: isHighlight ? "0 0 0 2px var(--bpm-accent-cyan)" : undefined,
                        transition: "box-shadow 0.2s, background 0.2s",
                      }}
                    >
                      {isEditing ? (
                        <>
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="bpm-textarea flex-1 min-h-[60px] w-full rounded-lg border px-2 py-1.5 text-sm resize-y"
                            style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)", color: "var(--bpm-text-primary)" }}
                            autoFocus
                          />
                          <div className="flex gap-1 mt-2">
                            <Button size="small" onClick={handleSaveEdit}>{t.saveButton}</Button>
                            <Button size="small" variant="secondary" onClick={() => { setEditingId(null); setEditContent(""); }}>{t.cancelButton}</Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="m-0 flex-1 whitespace-pre-wrap break-words" style={{ color: "var(--bpm-text-primary)" }}>{content}</p>
                          <p className="m-0 mt-2 text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
                            {p.author.displayName} — {t.formatDate(p.createdAt)}
                          </p>
                          {/* Actions au survol — icônes charte Blueprint */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-wrap gap-1 items-center">
                            <button type="button" onClick={() => handleEdit(p.id, content)} className="p-1 rounded hover:bg-black/10 flex items-center justify-center" title={t.editAction} aria-label={t.editAction}>
                              <IconEdit />
                            </button>
                            <button type="button" onClick={() => handleDelete(p.id)} className="p-1 rounded hover:bg-black/10 flex items-center justify-center" title={t.deleteAction} aria-label={t.deleteAction}>
                              <IconTrash />
                            </button>
                            {COLUMNS.filter((c) => c.id !== p.column).map((c) => (
                              <button key={c.id} type="button" onClick={() => handleMove(p.id, c.id)} className="p-1 rounded hover:bg-black/10 text-xs flex items-center" title={t.moveTo(t.columnLabels[c.id])}>
                                <IconArrowRight />
                                {t.columnLabels[c.id]}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
                {col.items.length === 0 && (
                  <p className="text-xs text-center py-4" style={{ color: "var(--bpm-text-secondary)" }}>{t.emptyColumn}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/tableau-blanc" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>{t.backToModule}</Link>
      </p>
    </div>
  );
}
