"use client";

import { useTreeStore } from "@/lib/store/tree-store";
import { useUIStore, type LanguageDisplay } from "@/lib/store/ui-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Download, Undo2, Redo2 } from "lucide-react";

export function Header() {
  const file = useTreeStore((s) => s.file);
  const fileName = useTreeStore((s) => s.fileName);
  const isDirty = useTreeStore((s) => s.isDirty);
  const getExportData = useTreeStore((s) => s.getExportData);
  const undo = useTreeStore((s) => s.undo);
  const redo = useTreeStore((s) => s.redo);
  const canUndo = useTreeStore((s) => s.canUndo);
  const canRedo = useTreeStore((s) => s.canRedo);

  const languageDisplay = useUIStore((s) => s.languageDisplay);
  const setLanguageDisplay = useUIStore((s) => s.setLanguageDisplay);

  const handleExport = () => {
    const data = getExportData();
    if (!data) return;
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "decision_trees.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className="h-14 border-b flex items-center justify-between px-4 bg-white shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold tracking-tight">RadiRight Editor</h1>
        {fileName && (
          <Badge variant="outline" className="text-xs font-mono">
            {fileName}
          </Badge>
        )}
        {isDirty && (
          <Badge variant="secondary" className="text-xs">
            unsaved
          </Badge>
        )}
      </div>

      {file && (
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={undo} disabled={!canUndo()}>
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={redo} disabled={!canRedo()}>
            <Redo2 className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <Select value={languageDisplay} onValueChange={(v) => setLanguageDisplay(v as LanguageDisplay)}>
            <SelectTrigger className="w-[100px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ar">Arabic</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>

          <Button size="sm" variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
        </div>
      )}
    </header>
  );
}
