"use client";

import { useTreeStore } from "@/lib/store/tree-store";
import { useUIStore } from "@/lib/store/ui-store";
import { QuestionEditor } from "./question-editor";
import { ResultEditor } from "./result-editor";
import { NoGuidelinesEditor } from "./no-guidelines-editor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export function NodeEditorPanel() {
  const file = useTreeStore((s) => s.file);
  const selectedNodeId = useUIStore((s) => s.selectedNodeId);
  const selectedTopicId = useUIStore((s) => s.selectedTopicId);
  const setSelectedNode = useUIStore((s) => s.setSelectedNode);

  if (!selectedNodeId || !selectedTopicId || !file) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4">
        Select a node to edit
      </div>
    );
  }

  // Find the topic and get the node from its nested nodes
  const topic = file.topics.find((t) => t.id === selectedTopicId);
  const node = topic?.nodes[selectedNodeId];

  if (!node) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4">
        Node not found
      </div>
    );
  }

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "question":
        return "default";
      case "result":
        return "secondary";
      case "noGuidelines":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getBadgeClass = (type: string) => {
    if (type === "noGuidelines") {
      return "bg-amber-100 text-amber-800 border-amber-300";
    }
    return "";
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Badge
            variant={getBadgeVariant(node.type)}
            className={getBadgeClass(node.type)}
          >
            {node.type === "noGuidelines" ? "No Guidelines" : node.type}
          </Badge>
          <span className="text-xs font-mono text-muted-foreground">
            {node.id}
          </span>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={() => setSelectedNode(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-4">
          {node.type === "question" ? (
            <QuestionEditor topicId={selectedTopicId} nodeId={selectedNodeId} />
          ) : node.type === "result" ? (
            <ResultEditor topicId={selectedTopicId} nodeId={selectedNodeId} />
          ) : (
            <NoGuidelinesEditor
              topicId={selectedTopicId}
              nodeId={selectedNodeId}
            />
          )}
        </div>
      </div>
    </div>
  );
}
