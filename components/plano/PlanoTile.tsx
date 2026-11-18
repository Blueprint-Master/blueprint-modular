import Link from "next/link";
import type { ReactNode } from "react";
import { PlanBlueprint, seedOf } from "@/components/plano/PlanBlueprint";
import { callOf, familyOf, humanName } from "@/lib/plano/families";
import { archetypeOf } from "@/lib/plano/archetypes";
import keyProps from "@/lib/generated/plano-key-props.json";

const KEY_PROPS = keyProps as Record<string, string[]>;

/**
 * Tuile de la planothèque : le PLAN de la famille au repos, la PIÈCE vivante
 * (aperçu réel du composant, quand il existe) au survol et au focus. Sans
 * aperçu, le plan reste : jamais l'image d'un autre composant.
 */
/** Les types React 18 du dépôt ne connaissent pas `inert` (le runtime de Next, si) : aperçu non focalisable. */
const INERT = { inert: true } as Record<string, boolean>;

export function PlanoTile({
  slug,
  name,
  category,
  preview,
  note,
  developed = false,
}: {
  slug: string;
  name: string;
  category: string;
  preview?: ReactNode;
  /** Ligne libre sous l'appel (ex. pourquoi l'IA a retenu la pièce). */
  note?: string;
  /** Pièce développée en permanence (composition) plutôt qu'au survol seulement. */
  developed?: boolean;
}) {
  const call = callOf(name);
  /* Le lien ne CONTIENT pas l'aperçu : une pièce vivante peut porter ses
     propres liens (fil d'Ariane, pagination), et un <a> dans un <a> est
     invalide. Le lien s'étend sur toute la tuile par son pseudo-élément. */
  return (
    <li className="plano-tile">
      <span className={`plano-frame${preview ? " plano-frame--live" : ""}${preview && developed ? " plano-frame--developed" : ""}`}>
        <span className="plano-plan">
          <PlanBlueprint family={familyOf(category)} archetype={archetypeOf(slug)} seed={seedOf(slug)} />
          <span className="plano-cote">{KEY_PROPS[slug]?.join(" · ") ?? category.toLowerCase()}</span>
        </span>
        {preview ? (
          <span className="plano-live" aria-hidden="true" {...INERT}>
            {preview}
          </span>
        ) : null}
      </span>
      <Link href={`/composants/${slug}`} className="plano-tile-link">
        <span className="plano-tile-name">{humanName(name)}</span>
        <span className="plano-tile-call">{call}</span>
      </Link>
      {note ? <span className="plano-tile-note">{note}</span> : null}
    </li>
  );
}
