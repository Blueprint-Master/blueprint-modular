import Link from "next/link";
import type { ReactNode } from "react";
import { PlanBlueprint } from "@/components/plano/PlanBlueprint";
import { callOf, familyOf, humanName } from "@/lib/plano/families";

/**
 * Tuile de la planothèque : le PLAN de la famille au repos, la PIÈCE vivante
 * (aperçu réel du composant, quand il existe) au survol et au focus. Sans
 * aperçu, le plan reste : jamais l'image d'un autre composant.
 */
/** React 18 ne type pas `inert` : l'attribut est passé tel quel au DOM (aperçu non focalisable). */
const INERT = { inert: "" } as Record<string, string>;

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
  return (
    <li className="plano-tile">
      <Link href={`/composants/${slug}`} className="plano-tile-link" aria-label={`${humanName(name)}, ${call}`}>
        <span className={`plano-frame${preview ? " plano-frame--live" : ""}${preview && developed ? " plano-frame--developed" : ""}`}>
          <span className="plano-plan">
            <PlanBlueprint family={familyOf(category)} />
            <span className="plano-cote">{category.toLowerCase()}</span>
          </span>
          {preview ? (
            <span className="plano-live" aria-hidden="true" {...INERT}>
              {preview}
            </span>
          ) : null}
        </span>
        <span className="plano-tile-name">{humanName(name)}</span>
        <span className="plano-tile-call">{call}</span>
        {note ? <span className="plano-tile-note">{note}</span> : null}
      </Link>
    </li>
  );
}
