"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/bpm/Button";
import { Panel } from "@/components/bpm/Panel";

type Conversation = { id: string; preview: string | null; createdAt: string };
type Message = { id: string; userMessage: string; aiResponse: string; createdAt: string };

export default function IAModulePage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = () => {
    fetch("/api/ai/conversations")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Unauthorized"))))
      .then(setConversations)
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (!currentId) {
      setMessages([]);
      return;
    }
    fetch(`/api/ai/conversations/${currentId}/messages`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setMessages)
      .catch(() => setMessages([]));
  }, [currentId]);

  const startNew = () => {
    setCurrentId(null);
    setMessages([]);
    setInput("");
  };

  const createAndSend = async () => {
    const text = input.trim();
    if (!text) return;
    setError(null);
    setSending(true);
    try {
      let cid = currentId;
      if (!cid) {
        const cr = await fetch("/api/ai/conversations", { method: "POST" });
        if (!cr.ok) throw new Error("Impossible de créer la conversation");
        const c = await cr.json();
        cid = c.id;
        setCurrentId(cid);
        loadConversations();
      }
      const res = await fetch(`/api/ai/conversations/${cid}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) throw new Error("Envoi échoué");
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: data.messageId,
          userMessage: data.userMessage,
          aiResponse: data.aiResponse,
          createdAt: new Date().toISOString(),
        },
      ]);
      setInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--bpm-accent)" }}>
        Module IA
      </h1>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Assistant conversationnel (Claude, GPT, Gemini, Grok). Configurez une clé API dans Paramètres pour les réponses réelles.
      </p>

      {error && (
        <Panel variant="error" title="Erreur" className="mb-4">
          {error}
        </Panel>
      )}

      <div className="flex gap-4 flex-1 min-h-0">
        <aside
          className="w-48 shrink-0 overflow-y-auto rounded-lg border p-2"
          style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)" }}
        >
          <Button variant="outline" className="w-full mb-2" onClick={startNew}>
            Nouvelle conversation
          </Button>
          {loading ? (
            <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Chargement...</p>
          ) : (
            <ul className="space-y-1">
              {conversations.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setCurrentId(c.id)}
                    className="w-full text-left text-sm p-2 rounded truncate block"
                    style={{
                      background: currentId === c.id ? "var(--bpm-accent-light)" : "transparent",
                      color: "var(--bpm-text-primary)",
                    }}
                  >
                    {c.preview || "Sans titre"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <div className="flex-1 flex flex-col min-w-0 rounded-lg border overflow-hidden" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && !currentId && (
              <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
                Démarrer une nouvelle conversation ou sélectionnez une conversation existante.
              </p>
            )}
            {messages.map((m) => (
              <div key={m.id} className="space-y-2">
                <div className="text-sm font-medium" style={{ color: "var(--bpm-accent)" }}>Vous</div>
                <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--bpm-text-primary)" }}>{m.userMessage}</p>
                <div className="text-sm font-medium" style={{ color: "var(--bpm-accent)" }}>IA</div>
                <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--bpm-text-secondary)" }}>{m.aiResponse}</p>
              </div>
            ))}
          </div>
          <form
            className="p-4 border-t flex gap-2"
            style={{ borderColor: "var(--bpm-border)" }}
            onSubmit={(e) => {
              e.preventDefault();
              createAndSend();
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écrivez votre message..."
              className="flex-1 px-3 py-2 rounded border text-sm"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
            />
            <Button type="submit" disabled={sending || !input.trim()}>
              {sending ? "Envoi..." : "Envoyer"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
