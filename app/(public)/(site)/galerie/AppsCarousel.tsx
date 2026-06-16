"use client";

import { useCallback, useRef } from "react";
import Link from "next/link";
import type { CuratedApp } from "@/lib/gallery/types";

export interface AppsCarouselLabels {
  promptLabel: string;
  screenshotAlt: string;
  noShot: string;
  prev: string;
  next: string;
  /** Libellé d'accès à la vue détail (chaîne de génération). */
  viewDetail: string;
}

/**
 * Carrousel client (interactif) de la galerie publique. Composant 'use client'
 * séparé — le layout et la page restent des Server Components.
 *
 * Rendu : une piste défilable (scroll-snap) responsive qui se comporte comme une
 * grille de cartes ; les boutons précédent/suivant font défiler carte par carte.
 * Les captures viennent déjà assainies du Maker via le contrat — ici on ne fait
 * que les afficher.
 */
export function AppsCarousel({
  apps,
  labels,
}: {
  apps: CuratedApp[];
  labels: AppsCarouselLabels;
}) {
  const trackRef = useRef<HTMLUListElement>(null);

  const scrollByCard = useCallback((dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-card]");
    const delta = card ? card.offsetWidth + 20 : track.clientWidth * 0.8;
    track.scrollBy({ left: dir * delta, behavior: "smooth" });
  }, []);

  return (
    <div className="apps-gallery">
      <div className="apps-gallery-controls">
        <button
          type="button"
          className="apps-gallery-nav"
          aria-label={labels.prev}
          onClick={() => scrollByCard(-1)}
        >
          <span aria-hidden="true">‹</span>
        </button>
        <button
          type="button"
          className="apps-gallery-nav"
          aria-label={labels.next}
          onClick={() => scrollByCard(1)}
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>

      <ul className="apps-gallery-track" ref={trackRef}>
        {apps.map((app) => (
          <li key={app.id} className="apps-gallery-card" data-card>
            {/* Carte entière cliquable → vue détail (chaîne prompt→structure→app). */}
            <Link
              href={`/galerie/${app.id}`}
              className="apps-gallery-link"
              aria-label={`${labels.viewDetail} — ${app.title}`}
            >
              <div className="apps-gallery-shot">
                {app.screenshotUrl ? (
                  // Capture fournie par le Maker (contrat) — same-origin ou CDN.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={app.screenshotUrl}
                    alt={`${labels.screenshotAlt} — ${app.title}`}
                    loading="lazy"
                  />
                ) : (
                  <span className="apps-gallery-noshot">{labels.noShot}</span>
                )}
              </div>

              <div className="apps-gallery-body">
                <h3 className="apps-gallery-card-title">{app.title}</h3>
                {app.prompt ? (
                  <p className="apps-gallery-prompt">
                    <span className="apps-gallery-prompt-label">
                      {labels.promptLabel}
                    </span>
                    {app.prompt}
                  </p>
                ) : null}
                <span className="apps-gallery-cta" aria-hidden="true">
                  {labels.viewDetail} →
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
