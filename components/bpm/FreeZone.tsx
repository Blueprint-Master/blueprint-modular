"use client";

import React from "react";

export interface FreeZoneProps {
  /**
   * Nom de la zone (ex. "BrassinsHero") — exposé en `data-bpm-free-zone`
   * pour l'observabilité (K-15, critique vision, retouche ciblée).
   */
  name: string;
  children?: React.ReactNode;
}

interface FreeZoneState {
  failed: boolean;
}

/**
 * bpm.free — CADRE DE SÉCURITÉ des zones de liberté du Maker.
 *
 * Le contenu (généré côté Maker, passé par ses gates) reste libre ; ce
 * composant n'apporte AUCUNE capacité nouvelle, uniquement du cadre :
 *
 *  1. PARE-FEU RUNTIME — ErrorBoundary : une zone qui lève à l'exécution
 *     meurt seule et en silence (render null), au lieu de faire tomber
 *     toute la page. Même philosophie que le repli par zone au build,
 *     étendue au runtime.
 *  2. CONFINEMENT VISUEL — min-width 0, largeur bornée, débordement
 *     horizontal clippé : une zone créative ne casse pas la mise en page
 *     qui l'entoure.
 *  3. OBSERVABILITÉ — `data-bpm-free-zone="<name>"` : chaque zone est
 *     identifiable et mesurable individuellement sur les captures.
 *
 * Passif par construction : pas de marge ni de padding (le rythme
 * vertical appartient au contenu — une zone qui rend null ne laisse
 * aucun espace fantôme), pas d'injection HTML, pas de contournement de
 * l'API bpm.
 */
export class FreeZone extends React.Component<FreeZoneProps, FreeZoneState> {
  state: FreeZoneState = { failed: false };

  static getDerivedStateFromError(): FreeZoneState {
    return { failed: true };
  }

  componentDidCatch(error: unknown): void {
    if (typeof console !== "undefined") {
      console.warn(
        `[bpm.free] zone "${this.props.name}" désactivée après une erreur runtime :`,
        error
      );
    }
  }

  render(): React.ReactNode {
    if (this.state.failed) return null;
    return (
      <div
        className="bpm-free-zone"
        data-bpm-free-zone={this.props.name}
        style={{ minWidth: 0, maxWidth: "100%", overflowX: "hidden" }}
      >
        {this.props.children}
      </div>
    );
  }
}
