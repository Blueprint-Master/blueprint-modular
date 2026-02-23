import Link from "next/link";
import { AIChat } from "@/components/AIChat/AIChat";

export default function IAPage() {
  return (
    <div style={{ height: "calc(100vh - 64px)", display: "flex", flexDirection: "column" }}>
      <div className="doc-page-header" style={{ flexShrink: 0 }}>
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → IA</div>
        <h1>IA</h1>
        <p className="doc-description">
          Assistant conversationnel branché sur Ollama (Qwen2.5:7b) par défaut. Contexte Wiki et Documents. Claude en fallback si configuré.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Ollama</span>
          <span className="doc-reading-time">⏱ 1 min</span>
        </div>
      </div>
      <div style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
        <AIChat />
      </div>
    </div>
  );
}
