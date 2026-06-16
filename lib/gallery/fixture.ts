/**
 * Fixture locale conforme au contrat docs/contracts/maker-gallery-endpoint.md.
 *
 * Activée UNIQUEMENT via `GALLERY_USE_FIXTURE=1` (dev / CI), pour builder et
 * tester la page sans l'endpoint Maker réel. JAMAIS servie en production sans
 * opt-in explicite : en prod, l'absence de `MAKER_GALLERY_URL` = galerie vide.
 *
 * Les captures pointent vers des SVG statiques same-origin (public/gallery-fixtures/*)
 * pour un rendu sans dépendance réseau. Un item volontairement sans capture
 * (`screenshotUrl: null`) permet de tester l'état « aperçu indisponible ».
 */
import type { CuratedApp } from "./types";

export const GALLERY_FIXTURE: CuratedApp[] = [
  {
    id: "demo-suivi-production",
    title: "Suivi de production temps réel",
    prompt:
      "Crée un tableau de bord qui suit le rendement de trois lignes de production, avec une alerte quand le taux de rebut dépasse 4 %.",
    screenshotUrl: "/gallery-fixtures/app-production.svg",
    createdAt: "2026-05-28T09:12:00.000Z",
  },
  {
    id: "demo-parc-capteurs",
    title: "Cartographie d'un parc de capteurs",
    prompt:
      "Affiche sur une carte l'état de mes capteurs IoT et liste ceux qui n'ont pas émis depuis plus de 24 h.",
    screenshotUrl: "/gallery-fixtures/app-capteurs.svg",
    createdAt: "2026-05-20T14:45:00.000Z",
  },
  {
    id: "demo-revue-contrats",
    title: "Revue de contrats fournisseurs",
    prompt:
      "Liste mes contrats fournisseurs, surligne ceux qui arrivent à échéance dans 60 jours et calcule l'engagement annuel total.",
    screenshotUrl: null,
    createdAt: "2026-05-11T08:00:00.000Z",
  },
];
