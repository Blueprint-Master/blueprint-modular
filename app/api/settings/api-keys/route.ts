import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encrypt";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const keys = await prisma.apiKey.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, provider: true, isActive: true, createdAt: true },
  });
  return NextResponse.json(keys.map((k) => ({ ...k, keyMasked: "••••••••" })));
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const body = (await request.json()) as { provider: string; key: string };
  const provider = (body.provider ?? "").trim();
  const key = (body.key ?? "").trim();
  if (!provider || !key) return NextResponse.json({ error: "provider and key required" }, { status: 400 });
  let keyEncrypted: string;
  try {
    keyEncrypted = encrypt(key);
  } catch (e) {
    return NextResponse.json({ error: "Encryption not configured (ENCRYPTION_SECRET)" }, { status: 500 });
  }
  const created = await prisma.apiKey.create({
    data: { userId: user.id, provider, keyEncrypted, isActive: true },
  });
  return NextResponse.json({ id: created.id, provider: created.provider, isActive: created.isActive });
}
