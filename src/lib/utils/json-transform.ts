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
        edges.push({
          id: `${id}-${option.id}`,
          source: id,
          target: option.nextNodeId,
          label: option.text,
          type: "smoothstep", // Use smoothstep for better routing around nodes
          labelStyle: {
            fontSize: 12,
            fontWeight: 500,
            fill: "#374151", // Dark gray for better visibility
          },
          labelBgStyle: {
            fill: "#ffffff",
            fillOpacity: 0.9,
            stroke: "#e5e7eb",
            strokeWidth: 1,
          },
          labelBgPadding: [4, 6], // Padding around label for better readability
          data: { option },
          style:
            option.navigationRule?.type === "conditional"
              ? { strokeDasharray: "5 5", stroke: "#6366f1" }
              : option.navigationRule?.type === "computed"
              ? { strokeDasharray: "2 4", stroke: "#8b5cf6" }
              : { stroke: "#6b7280" }, // Default gray color
          animated: !!option.redFlag,
          markerEnd: {
            type: "arrowclosed",
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
        edges.push({
          id: `${id}-${option.id}`,
          source: id,
          target: option.nextNodeId,
          label: option.text,
          type: "smoothstep", // Use smoothstep for better routing around nodes
          labelStyle: {
            fontSize: 12,
            fontWeight: 500,
            fill: "#374151", // Dark gray for better visibility
          },
          labelBgStyle: {
            fill: "#ffffff",
            fillOpacity: 0.9,
            stroke: "#e5e7eb",
            strokeWidth: 1,
          },
          labelBgPadding: [4, 6], // Padding around label for better readability
          data: { option },
          style:
            option.navigationRule?.type === "conditional"
              ? { strokeDasharray: "5 5", stroke: "#6366f1" }
              : option.navigationRule?.type === "computed"
              ? { strokeDasharray: "2 4", stroke: "#8b5cf6" }
              : { stroke: "#6b7280" }, // Default gray color
          animated: !!option.redFlag,
          markerEnd: {
            type: "arrowclosed",
            color: "#6b7280",
          },
        });
      }
    }
  }

  return { nodes, edges };
}
