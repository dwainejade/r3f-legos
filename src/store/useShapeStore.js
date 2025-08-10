import { create } from "zustand";

const GRID_SIZE = 1;

export const useShapeStore = create((set, get) => ({
  // State
  shapes: [],
  selectedShapeId: null,
  gridSize: GRID_SIZE,
  transformMode: "translate", // 'translate', 'rotate', 'scale'
  editorMode: "add", // 'add', 'select', 'remove'

  // Actions
  addShape: (shape) =>
    set((state) => ({
      shapes: [...state.shapes, { ...shape, id: crypto.randomUUID() }],
    })),

  updateShape: (id, updates) =>
    set((state) => ({
      shapes: state.shapes.map((shape) =>
        shape.id === id ? { ...shape, ...updates } : shape
      ),
    })),

  removeShape: (id) =>
    set((state) => ({
      shapes: state.shapes.filter((shape) => shape.id !== id),
      selectedShapeId:
        state.selectedShapeId === id ? null : state.selectedShapeId,
    })),

  selectShape: (id) => set({ selectedShapeId: id }),

  setTransformMode: (mode) => set({ transformMode: mode }),

  setEditorMode: (mode) =>
    set({
      editorMode: mode,
      selectedShapeId: mode === "add" ? null : get().selectedShapeId,
    }),

  getSelectedShape: () => {
    const { shapes, selectedShapeId } = get();
    return shapes.find((shape) => shape.id === selectedShapeId);
  },

  clearAll: () => set({ shapes: [], selectedShapeId: null }),
}));
