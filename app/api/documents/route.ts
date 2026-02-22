import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const docs = await prisma.document.findMany({
    where: { uploadedById: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      filename: true,
      mimeType: true,
      analysisStatus: true,
      supplier: true,
      client: true,
      contractDate: true,
      createdAt: true,
    },
  });
  return NextResponse.json(docs);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return NextResponse.json({ error: "file required" }, { status: 400 });
  const mime = file.type || "application/pdf";
  const ext = path.extname(file.name) || ".pdf";
  const baseDir = path.join(process.cwd(), "uploads");
  await mkdir(baseDir, { recursive: true });
  const docId = crypto.randomUUID();
  const filePath = path.join(baseDir, `${docId}${ext}`);
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buf);

  const doc = await prisma.document.create({
    data: {
      filename: file.name,
      mimeType: mime,
      filePath,
      uploadedById: user.id,
      analysisStatus: "pending",
    },
  });
  return NextResponse.json(doc);
}
