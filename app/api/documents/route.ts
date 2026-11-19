import { z } from "zod";
import { NextResponse } from "next/server";
import { getPersonalModuleSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { vllmClient } from "@/lib/ai/vllm-client";
import { extractTextFromBuffer } from "@/lib/contract-extract";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { documentMime, documentMaxBytes } from "@/lib/documents/formats";

const analysis = z.object({
  summary: z.string().trim().min(1),
  supplier: z.string().nullish(), client: z.string().nullish(),
  contract_date: z.string().date().nullish(), signature_date: z.string().date().nullish(),
  termination_date: z.string().date().nullish(), key_points: z.array(z.string()).nullish(),
  commitments: z.array(z.string()).nullish(),
});

export async function GET() {
  const result = await getPersonalModuleSession();
  if (!result) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { user } = result;
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
      terminationDate: true,
      summary: true,
      createdAt: true,
    },
  });
  return NextResponse.json(docs);
}

export async function POST(request: Request) {
  const result = await getPersonalModuleSession();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { user } = result;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
  const file = formData.get("file");
  if (!file || typeof file === "string" || !file.size) {
    return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
  }
  if (file.size > documentMaxBytes) return NextResponse.json({ error: "Limite de 50 Mo par fichier" }, { status: 413 });
  const mime = documentMime(file);
  if (!mime) return NextResponse.json({ error: "Formats acceptés : PDF, DOCX et TXT" }, { status: 415 });

  const ext = path.extname(file.name) || ".pdf";
  const baseDir = path.resolve(process.env.MODULAR_UPLOAD_DIR || "uploads", user.id);
  const docId = crypto.randomUUID();
  const filePath = path.join(baseDir, `${docId}${ext}`);
  let buf: Buffer;
  try {
    buf = Buffer.from(await file.arrayBuffer());
  } catch {
    return NextResponse.json({ error: "Impossible de lire le fichier" }, { status: 400 });
  }

  try {
    await mkdir(baseDir, { recursive: true });
    await writeFile(filePath, buf);
  } catch (err) {
    console.error("[documents] Write file failed:", err instanceof Error ? err.message : String(err));
    return NextResponse.json(
      { error: "Impossible d'enregistrer le fichier (droits ou espace disque). Contactez l'administrateur." },
      { status: 500 }
    );
  }

  let doc = await prisma.document.create({
    data: {
      id: docId,
      filename: file.name,
      mimeType: mime,
      filePath,
      uploadedById: user.id,
      analysisStatus: "processing",
    },
  }).catch(async error => {
    await unlink(filePath);
    throw error;
  });

  const extractPrompt = `Tu es un assistant d'extraction de données. Tu dois analyser le document fourni et répondre par UN SEUL objet JSON valide, sans aucun texte avant ou après, sans balises markdown (\`\`\`).

Format exact à respecter (copie cette structure et remplis les valeurs à partir du document ; mets null si l'information est absente) :
{"supplier":"nom du fournisseur ou null","client":"nom du client ou null","contract_date":"YYYY-MM-DD ou null","signature_date":"YYYY-MM-DD ou null","termination_date":"YYYY-MM-DD ou null","summary":"synthèse courte en 2-3 phrases","key_points":["point 1","point 2"],"commitments":["engagement 1","engagement 2"]}

Règles : supplier = partie qui fournit le service ; client = partie qui le reçoit ; dates au format ISO YYYY-MM-DD si présentes dans le document. Réponds uniquement par l'objet JSON.`;

  try {
    const rawText = (await extractTextFromBuffer(buf, mime, file.name)).slice(0, 50000);
    await prisma.document.update({
      where: { id: doc.id },
      data: { rawText },
    });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    let parsed: Record<string, unknown> | null = null;

    const extractJsonFromResponse = (text: string): Record<string, unknown> | null => {
      if (!text || typeof text !== "string") return null;
      const stripped = text.replace(/^[\s\S]*?```(?:json)?\s*/i, "").replace(/\s*```[\s\S]*$/i, "").trim();
      const match = stripped.match(/\{[\s\S]*\}/);
      if (!match) return null;
      try {
        return analysis.parse(JSON.parse(match[0]));
      } catch {
        return null;
      }
    };

    if (rawText.trim().length > 0) {
      if (apiKey) {
        const documentPayload = `${extractPrompt}\n\n---\nDocument (extrait texte) :\n${rawText.slice(0, 80000)}`;
        const Anthropic = (await import("@anthropic-ai/sdk")).default;
        const client = new Anthropic({ apiKey });
        const message = await client.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2048,
          messages: [{ role: "user", content: documentPayload }],
        });
        const textBlock = message.content.find((b) => b.type === "text") as { type: "text"; text: string } | undefined;
        parsed = extractJsonFromResponse(textBlock?.text ?? "");
      } else {
        const documentPayloadOllama = `${extractPrompt}\n\n---\nDocument (extrait texte) :\n${rawText.slice(0, 40000)}`;
        try {
          const { content } = await vllmClient.chat(
            [{ role: "user", content: documentPayloadOllama }],
            { timeout: 120_000 }
          );
          parsed = extractJsonFromResponse(content);
        } catch (ollamaErr) {
          console.error("[documents] Analyse Ollama échouée:", ollamaErr instanceof Error ? ollamaErr.message : String(ollamaErr));
          parsed = null;
        }
      }
    } else {
      console.warn("[documents] Aucun texte extrait du PDF (fichier vide ou PDF image-only).");
      await prisma.document.update({
        where: { id: doc.id },
        data: { analysisStatus: "error" },
      });
      doc = await prisma.document.findUniqueOrThrow({ where: { id: doc.id } });
      return NextResponse.json(doc);
    }

    if (parsed && typeof parsed.summary === "string" && parsed.summary.trim()) {
      const contractDate = parsed.contract_date ? new Date(String(parsed.contract_date)) : null;
      const signatureDate = parsed.signature_date ? new Date(String(parsed.signature_date)) : null;
      const terminationDate = parsed.termination_date ? new Date(String(parsed.termination_date)) : null;
      doc = await prisma.document.update({
        where: { id: doc.id },
        data: {
          analysisStatus: "done",
          supplier: typeof parsed.supplier === "string" ? parsed.supplier : null,
          client: typeof parsed.client === "string" ? parsed.client : null,
          contractDate: contractDate && !Number.isNaN(contractDate.getTime()) ? contractDate : null,
          signatureDate: signatureDate && !Number.isNaN(signatureDate.getTime()) ? signatureDate : null,
          terminationDate: terminationDate && !Number.isNaN(terminationDate.getTime()) ? terminationDate : null,
          summary: typeof parsed.summary === "string" ? parsed.summary : null,
          keyPoints: Array.isArray(parsed.key_points) ? JSON.stringify(parsed.key_points.filter(point => typeof point === "string")) : null,
          commitments: Array.isArray(parsed.commitments) ? JSON.stringify(parsed.commitments.filter(point => typeof point === "string")) : null,
        },
      });
    } else {
      await prisma.document.update({
        where: { id: doc.id },
        data: { analysisStatus: "error" },
      });
      doc = await prisma.document.findUniqueOrThrow({ where: { id: doc.id } });
    }
  } catch (err) {
    console.error("[documents] Erreur analyse document:", err instanceof Error ? err.message : String(err));
    await prisma.document.update({ where: { id: doc.id }, data: { analysisStatus: "error" } });
    doc = await prisma.document.findUniqueOrThrow({ where: { id: doc.id } });
  }

  return NextResponse.json(doc);
}

