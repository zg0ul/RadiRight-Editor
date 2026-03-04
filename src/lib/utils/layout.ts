import { Position, type Node, type Edge } from "@xyflow/react";

const NODE_WIDTH = 320;
const QUESTION_HEIGHT = 130;
const RESULT_HEIGHT = 140;

// Wider spacing so edge labels never overlap adjacent nodes
const HORIZONTAL_SPACING = 180;
const VERTICAL_SPACING = 260;
const MARGIN = 60;

/**
 * Custom hierarchical layout for decision tree graphs.
 * No external dependencies — works with both Turbopack and Webpack.
 *
 * Algorithm:
 *  1. Build adjacency from edges and find root nodes (no incoming edges).
 *  2. BFS from roots to create a spanning tree (handles DAGs by assigning
 *     each node to the first parent encountered).
 *  3. Compute subtree widths bottom-up so children can be spread out.
 *  4. Place subtrees top-down, centering each parent over its children.
 */
export async function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: "TB" | "LR" = "TB",
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  if (nodes.length === 0) return { nodes, edges };

  const isHorizontal = direction === "LR";
  const nodeById = new Map(nodes.map((n) => [n.id, n]));

  // ── Build adjacency ────────────────────────────────────────────────
  const childrenOf = new Map<string, string[]>();
  const parentCount = new Map<string, number>();

  for (const n of nodes) {
    childrenOf.set(n.id, []);
    parentCount.set(n.id, 0);
  }

  for (const e of edges) {
    if (nodeById.has(e.source) && nodeById.has(e.target)) {
      childrenOf.get(e.source)!.push(e.target);
      parentCount.set(e.target, (parentCount.get(e.target) ?? 0) + 1);
    }
  }

  // ── Find roots (nodes with no incoming edges) ──────────────────────
  const roots = nodes.filter((n) => parentCount.get(n.id) === 0);
  if (roots.length === 0) roots.push(nodes[0]);

  // ── BFS to build a spanning tree ───────────────────────────────────
  // In a DAG a node may have multiple parents; we assign it to the first
  // parent reached during BFS so the layout treats the graph as a tree.
  const treeChildren = new Map<string, string[]>();
  for (const n of nodes) treeChildren.set(n.id, []);

  const claimed = new Set<string>();
  const bfsQueue: string[] = [];

  for (const r of roots) {
    claimed.add(r.id);
    bfsQueue.push(r.id);
  }

  let head = 0;
  while (head < bfsQueue.length) {
    const cur = bfsQueue[head++];
    for (const child of childrenOf.get(cur)!) {
      if (!claimed.has(child)) {
        claimed.add(child);
        treeChildren.get(cur)!.push(child);
        bfsQueue.push(child);
      }
    }
  }

  // Disconnected nodes become additional roots
  for (const n of nodes) {
    if (!claimed.has(n.id)) {
      claimed.add(n.id);
      roots.push(n);
    }
  }

  // ── Node height helper ─────────────────────────────────────────────
  const heightOf = (id: string) => {
    const n = nodeById.get(id);
    return n?.type === "result" ? RESULT_HEIGHT : QUESTION_HEIGHT;
  };

  // ── Compute subtree widths (memoised) ──────────────────────────────
  const stWidthCache = new Map<string, number>();

  function subtreeWidth(id: string): number {
    if (stWidthCache.has(id)) return stWidthCache.get(id)!;

    const children = treeChildren.get(id)!;
    if (children.length === 0) {
      stWidthCache.set(id, NODE_WIDTH);
      return NODE_WIDTH;
    }

    let total = 0;
    for (const c of children) total += subtreeWidth(c);
    total += (children.length - 1) * HORIZONTAL_SPACING;

    const w = Math.max(NODE_WIDTH, total);
    stWidthCache.set(id, w);
    return w;
  }

  // ── Place nodes top-down ───────────────────────────────────────────
  const positions = new Map<string, { x: number; y: number }>();

  function place(id: string, left: number, top: number) {
    const sw = subtreeWidth(id);
    // Centre this node within its allocated subtree band
    positions.set(id, { x: left + sw / 2 - NODE_WIDTH / 2, y: top });

    const children = treeChildren.get(id)!;
    if (children.length === 0) return;

    const childTop = top + heightOf(id) + VERTICAL_SPACING;
    let childLeft = left;
    for (const c of children) {
      place(c, childLeft, childTop);
      childLeft += subtreeWidth(c) + HORIZONTAL_SPACING;
    }
  }

  let x = MARGIN;
  for (const r of roots) {
    place(r.id, x, MARGIN);
    x += subtreeWidth(r.id) + HORIZONTAL_SPACING * 2;
  }

  // ── Build final positioned nodes ───────────────────────────────────
  const layoutedNodes: Node[] = nodes.map((node) => {
    const pos = positions.get(node.id) ?? { x: 0, y: 0 };
    return {
      ...node,
      position: isHorizontal ? { x: pos.y, y: pos.x } : pos,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
    };
  });

  return { nodes: layoutedNodes, edges };
}
