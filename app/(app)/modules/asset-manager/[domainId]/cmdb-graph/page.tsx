"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { relationNeighbours } from "@/lib/asset-manager/relation-neighbours";
import { symmetricRelation } from "@/lib/asset-manager/relation-types";
import { readResponse } from "../../lib/read-response";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Panel, EmptyState, Spinner, Button } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../../strings";

type AssetNode = { id: string; reference: string; label: string; x: number; y: number };
type RelationEdge = { id: string; sourceAssetId: string; targetAssetId: string; relationType: string };

function runForceLayout(
  nodes: AssetNode[],
  edges: RelationEdge[],
  width: number,
  height: number,
  iterations: number
): AssetNode[] {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.4;
  const byId = new Map(nodes.map((n) => [n.id, { ...n }]));
  const nodeList = Array.from(byId.values());
  const positions = new Map(nodeList.map((node, index) => [node.id, index]));

  for (let i = 0; i < nodeList.length; i++) {
    const angle = (2 * Math.PI * i) / Math.max(1, nodeList.length);
    nodeList[i].x = cx + radius * Math.cos(angle);
    nodeList[i].y = cy + radius * Math.sin(angle);
  }

  for (let iter = 0; iter < iterations; iter++) {
    const forces = nodeList.map(() => ({ dx: 0, dy: 0 }));
    const k = 0.05;
    const repulsion = 800;

    for (const e of edges) {
      const s = byId.get(e.sourceAssetId);
      const t = byId.get(e.targetAssetId);
      if (!s || !t) continue;
      const si = positions.get(s.id)!;
      const ti = positions.get(t.id)!;
      const dx = t.x - s.x;
      const dy = t.y - s.y;
      const dist = Math.hypot(dx, dy) || 1;
      const f = (dist - 80) * k;
      const ux = dx / dist;
      const uy = dy / dist;
      forces[si].dx += ux * f;
      forces[si].dy += uy * f;
      forces[ti].dx -= ux * f;
      forces[ti].dy -= uy * f;
    }

    for (let i = 0; i < nodeList.length; i++) {
      for (let j = i + 1; j < nodeList.length; j++) {
        const dx = nodeList[j].x - nodeList[i].x;
        const dy = nodeList[j].y - nodeList[i].y;
        const dist = Math.hypot(dx, dy) || 1;
        const f = repulsion / (dist * dist);
        const ux = dx / dist;
        const uy = dy / dist;
        forces[i].dx -= ux * f;
        forces[i].dy -= uy * f;
        forces[j].dx += ux * f;
        forces[j].dy += uy * f;
      }
    }

    for (let i = 0; i < nodeList.length; i++) {
      nodeList[i].x = Math.max(30, Math.min(width - 30, nodeList[i].x + forces[i].dx));
      nodeList[i].y = Math.max(30, Math.min(height - 30, nodeList[i].y + forces[i].dy));
    }
  }

  return nodeList;
}

export default function AssetManagerCmdbGraphPage() {
  const params = useParams();
  const { locale } = useI18n();
  const t = STR[locale];
  const tc = t.cmdb;
  const RELATION_LABELS = t.assets.relationTypes;
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const search = useSearchParams();
  const rootId = search.get("rootAssetId");
  const depth = search.get("depth") === "3" ? 3 : search.get("depth") === "2" ? 2 : 1;
  const [assets, setAssets] = useState<{ id: string; reference: string; label: string }[]>([]);
  const [relations, setRelations] = useState<RelationEdge[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState({ w: 900, h: 600 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);
  zoomRef.current = zoom;
  panRef.current = pan;

  const ZOOM_MIN = 0.25;
  const ZOOM_MAX = 3;

  useEffect(() => {
    if (!domainId) return;
    let active = true;
    setLoading(true); setError("");
    Promise.all([
      fetch(`/api/asset-manager/assets?domainId=${encodeURIComponent(domainId)}`, { credentials: "include" }).then(readResponse),
      fetch(`/api/asset-manager/ci-relations?domainId=${encodeURIComponent(domainId)}`, { credentials: "include" }).then(readResponse),
    ])
      .then(([a, r]) => {
        if (active) { setAssets(a); setRelations(r); }
      })
      .catch(err => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [domainId]);

  const assetIdsInRelations = useMemo(() => {
    const set = new Set<string>();
    relations.forEach((e) => {
      set.add(e.sourceAssetId);
      set.add(e.targetAssetId);
    });
    return set;
  }, [relations]);

  const reachable = useMemo(() => rootId ? relationNeighbours(rootId, depth, relations) : null, [rootId, depth, relations]);
  const visibleEdges = useMemo(() => reachable
    ? relations.filter(edge => reachable.has(edge.sourceAssetId) && reachable.has(edge.targetAssetId))
    : relations, [reachable, relations]);

  const nodesForGraph = useMemo(() => {
    if (reachable) return assets.filter(asset => reachable.has(asset.id));
    const withRelations = assets.filter((a) => assetIdsInRelations.has(a.id));
    return withRelations.length > 0 ? withRelations : assets.slice(0, 20);
  }, [assets, assetIdsInRelations, reachable]);

  const nodes = useMemo(
    () => runForceLayout(nodesForGraph.map((a) => ({ ...a, x: 0, y: 0 })), visibleEdges, size.w, size.h, 80),
    [nodesForGraph, visibleEdges, size.w, size.h]
  );
  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  useEffect(() => {
    const onResize = () => setSize((s) => ({ ...s, w: Math.max(400, window.innerWidth - 80), h: Math.max(400, window.innerHeight - 220) }));
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handlePanStart = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    setIsPanning(true);
  }, [pan.x, pan.y]);

  useEffect(() => {
    if (!isPanning) return;
    const onMove = (e: MouseEvent) => {
      setPan({ x: e.clientX - panStartRef.current.x, y: e.clientY - panStartRef.current.y });
    };
    const onUp = () => setIsPanning(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isPanning]);

  const handleWheel = useCallback((e: WheelEvent) => {
    const svg = svgRef.current;
    if (!svg) return;
    e.preventDefault();
    const rect = svg.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;
    const factor = 1 - e.deltaY * 0.002;
    const z = zoomRef.current;
    const p = panRef.current;
    const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z * factor));
    if (newZoom === z) return;
    const ratio = newZoom / z;
    setPan({
      x: cursorX * (1 - ratio) + p.x * ratio,
      y: cursorY * (1 - ratio) + p.y * ratio,
    });
    setZoom(newZoom);
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.addEventListener("wheel", handleWheel, { passive: false });
    return () => svg.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  if (!domainId) {
    return (
      <div className="doc-page">
        <Panel variant="warning" title={tc.domainRequired} />
      </div>
    );
  }

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-4">
        <nav className="doc-breadcrumb">
          <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>{t.common.breadcrumbModules}</Link> →{" "}
          <Link href="/modules/asset-manager" style={{ color: "var(--bpm-accent-cyan)" }}>{t.common.moduleTitle}</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>{t.nav.dashboard}</Link> → {tc.title}
        </nav>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
            {tc.title}
          </h1>
          <Link href={`/modules/asset-manager/${domainId}/assets`} className="asset-manager-cta-button">
            <Button size="small" variant="outline">{tc.assetList}</Button>
          </Link>
        </div>
        <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
          {tc.description}
        </p>
      </div>

      {rootId && <nav className="mb-4 flex flex-wrap items-center gap-3">
        <span>{locale === "fr" ? "Niveaux de relations" : "Relationship depth"}</span>
        {[1, 2, 3].map(level => <Link key={level} aria-current={depth === level ? "page" : undefined}
          href={`/modules/asset-manager/${domainId}/cmdb-graph?rootAssetId=${encodeURIComponent(rootId)}&depth=${level}`}>
          <Button size="small" variant={level === depth ? "primary" : "outline"}>{level}</Button>
        </Link>)}
        <Link href={`/modules/asset-manager/${domainId}/cmdb-graph`}>{locale === "fr" ? "Tout le parc" : "All assets"}</Link>
      </nav>}
      {error ? <Panel variant="warning" title={tc.title}>{error}</Panel> : loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="medium" />
        </div>
      ) : nodes.length === 0 ? (
        <EmptyState title={tc.emptyTitle} description={tc.emptyDescription} />
      ) : (
        <div
          className="rounded-xl border overflow-hidden"
          style={{
            background: "var(--bpm-surface)",
            border: "1px solid var(--bpm-border)",
          }}
          role="region"
          aria-label={tc.graphAriaLabel}
        >
          <h2 className="text-sm font-semibold m-0 px-4 py-3" style={{ color: "var(--bpm-text-secondary)", letterSpacing: "0.04em" }}>
            {tc.graphHeading}
          </h2>
          <div className="overflow-auto rounded-lg border mx-4 mb-4" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>
            <svg ref={svgRef} width={size.w} height={size.h} className="block" style={{ cursor: isPanning ? "grabbing" : "grab" }}>
              <defs>
                <marker id="arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <path d="M0 0 L8 3 L0 6 Z" fill="var(--bpm-text-secondary)" />
                </marker>
              </defs>
              <rect
                width={size.w}
                height={size.h}
                fill="transparent"
                onMouseDown={handlePanStart}
                style={{ cursor: isPanning ? "grabbing" : "grab" }}
              />
              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} style={{ pointerEvents: "none" }}>
              {visibleEdges.map((e) => {
                const s = nodeById.get(e.sourceAssetId);
                const tgt = nodeById.get(e.targetAssetId);
                if (!s || !tgt) return null;
                return (
                  <g key={e.id}>
                    <line
                      x1={s.x}
                      y1={s.y}
                      x2={tgt.x}
                      y2={tgt.y}
                      stroke="var(--bpm-border)"
                      strokeWidth="1.5"
                      markerEnd={symmetricRelation(e.relationType) ? undefined : "url(#arrow)"}
                    />
                    <text
                      x={(s.x + tgt.x) / 2}
                      y={(s.y + tgt.y) / 2 - 6}
                      textAnchor="middle"
                      className="text-[10px] fill-[var(--bpm-text-secondary)]"
                    >
                      {RELATION_LABELS[e.relationType] ?? e.relationType}
                    </text>
                  </g>
                );
              })}
              {nodes.map((n) => (
                <a key={n.id} href={`/modules/asset-manager/${domainId}/assets/${n.id}`} aria-label={`${n.reference} — ${n.label}`}>
                  <title>{n.label}</title>
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r="24"
                    fill="var(--bpm-accent-cyan)"
                    stroke="var(--bpm-bg)"
                    strokeWidth="2"
                    style={{ cursor: "pointer", pointerEvents: "auto" }}
                  />
                  <text
                    x={n.x}
                    y={n.y + 4}
                    textAnchor="middle"
                    className="text-xs fill-[var(--bpm-bg)] pointer-events-none font-medium"
                  >
                    {n.reference}
                  </text>
                </a>
              ))}
              </g>
            </svg>
          </div>
          <p className="text-xs mt-2 px-4 pb-4" style={{ color: "var(--bpm-text-secondary)" }}>
            {tc.counts(nodes.length, visibleEdges.length)}
          </p>
        </div>
      )}

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>{tc.backToDashboard}</Link>
        <Link href={`/modules/asset-manager/${domainId}/assets`} style={{ color: "var(--bpm-accent-cyan)" }}>{tc.assetList}</Link>
      </nav>
    </div>
  );
}
