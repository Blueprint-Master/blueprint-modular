import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateEmbedding, cosineSimilarity } from "@/lib/ai/embedding-client";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user } = result;

  const body = (await request.json().catch(() => ({}))) as { query?: string; workspace?: string; limit?: number };
  const { query, workspace, limit = 5 } = body;
  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return NextResponse.json({ error: "query requis" }, { status: 400 });
  }

  const queryEmbedding = await generateEmbedding(query);

  const where: { uploadedById: string; workspace?: string; embeddingVector: { not: null } } = {
    uploadedById: user.id,
    embeddingVector: { not: null },
  };
  if (workspace && ["nxtfood", "beam"].includes(workspace)) where.workspace = workspace;

  const contracts = await prisma.contract.findMany({
    where,
    select: {
      id: true,
      title: true,
      workspace: true,
      contractType: true,
      embeddingVector: true,
      extractedData: true,
      originalFilename: true,
    },
  });

  const scored = contracts
    .map((c) => {
      try {
        const vector = JSON.parse(c.embeddingVector!) as number[];
        return { ...c, score: cosineSimilarity(queryEmbedding, vector) };
      } catch {
        return null;
      }
    })
    .filter((c): c is NonNullable<typeof c> => c !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return NextResponse.json({
    query,
    results: scored.map((c) => ({
      id: c.id,
      title: c.title,
      workspace: c.workspace,
      contractType: c.contractType,
      originalFilename: c.originalFilename,
      score: Math.round(c.score * 100) / 100,
      supplier_name: (c.extractedData as { supplier_name?: string } | null)?.supplier_name ?? null,
      end_date: (c.extractedData as { end_date?: string } | null)?.end_date ?? null,
      overall_risk_level: (c.extractedData as { overall_risk_level?: string } | null)?.overall_risk_level ?? null,
    })),
  });
}
