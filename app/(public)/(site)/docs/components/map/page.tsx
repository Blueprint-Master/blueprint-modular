"use client";

import { useState } from "react";
import Link from "next/link";
import { Map, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

const AGENCES = [
  { id: "paris", nom: "Agence de Paris", lat: 48.8566, lng: 2.3522 },
  { id: "lyon", nom: "Agence de Lyon", lat: 45.764, lng: 4.8357 },
  { id: "nantes", nom: "Agence de Nantes", lat: 47.2184, lng: -1.5536 },
] as const;

const ZOOM_DEFAUT = 14; // équivaut au cadrage par défaut du composant (bbox ±0.01°)

export default function DocMapPage() {
  const [agenceId, setAgenceId] = useState<(typeof AGENCES)[number]["id"]>("paris");
  const [zoom, setZoom] = useState(ZOOM_DEFAUT);
  const [marker, setMarker] = useState(true);
  const [height, setHeight] = useState(320);

  const agence = AGENCES.find((a) => a.id === agenceId) ?? AGENCES[0];
  // Demi-largeur de la bbox en degrés : plus le zoom est grand, plus la vue est serrée.
  const delta = 180 / Math.pow(2, zoom);
  const bbox = [agence.lng - delta, agence.lat - delta, agence.lng + delta, agence.lat + delta]
    .map((v) => v.toFixed(5))
    .join(",");
  const iframeSrc =
    "https://www.openstreetmap.org/export/embed.html?bbox=" +
    encodeURIComponent(bbox) +
    "&layer=mapnik" +
    (marker ? "&marker=" + agence.lat + "," + agence.lng : "");

  // Cas simple (zoom par défaut, sans marqueur) : l'API lat/lng suffit.
  const simple = zoom === ZOOM_DEFAUT && !marker;
  const pythonCode = simple
    ? `bpm.map(lat=${agence.lat}, lng=${agence.lng}, height=${height})`
    : `# Zoom et marqueur personnalisés via une URL d'embed OSM\nbpm.map(iframe_src="${iframeSrc}", height=${height})`;
  const { prev, next } = getPrevNext("map");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.map</div>
        <h1>bpm.map</h1>
        <p className="doc-description">
          Carte statique OpenStreetMap embarquée en iframe : localiser une agence, un site,
          un actif sur une carte sans dépendance JavaScript. Centrage par <code>lat</code>/<code>lng</code>,
          ou URL d&apos;embed complète via <code>iframeSrc</code> (zoom, marqueur). Pour une carte
          interactive (plusieurs marqueurs, événements), utiliser <code>bpm.mapView</code>.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Visualisation</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview" style={{ minHeight: 200 }}>
          <div className="w-full">
            <p className="text-sm font-medium mb-2" style={{ color: "var(--bpm-text-primary)" }}>
              {agence.nom} — {agence.lat.toFixed(4)}, {agence.lng.toFixed(4)}
            </p>
            <Map iframeSrc={iframeSrc} width="100%" height={height} />
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>Agence (recentre la carte)</label>
            <select value={agenceId} onChange={(e) => setAgenceId(e.target.value as typeof agenceId)}>
              {AGENCES.map((a) => (
                <option key={a.id} value={a.id}>{a.nom}</option>
              ))}
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>zoom ({zoom})</label>
            <input
              type="range"
              min={11}
              max={16}
              step={1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />
          </div>
          <div className="sandbox-control-group">
            <label>marker (épingle sur l&apos;agence)</label>
            <select value={marker ? "true" : "false"} onChange={(e) => setMarker(e.target.value === "true")}>
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>height (px)</label>
            <input
              type="number"
              min={160}
              max={640}
              step={40}
              value={height}
              onChange={(e) => setHeight(Math.min(640, Math.max(160, Number(e.target.value) || 320)))}
            />
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>Copier</button>
          </div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>

      <table className="props-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Défaut</th>
            <th>Requis</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>lat</code></td><td><code>number</code></td><td>—</td><td>Non</td><td>Latitude du centre (bbox ±0.01° autour du point).</td></tr>
          <tr><td><code>lng</code></td><td><code>number</code></td><td>—</td><td>Non</td><td>Longitude du centre.</td></tr>
          <tr><td><code>iframeSrc</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>URL d&apos;embed complète (prioritaire sur lat/lng) : permet zoom et marqueur personnalisés.</td></tr>
          <tr><td><code>width</code></td><td><code>number | string</code></td><td>100%</td><td>Non</td><td>Largeur.</td></tr>
          <tr><td><code>height</code></td><td><code>number | string</code></td><td>400</td><td>Non</td><td>Hauteur.</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Classes CSS additionnelles.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'# Localiser l\'agence de Lyon\nbpm.map(lat=45.7640, lng=4.8357, height=300)'} language="python" />
      <CodeBlock code={'# Marqueur + zoom serré via une URL d\'embed OSM\nbpm.map(iframe_src="https://www.openstreetmap.org/export/embed.html?bbox=2.3422,48.8466,2.3622,48.8666&layer=mapnik&marker=48.8566,2.3522")'} language="python" />
      <CodeBlock code={'# Carte d\'un site logistique dans une fiche actif\nbpm.card(title="Entrepôt Nantes Sud", children=bpm.map(lat=47.2184, lng=-1.5536, height=240))'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
