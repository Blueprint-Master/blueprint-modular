"use client";

import { useState } from "react";
import Link from "next/link";
import { Gps, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  breadcrumb: "Composants",
  category: "Média",
  description: (
    <>
      Géolocalisation avec carte Leaflet : afficher la position courante de l&apos;utilisateur
      (mode <code>display</code>) ou pointer un lieu précis — position d&apos;un véhicule, d&apos;un
      chantier, d&apos;une intervention (mode <code>picker</code>). La démo suit la position
      d&apos;un véhicule de flotte : modifiez lat/lng, cliquez sur la carte ou utilisez votre
      propre position.
    </>
  ),
  defaultLabel: "Véhicule VL-208 — dernière position",
  labelPlaceholder: "Titre optionnel",
  modeOptionPicker: "picker (pointer un lieu)",
  modeOptionDisplay: "display (position de l'utilisateur)",
  vehiclePosition: "Position du véhicule :",
  useMyPosition: "Reprendre ma position réelle",
  locating: "Localisation…",
  myPosition: "Ma position",
  geoUnavailable: "Géolocalisation non disponible dans ce navigateur.",
  geoAccuracy: (m: number) => `Position obtenue avec une précision de ±${m} m.`,
  geoDenied: "Autorisation refusée : la position saisie manuellement reste utilisée.",
  geoFailed: (msg: string) => `Impossible d'obtenir la position (${msg}).`,
  unknownError: "erreur inconnue",
  displayNote:
    "En mode display, le bouton « Localiser » du composant demande l'autorisation au navigateur, puis affiche lat/lng et la précision (±m). En cas de refus, un message d'erreur s'affiche à la place.",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  no: "Non",
  propLabel: "Titre affiché au-dessus du bloc.",
  propMode: "display = position de l'utilisateur, picker = sélection d'un point sur la carte.",
  propValue: "Position courante (mode picker, composant contrôlé).",
  propOnChange: "Callback à chaque clic sur la carte ou déplacement du marqueur (mode picker).",
  propOnLocation: (
    <>Callback quand la position du navigateur est obtenue : reçoit <code>{'{ lat, lng, accuracy }'}</code>.</>
  ),
  propShowMap: "Afficher la carte Leaflet (chargée côté client uniquement).",
  propHeight: "Hauteur de la carte en px.",
  propClassName: "Classes CSS additionnelles.",
  examplesTitle: "Exemples",
};

const en: typeof fr = {
  breadcrumb: "Components",
  category: "Media",
  description: (
    <>
      Geolocation with a Leaflet map: show the user&apos;s current position
      (<code>display</code> mode) or point to a precise place — the position of a vehicle,
      a worksite, an intervention (<code>picker</code> mode). The demo tracks the position
      of a fleet vehicle: edit lat/lng, click the map or use your own position.
    </>
  ),
  defaultLabel: "Vehicle VL-208 — last position",
  labelPlaceholder: "Optional title",
  modeOptionPicker: "picker (point to a place)",
  modeOptionDisplay: "display (the user's position)",
  vehiclePosition: "Vehicle VL-208 position:",
  useMyPosition: "Use my real position",
  locating: "Locating…",
  myPosition: "My location",
  geoUnavailable: "Geolocation is not available in this browser.",
  geoAccuracy: (m: number) => `Position obtained with an accuracy of ±${m} m.`,
  geoDenied: "Permission denied: the manually entered position is still used.",
  geoFailed: (msg: string) => `Unable to obtain the position (${msg}).`,
  unknownError: "unknown error",
  displayNote:
    "In display mode, the component's “Localiser” button asks the browser for permission, then displays lat/lng and the accuracy (±m). If permission is denied, an error message is shown instead.",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  no: "No",
  propLabel: "Title displayed above the block.",
  propMode: "display = the user's position, picker = selecting a point on the map.",
  propValue: "Current position (picker mode, controlled component).",
  propOnChange: "Callback on every map click or marker drag (picker mode).",
  propOnLocation: (
    <>Callback when the browser position is obtained: receives <code>{'{ lat, lng, accuracy }'}</code>.</>
  ),
  propShowMap: "Show the Leaflet map (loaded client-side only).",
  propHeight: "Map height in px.",
  propClassName: "Additional CSS classes.",
  examplesTitle: "Examples",
};

const L = { fr, en } as const;

export default function DocGpsPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [label, setLabel] = useState(t.defaultLabel);
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
      setGeoError(t.geoUnavailable);
      setGeoInfo(null);
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(Number(pos.coords.latitude.toFixed(6)));
        setLng(Number(pos.coords.longitude.toFixed(6)));
        setGeoInfo(t.geoAccuracy(Math.round(pos.coords.accuracy ?? 0)));
        setLocating(false);
      },
      (err) => {
        setGeoError(err.code === 1 ? t.geoDenied : t.geoFailed(err.message || t.unknownError));
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
        <div className="doc-breadcrumb"><Link href="/composants">{t.breadcrumb}</Link> → bpm.gps</div>
        <h1>bpm.gps</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
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
                {t.vehiclePosition} {lat.toFixed(6)}, {lng.toFixed(6)}
              </p>
            )}
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>label</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder={t.labelPlaceholder} />
          </div>
          <div className="sandbox-control-group">
            <label>mode</label>
            <select value={mode} onChange={(e) => setMode(e.target.value as "display" | "picker")}>
              <option value="picker">{t.modeOptionPicker}</option>
              <option value="display">{t.modeOptionDisplay}</option>
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
                <label>{t.useMyPosition}</label>
                <button
                  type="button"
                  onClick={handleMaPosition}
                  disabled={locating}
                  style={{ cursor: locating ? "wait" : "pointer" }}
                >
                  {locating ? t.locating : t.myPosition}
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
              {t.displayNote}
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
            <button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>{t.copy}</button>
          </div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>

      <table className="props-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>{t.thDefault}</th>
            <th>{t.thRequired}</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>label</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.propLabel}</td></tr>
          <tr><td><code>mode</code></td><td><code>&quot;display&quot; | &quot;picker&quot;</code></td><td>display</td><td>{t.no}</td><td>{t.propMode}</td></tr>
          <tr><td><code>value</code></td><td><code>{'{ lat: number; lng: number } | null'}</code></td><td>null</td><td>{t.no}</td><td>{t.propValue}</td></tr>
          <tr><td><code>onChange</code></td><td><code>(coords) =&gt; void</code></td><td>—</td><td>{t.no}</td><td>{t.propOnChange}</td></tr>
          <tr><td><code>onLocation</code></td><td><code>(coords) =&gt; void</code></td><td>—</td><td>{t.no}</td><td>{t.propOnLocation}</td></tr>
          <tr><td><code>showMap</code></td><td><code>boolean</code></td><td>true</td><td>{t.no}</td><td>{t.propShowMap}</td></tr>
          <tr><td><code>height</code></td><td><code>number</code></td><td>300</td><td>{t.no}</td><td>{t.propHeight}</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.propClassName}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examplesTitle}</h2>
      <CodeBlock code={'# Position courante de l\'utilisateur (précision incluse)\nbpm.gps(label="Ma position", on_location=save_coords)'} language="python" />
      <CodeBlock code={'# Pointer la position d\'un véhicule de flotte\nbpm.gps(label="Véhicule VL-208", mode="picker", value={"lat": 48.8412, "lng": 2.3219}, on_change=update_position)'} language="python" />
      <CodeBlock code={'# Capture de coordonnées sans carte (formulaire compact)\nbpm.gps(show_map=False, on_location=handle_location)'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
