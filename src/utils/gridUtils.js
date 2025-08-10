// ============================================================================
// utils/gridUtils.js
// ============================================================================

export const snapToGrid = (value, gridSize) =>
  Math.round(value / gridSize) * gridSize;

export const snapPositionToGrid = (position, gridSize) => [
  snapToGrid(position[0], gridSize),
  snapToGrid(position[1], gridSize),
  snapToGrid(position[2], gridSize),
];
