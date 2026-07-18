"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useBpmLocale } from "./i18n";

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: number;
  replies?: Comment[];
}

/**
 * @component bpm.commentThread
 * @description Fil de commentaires avec réponses et avatars.
 */
export interface CommentThreadProps {
  comments: Comment[];
  onPost: (content: string, parentId?: string) => void | Promise<void>;
  currentUser: { id: string; name: string };
  maxDepth?: number;
  className?: string;
}

const STRINGS = {
  fr: {
    justNow: "à l’instant",
    minAgo: (n: number) => `il y a ${n} min`,
    hAgo: (n: number) => `il y a ${n} h`,
    daysAgo: (n: number) => `il y a ${n} j`,
    reply: "Répondre",
    replyPlaceholder: "Votre réponse…",
    publish: "Publier",
    cancel: "Annuler",
    newComment: "Nouveau commentaire",
    commentPlaceholder: "Écrire un commentaire…",
    loggedInAs: "Connecté en tant que",
  },
  en: {
    justNow: "just now",
    minAgo: (n: number) => `${n} min ago`,
    hAgo: (n: number) => `${n} h ago`,
    daysAgo: (n: number) => `${n} d ago`,
    reply: "Reply",
    replyPlaceholder: "Your reply…",
    publish: "Post",
    cancel: "Cancel",
    newComment: "New comment",
    commentPlaceholder: "Write a comment…",
    loggedInAs: "Logged in as",
  },
} as const;

type CommentStrings = (typeof STRINGS)[keyof typeof STRINGS];

function formatRelative(ts: number, now: number, t: CommentStrings): string {
  const sec = Math.round((now - ts) / 1000);
  if (sec < 60) return t.justNow;
  const min = Math.floor(sec / 60);
  if (min < 60) return t.minAgo(min);
  const h = Math.floor(min / 60);
  if (h < 24) return t.hAgo(h);
  const d = Math.floor(h / 24);
  if (d < 7) return t.daysAgo(d);
  return new Date(ts).toLocaleDateString();
}

function CommentBlock({
  c,
  depth,
  maxDepth,
  now,
  onReply,
  posting,
}: {
  c: Comment;
  depth: number;
  maxDepth: number;
  now: number;
  onReply: (parentId: string, text: string) => void;
  posting: boolean;
}) {
  const bpmLocale = useBpmLocale();
  const t = STRINGS[bpmLocale];
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const canReply = depth < maxDepth;

  const submitReply = useCallback(() => {
    const t = draft.trim();
    if (!t) return;
    onReply(c.id, t);
    setDraft("");
    setOpen(false);
  }, [c.id, draft, onReply]);

  return (
    <div
      style={{
        borderLeft: depth > 0 ? "2px solid var(--bpm-border)" : undefined,
        paddingLeft: depth > 0 ? 12 : 0,
        marginLeft: depth > 0 ? 8 : 0,
        marginTop: 10,
      }}
    >
      <div
        style={{
          padding: "10px 12px",
          borderRadius: "var(--bpm-radius-sm)",
          border: "1px solid var(--bpm-border)",
          background: "var(--bpm-surface)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
          <span style={{ fontWeight: 600, color: "var(--bpm-text-primary)", fontSize: 13 }}>{c.authorName}</span>
          <time dateTime={new Date(c.createdAt).toISOString()} style={{ fontSize: 11, color: "var(--bpm-text-secondary)" }}>
            {formatRelative(c.createdAt, now, t)}
          </time>
        </div>
        <p style={{ margin: 0, whiteSpace: "pre-wrap", color: "var(--bpm-text-primary)", fontSize: 14 }}>{c.content}</p>
        {canReply ? (
          <div style={{ marginTop: 8 }}>
            {!open ? (
              <button
                type="button"
                onClick={() => setOpen(true)}
                style={{
                  fontSize: 12,
                  padding: "2px 8px",
                  borderRadius: "var(--bpm-radius-sm)",
                  border: "1px solid var(--bpm-border)",
                  background: "var(--bpm-bg-secondary, var(--bpm-surface))",
                  color: "var(--bpm-accent)",
                  cursor: "pointer",
                }}
              >
                {t.reply}
              </button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={t.replyPlaceholder}
                  rows={3}
                  disabled={posting}
                  style={{
                    resize: "vertical",
                    padding: 8,
                    borderRadius: "var(--bpm-radius-sm)",
                    border: "1px solid var(--bpm-border)",
                    background: "var(--bpm-surface)",
                    color: "var(--bpm-text-primary)",
                    fontSize: 13,
                  }}
                />
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    type="button"
                    onClick={submitReply}
                    disabled={posting || !draft.trim()}
                    style={{
                      fontSize: 12,
                      padding: "4px 12px",
                      borderRadius: "var(--bpm-radius-sm)",
                      border: "none",
                      background: "var(--bpm-accent)",
                      color: "var(--bpm-surface)",
                      cursor: posting ? "wait" : "pointer",
                    }}
                  >
                    {t.publish}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      setDraft("");
                    }}
                    style={{
                      fontSize: 12,
                      padding: "4px 12px",
                      borderRadius: "var(--bpm-radius-sm)",
                      border: "1px solid var(--bpm-border)",
                      background: "transparent",
                      color: "var(--bpm-text-secondary)",
                      cursor: "pointer",
                    }}
                  >
                    {t.cancel}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
      {(c.replies ?? []).map((r) => (
        <CommentBlock key={r.id} c={r} depth={depth + 1} maxDepth={maxDepth} now={now} onReply={onReply} posting={posting} />
      ))}
    </div>
  );
}

/**
 * @component bpm.commentThread
 * @description Fil de commentaires récursif avec réponses inline, dates relatives et profondeur configurable.
 * @example
 * bpm.commentThread({ comments: [...], onPost: (content, parentId) => addComment(content, parentId), currentUser: { id: "1", name: "Marie" } })
 *
 * @param {object} props
 * @param {Comment[]} props.comments - Liste des commentaires avec replies optionnelles. Obligatoire.
 * @param {function} props.onPost - Callback pour publier (content, parentId?). Obligatoire.
 * @param {object} props.currentUser - Utilisateur connecté {id, name}. Obligatoire.
 * @param {number} [props.maxDepth=2] - Profondeur maximale des réponses. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 *
 * @associated bpm.activityFeed, bpm.chatInterface
 */
export function CommentThread({
  comments,
  onPost,
  currentUser,
  maxDepth = 2,
  className = "",
}: CommentThreadProps) {
  const bpmLocale = useBpmLocale();
  const t = STRINGS[bpmLocale];
  const [rootDraft, setRootDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  const handlePostRoot = useCallback(async () => {
    const t = rootDraft.trim();
    if (!t) return;
    setPosting(true);
    try {
      await Promise.resolve(onPost(t));
      setRootDraft("");
    } finally {
      setPosting(false);
    }
  }, [onPost, rootDraft]);

  const handleReply = useCallback(
    async (parentId: string, text: string) => {
      setPosting(true);
      try {
        await Promise.resolve(onPost(text, parentId));
      } finally {
        setPosting(false);
      }
    },
    [onPost]
  );

  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 12, color: "var(--bpm-text-secondary)" }}>
        {t.loggedInAs} <strong style={{ color: "var(--bpm-text-primary)" }}>{currentUser.name}</strong>
      </div>
      {comments.map((c) => (
        <CommentBlock key={c.id} c={c} depth={0} maxDepth={maxDepth} now={now} onReply={handleReply} posting={posting} />
      ))}
      <div
        style={{
          marginTop: 8,
          paddingTop: 12,
          borderTop: "1px solid var(--bpm-border)",
        }}
      >
        <label style={{ display: "block", fontSize: 12, color: "var(--bpm-text-secondary)", marginBottom: 6 }}>{t.newComment}</label>
        <textarea
          value={rootDraft}
          onChange={(e) => setRootDraft(e.target.value)}
          placeholder={t.commentPlaceholder}
          rows={4}
          disabled={posting}
          style={{
            width: "100%",
            boxSizing: "border-box",
            resize: "vertical",
            padding: 10,
            borderRadius: "var(--bpm-radius-sm)",
            border: "1px solid var(--bpm-border)",
            background: "var(--bpm-surface)",
            color: "var(--bpm-text-primary)",
            fontSize: 14,
          }}
        />
        <button
          type="button"
          onClick={() => void handlePostRoot()}
          disabled={posting || !rootDraft.trim()}
          style={{
            marginTop: 8,
            padding: "8px 16px",
            borderRadius: "var(--bpm-radius-sm)",
            border: "none",
            background: "var(--bpm-accent)",
            color: "var(--bpm-surface)",
            cursor: posting ? "wait" : "pointer",
            fontSize: 14,
          }}
        >
          {t.publish}
        </button>
      </div>
    </div>
  );
}
