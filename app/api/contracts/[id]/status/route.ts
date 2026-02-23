import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const { id } = await params;
  const contract = await prisma.contract.findUnique({
    where: { id },
    select: { id: true, status: true, analysisProgress: true, uploadedById: true },
  });
  if (!contract || contract.uploadedById !== user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    status: contract.status,
    analysisProgress: contract.analysisProgress,
  });
}
