"use client";
import React from "react";
import { resolveMapLayers, setMapLayerVisibility, type CartographicLayer, type MapLayerGroup, type MapLayerState } from "./cartography";
import { sceneControl } from "./scene-ui";

export interface MapLayerControlProps {
  layers?: CartographicLayer[];
  groups?: MapLayerGroup[];
  state?: MapLayerState;
  onChange?: (state: MapLayerState) => void;
  zoom?: number;
  time?: number;
  title?: string;
  reorderable?: boolean;
  className?: string;
}
/**
 * @component bpm.mapLayerControl
 * @description Contrôle de pile cartographique : groupes imbriqués, fonds exclusifs, visibilité, opacité et réorganisation au clavier. L’ordre de dessin va du bas vers le haut.
 * @param {object} props - layers, groups et state partagés avec cartographicMap ; onChange reçoit l’état complet, sérialisable.
 * @example bpm.mapLayerControl({ layers: [{ id: "parcels", label: "Parcelles", kind: "geojson", data: { type: "FeatureCollection", features: [] } }] })
 * @associated bpm.cartographicMap, bpm.mapLegend, bpm.mapView
 */
export function MapLayerControl({ layers = [], groups = [], state, onChange, zoom, time, title = "Calques", reorderable = true, className }: MapLayerControlProps) {
  const [local, setLocal] = React.useState<MapLayerState>({});
  const current = state ?? local, resolved = resolveMapLayers(layers, groups, current, zoom, time);
  const update = (next: MapLayerState) => { if (state === undefined) setLocal(next); onChange?.(next); };
  const ordered = resolved.layers.map(entry => entry.layer.id);
  const move = (id: string, direction: number) => {
    const index = ordered.indexOf(id), target = index + direction;
    if (target < 0 || target >= ordered.length) return;
    const order = [...ordered]; [order[index], order[target]] = [order[target], order[index]];
    update({ ...current, order });
  };
  const path = (id: string) => {
    const names: string[] = [], visited = new Set<string>();
    let group = resolved.groups.find(item => item.id === id);
    while (group && !visited.has(group.id)) { visited.add(group.id); names.unshift(group.label); group = resolved.groups.find(item => item.id === group?.parentId); }
    return names.join(" / ");
  };
  return <section aria-label={title} className={className} style={{ minWidth: 0, color: "var(--bpm-text-primary, #1e293b)" }}>
    <strong>{title}</strong>
    {resolved.groups.length > 0 && <fieldset style={{ border: 0, margin: "12px 0", padding: 0, display: "grid", gap: 4 }}>
      <legend style={{ fontSize: 12, marginBottom: 6 }}>Groupes</legend>
      {resolved.groups.map(group => <label key={group.id} style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 44, overflowWrap: "anywhere" }}>
        <input type="checkbox" checked={(current.groups?.[group.id] ?? group.visible) !== false}
          onChange={event => update({ ...current, groups: { ...current.groups, [group.id]: event.target.checked } })} />
        <span>{path(group.id)}{group.exclusive ? " · un fond à la fois" : ""}</span>
      </label>)}
    </fieldset>}
    <p style={{ fontSize: 12, color: "var(--bpm-text-secondary, #64748b)" }}>Premier dans la liste = au-dessus sur la carte.</p>
    <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
      {[...resolved.layers].reverse().map((entry, topIndex) => {
        const { layer, opacity, reason, ancestors } = entry;
        const groupOff = ancestors.some(id => (current.groups?.[id] ?? resolved.groups.find(group => group.id === id)?.visible) === false);
        const exclusive = resolved.groups.find(group => group.id === layer.groupId)?.exclusive;
        const desired = (current.visible?.[layer.id] ?? layer.visible) !== false;
        return <li key={layer.id} data-map-layer-id={layer.id} style={{ padding: 12, border: "1px solid var(--bpm-border, #cbd5e1)", borderRadius: "var(--bpm-radius, 8px)" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 44 }}>
            <input type="checkbox" disabled={groupOff} checked={exclusive && !groupOff && !reason ? entry.visible : desired}
              onChange={event => update(setMapLayerVisibility(resolved.layers.map(item => item.layer), resolved.groups, current, layer.id, event.target.checked))} />
            <span style={{ overflowWrap: "anywhere" }}>{layer.label}</span>
          </label>
          {layer.groupId && <div style={{ fontSize: 11, color: "var(--bpm-text-secondary, #64748b)" }}>{path(layer.groupId)}</div>}
          {(reason || groupOff) && <div style={{ fontSize: 12 }}>{reason ?? "Masqué par un groupe"}</div>}
          {layer.description && <div style={{ fontSize: 12, marginTop: 4 }}>{layer.description}</div>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginTop: 8 }}>
            <label style={{ flex: "1 1 140px", display: "flex", alignItems: "center", gap: 8, minHeight: 44, fontSize: 12 }}>
              <span>Opacité {Math.round(opacity * 100)} %</span>
              <input type="range" aria-label={`Opacité de ${layer.label}`} min={0} max={100} value={Math.round(opacity * 100)} style={{ width: "100%", minWidth: 60 }}
                onChange={event => update({ ...current, opacity: { ...current.opacity, [layer.id]: Number(event.target.value) / 100 } })} />
            </label>
            {reorderable && <>
              <button type="button" aria-label={`Monter ${layer.label}`} style={sceneControl} disabled={topIndex === 0} onClick={() => move(layer.id, 1)}>↑</button>
              <button type="button" aria-label={`Descendre ${layer.label}`} style={sceneControl} disabled={topIndex === resolved.layers.length - 1} onClick={() => move(layer.id, -1)}>↓</button>
            </>}
          </div>
        </li>;
      })}
    </ol>
    {!resolved.layers.length && <p>Aucun calque disponible.</p>}
    {resolved.diagnostics.length > 0 && <p role="status">{resolved.diagnostics.join(" ")}</p>}
  </section>;
}
