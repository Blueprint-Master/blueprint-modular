import { describe, expect, it } from "vitest";
import { judgmentLabel, interpret } from "@/components/bpm/interpret";

// L'écart affiché sous une métrique doit être le MÊME nombre que la valeur et le
// delta : locale française, pas d'arrondi à l'entier, unité d'écart. Relevé le 19/11
// (recette du tableau de bord de marge) : « +1235 » sous « +1 234,5 € », « −1.2 ».
describe("judgmentLabel : même écriture que la valeur", () => {
  it("garde la décimale et les séparateurs français, avec l'unité monétaire", () => {
    const j = interpret(128450, { reference: 127215.5, direction: "higher_is_better" });
    expect(judgmentLabel(j, { locale: "fr-FR", unit: "€" })).toMatch(/\+1\s234,5\s€ vs repère/u);
  });
  it("exprime un écart de taux en points avec une virgule", () => {
    const j = interpret(41.5, { reference: 42.7, direction: "higher_is_better" });
    expect(judgmentLabel(j, { locale: "fr-FR", unit: "pt" })).toMatch(/^▼ −1,2\spt vs repère/u);
  });
  it("sans option, reste en français et sans unité", () => {
    const j = interpret(41.5, { reference: 42.7, direction: "higher_is_better" });
    expect(judgmentLabel(j)).toMatch(/−1,2 vs repère/u);
  });
});
