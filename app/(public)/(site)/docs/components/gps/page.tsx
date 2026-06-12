"use client";

import { useState } from "react";
import Link from "next/link";
import { Gps, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocGpsPage() {
  const [label, setLabel] = useState("Véhicule VL-208 — dernière position");
  const [showMap, setShowMap] = useState(true);
  const [height, setHeight] = useState(300);
  const [mode, setMode] = useState<"display" | "picker">("picker");
  // Position du véhicule (mode picker) : pilotable par les inputs, le clic carte ou la géolocalisation.
  const [lat, setLat] = useState(48.8412);
  const [lng, setLng] = useState(2.3219);
  const [geoInfo, setGeoInfo] = useState<string | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  // navigator.geolocation est appelé uniquement dans ce handler (jamais au rendu).
  const handleMaPosition = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoError("Géolocalisation non disponible dans ce navigateur.");
      setGeoInfo(null);
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(Number(pos.coords.latitude.toFixed(6)));
        setLng(Number(pos.coords.longitude.toFixed(6)));
        setGeoInfo(`Position obtenue avec une précision de ±${Math.round(pos.coords.accuracy ?? 0)} m.`);
        setLocating(false);
      },
      (err) => {
        setGeoError(
          err.code === 1
            ? "Autorisation refusée : la position saisie manuellement reste utilisée."
            : "Impossible d'obtenir la position (" + (err.message || "erreur inconnue") + ")."
        );
        setGeoInfo(null);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const parts: string[] = [];
  if (label.trim()) parts.push(`label="${label.trim().replace(/"/g, '\\"')}"`);
  if (mode !== "display") parts.push(`mode="${mode}"`);
  if (mode === "picker") parts.push(`value={"lat": ${lat}, "lng": ${lng}}, on_change=update_position`);
  if (!showMap) parts.push("show_map=False");
  if (height !== 300) parts.push(`height=${height}`);
  const pythonCode = parts.length ? `bpm.gps(${parts.join(", ")})` : "bpm.gps()";
  const { prev, next } = getPrevNext("gps");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.gps</div>
        <h1>bpm.gps</h1>
        <p className="doc-description">
          Géolocalisation avec carte Leaflet : afficher la position courante de l&apos;utilisateur
          (mode <code>display</code>) ou pointer un lieu précis — position d&apos;un véhicule, d&apos;un
          chantier, d&apos;une intervention (mode <code>picker</code>). La démo suit la position
          d&apos;un véhicule de flotte : modifiez lat/lng, cliquez sur la carte ou utilisez votre
          propre position.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Média</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview" style={{ minHeight: 200 }}>
          <div className="w-full">
            <Gps
              label={label.trim() || undefined}
              showMap={showMap}
              height={height}
              mode={mode}
              value={mode === "picker" ? { lat, lng } : null}
              onChange={(c) => {
                setLat(Number(c.lat.toFixed(6)));
                setLng(Number(c.lng.toFixed(6)));
              }}
            />
            {mode === "picker" && (
              <p className="text-sm mt-2" style={{ color: "var(--bpm-text-secondary)" }}>
                Position du véhicule : {lat.toFixed(6)}, {lng.toFixed(6)}
              </p>
            )}
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>label</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Titre optionnel" />
          </div>
          <div className="sandbox-control-group">
            <label>mode</label>
            <select value={mode} onChange={(e) => setMode(e.target.value as "display" | "picker")}>
              <option value="picker">picker (pointer un lieu)</option>
              <option value="display">display (position de l&apos;utilisateur)</option>
            </select>
          </div>
          {mode === "picker" ? (
            <>
              <div className="sandbox-control-group">
                <label>value.lat</label>
                <input
                  type="number"
                  step={0.0001}
                  value={lat}
                  onChange={(e) => setLat(Number(e.target.value) || 0)}
                />
              </div>
              <div className="sandbox-control-group">
                <label>value.lng</label>
                <input
                  type="number"
                  step={0.0001}
                  value={lng}
                  onChange={(e) => setLng(Number(e.target.value) || 0)}
                />
              </div>
              <div className="sandbox-control-group">
                <label>Reprendre ma position réelle</label>
                <button
                  type="button"
                  onClick={handleMaPosition}
                  disabled={locating}
                  style={{ cursor: locating ? "wait" : "pointer" }}
                >
                  {locating ? "Localisation…" : "Ma position"}
                </button>
                {geoInfo && (
                  <p className="text-sm mt-1" style={{ color: "var(--bpm-text-secondary)" }}>{geoInfo}</p>
                )}
                {geoError && (
                  <p className="text-sm mt-1" style={{ color: "var(--bpm-error, #b91c1c)" }}>{geoError}</p>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
              En mode display, le bouton « Localiser » du composant demande l&apos;autorisation au
              navigateur, puis affiche lat/lng et la précision (±m). En cas de refus, un message
              d&apos;erreur s&apos;affiche à la place.
            </p>
          )}
          <div className="sandbox-control-group">
            <label>showMap</label>
            <select value={showMap ? "true" : "false"} onChange={(e) => setShowMap(e.target.value === "true")}>
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>height (px)</label>
            <input
              type="number"
              min={160}
              max={600}
              step={20}
              value={height}
              onChange={(e) => setHeight(Number(e.target.value) || 300)}
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
          <tr><td><code>label</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Titre affiché au-dessus du bloc.</td></tr>
          <tr><td><code>mode</code></td><td><code>&quot;display&quot; | &quot;picker&quot;</code></td><td>display</td><td>Non</td><td>display = position de l&apos;utilisateur, picker = sélection d&apos;un point sur la carte.</td></tr>
          <tr><td><code>value</code></td><td><code>{'{ lat: number; lng: number } | null'}</code></td><td>null</td><td>Non</td><td>Position courante (mode picker, composant contrôlé).</td></tr>
          <tr><td><code>onChange</code></td><td><code>(coords) =&gt; void</code></td><td>—</td><td>Non</td><td>Callback à chaque clic sur la carte ou déplacement du marqueur (mode picker).</td></tr>
          <tr><td><code>onLocation</code></td><td><code>(coords) =&gt; void</code></td><td>—</td><td>Non</td><td>Callback quand la position du navigateur est obtenue : reçoit <code>{'{ lat, lng, accuracy }'}</code>.</td></tr>
          <tr><td><code>showMap</code></td><td><code>boolean</code></td><td>true</td><td>Non</td><td>Afficher la carte Leaflet (chargée côté client uniquement).</td></tr>
          <tr><td><code>height</code></td><td><code>number</code></td><td>300</td><td>Non</td><td>Hauteur de la carte en px.</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Classes CSS additionnelles.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'# Position courante de l\'utilisateur (précision incluse)\nbpm.gps(label="Ma position", on_location=save_coords)'} language="python" />
      <CodeBlock code={'# Pointer la position d\'un véhicule de flotte\nbpm.gps(label="Véhicule VL-208", mode="picker", value={"lat": 48.8412, "lng": 2.3219}, on_change=update_position)'} language="python" />
      <CodeBlock code={'# Capture de coordonnées sans carte (formulaire compact)\nbpm.gps(show_map=False, on_location=handle_location)'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
