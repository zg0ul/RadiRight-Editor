import type { Node, Edge } from "@xyflow/react";
import type { DecisionNode, QuestionNode, Topic } from "../types/decision-tree";

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

/**
 * Convert a topic's nodes to a graph representation for visualization.
 * Nodes are now nested within the topic, so we pass the topic directly.
 */
export function topicToGraph(topic: Topic): GraphData {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const { nodes: nodesMap, rootNodeId } = topic;

  for (const [id, node] of Object.entries(nodesMap)) {
    const isRoot = id === rootNodeId;
    nodes.push({
      id,
      type: node.type,
      position: { x: 0, y: 0 }, // Will be computed by layout
      data: { ...node, isRoot },
    });

    if (node.type === "question") {
      const q = node as QuestionNode;
      for (const option of q.options) {
        // Skip edges with no target (unconnected option handles)
        if (!option.nextNodeId) continue;
        const label =
          option.text.length > 35
            ? option.text.slice(0, 32) + "…"
            : option.text;
        edges.push({
          id: `${id}-${option.id}`,
          source: id,
          sourceHandle: option.id,
          target: option.nextNodeId,
          label,
          type: "smoothstep",
          labelStyle: {
            fontSize: 11,
            fontWeight: 500,
            fill: "#374151",
          },
          labelBgStyle: {
            fill: "#ffffff",
            fillOpacity: 0.95,
            stroke: "#e5e7eb",
            strokeWidth: 1,
          },
          labelBgPadding: [4, 4] as [number, number],
          data: { option },
          style:
            option.navigationRule?.type === "conditional"
              ? { strokeDasharray: "5 5", stroke: "#6366f1", strokeWidth: 2 }
              : option.navigationRule?.type === "computed"
                ? { strokeDasharray: "2 4", stroke: "#8b5cf6", strokeWidth: 2 }
                : { stroke: "#6b7280", strokeWidth: 2 },
          animated: !!option.redFlag,
          markerEnd: {
            type: "arrowclosed" as const,
            color: "#6b7280",
          },
        });
      }
    }
  }

  return { nodes, edges };
}

/**
 * Legacy function for backwards compatibility.
 * @deprecated Use topicToGraph instead
 */
export function treeToGraph(
  nodesMap: Record<string, DecisionNode>,
  _topicId: string,
  rootNodeId: string,
): GraphData {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  for (const [id, node] of Object.entries(nodesMap)) {
    const isRoot = id === rootNodeId;
    nodes.push({
      id,
      type: node.type,
      position: { x: 0, y: 0 },
      data: { ...node, isRoot },
    });

    if (node.type === "question") {
      const q = node as QuestionNode;
      for (const option of q.options) {
        if (!option.nextNodeId) continue;
        const label =
          option.text.length > 35
            ? option.text.slice(0, 32) + "…"
            : option.text;
        edges.push({
          id: `${id}-${option.id}`,
          source: id,
          sourceHandle: option.id,
          target: option.nextNodeId,
          label,
          type: "smoothstep",
          labelStyle: {
            fontSize: 11,
            fontWeight: 500,
            fill: "#374151",
          },
          labelBgStyle: {
            fill: "#ffffff",
            fillOpacity: 0.95,
            stroke: "#e5e7eb",
            strokeWidth: 1,
          },
          labelBgPadding: [4, 4] as [number, number],
          data: { option },
          style:
            option.navigationRule?.type === "conditional"
              ? { strokeDasharray: "5 5", stroke: "#6366f1", strokeWidth: 2 }
              : option.navigationRule?.type === "computed"
                ? { strokeDasharray: "2 4", stroke: "#8b5cf6", strokeWidth: 2 }
                : { stroke: "#6b7280", strokeWidth: 2 },
          animated: !!option.redFlag,
          markerEnd: {
            type: "arrowclosed" as const,
            color: "#6b7280",
          },
        });
      }
    }
  }

  return { nodes, edges };
}
