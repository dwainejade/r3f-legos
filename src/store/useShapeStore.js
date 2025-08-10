import { create } from "zustand";

const GRID_SIZE = 1; // Base grid unit

// Enhanced brick types with all shapes
export const BRICK_TYPES = {
  // Basic bricks
  "1x1": { width: 1, depth: 1, height: 1, shape: "brick" },
  "1x2": { width: 1, depth: 2, height: 1, shape: "brick" },
  "1x4": { width: 1, depth: 4, height: 1, shape: "brick" },
  "2x2": { width: 2, depth: 2, height: 1, shape: "brick" },
  "2x4": { width: 2, depth: 4, height: 1, shape: "brick" },
  "2x6": { width: 2, depth: 6, height: 1, shape: "brick" },
  "2x8": { width: 2, depth: 8, height: 1, shape: "brick" },

  // Extended rectangular bricks
  "1x3": { width: 1, depth: 3, height: 1, shape: "brick" },
  "1x6": { width: 1, depth: 6, height: 1, shape: "brick" },
  "1x8": { width: 1, depth: 8, height: 1, shape: "brick" },
  "2x3": { width: 2, depth: 3, height: 1, shape: "brick" },
  "3x3": { width: 3, depth: 3, height: 1, shape: "brick" },
  "4x4": { width: 4, depth: 4, height: 1, shape: "brick" },
  "3x6": { width: 3, depth: 6, height: 1, shape: "brick" },
  "4x8": { width: 4, depth: 8, height: 1, shape: "brick" },

  // Specialty shapes
  corner: { width: 2, depth: 2, height: 1, shape: "corner" },
  slope: { width: 2, depth: 2, height: 2, shape: "slope" },
  arch: { width: 3, depth: 1, height: 3, shape: "arch" },
  round: { width: 2, depth: 2, height: 1, shape: "round" },
  wedge: { width: 2, depth: 3, height: 1, shape: "wedge" },

  // Plates (thinner bricks)
  "plate-1x1": { width: 1, depth: 1, height: 0.3, shape: "plate" },
  "plate-1x2": { width: 1, depth: 2, height: 0.3, shape: "plate" },
  "plate-2x2": { width: 2, depth: 2, height: 0.3, shape: "plate" },
  "plate-2x4": { width: 2, depth: 4, height: 0.3, shape: "plate" },

  // Tall bricks
  "tall-1x1": { width: 1, depth: 1, height: 3, shape: "tall" },
  "tall-1x2": { width: 1, depth: 2, height: 3, shape: "tall" },
  "tall-2x2": { width: 2, depth: 2, height: 3, shape: "tall" },
};

// Default colors for each brick type
export const BRICK_COLORS = {
  "1x1": "#ff0000", // Red
  "1x2": "#0055bf", // Blue
  "1x4": "#00af4d", // Green
  "2x2": "#ffd700", // Yellow
  "2x4": "#ff8c00", // Orange
  "2x6": "#81007b", // Purple
  "2x8": "#ff69b4", // Pink
  "1x3": "#20b2aa", // Light Sea Green
  "1x6": "#dc143c", // Crimson
  "1x8": "#8a2be2", // Blue Violet
  "2x3": "#ff1493", // Deep Pink
  "3x3": "#32cd32", // Lime Green
  "4x4": "#ff4500", // Orange Red
  "3x6": "#4169e1", // Royal Blue
  "4x8": "#ff6347", // Tomato
  corner: "#8b4513", // Saddle Brown
  slope: "#9932cc", // Dark Orchid
  arch: "#008b8b", // Dark Cyan
  round: "#b22222", // Fire Brick
  wedge: "#556b2f", // Dark Olive Green
  "plate-1x1": "#87ceeb", // Sky Blue
  "plate-1x2": "#dda0dd", // Plum
  "plate-2x2": "#f0e68c", // Khaki
  "plate-2x4": "#ffa07a", // Light Salmon
  "tall-1x1": "#2f4f4f", // Dark Slate Gray
  "tall-1x2": "#8fbc8f", // Dark Sea Green
  "tall-2x2": "#cd853f", // Peru
};

export const useShapeStore = create((set, get) => ({
  // State
  shapes: [],
  selectedShapeId: null,
  gridSize: GRID_SIZE,
  transformMode: "translate",
  editorMode: "add",

  // Grid configuration options
  snapToGrid: true, // Enable/disable grid snapping globally
  gridVisible: true, // Show/hide visual grid
  gridSubdivisions: 1, // How many sub-grids per main grid unit (1, 2, 4, 8)

  // Brick building specific state
  selectedBrickType: "1x1",
  selectedColor: BRICK_COLORS["1x1"],

  // Calculated snap size based on subdivisions
  get snapSize() {
    const state = get();
    return state.gridSize / state.gridSubdivisions;
  },

  // Actions
  addShape: (shape) => {
    const newShape = {
      ...shape,
      id: crypto.randomUUID(),
      type: shape.type || "brick",
      brickType: shape.brickType || get().selectedBrickType,
      dimensions: shape.dimensions || BRICK_TYPES[get().selectedBrickType],
      color: shape.color || get().selectedColor,
      position: shape.position || [0, 0, 0],
      rotation: shape.rotation || 0,
      scale: shape.scale || [1, 1, 1],
    };

    set((state) => ({
      shapes: [...state.shapes, newShape],
    }));

    return newShape.id;
  },

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

  // Brick building actions
  setBrickType: (brickType) => {
    if (BRICK_TYPES[brickType]) {
      set({
        selectedBrickType: brickType,
        selectedColor: BRICK_COLORS[brickType] || "#6d6e70",
      });
    }
  },

  setColor: (color) => set({ selectedColor: color }),

  // Grid configuration actions
  setGridSize: (size) => set({ gridSize: Math.max(0.1, size) }),

  setGridSubdivisions: (subdivisions) =>
    set({
      gridSubdivisions: Math.max(1, Math.min(10, subdivisions)),
    }),

  toggleSnapToGrid: () => set((state) => ({ snapToGrid: !state.snapToGrid })),

  toggleGridVisible: () =>
    set((state) => ({ gridVisible: !state.gridVisible })),

  // Helper functions
  getSelectedShape: () => {
    const { shapes, selectedShapeId } = get();
    return shapes.find((shape) => shape.id === selectedShapeId);
  },

  duplicateShape: (id) => {
    const state = get();
    const shapeToDuplicate = state.shapes.find((shape) => shape.id === id);
    if (shapeToDuplicate) {
      const newShape = {
        ...shapeToDuplicate,
        id: crypto.randomUUID(),
        position: [
          shapeToDuplicate.position[0] + 2,
          shapeToDuplicate.position[1],
          shapeToDuplicate.position[2] + 2,
        ],
      };
      set((state) => ({
        shapes: [...state.shapes, newShape],
        selectedShapeId: newShape.id,
      }));
      return newShape.id;
    }
  },

  clearAll: () => set({ shapes: [], selectedShapeId: null }),

  // Helper function to get actual snap size
  getSnapSize: () => {
    const state = get();
    return state.snapToGrid ? state.gridSize / state.gridSubdivisions : null;
  },

  // Snap position to grid
  snapToGridPosition: (position) => {
    const state = get();
    if (!state.snapToGrid) return position;

    const snapSize = state.gridSize / state.gridSubdivisions;
    return position.map((coord) => Math.round(coord / snapSize) * snapSize);
  },

  // Get brick dimensions for a brick type
  getBrickDimensions: (brickType) => {
    return BRICK_TYPES[brickType] || BRICK_TYPES["1x1"];
  },

  // Get default color for a brick type
  getBrickColor: (brickType) => {
    return BRICK_COLORS[brickType] || "#6d6e70";
  },

  // Statistics
  getShapeCount: () => get().shapes.length,

  getShapesByType: () => {
    const shapes = get().shapes;
    return shapes.reduce((acc, shape) => {
      const type = shape.brickType || shape.type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
  },
}));
