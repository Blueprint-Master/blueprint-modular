import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { BRAND_MARK_SRC } from "@/lib/brandMark";

// 18/11 : une réécriture de la marque embarquée a laissé la fin de l'ancienne image collée
// après la nouvelle. tsc et le gate passaient sur le dépôt, `next build` cassait en prod.
describe("marque embarquée", () => {
  it("est UNE data URI PNG valide, rien après", () => {
    expect(BRAND_MARK_SRC.startsWith("data:image/png;base64,")).toBe(true);
    const b64 = BRAND_MARK_SRC.slice("data:image/png;base64,".length);
    expect(b64).toMatch(/^[A-Za-z0-9+/]+=*$/);
    const png = Buffer.from(b64, "base64");
    expect(png.subarray(1, 4).toString()).toBe("PNG");
    expect(png.readUInt32BE(16)).toBe(64);
    const src = readFileSync("lib/brandMark.ts", "utf8");
    expect(src.match(/base64/g)?.length).toBe(1);
  });

  it("le déploiement ne réécrit pas le logo versionné", () => {
    const sh = readFileSync("deploy/deploy-from-git.sh", "utf8");
    expect(sh).not.toMatch(/cp -f [^\n]*public\/img\/logo-bpm\.png/);
  });
});
