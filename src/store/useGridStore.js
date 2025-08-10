import { create } from "zustand";

export const useGridStore = create((set, get) => ({
  // Grid state
  gridSize: 1, // Base grid unit size
  gridSubdivisions: 1, // How many subdivisions per grid unit
  snapToGrid: true, // Enable/disable grid snapping
  gridVisible: true, // Show/hide visual grid
  gridColor: "#ffffff22", // Grid line color
  gridOpacity: 0.3, // Grid opacity

  // Grid configuration actions
  setGridSize: (size) => set({ gridSize: Math.max(0.1, Math.min(20, size)) }),

  setGridSubdivisions: (subdivisions) =>
    set({
      gridSubdivisions: Math.max(1, Math.min(16, subdivisions)),
    }),

  toggleSnapToGrid: () => set((state) => ({ snapToGrid: !state.snapToGrid })),

  toggleGridVisible: () =>
    set((state) => ({ gridVisible: !state.gridVisible })),

  setGridColor: (color) => set({ gridColor: color }),

  setGridOpacity: (opacity) =>
    set({ gridOpacity: Math.max(0, Math.min(1, opacity)) }),

  // Computed values
  getSnapSize: () => {
    const { gridSize, gridSubdivisions, snapToGrid } = get();
    return snapToGrid ? gridSize / gridSubdivisions : null;
  },

  getActualSnapSize: () => {
    const { gridSize, gridSubdivisions } = get();
    return gridSize / gridSubdivisions;
  },

  // Utility functions
  snapToGridPosition: (position) => {
    const { snapToGrid } = get();
    if (!snapToGrid) return position;

    const snapSize = get().getActualSnapSize();
    return position.map((coord) => Math.round(coord / snapSize) * snapSize);
  },

  snapValueToGrid: (value) => {
    const { snapToGrid } = get();
    if (!snapToGrid) return value;

    const snapSize = get().getActualSnapSize();
    return Math.round(value / snapSize) * snapSize;
  },

  // Presets for common grid configurations
  applyPreset: (presetName) => {
    const presets = {
      coarse: { gridSize: 2, gridSubdivisions: 1 },
      normal: { gridSize: 1, gridSubdivisions: 1 },
      fine: { gridSize: 1, gridSubdivisions: 2 },
      ultra: { gridSize: 1, gridSubdivisions: 4 },
      micro: { gridSize: 1, gridSubdivisions: 8 },
    };

    const preset = presets[presetName];
    if (preset) {
      set(preset);
    }
  },

  // Reset to defaults
  reset: () =>
    set({
      gridSize: 1,
      gridSubdivisions: 1,
      snapToGrid: true,
      gridVisible: true,
      gridColor: "#ffffff22",
      gridOpacity: 0.3,
    }),
}));
