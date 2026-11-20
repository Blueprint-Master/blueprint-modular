import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Metric } from "@/components/bpm/Metric";

// L'artefact passe currency "" (l'unité est dans le libellé) : sans judgmentUnit,
// l'écart au repère s'affichait sans unité (« −1,2 vs repère » sous « −1,2 pt »).
describe("Metric : unité de l'écart au repère", () => {
  it("affiche l'unité fournie par judgmentUnit", () => {
    const html = renderToStaticMarkup(
      <Metric label="Marge brute (%)" value={41.5} valueDecimals={1} currency="" judgmentUnit="pt"
        context={{ reference: 42.7, direction: "higher_is_better" }} />
    );
    expect(html).toMatch(/−1,2\s*pt vs repère/u);
  });
  it("sans judgmentUnit ni devise, reste sans unité", () => {
    const html = renderToStaticMarkup(
      <Metric label="Commandes" value={380} currency="" context={{ reference: 400, direction: "higher_is_better" }} />
    );
    expect(html).toMatch(/−20 vs repère/u);
  });
});
