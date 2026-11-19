type Edge = { sourceAssetId: string; targetAssetId: string };

export function relationNeighbours(root: string, depth: number, edges: Edge[]) {
  const neighbours = new Map<string, Set<string>>();
  for (const { sourceAssetId, targetAssetId } of edges) {
    for (const [from, to] of [[sourceAssetId, targetAssetId], [targetAssetId, sourceAssetId]]) {
      if (!neighbours.has(from)) neighbours.set(from, new Set());
      neighbours.get(from)!.add(to);
    }
  }
  const reached = new Set([root]);
  let frontier = [root];
  for (let level = 0; level < depth && frontier.length; level++) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const other of neighbours.get(id) ?? []) {
        if (reached.has(other)) continue;
        reached.add(other);
        next.push(other);
      }
    }
    frontier = next;
  }
  return reached;
}
