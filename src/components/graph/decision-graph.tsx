"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type OnSelectionChangeParams,
  type NodeChange,
  type Connection,
  Panel,
  MarkerType,
  ConnectionLineType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { QuestionNodeWidget } from "@/components/nodes/question-node";
import { ResultNodeWidget } from "@/components/nodes/result-node";
import { NoGuidelinesNodeWidget } from "@/components/nodes/no-guidelines-node";
import { useTreeStore } from "@/lib/store/tree-store";
import { useUIStore } from "@/lib/store/ui-store";
import { topicToGraph } from "@/lib/utils/json-transform";
import { getLayoutedElements } from "@/lib/utils/layout";
import { Button } from "@/components/ui/button";
import { generateNodeId } from "@/lib/utils/id-generator";
import type {
  QuestionNode,
  ResultNode,
  NoGuidelinesNode,
} from "@/lib/types/decision-tree";

const nodeTypes = {
  question: QuestionNodeWidget,
  result: ResultNodeWidget,
  noGuidelines: NoGuidelinesNodeWidget,
};

interface DecisionGraphProps {
  topicId: string;
}

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export function DecisionGraph({ topicId }: DecisionGraphProps) {
  const file = useTreeStore((s) => s.file);
  const addNode = useTreeStore((s) => s.addNode);
  const updateNode = useTreeStore((s) => s.updateNode);
  const undo = useTreeStore((s) => s.undo);
  const redo = useTreeStore((s) => s.redo);

  const setSelectedNode = useUIStore((s) => s.setSelectedNode);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Track manually dragged positions so store updates don't reset them
  const manualPositions = useRef<Map<string, { x: number; y: number }>>(
    new Map(),
  );

  const topic = useMemo(
    () => file?.topics.find((t) => t.id === topicId),
    [file, topicId],
  );

  // Build graph from store data, preserving manually-set positions
  const rebuildGraph = useCallback(
    async (clearManual = false) => {
      if (!file || !topic) return;
      if (clearManual) manualPositions.current.clear();
      try {
        const graphData = topicToGraph(topic);
        const layouted = await getLayoutedElements(
          graphData.nodes,
          graphData.edges,
        );

        // Preserve positions for nodes the user has manually dragged
        const finalNodes = layouted.nodes.map((node) => {
          const saved = manualPositions.current.get(node.id);
          return saved ? { ...node, position: saved } : node;
        });

        setNodes(finalNodes);
        setEdges(layouted.edges);
      } catch (error) {
        console.error("[DecisionGraph] rebuildGraph error:", error);
      }
    },
    [file, topic, setNodes, setEdges],
  );

  useEffect(() => {
    rebuildGraph();
  }, [rebuildGraph]);

  // Save position whenever a node is moved
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      for (const change of changes) {
        if (change.type === "position" && change.position) {
          manualPositions.current.set(change.id, change.position);
        }
      }
      onNodesChange(changes);
    },
    [onNodesChange],
  );

  // Drag-to-connect: wire an option's sourceHandle to a target node
  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!topic || !connection.source || !connection.target) return;
      const sourceNode = topic.nodes[connection.source];
      if (sourceNode?.type !== "question") return;

      const q = sourceNode as QuestionNode;
      const optIdx = q.options.findIndex(
        (o) => o.id === connection.sourceHandle,
      );
      if (optIdx < 0) return;

      const updated = [...q.options];
      updated[optIdx] = { ...updated[optIdx], nextNodeId: connection.target };
      updateNode(topicId, connection.source, { options: updated });
    },
    [topic, topicId, updateNode],
  );

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: OnSelectionChangeParams) => {
      if (selectedNodes.length === 1) {
        setSelectedNode(selectedNodes[0].id);
      }
    },
    [setSelectedNode],
  );

  const handleAddQuestion = useCallback(() => {
    if (!file || !topic) return;
    const existingIds = Object.keys(topic.nodes);
    const newId = generateNodeId("question", existingIds);
    const newNode: QuestionNode = {
      id: newId,
      type: "question",
      questionText: "New Question",
      questionTextAr: "[Arabic: New Question]",
      options: [],
    };
    addNode(topicId, newNode);
  }, [file, topic, topicId, addNode]);

  const handleAddResult = useCallback(() => {
    if (!file || !topic) return;
    const existingIds = Object.keys(topic.nodes);
    const newId = generateNodeId("result", existingIds);
    const newNode: ResultNode = {
      id: newId,
      type: "result",
      summary: "New Result",
      summaryAr: "[Arabic: New Result]",
      recommendations: [],
    };
    addNode(topicId, newNode);
  }, [file, topic, topicId, addNode]);

  const handleAddNoGuidelines = useCallback(() => {
    if (!file || !topic) return;
    const existingIds = Object.keys(topic.nodes);
    const newId = generateNodeId("noGuidelines", existingIds);
    const newNode: NoGuidelinesNode = {
      id: newId,
      type: "noGuidelines",
      summary: "No current guidelines covering this topic",
      summaryAr: "لا توجد إرشادات حالية تغطي هذا الموضوع",
    };
    addNode(topicId, newNode);
  }, [file, topic, topicId, addNode]);

  // Re-layout clears all manual positions and recomputes from scratch
  const handleRelayout = useCallback(() => {
    rebuildGraph(true);
  }, [rebuildGraph]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  if (!topic) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Topic not found
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{
          type: "smoothstep",
          animated: false,
          style: { strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed },
        }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        connectionLineStyle={{ strokeWidth: 2, stroke: "#3b82f6" }}
        connectionLineType={ConnectionLineType.SmoothStep}
      >
        <Controls position="bottom-left" />
        <MiniMap
          position="bottom-right"
          nodeColor={(node) => {
            if (node.type === "result") return "#86efac";
            if (node.type === "noGuidelines") return "#fcd34d";
            return "#93c5fd";
          }}
          className="bg-gray-50!"
        />
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Panel position="top-left" className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleAddQuestion}>
            + Question
          </Button>
          <Button size="sm" variant="outline" onClick={handleAddResult}>
            + Result
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-amber-300 text-amber-700 hover:bg-amber-50"
            onClick={handleAddNoGuidelines}
          >
            + No Guidelines
          </Button>
          <Button size="sm" variant="ghost" onClick={handleRelayout}>
            Re-layout
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
