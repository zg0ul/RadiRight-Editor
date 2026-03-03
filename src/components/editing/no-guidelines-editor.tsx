"use client";

import { useTreeStore } from "@/lib/store/tree-store";
import { BilingualInput } from "./bilingual-input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { NoGuidelinesNode } from "@/lib/types/decision-tree";
import { Trash2, AlertCircle } from "lucide-react";

interface NoGuidelinesEditorProps {
  topicId: string;
  nodeId: string;
}

export function NoGuidelinesEditor({ topicId, nodeId }: NoGuidelinesEditorProps) {
  const file = useTreeStore((s) => s.file);
  const updateNode = useTreeStore((s) => s.updateNode);
  const deleteNode = useTreeStore((s) => s.deleteNode);

  // Find the topic and get the node from its nested nodes
  const topic = file?.topics.find((t) => t.id === topicId);
  const node = topic?.nodes[nodeId] as NoGuidelinesNode | undefined;

  if (!node || node.type !== "noGuidelines") return null;

  const handleUpdateField = (field: string, value: string) => {
    updateNode(topicId, nodeId, { [field]: value } as Partial<NoGuidelinesNode>);
  };

  const handleDeleteNode = () => {
    if (confirm("Delete this 'No Guidelines' node? References to it will be removed from other nodes.")) {
      deleteNode(topicId, nodeId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <span className="text-sm text-amber-800 dark:text-amber-200">
          No ACR guidelines cover this clinical scenario
        </span>
      </div>

      <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
        No Guidelines
      </Badge>

      <BilingualInput
        label="Summary Message"
        valueEn={node.summary || "No current guidelines covering this topic"}
        valueAr={node.summaryAr || "لا توجد إرشادات حالية تغطي هذا الموضوع"}
        onChangeEn={(v) => handleUpdateField("summary", v)}
        onChangeAr={(v) => handleUpdateField("summaryAr", v)}
        multiline
      />

      <Separator />

      <Button size="sm" variant="destructive" className="w-full" onClick={handleDeleteNode}>
        <Trash2 className="h-3 w-3 mr-1" /> Delete Node
      </Button>
    </div>
  );
}
