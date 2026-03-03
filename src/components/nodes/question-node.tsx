"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useUIStore } from "@/lib/store/ui-store";
import type { QuestionNode as QNode } from "@/lib/types/decision-tree";
import { Badge } from "@/components/ui/badge";

function QuestionNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as QNode & { isRoot?: boolean };
  const languageDisplay = useUIStore((s) => s.languageDisplay);

  const displayText =
    languageDisplay === "ar" ? nodeData.questionTextAr : nodeData.questionText;
  const hasPlaceholderAr = nodeData.questionTextAr?.startsWith("[Arabic:");

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-white shadow-sm min-w-[240px] max-w-[300px] ${
        selected
          ? "border-blue-500 ring-2 ring-blue-200"
          : "border-blue-300"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-blue-400 !w-3 !h-3" />

      <div className="flex items-center gap-2 mb-1">
        {nodeData.isRoot && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700">
            ROOT
          </Badge>
        )}
        <span className="text-[10px] text-muted-foreground font-mono">{nodeData.id}</span>
        {hasPlaceholderAr && (
          <span className="w-2 h-2 rounded-full bg-orange-400" title="Arabic placeholder" />
        )}
      </div>

      <p
        className="text-sm font-medium text-gray-800 line-clamp-2"
        dir={languageDisplay === "ar" ? "rtl" : "ltr"}
      >
        {displayText}
      </p>

      <div className="flex items-center gap-2 mt-2">
        <Badge variant="outline" className="text-[10px]">
          {nodeData.options?.length || 0} options
        </Badge>
        {nodeData.hint && (
          <Badge variant="outline" className="text-[10px] bg-blue-50">
            hint
          </Badge>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-blue-400 !w-3 !h-3" />
    </div>
  );
}

export const QuestionNodeWidget = memo(QuestionNodeComponent);
