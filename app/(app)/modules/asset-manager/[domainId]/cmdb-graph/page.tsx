"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Panel, Spinner, Button } from "@/components/bpm";

type AssetNode = { id: string; reference: string; label: string; x: number; y: number };
type RelationEdge = { id: string; sourceAssetId: string; targetAssetId: string; relationType: string };

const RELATION_LABELS: Record<string, string> = {
  depends_on: "Dépend de",
  connected_to: "Connecté à",
  hosted_on: "Hébergé sur",
  fed_by: "Alimenté par",
  controls: "Contrôle",
};

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
      const si = nodeList.findIndex((n) => n.id === s.id);
      const ti = nodeList.findIndex((n) => n.id === t.id);
      if (si < 0 || ti < 0) continue;
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
  const router = useRouter();
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const [assets, setAssets] = useState<{ id: string; reference: string; label: string }[]>([]);
  const [relations, setRelations] = useState<RelationEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState({ w: 900, h: 600 });

  useEffect(() => {
    if (!domainId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/asset-manager/assets?domainId=${encodeURIComponent(domainId)}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
      fetch(`/api/asset-manager/ci-relations?domainId=${encodeURIComponent(domainId)}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([a, r]) => {
        setAssets(Array.isArray(a) ? a : []);
        setRelations(
          Array.isArray(r)
            ? r.map((x: { id: string; sourceAssetId: string; targetAssetId: string; relationType: string }) => ({
                id: x.id,
                sourceAssetId: x.sourceAssetId,
                targetAssetId: x.targetAssetId,
                relationType: x.relationType,
              }))
            : []
        );
      })
      .finally(() => setLoading(false));
  }, [domainId]);

  const assetIdsInRelations = useMemo(() => {
    const set = new Set<string>();
    relations.forEach((e) => {
      set.add(e.sourceAssetId);
      set.add(e.targetAssetId);
    });
    return set;
  }, [relations]);

  const nodesForGraph = useMemo(() => {
    const withRelations = assets.filter((a) => assetIdsInRelations.has(a.id));
    return withRelations.length > 0 ? withRelations : assets.slice(0, 20);
  }, [assets, assetIdsInRelations]);

  const nodes = useMemo(
    () => runForceLayout(nodesForGraph.map((a) => ({ ...a, x: 0, y: 0 })), relations, size.w, size.h, 80),
    [nodesForGraph, relations, size.w, size.h]
  );
  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  useEffect(() => {
    const onResize = () => setSize((s) => ({ ...s, w: Math.max(400, window.innerWidth - 80), h: Math.max(400, window.innerHeight - 220) }));
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (!domainId) {
    return (
      <div className="doc-page">
        <Panel variant="warning" title="Domaine requis" />
      </div>
    );
  }

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-4">
        <nav className="doc-breadcrumb">
          <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>Modules</Link> →{" "}
          <Link href="/modules/asset-manager" style={{ color: "var(--bpm-accent-cyan)" }}>Gestion de parc</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>Tableau de bord</Link> → Cartographie CMDB
        </nav>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
            Cartographie CMDB
          </h1>
          <Link href={`/modules/asset-manager/${domainId}/assets`} className="asset-manager-cta-button">
            <Button size="small" variant="outline">Liste des actifs</Button>
          </Link>
        </div>
        <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
          Graphe des actifs et de leurs relations. Clic sur un nœud pour ouvrir la fiche actif.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="medium" />
        </div>
      ) : nodes.length === 0 ? (
        <Panel variant="info" title="Aucun actif">
          Aucun actif dans ce domaine. Créez des actifs et des relations depuis les fiches actifs.
        </Panel>
      ) : (
        <Panel variant="info" title="Graphe des dépendances">
          <div className="overflow-auto rounded-lg border" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>
            <svg width={size.w} height={size.h} className="block">
              <defs>
                <marker id="arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <path d="M0 0 L8 3 L0 6 Z" fill="var(--bpm-text-secondary)" />
                </marker>
              </defs>
              {relations.map((e) => {
                const s = nodeById.get(e.sourceAssetId);
                const t = nodeById.get(e.targetAssetId);
                if (!s || !t) return null;
                return (
                  <g key={e.id}>
                    <line
                      x1={s.x}
                      y1={s.y}
                      x2={t.x}
                      y2={t.y}
                      stroke="var(--bpm-border)"
                      strokeWidth="1.5"
                      markerEnd="url(#arrow)"
                    />
                    <text
                      x={(s.x + t.x) / 2}
                      y={(s.y + t.y) / 2 - 6}
                      textAnchor="middle"
                      className="text-[10px] fill-[var(--bpm-text-secondary)]"
                    >
                      {RELATION_LABELS[e.relationType] ?? e.relationType}
                    </text>
                  </g>
                );
              })}
              {nodes.map((n) => (
                <g key={n.id}>
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r="24"
                    fill="var(--bpm-accent-cyan)"
                    stroke="var(--bpm-bg)"
                    strokeWidth="2"
                    style={{ cursor: "pointer" }}
                    onClick={() => router.push(`/modules/asset-manager/${domainId}/assets/${n.id}`)}
                  />
                  <text
                    x={n.x}
                    y={n.y + 4}
                    textAnchor="middle"
                    className="text-xs fill-[var(--bpm-bg)] pointer-events-none font-medium"
                  >
                    {n.reference}
                  </text>
                </g>
              ))}
            </svg>
          </div>
          <p className="text-xs mt-2" style={{ color: "var(--bpm-text-secondary)" }}>
            {nodes.length} actif(s), {relations.length} relation(s)
          </p>
        </Panel>
      )}

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>← Tableau de bord</Link>
        <Link href={`/modules/asset-manager/${domainId}/assets`} style={{ color: "var(--bpm-accent-cyan)" }}>Liste des actifs</Link>
      </nav>
    </div>
  );
}
