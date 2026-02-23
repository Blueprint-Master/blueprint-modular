/**
 * Extraction de texte depuis PDF et DOCX (côté serveur).
 */

export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: string,
  filename: string
): Promise<string> {
  if (mimeType === "application/pdf" || filename.toLowerCase().endsWith(".pdf")) {
    const pdfParse = (await import("pdf-parse")) as {
      PDFParse?: new (opts: { data: Buffer }) => { getText: () => Promise<{ text: string }> };
      default?: (buf: Buffer) => Promise<{ text: string }>;
    };
    if (pdfParse.PDFParse) {
      const parser = new pdfParse.PDFParse({ data: buffer });
      const result = await parser.getText();
      return result?.text ?? "";
    }
    if (pdfParse.default) {
      const data = await pdfParse.default(buffer);
      return data?.text ?? "";
    }
    throw new Error("pdf-parse API non reconnue");
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
