"use client";

import { useState, useMemo } from "react";
import { useTreeStore } from "@/lib/store/tree-store";
import { useUIStore } from "@/lib/store/ui-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Search, Settings } from "lucide-react";

export function Sidebar() {
  const file = useTreeStore((s) => s.file);
  const toggleTopicEnabled = useTreeStore((s) => s.toggleTopicEnabled);

  const selectedTopicId = useUIStore((s) => s.selectedTopicId);
  const setSelectedTopic = useUIStore((s) => s.setSelectedTopic);
  const showPanelSettings = useUIStore((s) => s.showPanelSettings);
  const setShowPanelSettings = useUIStore((s) => s.setShowPanelSettings);

  const [search, setSearch] = useState("");

  const topics = useMemo(() => {
    if (!file) return [];
    let filtered = file.topics;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (t) => t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [file, search]);

  if (!file) return null;

  const panelInfo = file.panel_info;
  const topicCount = file.topics?.length ?? 0;

  // Handle old file format or missing panel_info
  if (!panelInfo) {
    return (
      <div className="w-64 border-r bg-gray-50/50 flex flex-col shrink-0 p-4">
        <p className="text-sm text-muted-foreground">
          Invalid file format. Please reload a valid decision tree file.
        </p>
      </div>
    );
  }

  return (
    <div className="w-64 border-r bg-gray-50/50 flex flex-col shrink-0">
      {/* Panel info header */}
      <div className="px-4 py-3 border-b">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold truncate">{panelInfo.name ?? "Unnamed Panel"}</h2>
          <button
            onClick={() => setShowPanelSettings(!showPanelSettings)}
            className="text-muted-foreground hover:text-foreground p-1 rounded"
            title="Panel settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{topicCount} topics</span>
          {panelInfo.isEnabled === false && (
            <Badge variant="secondary" className="text-[10px] px-1 py-0">
              Disabled
            </Badge>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-2 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topics..."
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      {/* Topic list */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {topics.map((topic) => {
            const nodeCount = Object.keys(topic.nodes).length;
            return (
              <div
                key={topic.id}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer transition-colors ${
                  selectedTopicId === topic.id ? "bg-accent" : "hover:bg-accent/50"
                }`}
              >
                <button
                  className="flex-1 text-left min-w-0"
                  onClick={() => setSelectedTopic(topic.id)}
                >
                  <div className="font-medium truncate">{topic.name}</div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="font-mono">{topic.id}</span>
                    <span>• {nodeCount} nodes</span>
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTopicEnabled(topic.id);
                  }}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                  title={topic.isEnabled ? "Disable topic" : "Enable topic"}
                >
                  {topic.isEnabled ? (
                    <Eye className="h-3.5 w-3.5" />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5 text-muted-foreground/50" />
                  )}
                </button>
              </div>
            );
          })}
          {topics.length === 0 && (
            <p className="text-xs text-muted-foreground px-3 py-2">
              {search ? "No topics match your search" : "No topics yet"}
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
