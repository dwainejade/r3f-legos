import { create } from "zustand";

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

const useBrickStore = create((set, get) => ({
  // Brick selection state
  selectedBrickType: "1x1",
  selectedColor: BRICK_COLORS["1x1"],

  // Actions
  setBrickType: (brickType) => {
    if (BRICK_TYPES[brickType]) {
      set({
        selectedBrickType: brickType,
        selectedColor: BRICK_COLORS[brickType] || "#6d6e70",
      });
    }
  },

  setColor: (color) => set({ selectedColor: color }),

  // Helper functions
  getBrickDimensions: (brickType) => {
    return BRICK_TYPES[brickType] || BRICK_TYPES["1x1"];
  },

  getBrickColor: (brickType) => {
    return BRICK_COLORS[brickType] || "#6d6e70";
  },

  getCurrentBrick: () => {
    const { selectedBrickType, selectedColor } = get();
    return {
      type: selectedBrickType,
      dimensions: BRICK_TYPES[selectedBrickType],
      color: selectedColor,
    };
  },

  // Create a brick shape object ready for the shape store
  createBrickShape: (position = [0, 0, 0], rotation = 0) => {
    const { selectedBrickType, selectedColor } = get();
    const dimensions = BRICK_TYPES[selectedBrickType];

    return {
      type: "brick",
      brickType: selectedBrickType,
      dimensions,
      color: selectedColor,
      position,
      rotation,
      scale: [1, 1, 1],
    };
  },
}));

export default useBrickStore;
