"use client";

import { useMemo } from "react";
import { useTreeStore } from "@/lib/store/tree-store";
import { useUIStore } from "@/lib/store/ui-store";
import { validateTree, type ValidationIssue } from "@/lib/utils/validation";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, AlertTriangle } from "lucide-react";

export function ValidationPanel() {
  const file = useTreeStore((s) => s.file);
  const setSelectedNode = useUIStore((s) => s.setSelectedNode);

  const issues = useMemo(() => {
    if (!file) return [];
    return validateTree(file);
  }, [file]);

  const errors = issues.filter((i) => i.type === "error");
  const warnings = issues.filter((i) => i.type === "warning");

  if (issues.length === 0) {
    return (
      <div className="p-3 text-sm text-green-600 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500" />
        No validation issues
      </div>
    );
  }

  return (
    <div className="border-t bg-white">
      <div className="flex items-center gap-2 px-4 py-2 border-b">
        <span className="text-sm font-semibold">Validation</span>
        {errors.length > 0 && (
          <Badge variant="destructive" className="text-[10px]">
            {errors.length} errors
          </Badge>
        )}
        {warnings.length > 0 && (
          <Badge variant="secondary" className="text-[10px]">
            {warnings.length} warnings
          </Badge>
        )}
      </div>
      <ScrollArea className="max-h-48">
        <div className="p-2 space-y-1">
          {issues.map((issue, i) => (
            <button
              key={i}
              className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-accent flex items-start gap-2 transition-colors"
              onClick={() => {
                if (issue.nodeId) setSelectedNode(issue.nodeId);
              }}
            >
              {issue.type === "error" ? (
                <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 shrink-0 mt-0.5" />
              )}
              <span className={issue.type === "error" ? "text-red-700" : "text-yellow-700"}>
                {issue.message}
              </span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
