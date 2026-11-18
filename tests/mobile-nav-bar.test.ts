import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// 18/11, retour de Rémi : un liseré bleu clair séparait la barre basse du contenu.
// La barre est translucide et floutée : elle se détache sans trait.
describe("barre de navigation basse (téléphone)", () => {
  it("ne porte aucune bordure", () => {
    const src = readFileSync("components/Sidebar/Sidebar.tsx", "utf8");
    const bar = src.slice(src.indexOf("const mobileNavBar"), src.indexOf("navItems.map"));
    expect(bar).not.toMatch(/\bborder-t\b/);
    expect(bar).not.toMatch(/borderColor/);
  });
});
