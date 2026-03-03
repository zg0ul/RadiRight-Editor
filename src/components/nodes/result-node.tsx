"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useUIStore } from "@/lib/store/ui-store";
import type { ResultNode as RNode } from "@/lib/types/decision-tree";
import { Badge } from "@/components/ui/badge";

const appropriatenessColors: Record<string, string> = {
  usuallyAppropriate: "border-green-400 bg-green-50",
  mayBeAppropriate: "border-yellow-400 bg-yellow-50",
  usuallyNotAppropriate: "border-red-400 bg-red-50",
  noImagingIndicated: "border-gray-400 bg-gray-50",
};

const appropriatenessLabels: Record<string, string> = {
  usuallyAppropriate: "Usually Appropriate",
  mayBeAppropriate: "May Be Appropriate",
  usuallyNotAppropriate: "Usually Not Appropriate",
  noImagingIndicated: "No Imaging",
};

function ResultNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as RNode & { isRoot?: boolean };
  const languageDisplay = useUIStore((s) => s.languageDisplay);

  const displayText =
    languageDisplay === "ar" ? nodeData.summaryAr : nodeData.summary;

  const topRec = nodeData.recommendations?.[0];
  const borderClass = topRec
    ? appropriatenessColors[topRec.appropriateness] || "border-gray-300"
    : "border-green-300";

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 shadow-sm min-w-[240px] max-w-[320px] ${borderClass} ${
        selected ? "ring-2 ring-green-200" : ""
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-green-400 !w-3 !h-3" />

      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] text-muted-foreground font-mono">{nodeData.id}</span>
      </div>

      {displayText && (
        <p
          className="text-sm font-medium text-gray-800 line-clamp-2 mb-2"
          dir={languageDisplay === "ar" ? "rtl" : "ltr"}
        >
          {displayText}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-1">
        <Badge variant="outline" className="text-[10px]">
          {nodeData.recommendations?.length || 0} recommendations
        </Badge>
        {topRec && (
          <Badge variant="secondary" className="text-[10px]">
            {appropriatenessLabels[topRec.appropriateness] || topRec.appropriateness}
          </Badge>
        )}
      </div>
    </div>
  );
}

export const ResultNodeWidget = memo(ResultNodeComponent);
