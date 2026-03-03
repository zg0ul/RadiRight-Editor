"use client";

import { useTreeStore } from "@/lib/store/tree-store";
import { useUIStore } from "@/lib/store/ui-store";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { JsonImport } from "@/components/panels/json-import";
import { PanelFormDialog } from "@/components/panels/panel-form-dialog";
import { DecisionGraph } from "@/components/graph/decision-graph";
import { NodeEditorPanel } from "@/components/editing/node-editor-panel";
import { ValidationPanel } from "@/components/editing/validation-panel";

export function EditorApp() {
  const file = useTreeStore((s) => s.file);
  const selectedTopicId = useUIStore((s) => s.selectedTopicId);
  const selectedNodeId = useUIStore((s) => s.selectedNodeId);
  const showPanelSettings = useUIStore((s) => s.showPanelSettings);
  const setShowPanelSettings = useUIStore((s) => s.setShowPanelSettings);

  // No file loaded -> show import screen
  if (!file) {
    return (
      <div className="h-screen flex flex-col">
        <Header />
        <JsonImport />
      </div>
    );
  }

  // File loaded but no topic selected -> show sidebar with message
  if (!selectedTopicId) {
    return (
      <div className="h-screen flex flex-col">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-2">Select a topic from the sidebar</p>
              <p className="text-sm">Or create a new topic to get started</p>
            </div>
          </main>
        </div>
        <PanelFormDialog
          open={showPanelSettings}
          onOpenChange={setShowPanelSettings}
        />
      </div>
    );
  }

  // Topic selected -> show graph editor
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          <div className="flex-1 flex min-h-0 overflow-hidden">
            <div className="flex-1 min-h-0 min-w-0 relative">
              <div className="absolute inset-0">
                <DecisionGraph topicId={selectedTopicId} />
              </div>
            </div>
            {selectedNodeId && (
              <div className="w-[380px] border-l bg-white overflow-hidden">
                <NodeEditorPanel />
              </div>
            )}
          </div>
          <ValidationPanel />
        </div>
      </div>
      <PanelFormDialog
        open={showPanelSettings}
        onOpenChange={setShowPanelSettings}
      />
    </div>
  );
}
