// Enhanced Store with configurable grid settings
// Add these to your useShapeStore.js:

import { create } from "zustand";

const GRID_SIZE = 1; // Base grid unit

export const useShapeStore = create((set, get) => ({
  // State
  shapes: [],
  selectedShapeId: null,
  gridSize: GRID_SIZE,
  transformMode: "translate",
  editorMode: "add",

  // NEW: Grid configuration options
  snapToGrid: true, // Enable/disable grid snapping globally
  gridVisible: true, // Show/hide visual grid
  gridSubdivisions: 1, // How many sub-grids per main grid unit (1, 2, 4, 5, 10)

  // Calculated snap size based on subdivisions
  get snapSize() {
    return this.gridSize / this.gridSubdivisions;
  },

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

  // NEW: Grid configuration actions
  setGridSize: (size) => set({ gridSize: Math.max(0.1, size) }),
  setGridSubdivisions: (subdivisions) =>
    set({
      gridSubdivisions: Math.max(1, Math.min(10, subdivisions)),
    }),
  toggleSnapToGrid: () => set((state) => ({ snapToGrid: !state.snapToGrid })),
  toggleGridVisible: () =>
    set((state) => ({ gridVisible: !state.gridVisible })),

  getSelectedShape: () => {
    const { shapes, selectedShapeId } = get();
    return shapes.find((shape) => shape.id === selectedShapeId);
  },

  clearAll: () => set({ shapes: [], selectedShapeId: null }),

  // Helper function to get actual snap size
  getSnapSize: () => {
    const state = get();
    return state.snapToGrid ? state.gridSize / state.gridSubdivisions : null;
  },
}));
