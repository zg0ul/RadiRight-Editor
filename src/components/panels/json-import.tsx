"use client";

import { useCallback, useRef, useState } from "react";
import { useTreeStore } from "@/lib/store/tree-store";
import { useUIStore } from "@/lib/store/ui-store";
import { decisionTreeFileSchema } from "@/lib/schemas/tree-schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileJson, Plus } from "lucide-react";
import type { DecisionTreeFile } from "@/lib/types/decision-tree";

export function JsonImport() {
  const loadFile = useTreeStore((s) => s.loadFile);
  const setSelectedPanel = useUIStore((s) => s.setSelectedPanel);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        const result = decisionTreeFileSchema.safeParse(json);

        if (!result.success) {
          setError(
            `Validation error: ${result.error.issues
              .slice(0, 3)
              .map((i) => i.message)
              .join("; ")}`
          );
          return;
        }

        // Use raw parsed JSON (not Zod output) to preserve property ordering for round-trip fidelity
        loadFile(json as DecisionTreeFile, file.name);
      } catch (e) {
        setError(`Failed to parse JSON: ${e instanceof Error ? e.message : "Unknown error"}`);
      }
    },
    [loadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith(".json")) {
        processFile(file);
      } else {
        setError("Please drop a .json file");
      }
    },
    [processFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleCreateNew = () => {
    const emptyFile: DecisionTreeFile = {
      panel_info: {
        id: "new_panel",
        name: "New Panel",
        nameAr: "[Arabic: New Panel]",
        description: "",
        descriptionAr: "",
        iconName: "folder",
        isEnabled: true,
      },
      topics: [],
    };
    loadFile(emptyFile, "new_decision_trees.json");
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
      <div className="max-w-lg w-full mx-4 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">RadiRight Decision Tree Editor</h2>
          <p className="text-muted-foreground text-sm">
            Upload a decision tree JSON file to start editing, or create a new one.
          </p>
        </div>

        <Card
          className={`border-2 border-dashed transition-colors cursor-pointer ${
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-medium">Drop JSON file here or click to browse</p>
              <p className="text-xs text-muted-foreground">Supports decision tree JSON files</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
          </CardContent>
        </Card>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Button variant="outline" className="w-full" onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" /> Create New Empty Project
        </Button>
      </div>
    </div>
  );
}
