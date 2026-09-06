"use client";

import React from "react";

/**
 * Un point du ciel, tel qu'une application le détient : les coordonnées
 * arrivent BRUTES (décimales ou sexagésimales), pas déjà converties.
 *
 * C'est délibéré et c'est ce qui distingue ce composant de `bpm.mapView`, dont
 * les `markers` portent une position déjà numérique : une coordonnée céleste
 * s'écrit de six façons légitimes (`12.5`, `12h30m`, `12:30:00`, `+41 16 09`,
 * `-05°23'`, `41.2688`), et laisser chaque appelant écrire son parseur
 * garantirait six grammaires divergentes. Le composant possède la sienne, elle
 * est exportée (`parseCelestialAngle`), et il COMPTE ce qu'il n'a pas su lire —
 * c'est ce comptage qui permet de dire « 3 observations sans coordonnées
 * valides » au lieu de les faire disparaître en silence.
 */
export interface SkyPoint {
  /** Identifiant stable. À défaut, l'index sert de clé. */
  id?: string;
  /** Libellé lisible. À défaut, « Point N ». */
  label?: string;
  /** Ascension droite — degrés par défaut, heures si `raUnit="hours"`. */
  ra: string | number | null | undefined;
  /** Déclinaison, en degrés (−90 à +90). */
  dec: string | number | null | undefined;
}

export interface SkyMapProps {
  points: SkyPoint[];
  /** Unité de l'ascension droite DÉCIMALE. La forme sexagésimale reste en heures. */
  raUnit?: "degrees" | "hours";
  height?: number | string;
  onPointClick?: (index: number, point: SkyPoint) => void;
  /** Titre de la carte. */
  title?: string;
  className?: string;
}

/**
 * Lit une coordonnée céleste écrite sous l'une de ses formes usuelles.
 *
 * Conventions d'unité : https://heasarc.gsfc.nasa.gov/Tools/name_or_coordinates_help.html
 * Une ascension droite DÉCIMALE est en degrés sauf `raUnit="hours"` ; une
 * ascension droite SEXAGÉSIMALE est en heures, parce que c'est ce que cette
 * notation veut dire — `12:30:00` en RA n'a jamais signifié 12 degrés.
 *
 * Rend `null` sur toute forme non reconnue ou hors bornes : l'abstention est le
 * comportement voulu, jamais une valeur devinée. Un point à `null` n'est pas
 * placé, et il est COMPTÉ (cf. `SkyPoint`).
 */
export function parseCelestialAngle(
  raw: unknown,
  axis: "ra" | "dec",
  raUnit: "degrees" | "hours" = "degrees",
): number | null {
  if (typeof raw !== "string" && typeof raw !== "number") return null;
  const s = String(raw).trim().toLowerCase().replace(/[−–]/g, "-").replace(/,/g, ".");
  if (!s) return null;
  let value: number;
  let hours = axis === "ra" && raUnit === "hours";
  if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)) {
    value = Number(s);
  } else {
    const explicit = s.match(
      /^([+-]?\d+(?:\.\d+)?)\s*([hd°])(?:\s*(\d+(?:\.\d+)?)\s*[m'′](?:\s*(\d+(?:\.\d+)?)\s*[s"″])?)?$/,
    );
    const separated = s.match(/^([+-]?\d+)(?::|\s+)(\d+(?:\.\d+)?)(?:(?::|\s+)(\d+(?:\.\d+)?))?$/);
    if (!explicit && !separated) return null;
    /* Une déclinaison ne se compte pas en heures : `41h16m` est une RA écrite
       dans la mauvaise colonne, pas une déclinaison à réinterpréter. */
    if (explicit && axis === "dec" && explicit[2] === "h") return null;
    const major = Number((explicit ?? separated)![1]);
    const minuteText = explicit ? explicit[3] : separated![2];
    const secondText = explicit ? explicit[4] : separated![3];
    const minute = Number(minuteText ?? 0);
    const second = Number(secondText ?? 0);
    if (
      minute >= 60 ||
      second >= 60 ||
      (minuteText && !Number.isInteger(major)) ||
      (secondText && !Number.isInteger(minute))
    ) {
      return null;
    }
    value = (s.startsWith("-") ? -1 : 1) * (Math.abs(major) + minute / 60 + second / 3600);
    hours = axis === "ra" && (explicit ? explicit[2] === "h" : true);
  }
  if (!Number.isFinite(value)) return null;
  if (axis === "dec") return Math.abs(value) <= 90 ? value : null;
  if (value < 0 || value > (hours ? 24 : 360)) return null;
  return (value * (hours ? 15 : 1)) % 360;
}

/**
 * Projection de Hammer, RA croissante vers la GAUCHE, centre à 12 h.
 * https://proj.org/en/stable/operations/projections/hammer.html
 *
 * ⚠️ Ce n'est PAS la projection d'un planétarium. Stellarium ou SkySafari
 * rendent la voûte VISIBLE depuis un lieu et un instant, en projection
 * stéréographique/azimutale. Hammer est une projection tout-ciel ÉQUISURFACE,
 * celle des catalogues et des relevés : elle montre l'ensemble du ciel d'un
 * seul tenant, sans privilégier d'observateur. C'est la bonne projection pour
 * un JOURNAL d'observations — « où sont les objets que j'ai notés » — et la
 * mauvaise pour « que vois-je ce soir ». La distinction est écrite ici parce
 * qu'elle décide de l'usage, et qu'aucun nom de composant ne la porte.
 */
export function projectHammer(ra: number, dec: number): { x: number; y: number } {
  const longitude = ((180 - ra) * Math.PI) / 180;
  const latitude = (dec * Math.PI) / 180;
  const denominator = Math.sqrt(1 + Math.cos(latitude) * Math.cos(longitude / 2));
  return {
    x: 450 + (400 * Math.cos(latitude) * Math.sin(longitude / 2)) / denominator,
    y: 250 - (200 * Math.sin(latitude)) / denominator,
  };
}

/**
 * @component bpm.skyMap
 * @description Carte céleste équatoriale (projection de Hammer) : place des observations en ascension droite / déclinaison, avec sélection, zoom et liste tactile.
 * @example
 * bpm.skyMap({ points: [{ id: "s1", label: "Sirius", ra: "06:45:09", dec: "-16:42:58" }] })
 *
 * @param {object} props
 * @param {SkyPoint[]} props.points - Observations à placer. Coordonnées BRUTES (décimales ou sexagésimales) ; celles qui ne se lisent pas sont comptées, jamais masquées. Obligatoire.
 * @param {"degrees"|"hours"} [props.raUnit="degrees"] - Unité de l'ascension droite DÉCIMALE. Optionnel.
 * @param {number|string} [props.height] - Hauteur du canevas. Optionnel.
 * @param {function} [props.onPointClick] - Callback au clic sur un point : (index, point). Optionnel.
 * @param {string} [props.title="Carte équatoriale"] - Titre affiché. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 *
 * @associated bpm.mapView, bpm.gps
 */
export function SkyMap({
  points = [],
  raUnit = "degrees",
  height,
  onPointClick,
  title = "Carte équatoriale",
  className = "",
}: SkyMapProps) {
  const labelId = React.useId();
  const [selectedId, setSelectedId] = React.useState("");
  const [zoom, setZoom] = React.useState(1);

  /* `points` peut arriver absent ou d'une autre FORME que celle annoncée : ce
     composant est rendu par un objet `bpm.*` que le Maker appelle depuis du code
     généré, et les props `bpm.*` ne sont opposables que sur 5 composants sur 156
     — le typage ne protège donc rien ici. Le gate de fumée du core le dit
     autrement : chaque composant doit se rendre AVEC UNE FIXTURE VIDE. Un défaut
     et une garde de forme, pas une valeur devinée. */
  const liste = Array.isArray(points) ? points : [];

  const placed = React.useMemo(
    () =>
      liste.flatMap((point, index) => {
        const ra = parseCelestialAngle(point.ra, "ra", raUnit);
        const dec = parseCelestialAngle(point.dec, "dec");
        if (ra === null || dec === null) return [];
        return [
          {
            id: point.id ?? String(index),
            index,
            source: point,
            label: point.label ?? `Point ${index + 1}`,
            ra,
            dec,
            ...projectHammer(ra, dec),
          },
        ];
      }),
    [liste, raUnit],
  );

  const selected = placed.find((point) => point.id === selectedId);
  const width = 900 / zoom;
  const viewHeight = 500 / zoom;
  const cx = selected?.x ?? 450;
  const cy = selected?.y ?? 250;
  const left = Math.max(0, Math.min(900 - width, cx - width / 2));
  const top = Math.max(0, Math.min(500 - viewHeight, cy - viewHeight / 2));

  const pathFor = (coordinates: number[][]) =>
    coordinates
      .map(([ra, dec], index) => {
        const point = projectHammer(ra!, dec!);
        return `${index ? "L" : "M"}${point.x.toFixed(2)},${point.y.toFixed(2)}`;
      })
      .join(" ");

  const text = "var(--bpm-text-primary, #e2e8f0)";
  const muted = "var(--bpm-text-secondary, #94a3b8)";
  const accent = "var(--bpm-accent, #f59e0b)";
  const controlStyle: React.CSSProperties = {
    minHeight: 44,
    padding: "8px 14px",
    borderRadius: "var(--bpm-radius, 8px)",
    border: "1px solid var(--bpm-border, #475569)",
    background: "var(--bpm-surface, #0f172a)",
    color: text,
    font: "inherit",
    cursor: "pointer",
  };

  const choose = (id: string) => {
    setSelectedId(id);
    const hit = placed.find((point) => point.id === id);
    if (hit && onPointClick) onPointClick(hit.index, hit.source);
  };

  return (
    <section
      data-bpm-celestial-map="equatorial"
      aria-label="Carte céleste des observations"
      className={className}
      style={{
        minWidth: 0,
        marginBottom: 20,
        border: "1px solid var(--bpm-border, #475569)",
        borderRadius: "var(--bpm-radius, 12px)",
        background: "var(--bpm-surface, #0f172a)",
        color: text,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, padding: 16 }}>
        <div style={{ flex: "1 1 180px" }}>
          <strong>{title}</strong>
          <div role="status" style={{ color: muted, fontSize: 13, marginTop: 4 }}>
            {placed.length} sur {liste.length} observations positionnées
          </div>
        </div>
        <div role="group" aria-label="Zoom de la carte" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <button
            type="button"
            aria-label="Réduire le zoom"
            disabled={zoom === 1}
            onClick={() => setZoom((value) => Math.max(1, value - 0.5))}
            style={controlStyle}
          >
            −
          </button>
          <button
            type="button"
            aria-label="Agrandir la carte"
            disabled={zoom === 4}
            onClick={() => setZoom((value) => Math.min(4, value + 0.5))}
            style={controlStyle}
          >
            +
          </button>
          <button
            type="button"
            onClick={() => {
              setZoom(1);
              setSelectedId("");
            }}
            style={controlStyle}
          >
            Tout le ciel
          </button>
        </div>
      </div>

      <svg
        viewBox={[left, top, width, viewHeight].join(" ")}
        role="group"
        aria-label="Positions en ascension droite et déclinaison"
        style={{ width: "100%", height: height ?? "auto", minHeight: 220, display: "block" }}
      >
        <title>Carte du ciel — coordonnées équatoriales enregistrées</title>
        <ellipse cx="450" cy="250" rx="400" ry="200" fill="var(--bpm-bg, #020617)" stroke={muted} strokeOpacity="0.5" />
        <g fill="none" stroke={muted} strokeOpacity="0.25" strokeWidth="1">
          {[0, 60, 120, 180, 240, 300, 360].map((ra) => (
            <path key={`ra-${ra}`} d={pathFor(Array.from({ length: 61 }, (_, index) => [ra, -90 + index * 3]))} />
          ))}
          {[-60, -30, 0, 30, 60].map((dec) => (
            <path
              key={`dec-${dec}`}
              d={pathFor(Array.from({ length: 121 }, (_, index) => [index * 3, dec]))}
              strokeOpacity={dec === 0 ? 0.6 : 0.25}
            />
          ))}
        </g>
        <g fill={muted} fontSize="22" textAnchor="middle" aria-hidden="true">
          <text x="450" y="32">
            +90°
          </text>
          <text x="450" y="480">
            −90°
          </text>
          {[0, 6, 12, 18, 24].map((hour) => (
            <text key={hour} x={projectHammer(hour * 15, 0).x} y="279">
              {hour} h
            </text>
          ))}
        </g>
        {placed.map((point) => (
          <g
            key={point.id}
            data-celestial-point={point.id}
            role="button"
            tabIndex={0}
            aria-label={`${point.label}, ascension droite ${(point.ra / 15).toFixed(3)} h, déclinaison ${point.dec.toFixed(3)}°`}
            aria-pressed={selectedId === point.id}
            onClick={() => choose(point.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                choose(point.id);
              }
            }}
            style={{ cursor: "pointer" }}
          >
            <title>{point.label}</title>
            <circle cx={point.x} cy={point.y} r="20" fill="transparent" />
            <circle
              cx={point.x}
              cy={point.y}
              r={selectedId === point.id ? 13 : 8}
              fill={accent}
              opacity={selectedId === point.id ? 0.25 : 0.12}
            />
            <circle
              cx={point.x}
              cy={point.y}
              r={selectedId === point.id ? 5 : 3.5}
              fill={accent}
              stroke={text}
              strokeWidth="1"
            />
            {selectedId === point.id && (
              <circle cx={point.x} cy={point.y} r="17" fill="none" stroke={accent} strokeWidth="1.5" />
            )}
          </g>
        ))}
      </svg>

      <div style={{ padding: 16, display: "grid", gap: 10, fontSize: 14 }}>
        {placed.length > 0 && (
          <label htmlFor={labelId} style={{ display: "grid", gap: 6 }}>
            Choisir une observation
            <select
              id={labelId}
              value={selected?.id ?? ""}
              onChange={(event) => choose(event.target.value)}
              style={{ ...controlStyle, width: "100%", minWidth: 0 }}
            >
              <option value="">Sélectionner sur la carte ou dans la liste</option>
              {placed.map((point) => (
                <option key={point.id} value={point.id}>
                  {point.label}
                </option>
              ))}
            </select>
          </label>
        )}
        {selected && (
          <div
            role="status"
            data-celestial-detail={selected.id}
            style={{ padding: 12, borderLeft: `3px solid ${accent}`, overflowWrap: "anywhere" }}
          >
            <strong>{selected.label}</strong>
            <div>
              Ascension droite : {(selected.ra / 15).toFixed(3)} h · Déclinaison : {selected.dec.toFixed(3)}°
            </div>
          </div>
        )}
        {liste.length === 0 ? (
          <p style={{ margin: 0 }}>Aucune observation à positionner pour cette sélection.</p>
        ) : placed.length < liste.length ? (
          <p style={{ margin: 0 }}>
            {liste.length - placed.length} observation(s) sans coordonnées célestes valides. Renseignez leur ascension
            droite et leur déclinaison pour les placer.
          </p>
        ) : null}
        <div style={{ color: muted, fontSize: 12 }}>
          Positions enregistrées · Ascension droite en heures, déclinaison en degrés · Pôle nord en haut
        </div>
      </div>
    </section>
  );
}
