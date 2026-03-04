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
  const options = nodeData.options ?? [];

  return (
    <div
      className={`rounded-xl border-2 bg-white shadow-md min-w-[260px] max-w-[320px] transition-shadow ${
        selected
          ? "border-blue-500 shadow-blue-100 shadow-lg ring-2 ring-blue-200"
          : "border-blue-300 hover:shadow-md"
      }`}
    >
      {/* Target handle — always centred on top */}
      <Handle
        type="target"
        position={Position.Top}
        className="bg-blue-500! w-3! h-3! border-2! border-white!"
      />

      {/* Header strip */}
      <div className="bg-blue-50 px-4 py-2 rounded-t-xl border-b border-blue-100 flex items-center gap-2">
        {nodeData.isRoot && (
          <Badge className="text-[10px] px-1.5 py-0 bg-amber-400 text-white border-0 shrink-0">
            ROOT
          </Badge>
        )}
        <span className="text-[10px] text-blue-400 font-mono truncate">
          {nodeData.id}
        </span>
        {hasPlaceholderAr && (
          <span
            className="w-2 h-2 rounded-full bg-orange-400 shrink-0"
            title="Arabic translation missing"
          />
        )}
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        <p
          className="text-sm font-semibold text-gray-800 leading-snug"
          dir={languageDisplay === "ar" ? "rtl" : "ltr"}
        >
          {displayText}
        </p>

        {nodeData.hint && (
          <p className="text-xs text-gray-400 mt-1 italic line-clamp-1">
            {nodeData.hint}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-3 flex items-center gap-2">
        <Badge variant="outline" className="text-[10px] border-blue-200 text-blue-600">
          {options.length} {options.length === 1 ? "option" : "options"}
        </Badge>
        {nodeData.hint && (
          <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-500 border-blue-200">
            hint
          </Badge>
        )}
      </div>

      {/*
        Per-option source handles spread evenly along the bottom.
        Each handle id matches the option id so onConnect can
        identify which option is being wired.
        Tooltip shows the option text on hover.
      */}
      {options.length > 0 ? (
        options.map((option, i) => (
          <Handle
            key={option.id}
            id={option.id}
            type="source"
            position={Position.Bottom}
            style={{
              left: `${((i + 1) / (options.length + 1)) * 100}%`,
              transform: "translate(-50%, 50%)",
              bottom: 0,
            }}
            className="bg-blue-500! w-3! h-3! border-2! border-white!"
            title={option.text}
          />
        ))
      ) : (
        /* When no options exist, show a disabled-looking handle as a visual cue */
        <Handle
          type="source"
          position={Position.Bottom}
          className="bg-gray-300! w-3! h-3! border-2! border-white! cursor-not-allowed!"
          isConnectable={false}
        />
      )}
    </div>
  );
}

export const QuestionNodeWidget = memo(QuestionNodeComponent);
