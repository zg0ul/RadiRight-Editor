"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useUIStore } from "@/lib/store/ui-store";
import type { NoGuidelinesNode as NGNode } from "@/lib/types/decision-tree";
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
      className={`rounded-xl border-2 shadow-md min-w-[260px] max-w-[340px] border-amber-400 bg-amber-50 transition-shadow ${
        selected ? "shadow-lg ring-2 ring-amber-200" : "hover:shadow-md"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="bg-amber-500! w-3! h-3! border-2! border-white!"
      />

      {/* Header strip */}
      <div className="px-4 py-2 rounded-t-xl bg-amber-100 border-b border-amber-200 flex items-center gap-2">
        <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
        <span className="text-[10px] text-amber-500 font-mono truncate">
          {nodeData.id}
        </span>
        <span className="ml-auto text-[10px] font-semibold text-amber-700 shrink-0">
          No Guidelines
        </span>
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        <p
          className="text-sm font-semibold text-amber-900 leading-snug"
          dir={languageDisplay === "ar" ? "rtl" : "ltr"}
        >
          {displayText}
        </p>
      </div>
    </div>
  );
}

export const NoGuidelinesNodeWidget = memo(NoGuidelinesNodeComponent);
