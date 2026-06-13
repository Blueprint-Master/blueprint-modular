"use client";

import { useState } from "react";
import Link from "next/link";
import { ChatInterface, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import type { ChatMessage } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  components: "Composants",
  description: "Interface de chat (messages, saisie, streaming).",
  category: "IA & Spécialisés",
  demoUser: "Bonjour !",
  demoAssistant: "Bonjour, comment puis-je vous aider ?",
  simulatedReply: "Réponse simulée à : ",
  placeholderDefault: "Écrivez votre message...",
  systemContextPlaceholder: "Contexte système (optionnel)",
  copy: "Copier",
  default: "Défaut",
  required: "Requis",
  descriptionCol: "Description",
  yes: "Oui",
  no: "Non",
  examples: "Exemples",
  descMessages: "Liste des messages (id, role, content, timestamp?).",
  descOnSend: "Envoi d’un message utilisateur.",
  descIsLoading: "Affiche un indicateur de chargement (réponse en cours).",
  descPlaceholder: "Placeholder du champ de saisie.",
  descSystemContext: "Contexte système affiché en haut si défini.",
  descHeight: "Hauteur du conteneur.",
  descClassName: "Classes CSS.",
};
const en: typeof fr = {
  components: "Components",
  description: "Chat interface (messages, input, streaming).",
  category: "AI & Specialized",
  demoUser: "Hello!",
  demoAssistant: "Hello, how can I help you?",
  simulatedReply: "Simulated reply to: ",
  placeholderDefault: "Type your message...",
  systemContextPlaceholder: "System context (optional)",
  copy: "Copy",
  default: "Default",
  required: "Required",
  descriptionCol: "Description",
  yes: "Yes",
  no: "No",
  examples: "Examples",
  descMessages: "List of messages (id, role, content, timestamp?).",
  descOnSend: "Sending a user message.",
  descIsLoading: "Shows a loading indicator (reply in progress).",
  descPlaceholder: "Placeholder for the input field.",
  descSystemContext: "System context shown at the top when set.",
  descHeight: "Container height.",
  descClassName: "CSS classes.",
};
const L = { fr, en } as const;

export default function DocChatInterfacePage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: "1", role: "user", content: t.demoUser },
    { id: "2", role: "assistant", content: t.demoAssistant },
  ]);
  const [placeholder, setPlaceholder] = useState(t.placeholderDefault);
  const [systemContext, setSystemContext] = useState("");
  const [height, setHeight] = useState("100%");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = (content: string) => {
    const userMsg: ChatMessage = { id: String(Date.now()), role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: String(Date.now() + 1), role: "assistant", content: t.simulatedReply + content },
      ]);
      setIsLoading(false);
    }, 500);
  };

  const pyPlaceholder = placeholder !== t.placeholderDefault ? `, placeholder="${placeholder.replace(/"/g, '\\"')}"` : "";
  const pySystemContext = systemContext.trim() ? `, systemContext="${systemContext.trim().replace(/"/g, '\\"')}"` : "";
  const pyHeight = height !== "100%" ? `, height="${height.replace(/"/g, '\\"')}"` : "";
  const pyLoading = isLoading ? ", isLoading=True" : "";
  const pythonCode = `bpm.chatInterface(messages=msgs, onSend=handle_send${pyPlaceholder}${pySystemContext}${pyHeight}${pyLoading})`;
  const { prev, next } = getPrevNext("chatinterface");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">{t.components}</Link> → bpm.chatInterface</div>
        <h1>bpm.chatInterface</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview" style={{ height: 340 }}>
          <ChatInterface
            messages={messages}
            onSend={handleSend}
            placeholder={placeholder}
            systemContext={systemContext.trim() || undefined}
            height={height}
            isLoading={isLoading}
          />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>placeholder</label>
            <input type="text" value={placeholder} onChange={(e) => setPlaceholder(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>systemContext</label>
            <input type="text" value={systemContext} onChange={(e) => setSystemContext(e.target.value)} placeholder={t.systemContextPlaceholder} />
          </div>
          <div className="sandbox-control-group">
            <label>height</label>
            <input type="text" value={height} onChange={(e) => setHeight(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>isLoading</label>
            <select value={isLoading ? "true" : "false"} onChange={(e) => setIsLoading(e.target.value === "true")}>
              <option value="false">false</option>
              <option value="true">true</option>
            </select>
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>{t.copy}</button>
          </div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>

      <table className="props-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>{t.default}</th>
            <th>{t.required}</th>
            <th>{t.descriptionCol}</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>messages</code></td><td><code>ChatMessage[]</code></td><td>—</td><td>{t.yes}</td><td>{t.descMessages}</td></tr>
          <tr><td><code>onSend</code></td><td><code>(content: string) =&gt; void</code></td><td>—</td><td>{t.yes}</td><td>{t.descOnSend}</td></tr>
          <tr><td><code>isLoading</code></td><td><code>boolean</code></td><td>false</td><td>{t.no}</td><td>{t.descIsLoading}</td></tr>
          <tr><td><code>placeholder</code></td><td><code>string</code></td><td>&quot;{t.placeholderDefault}&quot;</td><td>{t.no}</td><td>{t.descPlaceholder}</td></tr>
          <tr><td><code>systemContext</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.descSystemContext}</td></tr>
          <tr><td><code>height</code></td><td><code>string</code></td><td>100%</td><td>{t.no}</td><td>{t.descHeight}</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.descClassName}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'bpm.chatInterface(messages=msgs, onSend=send_message)'} language="python" />
      <CodeBlock code={'bpm.chatInterface(messages=msgs, onSend=send_message, isLoading=loading)'} language="python" />
      <CodeBlock code={'bpm.chatInterface(messages=msgs, onSend=send_message, systemContext="Assistant support client")'} language="python" />
      <CodeBlock code={'bpm.chatInterface(messages=msgs, onSend=send_message, placeholder="Posez votre question...", height="400px")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
