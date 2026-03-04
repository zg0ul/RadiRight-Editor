"use client";

import { BilingualInput } from "./bilingual-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type {
  ImagingRecommendation,
  AppropriatenessLevel,
  RadiationLevel,
} from "@/lib/types/decision-tree";
import {
  IMAGING_MODALITY_OPTIONS,
  findImagingModalityByValue,
} from "@/lib/constants/imaging-modalities";
import { Trash2 } from "lucide-react";

interface RecommendationEditorProps {
  recommendation: ImagingRecommendation;
  onUpdate: (updates: Partial<ImagingRecommendation>) => void;
  onDelete: () => void;
}

export function RecommendationEditor({
  recommendation,
  onUpdate,
  onDelete,
}: RecommendationEditorProps) {
  const selectedModality = findImagingModalityByValue(recommendation.modality);

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs font-medium text-muted-foreground">
          Modality
        </Label>
        <Select
          value={selectedModality?.code ?? ""}
          onValueChange={(code) => {
            const modality = IMAGING_MODALITY_OPTIONS.find(
              (m) => m.code === code,
            );
            if (!modality) return;
            onUpdate({
              modality: modality.code,
              modalityAr: modality.labelAr,
            });
          }}
        >
          <SelectTrigger className="text-sm">
            <SelectValue placeholder="Select imaging modality" />
          </SelectTrigger>
          <SelectContent>
            {IMAGING_MODALITY_OPTIONS.map((modality) => (
              <SelectItem key={modality.code} value={modality.code}>
                {modality.labelEn} ({modality.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedModality && (
          <p className="text-[11px] text-muted-foreground">
            {selectedModality.labelAr}
          </p>
        )}
      </div>

      <BilingualInput
        label="Procedure"
        valueEn={recommendation.procedure}
        valueAr={recommendation.procedureAr}
        onChangeEn={(v) => onUpdate({ procedure: v })}
        onChangeAr={(v) => onUpdate({ procedureAr: v })}
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs font-medium text-muted-foreground">
            Appropriateness
          </Label>
          <Select
            value={recommendation.appropriateness}
            onValueChange={(v) =>
              onUpdate({ appropriateness: v as AppropriatenessLevel })
            }
          >
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="usuallyAppropriate">
                Usually Appropriate
              </SelectItem>
              <SelectItem value="mayBeAppropriate">May Be Appropriate</SelectItem>
              <SelectItem value="usuallyNotAppropriate">
                Usually Not Appropriate
              </SelectItem>
              <SelectItem value="noImagingIndicated">No Imaging</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-medium text-muted-foreground">
            Radiation
          </Label>
          <Select
            value={recommendation.radiation}
            onValueChange={(v) =>
              onUpdate({ radiation: v as RadiationLevel })
            }
          >
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs font-medium text-muted-foreground">
            Score (1-9)
          </Label>
          <Input
            type="number"
            min={1}
            max={9}
            value={recommendation.score ?? ""}
            onChange={(e) =>
              onUpdate({ score: parseInt(e.target.value) || undefined })
            }
            className="text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-medium text-muted-foreground">
            Priority
          </Label>
          <Select
            value={String(recommendation.priority ?? 1)}
            onValueChange={(v) => onUpdate({ priority: parseInt(v) })}
          >
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">
                1 - Indicated (1st choice)
              </SelectItem>
              <SelectItem value="2">
                2 - May be appropriate (2nd choice)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <BilingualInput
        label="Comments (optional)"
        valueEn={recommendation.comments || ""}
        valueAr={recommendation.commentsAr || ""}
        onChangeEn={(v) => onUpdate({ comments: v })}
        onChangeAr={(v) => onUpdate({ commentsAr: v })}
        multiline
      />

      <Separator />

      <Button
        size="sm"
        variant="ghost"
        className="text-destructive w-full"
        onClick={onDelete}
      >
        <Trash2 className="h-3 w-3 mr-1" /> Remove Recommendation
      </Button>
    </div>
  );
}
