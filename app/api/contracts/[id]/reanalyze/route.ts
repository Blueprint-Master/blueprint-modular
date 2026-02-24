import { NextResponse } from "next/server";
import { getSessionOrTestUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import { extractTextFromBuffer } from "@/lib/contract-extract";
import { analyzeContract, type ContractType } from "@/lib/ai/contract-analyzer";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await getSessionOrTestUser();
  if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user } = result;
  const { id } = await params;
  const contract = await prisma.contract.findUnique({ where: { id } });
  if (!contract || contract.uploadedById !== user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.contract.update({
    where: { id },
    data: { status: "analyzing", analysisProgress: 0 },
  });

  try {
    const buf = await readFile(contract.filePath);
    const ext = contract.originalFilename.toLowerCase();
    const mime =
      ext.endsWith(".pdf") ? "application/pdf"
      : ext.endsWith(".docx") ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      : "text/plain";
    const text = await extractTextFromBuffer(buf, mime, contract.originalFilename);
    await prisma.contract.update({
      where: { id },
      data: { analysisProgress: 30 },
    });
    const extractedData = await analyzeContract(text, contract.contractType as ContractType);
    await prisma.contract.update({
      where: { id },
      data: {
        status: "done",
        analysisProgress: 100,
        extractedData: extractedData as object,
        analyzedAt: new Date(),
      },
    });
  } catch {
    await prisma.contract.update({
      where: { id },
      data: { status: "error", analysisProgress: 0 },
    });
  }

  const updated = await prisma.contract.findUniqueOrThrow({ where: { id } });
  return NextResponse.json(updated);
}
