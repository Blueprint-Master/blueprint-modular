import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";

// Décision du 18/11 : le logo ne vit plus DANS l'interface (barre de titre, nav vitrine,
// sidebar). Il ne sert qu'à l'icône d'application (smartphone, ordinateur) et au favicon.
const UI = ["components/AppLayoutClient.tsx", "components/site/SiteNav.tsx", "components/Sidebar/Sidebar.tsx"];

describe("logo hors de l'interface", () => {
  it.each(UI.filter((f) => existsSync(f)))("%s n'affiche pas la marque", (f) => {
    const src = readFileSync(f, "utf8");
    expect(src).not.toMatch(/BRAND_MARK_SRC/);
    expect(src).not.toMatch(/brand-logo/);
  });

  it("la marque reste servie comme icône et favicon", () => {
    const manifest = readFileSync("app/manifest.ts", "utf8");
    expect(manifest).toMatch(/icons/);
    const layout = readFileSync("app/layout.tsx", "utf8");
    expect(layout).toMatch(/icon/);
  });
});
