import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const { id } = await params;
  const conv = await prisma.aiConversation.findFirst({
    where: { id, userId: user.id },
  });
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.aiConversation.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
