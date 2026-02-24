import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user } = result;
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
