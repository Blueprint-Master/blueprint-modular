"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button, Checkbox } from "@/components/bpm";
import { moduleRegistry } from "@/lib/ai/module-registry";

type MessageRole = "user" | "assistant";
type ChatMessage = { role: MessageRole; content: string };
type ProviderId = "vllm" | "claude" | "openai" | "gemini" | "grok";

const PROVIDER_LABELS: Record<ProviderId, string> = {
  vllm: "Ollama",
  claude: "Claude",
  openai: "OpenAI",
  gemini: "Gemini",
  grok: "Grok",
};

export function AIChat() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [provider, setProvider] = useState<ProviderId>("vllm");
  const [health, setHealth] = useState<{ available: boolean; model?: string } | null>(null);
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);
  const [modules, setModules] = useState(moduleRegistry.getAllModules());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setModules(moduleRegistry.getAllModules());
  }, []);

  useEffect(() => {
    fetch("/api/ai/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth({ available: false }));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const send = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setStreaming(true);
    setStreamingContent("");

    const history = messages
      .concat([{ role: "user", content: text }])
      .map((m) => ({ role: m.role, content: m.content }));

    let contextFromModules: string | undefined;
    if (selectedModuleIds.length > 0) {
      const { text: ctx } = await moduleRegistry.buildContext(selectedModuleIds);
      contextFromModules = ctx;
    }

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          provider_name: provider as string,
          conversation_history: history.slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
          context_from_modules: contextFromModules,
        }),
      });
      if (!res.ok) {
        setStreamingContent(`Erreur: ${res.status}`);
        setStreaming(false);
        return;
      }
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6)) as { type: string; t?: string; message?: string };
                if (data.type === "chunk" && data.t) {
                  full += data.t;
                  setStreamingContent(full);
                }
                if (data.type === "error") {
                  setStreamingContent((prev) => prev + `\n[Erreur: ${data.message}]`);
                }
              } catch {
                // ignore parse errors
              }
            }
          }
        }
      }
      setMessages((prev) => [...prev, { role: "assistant", content: full || streamingContent }]);
      setStreamingContent("");
    } catch (err) {
      setStreamingContent(`Erreur: ${err instanceof Error ? err.message : "Réseau"}`);
    } finally {
      setStreaming(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="p-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Chargement...
      </div>
    );
  }
  if (!session) {
    return (
      <div className="p-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Connectez-vous pour utiliser l&apos;assistant IA.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 rounded-lg border" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)" }}>
      <div className="flex items-center gap-2 p-2 border-b flex-wrap" style={{ borderColor: "var(--bpm-border)" }}>
        {health && (
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ background: health.available ? "var(--bpm-accent-mint)" : "var(--bpm-accent)" }}
            title={health.available ? health.model : "IA indisponible"}
          />
        )}
        <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Modèle:</span>
        {(["vllm", "claude", "openai", "gemini", "grok"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setProvider(p)}
            className={`px-2 py-1 rounded text-sm ${provider === p ? "btn-primary" : "btn-secondary"}`}
          >
            {PROVIDER_LABELS[p]}
          </button>
        ))}
        {health?.model && (
          <span className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
            {health.model}
          </span>
        )}
      </div>
      {modules.length > 0 && (
        <div className="flex items-center gap-2 p-2 border-b flex-wrap" style={{ borderColor: "var(--bpm-border)" }}>
          <span className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>Contexte:</span>
          {modules.map((m) => (
            <label key={m.moduleId} className="flex items-center gap-1.5 text-sm cursor-pointer">
              <Checkbox
                checked={selectedModuleIds.includes(m.moduleId)}
                onChange={(checked) =>
                  setSelectedModuleIds((prev) =>
                    checked ? [...prev, m.moduleId] : prev.filter((id) => id !== m.moduleId)
                  )
                }
                label=""
              />
              <span style={{ color: "var(--bpm-text-primary)" }}>{m.label}</span>
            </label>
          ))}
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 && !streamingContent && (
          <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
            Posez une question. Ollama (Qwen2.5) par défaut ; choisissez un autre modèle dans la barre ci-dessus si besoin.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className="space-y-1">
            <div className="text-xs font-medium" style={{ color: m.role === "user" ? "var(--bpm-accent)" : "var(--bpm-accent-mint)" }}>
              {m.role === "user" ? "Vous" : "IA"}
            </div>
            <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--bpm-text-primary)" }}>{m.content}</p>
          </div>
        ))}
        {streamingContent && (
          <div className="space-y-1">
            <div className="text-xs font-medium" style={{ color: "var(--bpm-accent-mint)" }}>IA</div>
            <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--bpm-text-primary)" }}>{streamingContent}</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <form
        className="p-4 border-t flex gap-2"
        style={{ borderColor: "var(--bpm-border)" }}
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Écrivez votre message..."
          className="flex-1 px-3 py-2 rounded border text-sm"
          style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)", color: "var(--bpm-text-primary)" }}
        />
        <Button type="submit" disabled={streaming || !input.trim()}>
          {streaming ? "..." : "Envoyer"}
        </Button>
      </form>
    </div>
  );
}
