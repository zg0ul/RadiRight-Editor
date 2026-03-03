"use client";

import { BilingualInput } from "./bilingual-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import type { AnswerOption } from "@/lib/types/decision-tree";
import { Trash2 } from "lucide-react";

interface OptionEditorProps {
  option: AnswerOption;
  availableNodes: { id: string; label: string }[];
  onUpdate: (updates: Partial<AnswerOption>) => void;
  onDelete: () => void;
}

export function OptionEditor({ option, availableNodes, onUpdate, onDelete }: OptionEditorProps) {
  return (
    <div className="space-y-3">
      <BilingualInput
        label="Option Text"
        valueEn={option.text}
        valueAr={option.textAr}
        onChangeEn={(v) => onUpdate({ text: v })}
        onChangeAr={(v) => onUpdate({ textAr: v })}
      />

      <BilingualInput
        label="Description (optional)"
        valueEn={option.description || ""}
        valueAr={option.descriptionAr || ""}
        onChangeEn={(v) => onUpdate({ description: v })}
        onChangeAr={(v) => onUpdate({ descriptionAr: v })}
      />

      <div className="space-y-1">
        <Label className="text-xs font-medium text-muted-foreground">Next Node</Label>
        <Select value={option.nextNodeId} onValueChange={(v) => onUpdate({ nextNodeId: v })}>
          <SelectTrigger className="text-sm">
            <SelectValue placeholder="Select target node..." />
          </SelectTrigger>
          <SelectContent>
            {availableNodes.map((n) => (
              <SelectItem key={n.id} value={n.id} className="text-sm">
                <span className="font-mono text-[10px] mr-2">{n.id}</span>
                <span className="truncate">{n.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Red Flag */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-muted-foreground">Red Flag (optional)</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            value={option.redFlag?.category || ""}
            onChange={(e) =>
              onUpdate({
                redFlag: e.target.value
                  ? { category: e.target.value, severity: option.redFlag?.severity || "moderate" }
                  : undefined,
              })
            }
            placeholder="Category"
            className="text-sm"
          />
          <Select
            value={option.redFlag?.severity || ""}
            onValueChange={(v) =>
              onUpdate({
                redFlag: option.redFlag ? { ...option.redFlag, severity: v } : undefined,
              })
            }
          >
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Score Impact */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-muted-foreground">Score Impact (optional)</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            value={option.scoreImpact?.modalityKey || ""}
            onChange={(e) =>
              onUpdate({
                scoreImpact: e.target.value
                  ? { modalityKey: e.target.value, score: option.scoreImpact?.score || 0 }
                  : undefined,
              })
            }
            placeholder="Modality key"
            className="text-sm"
          />
          <Input
            type="number"
            value={option.scoreImpact?.score ?? ""}
            onChange={(e) =>
              onUpdate({
                scoreImpact: option.scoreImpact
                  ? { ...option.scoreImpact, score: parseInt(e.target.value) || 0 }
                  : undefined,
              })
            }
            placeholder="Score"
            className="text-sm"
          />
        </div>
      </div>

      <Separator />

      <Button size="sm" variant="ghost" className="text-destructive w-full" onClick={onDelete}>
        <Trash2 className="h-3 w-3 mr-1" /> Remove Option
      </Button>
    </div>
  );
}
