"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useUIStore } from "@/lib/store/ui-store";
import type { ResultNode as RNode } from "@/lib/types/decision-tree";
import { Badge } from "@/components/ui/badge";

function ResultNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as RNode & { isRoot?: boolean };
  const languageDisplay = useUIStore((s) => s.languageDisplay);

  const displayText =
    languageDisplay === "ar" ? nodeData.summaryAr : nodeData.summary;

  const topRec = nodeData.recommendations?.[0];
  const is1st = !topRec || (topRec.priority ?? 1) === 1;

  return (
    <div
      className={`rounded-xl border-2 shadow-md min-w-[260px] max-w-[340px] transition-shadow ${
        is1st
          ? "border-green-400 bg-green-50"
          : "border-yellow-400 bg-yellow-50"
      } ${selected ? "shadow-lg ring-2 ring-green-200" : "hover:shadow-md"}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="bg-green-500! w-3! h-3! border-2! border-white!"
      />

      {/* Header strip */}
      <div
        className={`px-4 py-2 rounded-t-xl border-b flex items-center gap-2 ${
          is1st
            ? "bg-green-100 border-green-200"
            : "bg-yellow-100 border-yellow-200"
        }`}
      >
        <span
          className={`text-[10px] font-mono truncate ${
            is1st ? "text-green-500" : "text-yellow-600"
          }`}
        >
          {nodeData.id}
        </span>
        {topRec && (
          <Badge
            className={`ml-auto text-[10px] px-1.5 py-0 shrink-0 border-0 ${
              is1st
                ? "bg-green-500 text-white"
                : "bg-yellow-500 text-white"
            }`}
          >
            {is1st ? "1st choice" : "2nd choice"}
          </Badge>
        )}
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        {displayText && (
          <p
            className="text-sm font-semibold text-gray-800 leading-snug"
            dir={languageDisplay === "ar" ? "rtl" : "ltr"}
          >
            {displayText}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-3">
        <Badge
          variant="outline"
          className={`text-[10px] ${
            is1st
              ? "border-green-300 text-green-700"
              : "border-yellow-300 text-yellow-700"
          }`}
        >
          {nodeData.recommendations?.length || 0} recommendations
        </Badge>
      </div>
    </div>
  );
}

export const ResultNodeWidget = memo(ResultNodeComponent);
