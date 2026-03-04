"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useUIStore } from "@/lib/store/ui-store";
import type { ResultNode as RNode } from "@/lib/types/decision-tree";
import { Badge } from "@/components/ui/badge";

const priorityBorderClasses: Record<number, string> = {
  1: "border-green-400 bg-green-50",
  2: "border-yellow-400 bg-yellow-50",
};

function ResultNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as RNode & { isRoot?: boolean };
  const languageDisplay = useUIStore((s) => s.languageDisplay);

  const displayText =
    languageDisplay === "ar" ? nodeData.summaryAr : nodeData.summary;

  const topRec = nodeData.recommendations?.[0];
  const borderClass = topRec
    ? priorityBorderClasses[topRec.priority ?? 1] || "border-gray-300"
    : "border-green-300";

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 shadow-sm min-w-[240px] max-w-[320px] ${borderClass} ${
        selected ? "ring-2 ring-green-200" : ""
      }`}
    >
      <Handle type="target" position={Position.Top} className="bg-green-400! w-3! h-3!" />

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
            {topRec.priority === 2 ? "2nd choice" : "1st choice"}
          </Badge>
        )}
      </div>
    </div>
  );
}

export const ResultNodeWidget = memo(ResultNodeComponent);
