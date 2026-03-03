"use client";

import { useCallback, useEffect, useMemo } from "react";
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
  Panel,
  MarkerType,
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
import type { QuestionNode, ResultNode, NoGuidelinesNode } from "@/lib/types/decision-tree";

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
  const undo = useTreeStore((s) => s.undo);
  const redo = useTreeStore((s) => s.redo);

  const setSelectedNode = useUIStore((s) => s.setSelectedNode);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const topic = useMemo(
    () => file?.topics.find((t) => t.id === topicId),
    [file, topicId],
  );

  // Build graph from store data
  const rebuildGraph = useCallback(async () => {
    if (!file || !topic) {
      console.log(
        "[DecisionGraph] skipping rebuild: file=",
        !!file,
        "topic=",
        !!topic,
      );
      return;
    }
    try {
      // Use topicToGraph which now works with nested nodes
      const graphData = topicToGraph(topic);
      console.log(
        "[DecisionGraph] topicToGraph produced",
        graphData.nodes.length,
        "nodes,",
        graphData.edges.length,
        "edges for topic",
        topicId,
      );
      const layouted = await getLayoutedElements(
        graphData.nodes,
        graphData.edges,
      );
      console.log(
        "[DecisionGraph] layout done, setting",
        layouted.nodes.length,
        "nodes",
      );
      setNodes(layouted.nodes);
      setEdges(layouted.edges);
    } catch (error) {
      console.error("[DecisionGraph] rebuildGraph error:", error);
    }
  }, [file, topic, topicId, setNodes, setEdges]);

  useEffect(() => {
    rebuildGraph();
  }, [rebuildGraph]);

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: OnSelectionChangeParams) => {
      if (selectedNodes.length === 1) {
        setSelectedNode(selectedNodes[0].id);
      } else {
        setSelectedNode(null);
      }
    },
    [setSelectedNode],
  );

  const handleAddQuestion = useCallback(() => {
    if (!file || !topic) return;
    // Get existing node IDs from this topic's nodes
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
    // Get existing node IDs from this topic's nodes
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
    // Get existing node IDs from this topic's nodes
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

  const handleRelayout = useCallback(() => {
    rebuildGraph();
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
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{
          type: "smoothstep",
          animated: false,
          style: { strokeWidth: 2 },
        }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Controls position="bottom-left" />
        <MiniMap
          position="bottom-right"
          nodeColor={(node) => {
            if (node.type === "result") return "#86efac";
            if (node.type === "noGuidelines") return "#fcd34d";
            return "#93c5fd";
          }}
          className="!bg-gray-50"
        />
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Panel position="top-left" className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleAddQuestion}>
            + Question
          </Button>
          <Button size="sm" variant="outline" onClick={handleAddResult}>
            + Result
          </Button>
          <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50" onClick={handleAddNoGuidelines}>
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
