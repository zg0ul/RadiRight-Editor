"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useUIStore } from "@/lib/store/ui-store";
import type { NoGuidelinesNode as NGNode } from "@/lib/types/decision-tree";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

function NoGuidelinesNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as NGNode & { isRoot?: boolean };
  const languageDisplay = useUIStore((s) => s.languageDisplay);

  const displayText =
    languageDisplay === "ar"
      ? nodeData.summaryAr || "لا توجد إرشادات حالية تغطي هذا الموضوع"
      : nodeData.summary || "No current guidelines covering this topic";

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 shadow-sm min-w-[240px] max-w-[320px] border-amber-400 bg-amber-50 ${
        selected ? "ring-2 ring-amber-200" : ""
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-amber-400 !w-3 !h-3" />

      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] text-muted-foreground font-mono">{nodeData.id}</span>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <p
          className="text-sm font-medium text-amber-800 line-clamp-2"
          dir={languageDisplay === "ar" ? "rtl" : "ltr"}
        >
          {displayText}
        </p>
      </div>

      <Badge variant="outline" className="text-[10px] bg-amber-100 text-amber-800 border-amber-300">
        No Guidelines
      </Badge>
    </div>
  );
}

export const NoGuidelinesNodeWidget = memo(NoGuidelinesNodeComponent);
