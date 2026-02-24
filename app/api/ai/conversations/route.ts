import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const list = await prisma.aiConversation.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      messages: { orderBy: { createdAt: "asc" as const }, select: { userMessage: true, aiResponse: true, providerName: true } },
    },
  });
  const out = list.map((c) => ({
    id: c.id,
    preview: c.preview,
    createdAt: c.createdAt,
    updated_at: c.updatedAt,
    messages: c.messages.map((m) => ({ user_message: m.userMessage, ai_response: m.aiResponse, provider_name: m.providerName })),
  }));
  return NextResponse.json(out);
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const conv = await prisma.aiConversation.create({
    data: { userId: user.id },
  });
  return NextResponse.json(conv);
}
