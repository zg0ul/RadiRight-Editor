"use client";

import { useTreeStore } from "@/lib/store/tree-store";
import { BilingualInput } from "./bilingual-input";
import { OptionEditor } from "./option-editor";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { generateOptionId } from "@/lib/utils/id-generator";
import type { QuestionNode, AnswerOption } from "@/lib/types/decision-tree";
import { Plus, Trash2 } from "lucide-react";

interface QuestionEditorProps {
  topicId: string;
  nodeId: string;
}

export function QuestionEditor({ topicId, nodeId }: QuestionEditorProps) {
  const file = useTreeStore((s) => s.file);
  const updateNode = useTreeStore((s) => s.updateNode);
  const deleteNode = useTreeStore((s) => s.deleteNode);

  // Find the topic and get the node from its nested nodes
  const topic = file?.topics.find((t) => t.id === topicId);
  const node = topic?.nodes[nodeId] as QuestionNode | undefined;

  if (!node || node.type !== "question") return null;

  const handleUpdateField = (field: string, value: string) => {
    updateNode(topicId, nodeId, { [field]: value } as Partial<QuestionNode>);
  };

  const handleUpdateOption = (optionIndex: number, updates: Partial<AnswerOption>) => {
    const newOptions = [...node.options];
    newOptions[optionIndex] = { ...newOptions[optionIndex], ...updates };
    updateNode(topicId, nodeId, { options: newOptions } as Partial<QuestionNode>);
  };

  const handleAddOption = () => {
    const existingIds = node.options.map((o) => o.id);
    const newOption: AnswerOption = {
      id: generateOptionId(existingIds),
      text: "New Option",
      textAr: "[Arabic: New Option]",
      nextNodeId: "",
    };
    updateNode(topicId, nodeId, { options: [...node.options, newOption] } as Partial<QuestionNode>);
  };

  const handleDeleteOption = (optionIndex: number) => {
    const newOptions = node.options.filter((_, i) => i !== optionIndex);
    updateNode(topicId, nodeId, { options: newOptions } as Partial<QuestionNode>);
  };

  const handleDeleteNode = () => {
    if (confirm("Delete this node? References to it will be removed from other nodes.")) {
      deleteNode(topicId, nodeId);
    }
  };

  // Collect available node IDs from this topic's nodes for the nextNodeId dropdown
  const availableNodes = topic
    ? Object.entries(topic.nodes)
        .filter(([id]) => id !== nodeId)
        .map(([id, n]) => ({
          id,
          label: n.type === "question" ? (n as QuestionNode).questionText : `[Result] ${id}`,
        }))
    : [];

  return (
    <div className="space-y-4">
      <BilingualInput
        label="Question Text"
        valueEn={node.questionText}
        valueAr={node.questionTextAr}
        onChangeEn={(v) => handleUpdateField("questionText", v)}
        onChangeAr={(v) => handleUpdateField("questionTextAr", v)}
        multiline
      />

      <BilingualInput
        label="Hint (optional)"
        valueEn={node.hint || ""}
        valueAr={node.hintAr || ""}
        onChangeEn={(v) => handleUpdateField("hint", v)}
        onChangeAr={(v) => handleUpdateField("hintAr", v)}
      />

      <Separator />

      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Options ({node.options.length})</h4>
        <Button size="sm" variant="outline" onClick={handleAddOption}>
          <Plus className="h-3 w-3 mr-1" /> Add Option
        </Button>
      </div>

      <Accordion type="multiple" className="space-y-2">
        {node.options.map((option, index) => (
          <AccordionItem key={option.id} value={option.id} className="border rounded-lg px-3">
            <AccordionTrigger className="text-sm py-2 hover:no-underline">
              <div className="flex items-center gap-2 text-left">
                <span className="font-mono text-[10px] text-muted-foreground">{option.id}</span>
                <span className="truncate max-w-[180px]">{option.text}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-3">
              <OptionEditor
                option={option}
                availableNodes={availableNodes}
                onUpdate={(updates) => handleUpdateOption(index, updates)}
                onDelete={() => handleDeleteOption(index)}
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
