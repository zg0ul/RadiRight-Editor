"use client";

import { useState, useMemo } from "react";
import { useTreeStore } from "@/lib/store/tree-store";
import { useUIStore } from "@/lib/store/ui-store";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  EyeOff,
  Search,
  Settings,
  Plus,
  MoreHorizontal,
  Trash2,
  Pencil,
} from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Bone01Icon,
  Bone02Icon,
  LungsIcon,
  BrainIcon,
  HeartCheckIcon,
  KidneysIcon,
  LiverIcon,
  XRayIcon,
  HandGripIcon,
  RunningShoesIcon,
  BodyPartMuscleIcon,
  Baby01Icon,
  StethoscopeIcon,
} from "@hugeicons/core-free-icons";
import { TopicFormDialog } from "@/components/topics/topic-form-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Sidebar() {
  const file = useTreeStore((s) => s.file);
  const toggleTopicEnabled = useTreeStore((s) => s.toggleTopicEnabled);
  const deleteTopic = useTreeStore((s) => s.deleteTopic);
  const getTopic = useTreeStore((s) => s.getTopic);

  const selectedTopicId = useUIStore((s) => s.selectedTopicId);
  const setSelectedTopic = useUIStore((s) => s.setSelectedTopic);
  const showPanelSettings = useUIStore((s) => s.showPanelSettings);
  const setShowPanelSettings = useUIStore((s) => s.setShowPanelSettings);

  const [search, setSearch] = useState("");
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);

  const resolveTopicIcon = (panelId: string, iconName?: string | null) => {
    const key = iconName?.toLowerCase();
    switch (key) {
      case "bone":
        return Bone01Icon;
      case "joint":
        return Bone02Icon;
      case "xray":
        return XRayIcon;
      case "hand":
      case "wrist":
        return HandGripIcon;
      case "foot":
      case "ankle":
        return RunningShoesIcon;
      case "shoulder":
      case "elbow":
        return Bone01Icon;
      case "hip":
      case "knee":
        return Bone02Icon;
      case "spine":
        return BodyPartMuscleIcon;
      case "lungs":
      case "chest":
        return LungsIcon;
      case "brain":
      case "head":
        return BrainIcon;
      case "heart":
        return HeartCheckIcon;
      case "kidneys":
      case "abdomen":
        return KidneysIcon;
      case "liver":
        return LiverIcon;
      case "stomach":
        return KidneysIcon;
      case "baby":
        return Baby01Icon;
      case "medical":
        return StethoscopeIcon;
      default:
        break;
    }

    switch (panelId.toLowerCase()) {
      case "msk":
        return Bone01Icon;
      case "chest":
        return LungsIcon;
      case "neuro":
        return BrainIcon;
      case "cardiac":
        return HeartCheckIcon;
      case "abdominal":
        return KidneysIcon;
      case "pediatric":
        return Baby01Icon;
      default:
        return StethoscopeIcon;
    }
  };

  const topics = useMemo(() => {
    if (!file) return [];
    let filtered = file.topics;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q),
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
    <>
      <div className="w-64 border-r bg-gray-50/50 flex flex-col shrink-0 min-h-0 overflow-hidden">
        {/* Panel info header */}
        <div className="px-4 py-3 border-b">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold truncate">
              {panelInfo.name ?? "Unnamed Panel"}
            </h2>
            <button
              onClick={() => setShowPanelSettings(!showPanelSettings)}
              className="text-muted-foreground hover:text-foreground p-1 rounded"
              title="Panel settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>{topicCount} topics</span>
              {panelInfo.isEnabled === false && (
                <Badge variant="secondary" className="text-[10px] px-1 py-0">
                  Disabled
                </Badge>
              )}
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => setTopicDialogOpen(true)}
              title="New topic"
            >
              <Plus className="h-3 w-3" />
            </Button>
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
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-2 space-y-0.5">
            {topics.map((topic) => {
              const nodeCount = Object.keys(topic.nodes).length;
              const Icon = resolveTopicIcon(panelInfo.id, topic.iconName);
              return (
                <div
                  key={topic.id}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer transition-colors ${
                    selectedTopicId === topic.id
                      ? "bg-accent"
                      : "hover:bg-accent/50"
                  } ${!topic.isEnabled ? "opacity-50 hover:opacity-75" : ""}`}
                >
                  {Icon && (
                    <div className="shrink-0 rounded-md bg-white/40 border border-border/60 flex items-center justify-center h-7 w-7">
                      <HugeiconsIcon
                        icon={Icon}
                        size={16}
                        color="currentColor"
                        strokeWidth={1.6}
                      />
                    </div>
                  )}
                  <button
                    className="flex-1 text-left min-w-0"
                    onClick={() => setSelectedTopic(topic.id)}
                  >
                    <div className="font-medium truncate">{topic.name}</div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground whitespace-nowrap">
                      <span className="font-mono">{topic.id}</span>
                      <span>• {nodeCount} nodes</span>
                      {!topic.isEnabled && (
                        <Badge
                          variant="secondary"
                          className="text-[9px] px-1 py-0"
                        >
                          Disabled
                        </Badge>
                      )}
                    </div>
                  </button>
                  <div className="flex items-center gap-1 shrink-0">
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
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="p-1 rounded hover:bg-accent/60 text-muted-foreground hover:text-foreground"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            setEditingTopicId(topic.id);
                          }}
                        >
                          <Pencil className="h-3 w-3" />
                          Rename topic
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={(e) => {
                            e.preventDefault();
                            deleteTopic(topic.id);
                            if (selectedTopicId === topic.id) {
                              setSelectedTopic(null);
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete topic
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
            {topics.length === 0 && (
              <div className="px-3 py-3 space-y-2 text-xs text-muted-foreground">
                <p>No topics yet.</p>
                <Button
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => setTopicDialogOpen(true)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Create first topic
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <TopicFormDialog
        open={topicDialogOpen}
        onOpenChange={setTopicDialogOpen}
        panelId={panelInfo.id}
      />
      {editingTopicId && (
        <TopicFormDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) setEditingTopicId(null);
          }}
          panelId={panelInfo.id}
          topic={getTopic(editingTopicId) ?? undefined}
        />
      )}
    </>
  );
}
