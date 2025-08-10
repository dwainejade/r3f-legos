import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";

export const LEGO_UNIT = 0.8;
export const BRICK_HEIGHT = 0.96;
export const BASEPLATE_SIZE = 200; // studs
export const BASEPLATE_HEIGHT = 0.32;
export const BASEPLATE_COLOR = "#00aa00";
export const STUD_RADIUS = 0.2;
export const STUD_HEIGHT = 0.17;

// Import BRICK_TYPES - you might want to move this to a shared constants file
export const BRICK_TYPES = {
  "1x1": { width: 1, depth: 1, height: 1 },
  "1x2": { width: 1, depth: 2, height: 1 },
  "1x4": { width: 1, depth: 4, height: 1 },
  "2x2": { width: 2, depth: 2, height: 1 },
  "2x4": { width: 2, depth: 4, height: 1 },
  "2x6": { width: 2, depth: 6, height: 1 },
  "2x8": { width: 2, depth: 8, height: 1 },
};

// Enhanced snapToGrid function that handles bounds, collision, and stacking
export const snapToGrid = (
  worldPosition,
  brickType,
  baseplateSize,
  occupiedStuds,
  baseplateHeight = 0.32,
  rotationY = 0
) => {
  const dims = BRICK_TYPES[brickType];
  if (!dims) return { position: [0, 0, 0], isValid: false, layer: 0 };

  const gridSize = LEGO_UNIT;

  // --- Compute the stud-origin used by your Baseplate ---
  const studOrigin = -((baseplateSize - 1) / 2); // in studs

  // Convert world coords to stud units relative to the stud origin
  const xStudWorld = worldPosition.x / gridSize;
  const zStudWorld = worldPosition.z / gridSize;
  const xStudLocal = xStudWorld - studOrigin;
  const zStudLocal = zStudWorld - studOrigin;

  // Normalize rotation to nearest quarter-turn (0, 90, 180, 270)
  const quarterTurns =
    ((Math.round((rotationY % (2 * Math.PI)) / (Math.PI / 2)) % 4) + 4) % 4;

  // Swap width/depth parity if rotated by odd number of quarter turns
  let width = dims.width;
  let depth = dims.depth;
  if (quarterTurns % 2 === 1) {
    [width, depth] = [depth, width];
  }

  // Parity offset in stud-units: even -> 0.5, odd -> 0
  const xParityOffset = width % 2 === 0 ? 0.5 : 0;
  const zParityOffset = depth % 2 === 0 ? 0.5 : 0;

  // Snap in local stud space (relative to studOrigin), then convert back
  const snappedXStudLocal =
    Math.round(xStudLocal - xParityOffset) + xParityOffset;
  const snappedZStudLocal =
    Math.round(zStudLocal - zParityOffset) + zParityOffset;

  const snappedXStudWorld = snappedXStudLocal + studOrigin;
  const snappedZStudWorld = snappedZStudLocal + studOrigin;

  const snappedX = snappedXStudWorld * gridSize;
  const snappedZ = snappedZStudWorld * gridSize;

  // Bounds check first (world units)
  const brickHalfWidth = (width * gridSize) / 2;
  const brickHalfDepth = (depth * gridSize) / 2;
  const baseplateHalfSize = (baseplateSize * gridSize) / 2;

  const minX = snappedX - brickHalfWidth;
  const maxX = snappedX + brickHalfWidth;
  const minZ = snappedZ - brickHalfDepth;
  const maxZ = snappedZ + brickHalfDepth;

  const withinBounds =
    minX >= -baseplateHalfSize &&
    maxX <= baseplateHalfSize &&
    minZ >= -baseplateHalfSize &&
    maxZ <= baseplateHalfSize;

  if (!withinBounds) {
    return { position: [snappedX, 0, snappedZ], isValid: false, layer: 0 };
  }

  // --- Collision detection and stacking ---
  // Convert world position to stud coordinates for collision detection
  const studX = Math.round(snappedXStudWorld);
  const studZ = Math.round(snappedZStudWorld);

  let layer = 0;

  // Find the highest available layer by checking collisions
  while (true) {
    let collision = false;

    // Check all studs that this brick would occupy
    for (let dx = 0; dx < width; dx++) {
      for (let dz = 0; dz < depth; dz++) {
        const checkStudX = studX + dx - Math.floor(width / 2);
        const checkStudZ = studZ + dz - Math.floor(depth / 2);
        const studKey = `${checkStudX},${layer},${checkStudZ}`;

        if (occupiedStuds.has(studKey)) {
          collision = true;
          break;
        }
      }
      if (collision) break;
    }

    if (!collision) break;
    layer++;

    // Prevent infinite stacking (safety limit)
    if (layer > 20) {
      return { position: [snappedX, 0, snappedZ], isValid: false, layer: 0 };
    }
  }

  // Calculate Y position based on layer
  const snappedY =
    baseplateHeight / 2 + BRICK_HEIGHT * layer + BRICK_HEIGHT / 2;

  return {
    position: [snappedX, snappedY, snappedZ],
    isValid: true,
    layer,
    studCoords: { x: studX, z: studZ },
    dimensions: { width, depth },
  };
};

// Helper function to get occupied studs for a brick
const getBrickOccupiedStuds = (brick) => {
  const dims = BRICK_TYPES[brick.type];
  const [x, y, z] = brick.position;
  const layer = Math.round((y - BRICK_HEIGHT / 2) / BRICK_HEIGHT);

  // Convert world position to stud coordinates
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

const useBrickStore = create()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // State
      bricks: [],
      occupiedStuds: new Set(),
      selectedBrickId: null,
      selectedBrickType: "2x4",
      selectedColor: "#ff0000",
      buildMode: "place", // 'place', 'remove', 'select'
      baseplateSize: 64, // Add baseplate size to store

      // Actions
      addBrick: (brick) => {
        const { occupiedStuds, baseplateSize } = get();

        // Use enhanced snapToGrid with collision detection
        const snapResult = snapToGrid(
          { x: brick.position[0], y: brick.position[1], z: brick.position[2] },
          brick.type,
          baseplateSize,
          occupiedStuds
        );

        if (!snapResult.isValid) {
          console.warn("Cannot place brick: invalid position or collision");
          return;
        }

        // Create the new brick with snapped position
        const newBrick = {
          ...brick,
          id: crypto.randomUUID(),
          position: snapResult.position,
          layer: snapResult.layer,
        };

        // Get the studs this brick will occupy
        const brickStuds = getBrickOccupiedStuds(newBrick);

        // Add occupied studs to the set
        const newOccupiedStuds = new Set(occupiedStuds);
        brickStuds.forEach((stud) => newOccupiedStuds.add(stud));

        set((state) => ({
          bricks: [...state.bricks, newBrick],
          occupiedStuds: newOccupiedStuds,
        }));
      },

      removeBrick: (id) => {
        const brick = get().bricks.find((b) => b.id === id);
        if (!brick) return;

        const { occupiedStuds } = get();

        // Get the studs this brick occupies
        const brickStuds = getBrickOccupiedStuds(brick);

        // Remove occupied studs from the set
        const newOccupiedStuds = new Set(occupiedStuds);
        brickStuds.forEach((stud) => newOccupiedStuds.delete(stud));

        set((state) => ({
          bricks: state.bricks.filter((brick) => brick.id !== id),
          occupiedStuds: newOccupiedStuds,
          selectedBrickId:
            state.selectedBrickId === id ? null : state.selectedBrickId,
        }));
      },

      snapPoint: (point) => {
        const { selectedBrickType, occupiedStuds, baseplateSize } = get();
        return snapToGrid(
          point,
          selectedBrickType,
          baseplateSize,
          occupiedStuds
        );
      },

      updateBrick: (id, updates) =>
        set((state) => ({
          bricks: state.bricks.map((brick) =>
            brick.id === id ? { ...brick, ...updates } : brick
          ),
        })),

      selectBrick: (id) => set({ selectedBrickId: id }),
      setBrickType: (type) => set({ selectedBrickType: type }),
      setColor: (color) => set({ selectedColor: color }),
      setBuildMode: (mode) => set({ buildMode: mode }),

      clearAll: () =>
        set({
          bricks: [],
          occupiedStuds: new Set(),
          selectedBrickId: null,
        }),

      // Update baseplate size
      setBaseplateSize: (size) => set({ baseplateSize: size }),

      // Utility getters
      getSelectedBrick: () => {
        const { bricks, selectedBrickId } = get();
        return bricks.find((brick) => brick.id === selectedBrickId);
      },

      getBricksByType: (type) => {
        const { bricks } = get();
        return bricks.filter((brick) => brick.type === type);
      },

      // Debug helper
      debugOccupiedStuds: () => {
        const { occupiedStuds } = get();
        console.log("Occupied studs:", Array.from(occupiedStuds));
      },
    })),
    { name: "brick-store" }
  )
);

export default useBrickStore;
