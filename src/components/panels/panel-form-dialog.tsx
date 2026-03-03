"use client";

import { useState, useEffect } from "react";
import { useTreeStore } from "@/lib/store/tree-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface PanelFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PanelFormDialog({ open, onOpenChange }: PanelFormDialogProps) {
  const file = useTreeStore((s) => s.file);
  const updatePanelInfo = useTreeStore((s) => s.updatePanelInfo);
  const togglePanelEnabled = useTreeStore((s) => s.togglePanelEnabled);

  const panelInfo = file?.panel_info;

  const [id, setId] = useState(panelInfo?.id || "");
  const [name, setName] = useState(panelInfo?.name || "");
  const [nameAr, setNameAr] = useState(panelInfo?.nameAr || "");
  const [description, setDescription] = useState(panelInfo?.description || "");
  const [descriptionAr, setDescriptionAr] = useState(panelInfo?.descriptionAr || "");
  const [iconName, setIconName] = useState(panelInfo?.iconName || "");

  // Reset form when dialog opens
  useEffect(() => {
    if (open && panelInfo) {
      setId(panelInfo.id);
      setName(panelInfo.name);
      setNameAr(panelInfo.nameAr);
      setDescription(panelInfo.description || "");
      setDescriptionAr(panelInfo.descriptionAr || "");
      setIconName(panelInfo.iconName || "");
    }
  }, [open, panelInfo]);

  const handleSave = () => {
    if (!name.trim()) return;

    updatePanelInfo({
      id: id.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
      name,
      nameAr: nameAr || `[Arabic: ${name}]`,
      description: description || undefined,
      descriptionAr: descriptionAr || (description ? `[Arabic: ${description}]` : undefined),
      iconName: iconName || undefined,
    });

    onOpenChange(false);
  };

  if (!panelInfo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Panel Info</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs">Panel ID</Label>
            <Input
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="e.g., msk"
              className="font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Name (EN)</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Panel name" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Name (AR)</Label>
              <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} placeholder="Arabic name" dir="rtl" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Description (EN)</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Description (AR)</Label>
              <Textarea value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} rows={2} dir="rtl" />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Icon Name</Label>
            <Input value={iconName} onChange={(e) => setIconName(e.target.value)} placeholder="e.g., skeleton, lungs" />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs">Enabled</Label>
            <Switch
              checked={panelInfo.isEnabled}
              onCheckedChange={() => togglePanelEnabled()}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
