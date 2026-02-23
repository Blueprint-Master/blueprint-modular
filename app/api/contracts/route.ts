import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { extractTextFromBuffer, computeFileHash } from "@/lib/contract-extract";
import { analyzeContract, type ContractType } from "@/lib/ai/contract-analyzer";

export const dynamic = "force-dynamic";

const ALLOWED_MIMES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];
const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const workspace = searchParams.get("workspace");
  const contractType = searchParams.get("contractType");
  const status = searchParams.get("status");

  const where: { uploadedById: string; workspace?: string; contractType?: string; status?: string } = {
    uploadedById: user.id,
  };
  if (workspace && ["nxtfood", "beam"].includes(workspace)) where.workspace = workspace;
  if (contractType && ["supplier", "cgv", "other"].includes(contractType)) where.contractType = contractType;
  if (status && ["pending", "analyzing", "done", "error"].includes(status)) where.status = status;

  const contracts = await prisma.contract.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      contractType: true,
      workspace: true,
      originalFilename: true,
      status: true,
      analysisProgress: true,
      extractedData: true,
      createdAt: true,
      analyzedAt: true,
    },
  });

  const list = contracts.map((c) => ({
    ...c,
    overall_risk_level: (c.extractedData as { overall_risk_level?: string } | null)?.overall_risk_level ?? null,
    supplier_name: (c.extractedData as { supplier_name?: string } | null)?.supplier_name ?? null,
    contract_date: (c.extractedData as { contract_date?: string } | null)?.contract_date ?? null,
    end_date: (c.extractedData as { end_date?: string } | null)?.end_date ?? null,
  }));

  return NextResponse.json(list);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const workspace = (formData.get("workspace") as string) || "nxtfood";
  const contractType = (formData.get("contractType") as string) || "other";

  if (!file || file.size === 0) return NextResponse.json({ error: "file required" }, { status: 400 });
  if (file.size > MAX_FILE_BYTES) return NextResponse.json({ error: "File too large" }, { status: 400 });
  if (!ALLOWED_MIMES.includes(file.type))
    return NextResponse.json({ error: "Only PDF, DOCX and TXT are accepted" }, { status: 400 });
  if (!["nxtfood", "beam"].includes(workspace))
    return NextResponse.json({ error: "workspace must be nxtfood or beam" }, { status: 400 });
  const ct = contractType as ContractType;
  if (!["supplier", "cgv", "other"].includes(ct))
    return NextResponse.json({ error: "contractType must be supplier, cgv or other" }, { status: 400 });

  const buf = Buffer.from(await file.arrayBuffer());
  const fileHash = computeFileHash(buf);
  const existing = await prisma.contract.findFirst({
    where: { fileHash, uploadedById: user.id },
  });
  if (existing) return NextResponse.json({ error: "Un contrat avec le même fichier existe déjà" }, { status: 409 });

  const baseDir = path.join(process.cwd(), "uploads", "contracts", user.id);
  await mkdir(baseDir, { recursive: true });
  const ext = path.extname(file.name) || ".pdf";
  const title = path.basename(file.name, ext) || file.name;
  const contract = await prisma.contract.create({
    data: {
      title,
      contractType: ct,
      workspace,
      filePath: path.join(baseDir, `temp-${Date.now()}${ext}`),
      fileHash,
      originalFilename: file.name,
      fileSizeBytes: file.size,
      status: "analyzing",
      analysisProgress: 0,
      uploadedById: user.id,
    },
  });
  const filePath = path.join(baseDir, `${contract.id}${ext}`);
  await writeFile(filePath, buf);
  await prisma.contract.update({
    where: { id: contract.id },
    data: { filePath },
  });

  try {
    const text = await extractTextFromBuffer(buf, file.type, file.name);
    await prisma.contract.update({
      where: { id: contract.id },
      data: { analysisProgress: 30 },
    });
    const extractedData = await analyzeContract(text, ct);
    await prisma.contract.update({
      where: { id: contract.id },
      data: {
        status: "done",
        analysisProgress: 100,
        extractedData: extractedData as object,
        analyzedAt: new Date(),
      },
    });
  } catch {
    await prisma.contract.update({
      where: { id: contract.id },
      data: { status: "error", analysisProgress: 0 },
    });
  }

  const updated = await prisma.contract.findUniqueOrThrow({ where: { id: contract.id } });
  return NextResponse.json(updated);
}
