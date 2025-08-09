import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";

export const LEGO_UNIT = 0.8;
export const BRICK_HEIGHT = 0.96;
export const BASEPLATE_SIZE = 100; // studs
export const BASEPLATE_HEIGHT = 0.32;
export const BASEPLATE_COLOR = "#00aa00";
export const STUD_RADIUS = 0.2;
export const STUD_HEIGHT = 0.17;

export const BRICK_TYPES = {
  "1x1": { width: 1, depth: 1, height: 1 },
  "1x2": { width: 1, depth: 2, height: 1 },
  "1x4": { width: 1, depth: 4, height: 1 },
  "2x2": { width: 2, depth: 2, height: 1 },
  "2x4": { width: 2, depth: 4, height: 1 },
  "2x6": { width: 2, depth: 6, height: 1 },
  "2x8": { width: 2, depth: 8, height: 1 },
};

// Helper: compute studs occupied by a brick at given position/layer
const getBrickOccupiedStuds = (brick) => {
  const dims = BRICK_TYPES[brick.type];
  const [x, y, z] = brick.position;
  const layer = Math.round((y - BRICK_HEIGHT / 2) / BRICK_HEIGHT);

  const studX = Math.round(x / LEGO_UNIT);
  const studZ = Math.round(z / LEGO_UNIT);

  const studs = [];
  for (let dx = 0; dx < dims.width; dx++) {
    for (let dz = 0; dz < dims.depth; dz++) {
      const checkStudX = studX + dx - Math.floor(dims.width / 2);
      const checkStudZ = studZ + dz - Math.floor(dims.depth / 2);
      studs.push(`${checkStudX},${layer},${checkStudZ}`);
    }
  }
  return studs;
};

// Check if placing a brick at position collides with any existing brick
const canPlaceBrickAt = (position, brickType, bricks) => {
  const dims = BRICK_TYPES[brickType];
  const [x, y, z] = position;
  const layer = Math.round((y - BRICK_HEIGHT / 2) / BRICK_HEIGHT);
  const studX = Math.round(x / LEGO_UNIT);
  const studZ = Math.round(z / LEGO_UNIT);

  // For each brick in bricks, check for overlapping studs at this layer
  for (const brick of bricks) {
    const brickLayer = Math.round(
      (brick.position[1] - BRICK_HEIGHT / 2) / BRICK_HEIGHT
    );
    if (brickLayer !== layer) continue; // Different vertical layer

    const brickDims = BRICK_TYPES[brick.type];
    const brickStudX = Math.round(brick.position[0] / LEGO_UNIT);
    const brickStudZ = Math.round(brick.position[2] / LEGO_UNIT);

    // Check overlap in stud space
    const overlapX =
      studX + dims.width > brickStudX - Math.floor(brickDims.width / 2) &&
      studX - Math.floor(dims.width / 2) < brickStudX + brickDims.width;
    const overlapZ =
      studZ + dims.depth > brickStudZ - Math.floor(brickDims.depth / 2) &&
      studZ - Math.floor(dims.depth / 2) < brickStudZ + brickDims.depth;

    if (overlapX && overlapZ) {
      return false; // Collision
    }
  }
  return true;
};

const useBrickStore = create()(
  devtools(
    subscribeWithSelector((set, get) => ({
      bricks: [],
      selectedBrickType: "2x4",
      selectedColor: "#ff0000",
      buildMode: "place", // 'place', 'remove', 'select'
      baseplateSize: 32, // studs, default 32x32 baseplate

      addBrick: (brick) => {
        const { bricks } = get();
        if (!canPlaceBrickAt(brick.position, brick.type, bricks)) {
          console.warn("Collision detected: cannot place brick");
          return;
        }
        set((state) => ({
          bricks: [...state.bricks, { ...brick, id: crypto.randomUUID() }],
        }));
      },

      removeBrick: (id) =>
        set((state) => ({
          bricks: state.bricks.filter((brick) => brick.id !== id),
        })),

      snapPoint: (point) => {
        const { bricks, baseplateSize, selectedBrickType } = get();

        if (!selectedBrickType) {
          return { isValid: false, position: null };
        }

        const dims = BRICK_TYPES[selectedBrickType];
        const gridSize = LEGO_UNIT;
        const baseplateHalfSize = (baseplateSize * gridSize) / 2;

        // Snap x and z to grid
        const snappedX = Math.round(point.x / gridSize) * gridSize;
        const snappedZ = Math.round(point.z / gridSize) * gridSize;

        // Ensure within baseplate bounds horizontally
        const halfBrickWidth = (dims.width * gridSize) / 2;
        const halfBrickDepth = (dims.depth * gridSize) / 2;

        if (
          snappedX - halfBrickWidth < -baseplateHalfSize ||
          snappedX + halfBrickWidth > baseplateHalfSize ||
          snappedZ - halfBrickDepth < -baseplateHalfSize ||
          snappedZ + halfBrickDepth > baseplateHalfSize
        ) {
          return { isValid: false, position: null };
        }

        // Start at baseplate layer (y)
        // Bricks are stacked vertically in increments of BRICK_HEIGHT
        let layer = 0;
        let yPos = BRICK_HEIGHT / 2 + BASEPLATE_HEIGHT;

        // Find lowest free vertical position where brick can fit
        while (
          !canPlaceBrickAt(
            [snappedX, yPos, snappedZ],
            selectedBrickType,
            bricks
          )
        ) {
          layer++;
          yPos = BRICK_HEIGHT / 2 + BASEPLATE_HEIGHT + layer * BRICK_HEIGHT;

          // If too high (optional limit), break and invalidate
          if (layer > 20) {
            return { isValid: false, position: null };
          }
        }

        return { isValid: true, position: [snappedX, yPos, snappedZ] };
      },
      selectBrick: (id) => set({ selectedBrickId: id }),
      setBrickType: (type) => set({ selectedBrickType: type }),
      setColor: (color) => set({ selectedColor: color }),
      setBuildMode: (mode) => set({ buildMode: mode }),
      setBaseplateSize: (size) => set({ baseplateSize: size }),
    })),
    { name: "brick-store" }
  )
);

export default useBrickStore;
export { canPlaceBrickAt, getBrickOccupiedStuds };
