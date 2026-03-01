import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getProvider, type ChatMessage } from "@/lib/ai/providers";
import { SYSTEM_PROMPT_BASE } from "@/lib/ai/prompt-templates";

export const dynamic = "force-dynamic";

async function saveConversationTurn(
  userId: string,
  discussionId: string | undefined,
  userMessage: string,
  aiResponse: string,
  providerName: string
): Promise<string> {
  const preview = userMessage.slice(0, 80) + (userMessage.length > 80 ? "…" : "");
  if (discussionId) {
    const conv = await prisma.aiConversation.findFirst({ where: { id: discussionId, userId } });
    if (conv) {
      await prisma.$transaction([
        prisma.aiMessage.create({
          data: { conversationId: conv.id, userMessage, aiResponse, providerName },
        }),
        prisma.aiConversation.update({ where: { id: conv.id }, data: { preview, updatedAt: new Date() } }),
      ]);
      return conv.id;
    }
  }
  const conv = await prisma.aiConversation.create({
    data: { userId, preview },
  });
  await prisma.aiMessage.create({
    data: { conversationId: conv.id, userMessage, aiResponse, providerName },
  });
  return conv.id;
}

export async function POST(req: Request) {
  const result = await getSessionOrTestUser();
  if (!result) return new Response("Unauthorized", { status: 401 });
  const { user } = result;

  const body = await req.json().catch(() => ({}));
  const {
    message,
    provider_name = "vllm",
    conversation_history = [],
    discussion_id,
    context_from_modules,
    page_context,
    mode,
  } = body as {
    message?: string;
    provider_name?: "claude" | "openai" | "gemini" | "grok" | "vllm" | "qwen" | "mistral";
    conversation_history?: { role: string; content: string }[];
    discussion_id?: string;
    context_from_modules?: string;
    /** Contexte de la page (composants BPM), fourni par le client via bpmComponentRegistry.buildSystemPromptContext() */
    page_context?: string;
    /** "builder" = pas de system prompt assistant (génération code). Sinon = assistant. */
    mode?: string;
  };

  const providerConfig =
    provider_name === "claude"
      ? { type: "claude" as const }
      : provider_name === "openai"
        ? { type: "openai" as const }
        : provider_name === "qwen"
          ? { type: "ollama" as const, model: process.env.AI_MODEL_QWEN ?? "qwen3:8b" }
          : provider_name === "mistral"
            ? { type: "ollama" as const, model: process.env.AI_MODEL_MISTRAL ?? "mistral:7b" }
            : undefined;

  if (!message || typeof message !== "string") {
    return new Response(JSON.stringify({ error: "message required" }), { status: 400 });
  }

  if (provider_name === "gemini" || provider_name === "grok") {
    return new Response(
      JSON.stringify({ error: `Provider ${provider_name} not implemented` }),
      { status: 400 }
    );
  }

  const provider = getProvider(providerConfig);
  const systemPrompt =
    mode === "builder"
      ? undefined
      : (() => {
          const combined = [context_from_modules, page_context]
            .filter(Boolean)
            .join("\n\n");
          return combined
            ? `${SYSTEM_PROMPT_BASE}\n\nContexte :\n---\n${combined}\n---`
            : SYSTEM_PROMPT_BASE;
        })();
  const messages: ChatMessage[] = [
    ...conversation_history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user", content: message },
  ];

  const encoder = new TextEncoder();
  let fullResponse = "";

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "start" })}\n\n`));
      try {
        await provider.chatStream(messages, (chunk) => {
          fullResponse += chunk;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "chunk", t: chunk })}\n\n`));
        }, systemPrompt);
        const savedId = await saveConversationTurn(
          user.id,
          discussion_id,
          message,
          fullResponse,
          provider.getProviderName()
        );
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "done", discussion_id: savedId })}\n\n`)
        );
      } catch (err) {
        const raw = err instanceof Error ? err.message : String(err);
        const isConnection =
          /fetch|ECONNREFUSED|timeout|ETIMEDOUT|network|Failed to fetch|Ollama 5/i.test(raw);
        const errMsg =
          isConnection && provider.getProviderName() === "ollama"
            ? "Impossible de joindre le service IA (Ollama). Vérifiez qu'Ollama est démarré (ex. http://localhost:11434) ou définissez AI_MOCK=true pour le mode démo."
            : raw;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", message: errMsg })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
