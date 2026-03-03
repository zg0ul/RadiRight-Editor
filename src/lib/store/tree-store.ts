import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  DecisionTreeFile,
  PanelInfo,
  Topic,
  DecisionNode,
  QuestionNode,
} from "../types/decision-tree";

interface TreeState {
  // Data
  file: DecisionTreeFile | null;
  fileName: string | null;
  isDirty: boolean;

  // Undo/redo
  history: DecisionTreeFile[];
  historyIndex: number;

  // Actions - file level
  loadFile: (file: DecisionTreeFile, fileName: string) => void;
  clearFile: () => void;
  getExportData: () => DecisionTreeFile | null;

  // Actions - panel (single panel per file)
  updatePanelInfo: (updates: Partial<PanelInfo>) => void;
  togglePanelEnabled: () => void;

  // Actions - topics
  addTopic: (topic: Topic) => void;
  updateTopic: (id: string, updates: Partial<Omit<Topic, "nodes">>) => void;
  deleteTopic: (id: string) => void;
  toggleTopicEnabled: (id: string) => void;

  // Actions - nodes (require topicId since nodes are nested)
  addNode: (topicId: string, node: DecisionNode) => void;
  updateNode: (
    topicId: string,
    nodeId: string,
    updates: Partial<DecisionNode>,
  ) => void;
  deleteNode: (topicId: string, nodeId: string) => void;

  // Helper to get a topic by ID
  getTopic: (topicId: string) => Topic | undefined;

  // Actions - undo/redo
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const MAX_HISTORY = 50;

function pushHistory(state: TreeState): {
  history: DecisionTreeFile[];
  historyIndex: number;
} {
  if (!state.file)
    return { history: state.history, historyIndex: state.historyIndex };
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(JSON.parse(JSON.stringify(state.file)));
  if (newHistory.length > MAX_HISTORY) newHistory.shift();
  return { history: newHistory, historyIndex: newHistory.length - 1 };
}

export const useTreeStore = create<TreeState>()(
  persist(
    (set, get) => ({
      file: null,
      fileName: null,
      isDirty: false,
      history: [],
      historyIndex: -1,

      loadFile: (file, fileName) =>
        set({
          file: JSON.parse(JSON.stringify(file)),
          fileName,
          isDirty: false,
          history: [JSON.parse(JSON.stringify(file))],
          historyIndex: 0,
        }),

      clearFile: () =>
        set({
          file: null,
          fileName: null,
          isDirty: false,
          history: [],
          historyIndex: -1,
        }),

      getExportData: () => {
        const state = get();
        if (!state.file) return null;
        return JSON.parse(JSON.stringify(state.file)) as DecisionTreeFile;
      },

      // Panel info operations (single panel per file)
      updatePanelInfo: (updates) =>
        set((state) => {
          if (!state.file) return state;
          const hist = pushHistory(state);
          return {
            ...hist,
            file: {
              ...state.file,
              panel_info: { ...state.file.panel_info, ...updates },
            },
            isDirty: true,
          };
        }),

      togglePanelEnabled: () =>
        set((state) => {
          if (!state.file) return state;
          const hist = pushHistory(state);
          return {
            ...hist,
            file: {
              ...state.file,
              panel_info: {
                ...state.file.panel_info,
                isEnabled: !state.file.panel_info.isEnabled,
              },
            },
            isDirty: true,
          };
        }),

      // Topics
      addTopic: (topic) =>
        set((state) => {
          if (!state.file) return state;
          const hist = pushHistory(state);
          return {
            ...hist,
            file: {
              ...state.file,
              topics: [...state.file.topics, topic],
            },
            isDirty: true,
          };
        }),

      updateTopic: (id, updates) =>
        set((state) => {
          if (!state.file) return state;
          const hist = pushHistory(state);
          return {
            ...hist,
            file: {
              ...state.file,
              topics: state.file.topics.map((t) =>
                t.id === id ? { ...t, ...updates } : t,
              ),
            },
            isDirty: true,
          };
        }),

      deleteTopic: (id) =>
        set((state) => {
          if (!state.file) return state;
          const hist = pushHistory(state);
          return {
            ...hist,
            file: {
              ...state.file,
              topics: state.file.topics.filter((t) => t.id !== id),
            },
            isDirty: true,
          };
        }),

      toggleTopicEnabled: (id) =>
        set((state) => {
          if (!state.file) return state;
          const hist = pushHistory(state);
          return {
            ...hist,
            file: {
              ...state.file,
              topics: state.file.topics.map((t) =>
                t.id === id ? { ...t, isEnabled: !t.isEnabled } : t,
              ),
            },
            isDirty: true,
          };
        }),

      // Nodes (nested under topics)
      addNode: (topicId, node) =>
        set((state) => {
          if (!state.file) return state;
          const hist = pushHistory(state);
          return {
            ...hist,
            file: {
              ...state.file,
              topics: state.file.topics.map((t) =>
                t.id === topicId
                  ? { ...t, nodes: { ...t.nodes, [node.id]: node } }
                  : t,
              ),
            },
            isDirty: true,
          };
        }),

      updateNode: (topicId, nodeId, updates) =>
        set((state) => {
          if (!state.file) return state;
          const topic = state.file.topics.find((t) => t.id === topicId);
          if (!topic || !topic.nodes[nodeId]) return state;

          const hist = pushHistory(state);
          const existingNode = topic.nodes[nodeId];
          const updatedNode = { ...existingNode, ...updates } as DecisionNode;

          return {
            ...hist,
            file: {
              ...state.file,
              topics: state.file.topics.map((t) =>
                t.id === topicId
                  ? { ...t, nodes: { ...t.nodes, [nodeId]: updatedNode } }
                  : t,
              ),
            },
            isDirty: true,
          };
        }),

      deleteNode: (topicId, nodeId) =>
        set((state) => {
          if (!state.file) return state;
          const topic = state.file.topics.find((t) => t.id === topicId);
          if (!topic) return state;

          const hist = pushHistory(state);
          const newNodes = { ...topic.nodes };
          delete newNodes[nodeId];

          // Also remove references to this node from question options within the same topic
          for (const nId of Object.keys(newNodes)) {
            const node = newNodes[nId];
            if (node.type === "question") {
              const q = node as QuestionNode;
              const filtered = q.options.filter((o) => o.nextNodeId !== nodeId);
              if (filtered.length !== q.options.length) {
                newNodes[nId] = { ...q, options: filtered };
              }
            }
          }

          return {
            ...hist,
            file: {
              ...state.file,
              topics: state.file.topics.map((t) =>
                t.id === topicId ? { ...t, nodes: newNodes } : t,
              ),
            },
            isDirty: true,
          };
        }),

      getTopic: (topicId) => {
        const state = get();
        return state.file?.topics.find((t) => t.id === topicId);
      },

      // Undo/redo
      undo: () =>
        set((state) => {
          if (state.historyIndex <= 0) return state;
          const newIndex = state.historyIndex - 1;
          return {
            file: JSON.parse(JSON.stringify(state.history[newIndex])),
            historyIndex: newIndex,
            isDirty: true,
          };
        }),

      redo: () =>
        set((state) => {
          if (state.historyIndex >= state.history.length - 1) return state;
          const newIndex = state.historyIndex + 1;
          return {
            file: JSON.parse(JSON.stringify(state.history[newIndex])),
            historyIndex: newIndex,
            isDirty: true,
          };
        }),

      canUndo: () => {
        const state = get();
        return state.historyIndex > 0;
      },

      canRedo: () => {
        const state = get();
        return state.historyIndex < state.history.length - 1;
      },
    }),
    {
      name: "radi-right-editor-storage",
      version: 2, // Bump version to invalidate old stored data
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          // Return a no-op storage for SSR
          return {
            length: 0,
            clear: () => {},
            getItem: () => null,
            key: () => null,
            removeItem: () => {},
            setItem: () => {},
          } satisfies Storage;
        }
        return localStorage;
      }),
      partialize: (state) => ({
        file: state.file,
        fileName: state.fileName,
      }),
      // Migrate old data format
      migrate: (persistedState, version) => {
        const state = persistedState as { file?: unknown; fileName?: string };
        // If coming from old version, clear the file to force re-import
        if (version < 2 && state.file) {
          const file = state.file as Record<string, unknown>;
          // Old format had 'panels' array, new format has 'panel_info' object
          if (!file.panel_info || Array.isArray(file.panels)) {
            return { file: null, fileName: null };
          }
        }
        return state;
      },
      // Validate on rehydrate
      onRehydrateStorage: () => (state) => {
        if (state?.file) {
          const file = state.file as unknown as Record<string, unknown>;
          // Clear if invalid format
          if (!file.panel_info) {
            state.file = null;
            state.fileName = null;
          }
        }
      },
    },
  ),
);
