import fs from "fs";
import path from "path";

/**
 * Extraction d'une section « ## bpm.x » de public/llms.txt (référence machine
 * générée). Utilisé par les fiches composants pour afficher la signature
 * d'API sans la dupliquer à la main.
 */

let cached: string | null = null;

function readLlms(): string {
  if (cached === null) {
    try {
      cached = fs.readFileSync(path.join(process.cwd(), "public", "llms.txt"), "utf-8");
    } catch {
      cached = "";
    }
  }
  return cached;
}

/** Retourne le bloc de props (entre ``` ) de la section `## <name>`, ou null. */
export function getLlmsPropsBlock(name: string): string | null {
  const source = readLlms();
  if (!source) return null;
  const header = `\n## ${name}\n`;
  const start = source.indexOf(header);
  if (start === -1) return null;
  const sectionEnd = source.indexOf("\n## ", start + header.length);
  const section = source.slice(start + header.length, sectionEnd === -1 ? undefined : sectionEnd);
  const fenceStart = section.indexOf("```");
  if (fenceStart === -1) return null;
  const fenceEnd = section.indexOf("```", fenceStart + 3);
  if (fenceEnd === -1) return null;
  const block = section.slice(fenceStart + 3, fenceEnd).trim();
  return block.length > 0 ? block : null;
}
