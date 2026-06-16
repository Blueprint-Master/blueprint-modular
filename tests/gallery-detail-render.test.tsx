/**
 * Rendu de la vue détail galerie (chaîne prompt → structure → app).
 *
 * On rend le composant RÉEL via `renderToStaticMarkup` et l'on vérifie :
 *   - app AVEC appSpec → 3 étapes (prompt, structure, capture), structure
 *     rendue en UI lisible (entités/modules/KPIs), JAMAIS de JSON brut ;
 *   - app SANS appSpec (null) → 2 étapes seulement (prompt + capture), aucune
 *     section structure, aucun « 0 entité ».
 */
import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { GenerationChain, type GenerationChainLabels } from "@/app/(public)/(site)/galerie/[id]/GenerationChain";
import type { CuratedApp } from "@/lib/gallery/types";

const LABELS: GenerationChainLabels = {
  stepPromptTitle: "La demande",
  stepStructureTitle: "La structure générée",
  stepAppTitle: "L'application",
  narrative: "Dérivée déterministiquement.",
  entitiesTitle: "Entités",
  modulesTitle: "Modules",
  kpisTitle: "Indicateurs",
  fieldColLabel: "Champ",
  fieldColType: "Type",
  fieldColRequired: "Obligatoire",
  requiredYes: "Obligatoire",
  requiredNo: "Optionnel",
  fieldsCount: "{n} champs",
  moduleColLabel: "Module",
  moduleColEntity: "Entité",
  noEntity: "—",
  screenshotAlt: "Capture",
  noShot: "Aperçu indisponible",
};

const APP_WITH_SPEC: CuratedApp = {
  id: "app-1",
  title: "Suivi de production",
  prompt: "Crée un tableau de bord de production avec alertes.",
  screenshotUrl: "/shot.png",
  createdAt: "2026-05-28T09:12:00.000Z",
  appSpec: {
    entities: [
      {
        name: "Ligne",
        label: "Ligne de production",
        labelPlural: "Lignes",
        fields: [
          { name: "nom", label: "Nom de la ligne", type: "string", required: true },
          { name: "rendement", label: "Rendement", type: "number", required: false },
        ],
      },
    ],
    modules: [
      { key: "dash", label: "Tableau de bord", layout: "kpi-overview", entity: null },
      { key: "lignes", label: "Lignes", layout: "crud-table", entity: "Ligne" },
    ],
    kpis: [{ label: "Rendement moyen", unit: "%", aggregation: "avg", entity: "Ligne" }],
  },
};

const APP_NO_SPEC: CuratedApp = {
  id: "app-2",
  title: "App sans structure",
  prompt: "Un utilitaire simple.",
  screenshotUrl: "/shot2.png",
  createdAt: "2026-05-20T00:00:00.000Z",
  appSpec: null,
};

describe("GenerationChain — app AVEC appSpec : 3 étapes + structure lisible", () => {
  const html = renderToStaticMarkup(<GenerationChain app={APP_WITH_SPEC} labels={LABELS} />);

  it("affiche les 3 étapes dans l'ordre prompt → structure → app", () => {
    expect(html).toContain("La demande");
    expect(html).toContain("La structure générée");
    expect(html).toContain("application"); // "L&#x27;application" échappé par React
    // Trois pastilles numérotées (1, 2, 3).
    expect(html).toContain(">1<");
    expect(html).toContain(">2<");
    expect(html).toContain(">3<");
  });

  it("rend le prompt, les entités, modules et KPIs en UI lisible", () => {
    expect(html).toContain(APP_WITH_SPEC.prompt);
    expect(html).toContain("Entités");
    expect(html).toContain("Ligne de production");
    expect(html).toContain("Nom de la ligne");
    expect(html).toContain("Modules");
    expect(html).toContain("Tableau de bord");
    expect(html).toContain("Indicateurs");
    expect(html).toContain("Rendement moyen");
  });

  it("ne contient JAMAIS de JSON brut de l'AppSpec", () => {
    expect(html).not.toContain('"entities"');
    expect(html).not.toContain('"labelPlural"');
    expect(html).not.toContain('"aggregation"');
    expect(html).not.toMatch(/\{&quot;|\{"/); // pas d'objet sérialisé échappé ou non
  });
});

describe("GenerationChain — app SANS appSpec : 2 étapes, pas de structure", () => {
  const html = renderToStaticMarkup(<GenerationChain app={APP_NO_SPEC} labels={LABELS} />);

  it("affiche prompt + capture, mais aucune section structure", () => {
    expect(html).toContain("La demande");
    expect(html).toContain("application"); // "L&#x27;application" échappé par React
    expect(html).not.toContain("La structure générée");
    expect(html).not.toContain("Entités");
    expect(html).not.toContain("Modules");
    expect(html).not.toContain("Indicateurs");
    expect(html).not.toContain("Dérivée déterministiquement.");
  });

  it("numérote l'app comme étape 2 (pas 3), sans pastille 3", () => {
    expect(html).toContain(">1<");
    expect(html).toContain(">2<");
    expect(html).not.toContain(">3<");
  });
});
