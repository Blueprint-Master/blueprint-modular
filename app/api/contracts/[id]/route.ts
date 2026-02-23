import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";

export const dynamic = "force-dynamic";

async function getContractAndCheckAuth(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return { error: NextResponse.json({ error: "User not found" }, { status: 404 }) };
  const contract = await prisma.contract.findUnique({ where: { id } });
  if (!contract) return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  if (contract.uploadedById !== user.id)
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { contract, user };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await getContractAndCheckAuth(id);
  if ("error" in result) return result.error;
  return NextResponse.json(result.contract);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await getContractAndCheckAuth(id);
  if ("error" in result) return result.error;
  const { contract } = result;
  try {
    await unlink(contract.filePath).catch(() => {});
  } catch {
    // ignore
  }
  await prisma.contract.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
