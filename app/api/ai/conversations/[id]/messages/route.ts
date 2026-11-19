import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { getProvider, type ChatMessage } from "@/lib/ai/providers";
import { SYSTEM_PROMPT_BASE } from "@/lib/ai/prompt-templates";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user } = result;
  const { id } = await params;
  const conv = await prisma.aiConversation.findFirst({
    where: { id, userId: user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(conv.messages);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user } = result;
  const { id } = await params;
  const conv = await prisma.aiConversation.findFirst({
    where: { id, userId: user.id },
    include: { messages: { take: 12, orderBy: [{ createdAt: "desc" }, { id: "desc" }] } },
  });
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await request.json().catch(() => null);
  const userMessage = typeof body?.message === "string" ? body.message.trim() : "";
  if (!userMessage) return NextResponse.json({ error: "message required" }, { status: 400 });

  const history: ChatMessage[] = conv.messages.reverse().flatMap(turn => [
    { role: "user" as const, content: turn.userMessage },
    { role: "assistant" as const, content: turn.aiResponse },
  ]);
  const provider = getProvider();
  let aiResponse: string;
  try {
    aiResponse = await provider.chat([...history, { role: "user", content: userMessage }], SYSTEM_PROMPT_BASE);
    if (!aiResponse.trim()) throw new Error("Réponse vide");
  } catch {
    return NextResponse.json({ error: "Le fournisseur IA est indisponible" }, { status: 502 });
  }
  const preview = userMessage.slice(0, 80) + (userMessage.length > 80 ? "…" : "");

  const [msg] = await prisma.$transaction([
    prisma.aiMessage.create({
      data: {
        conversationId: conv.id,
        userMessage,
        aiResponse,
        providerName: provider.getProviderName(),
      },
    }),
    prisma.aiConversation.update({
      where: { id: conv.id },
      data: { preview, updatedAt: new Date() },
    }),
  ]);
  return NextResponse.json({ userMessage, aiResponse, messageId: msg.id });
}
