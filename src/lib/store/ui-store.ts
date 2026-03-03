import { create } from "zustand";

export type LanguageDisplay = "en" | "ar" | "both";

interface UIState {
  // Navigation
  selectedPanelId: string | null;
  selectedTopicId: string | null;
  selectedNodeId: string | null;

  // Display
  languageDisplay: LanguageDisplay;
  sidebarOpen: boolean;
  showPanelSettings: boolean;

  // Actions
  setSelectedPanel: (id: string | null) => void;
  setSelectedTopic: (id: string | null) => void;
  setSelectedNode: (id: string | null) => void;
  setLanguageDisplay: (mode: LanguageDisplay) => void;
  setSidebarOpen: (open: boolean) => void;
  setShowPanelSettings: (show: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  selectedPanelId: null,
  selectedTopicId: null,
  selectedNodeId: null,
  languageDisplay: "en",
  sidebarOpen: true,
  showPanelSettings: false,

  setSelectedPanel: (id) => set({ selectedPanelId: id, selectedTopicId: null, selectedNodeId: null }),
  setSelectedTopic: (id) => set({ selectedTopicId: id, selectedNodeId: null }),
  setSelectedNode: (id) => set({ selectedNodeId: id }),
  setLanguageDisplay: (mode) => set({ languageDisplay: mode }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setShowPanelSettings: (show) => set({ showPanelSettings: show }),
}));
