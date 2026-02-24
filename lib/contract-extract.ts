/**
 * Extraction de texte depuis PDF et DOCX (côté serveur).
 * pdf-parse v2 : PDFParse({ data }) + getText() → TextResult.text
 */

export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: string,
  filename: string
): Promise<string> {
  if (mimeType === "application/pdf" || filename.toLowerCase().endsWith(".pdf")) {
    let extractedText = "";
    try {
      const pdf = (await import("pdf-parse")) as {
        PDFParse?: new (opts: { data: Buffer | Uint8Array }) => { getText: () => Promise<{ text: string }> };
        default?: (buf: Buffer) => Promise<{ text?: string }>;
      };
      if (pdf?.PDFParse) {
        const parser = new pdf.PDFParse({ data: buffer });
        const result = await parser.getText();
        extractedText = (result as { text?: string })?.text ?? "";
      } else if (typeof pdf?.default === "function") {
        const data = await pdf.default(buffer);
        extractedText = data?.text ?? "";
      }
    } catch (err) {
      console.error("[contract-extract] PDF extraction failed:", err instanceof Error ? err.message : String(err));
    }

    // Si le texte extrait est trop court (< 200 chars), c'est probablement un PDF scanné
    // On tente une extraction via Qwen3-VL sur la première page
    if (extractedText.length < 200 && mimeType === "application/pdf") {
      try {
        const { extractTextFromImage } = await import("@/lib/ai/vision-client");
        const { fromBuffer } = await import("pdf2pic");

        const converter = fromBuffer(buffer, {
          density: 150,
          saveFilename: "page",
          savePath: "/tmp",
          format: "jpeg",
          width: 1200,
          height: 1600,
        });

        const pageImage = await converter(1, { responseType: "base64" });
        const base64 = typeof pageImage === "string" ? pageImage : (pageImage as { base64?: string })?.base64;
        if (base64) {
          const visionText = await extractTextFromImage(base64, "image/jpeg");
          if (visionText.length > extractedText.length) {
            extractedText = visionText;
          }
        }
      } catch (visionErr) {
        console.warn(
          "[contract-extract] Vision fallback échoué:",
          visionErr instanceof Error ? visionErr.message : String(visionErr)
        );
      }
    }

    return extractedText;
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    filename.toLowerCase().endsWith(".docx")
  ) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value ?? "";
  }

  if (mimeType === "text/plain" || filename.toLowerCase().endsWith(".txt")) {
    return buffer.toString("utf-8");
  }

  throw new Error(`Type de fichier non supporté: ${mimeType}`);
}

export function computeFileHash(buffer: Buffer): string {
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(buffer).digest("hex");
}
