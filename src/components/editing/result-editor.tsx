"use client";

import { useTreeStore } from "@/lib/store/tree-store";
import { BilingualInput } from "./bilingual-input";
import { RecommendationEditor } from "./recommendation-editor";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import type { ResultNode, ImagingRecommendation } from "@/lib/types/decision-tree";
import { Plus, Trash2 } from "lucide-react";

interface ResultEditorProps {
  topicId: string;
  nodeId: string;
}

const appropriatenessColors: Record<string, string> = {
  usuallyAppropriate: "bg-green-100 text-green-800",
  mayBeAppropriate: "bg-yellow-100 text-yellow-800",
  usuallyNotAppropriate: "bg-red-100 text-red-800",
  noImagingIndicated: "bg-gray-100 text-gray-800",
};

export function ResultEditor({ topicId, nodeId }: ResultEditorProps) {
  const file = useTreeStore((s) => s.file);
  const updateNode = useTreeStore((s) => s.updateNode);
  const deleteNode = useTreeStore((s) => s.deleteNode);

  // Find the topic and get the node from its nested nodes
  const topic = file?.topics.find((t) => t.id === topicId);
  const node = topic?.nodes[nodeId] as ResultNode | undefined;

  if (!node || node.type !== "result") return null;

  const handleUpdateField = (field: string, value: string) => {
    updateNode(topicId, nodeId, { [field]: value } as Partial<ResultNode>);
  };

  const handleUpdateRecommendation = (index: number, updates: Partial<ImagingRecommendation>) => {
    const newRecs = [...node.recommendations];
    newRecs[index] = { ...newRecs[index], ...updates };
    updateNode(topicId, nodeId, { recommendations: newRecs } as Partial<ResultNode>);
  };

  const handleAddRecommendation = () => {
    const newRec: ImagingRecommendation = {
      modality: "X-ray",
      modalityAr: "[Arabic: X-ray]",
      procedure: "New procedure",
      procedureAr: "[Arabic: New procedure]",
      appropriateness: "usuallyAppropriate",
      radiation: "low",
      score: 5,
    };
    updateNode(topicId, nodeId, {
      recommendations: [...node.recommendations, newRec],
    } as Partial<ResultNode>);
  };

  const handleDeleteRecommendation = (index: number) => {
    const newRecs = node.recommendations.filter((_, i) => i !== index);
    updateNode(topicId, nodeId, { recommendations: newRecs } as Partial<ResultNode>);
  };

  const handleDeleteNode = () => {
    if (confirm("Delete this result node? References to it will be removed from other nodes.")) {
      deleteNode(topicId, nodeId);
    }
  };

  return (
    <div className="space-y-4">
      <BilingualInput
        label="Summary"
        valueEn={node.summary || ""}
        valueAr={node.summaryAr || ""}
        onChangeEn={(v) => handleUpdateField("summary", v)}
        onChangeAr={(v) => handleUpdateField("summaryAr", v)}
        multiline
      />

      <Separator />

      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Recommendations ({node.recommendations.length})</h4>
        <Button size="sm" variant="outline" onClick={handleAddRecommendation}>
          <Plus className="h-3 w-3 mr-1" /> Add
        </Button>
      </div>

      <Accordion type="multiple" className="space-y-2">
        {node.recommendations.map((rec, index) => (
          <AccordionItem key={index} value={`rec-${index}`} className="border rounded-lg px-3">
            <AccordionTrigger className="text-sm py-2 hover:no-underline">
              <div className="flex items-center gap-2 text-left">
                <Badge className={`text-[10px] ${appropriatenessColors[rec.appropriateness] || ""}`}>
                  {rec.appropriateness === "usuallyAppropriate"
                    ? "UA"
                    : rec.appropriateness === "mayBeAppropriate"
                    ? "MBA"
                    : rec.appropriateness === "usuallyNotAppropriate"
                    ? "UNA"
                    : "NI"}
                </Badge>
                <span className="truncate max-w-[180px]">{rec.procedure}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-3">
              <RecommendationEditor
                recommendation={rec}
                onUpdate={(updates) => handleUpdateRecommendation(index, updates)}
                onDelete={() => handleDeleteRecommendation(index)}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Separator />

      <Button size="sm" variant="destructive" className="w-full" onClick={handleDeleteNode}>
        <Trash2 className="h-3 w-3 mr-1" /> Delete Node
      </Button>
    </div>
  );
}
