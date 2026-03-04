"use client";

import { useState, useEffect } from "react";
import { useTreeStore } from "@/lib/store/tree-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { Topic, QuestionNode } from "@/lib/types/decision-tree";

// Topic icon names matching Flutter TopicIcon enum (lib/features/assessment/domain/enums/topic_icon.dart)
const TOPIC_ICON_NAMES = [
  "skeleton",
  "bone",
  "joint",
  "xray",
  "hand",
  "wrist",
  "foot",
  "ankle",
  "shoulder",
  "elbow",
  "hip",
  "knee",
  "spine",
  "lungs",
  "chest",
  "brain",
  "head",
  "heart",
  "kidneys",
  "liver",
  "stomach",
  "abdomen",
  "baby",
  "medical",
] as const;

function getTopicIconComponent(iconName?: string | null) {
  const key = iconName?.toLowerCase();
  switch (key) {
    case "skeleton":
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
      return undefined;
  }
}

interface TopicFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  panelId: string;
  topic?: Topic;
}

export function TopicFormDialog({
  open,
  onOpenChange,
  panelId,
  topic,
}: TopicFormDialogProps) {
  const addTopic = useTreeStore((s) => s.addTopic);
  const updateTopic = useTreeStore((s) => s.updateTopic);

  const [name, setName] = useState(topic?.name || "");
  const [nameAr, setNameAr] = useState(topic?.nameAr || "");
  const [description, setDescription] = useState(topic?.description || "");
  const [descriptionAr, setDescriptionAr] = useState(
    topic?.descriptionAr || "",
  );
  const [iconName, setIconName] = useState<string>(topic?.iconName ?? "");

  // Sync form when dialog opens (create vs edit) without synchronous state updates in the effect body
  useEffect(() => {
    if (!open) return;

    queueMicrotask(() => {
      setName(topic?.name || "");
      setNameAr(topic?.nameAr || "");
      setDescription(topic?.description || "");
      setDescriptionAr(topic?.descriptionAr || "");
      setIconName(topic?.iconName ?? "");
    });
  }, [
    open,
    topic?.id,
    topic?.name,
    topic?.nameAr,
    topic?.description,
    topic?.descriptionAr,
    topic?.iconName,
  ]);

  const handleSave = () => {
    if (!name.trim()) return;

    if (topic) {
      updateTopic(topic.id, {
        name,
        nameAr,
        description,
        descriptionAr,
        iconName: iconName || undefined,
      });
    } else {
      const id = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");
      const rootNodeId = "q1";

      // Create the root question node (without topicId - it's now implicit)
      const rootNode: QuestionNode = {
        id: rootNodeId,
        type: "question",
        questionText: "Initial question",
        questionTextAr: "[Arabic: Initial question]",
        options: [],
      };

      // Create the topic with nested nodes
      const newTopic: Topic = {
        id,
        panelId,
        name,
        nameAr: nameAr || `[Arabic: ${name}]`,
        description,
        descriptionAr:
          descriptionAr ||
          (description ? `[Arabic: ${description}]` : undefined),
        iconName: iconName || undefined,
        rootNodeId,
        isEnabled: true,
        nodes: {
          [rootNodeId]: rootNode,
        },
      };

      addTopic(newTopic);
    }

    onOpenChange(false);
    setName("");
    setNameAr("");
    setDescription("");
    setDescriptionAr("");
    setIconName("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{topic ? "Edit Topic" : "Create Topic"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Name (EN)</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Topic name"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Name (AR)</Label>
              <Input
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="Arabic name"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Description (EN)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Description (AR)</Label>
              <Textarea
                value={descriptionAr}
                onChange={(e) => setDescriptionAr(e.target.value)}
                rows={2}
                dir="rtl"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Icon</Label>
            <Select
              value={iconName || "__none__"}
              onValueChange={(v) => setIconName(v === "__none__" ? "" : v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select topic icon (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">None</span>
                  </div>
                </SelectItem>
                {TOPIC_ICON_NAMES.map((icon) => {
                  const Icon = getTopicIconComponent(icon);
                  return (
                    <SelectItem key={icon} value={icon}>
                      <div className="flex items-center gap-2">
                        {Icon && (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md border border-border/60 bg-white/60">
                            <HugeiconsIcon
                              icon={Icon}
                              size={14}
                              color="currentColor"
                              strokeWidth={1.6}
                            />
                          </span>
                        )}
                        <span className="text-xs capitalize">{icon}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {topic ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
