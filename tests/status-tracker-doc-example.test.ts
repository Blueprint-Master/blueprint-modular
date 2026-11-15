/**
 * L'EXEMPLE DOCUMENTÉ DE bpm.statusTracker EMPLOIE LA CLÉ QUE LE COMPOSANT LIT.
 *
 * La JSDoc écrivait `{ label, state: "completed" }` alors que le composant lit
 * `s.status`. L'exemple est recopié dans `public/llms.txt`, donc dans ce que
 * lisent les modèles et les intégrateurs : le générateur du Maker l'a repris
 * mot pour mot, et la piste de statut de ses fiches détail est restée grise sur
 * toutes les apps (aucune étape « faite » ni « courante »). Trouvé le 15/11, le
 * jour où la publication des types a rendu l'erreur visible au compilateur.
 */
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const SOURCE = readFileSync("components/bpm/StatusTracker.tsx", "utf8");

describe("bpm.statusTracker — exemple de documentation", () => {
  it("la clé d'étape est celle de l'interface, et l'exemple l'emploie", () => {
    const iface = SOURCE.match(/export interface StatusTrackerStage \{([\s\S]*?)\n\}/)?.[1] ?? "";
    expect(iface).toMatch(/\bstatus:/);
    expect(iface).not.toMatch(/\bstate\??:/);

    const exemple = SOURCE.match(/@example\s*\n\s*\*\s*(bpm\.statusTracker\(.*\))/)?.[1] ?? "";
    expect(exemple, "exemple introuvable").not.toBe("");
    expect(exemple).toMatch(/status: "completed"/);
    expect(exemple).not.toMatch(/\bstate:/);
  });

  it("le llms.txt publié a été régénéré depuis la source", () => {
    const llms = readFileSync("public/llms.txt", "utf8");
    const ligne = llms.split("\n").find((l) => l.startsWith("@component bpm.statusTracker")) ?? "";
    expect(ligne).toContain('status: "completed"');
    expect(ligne).not.toMatch(/\bstate: "/);
  });
});
