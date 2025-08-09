import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";

export const LEGO_UNIT = 1; // stud size
export const BRICK_HEIGHT = LEGO_UNIT * 1.2;

function getBrickDimensions(type) {
  // Map your brick types to stud width/depth
  const map = {
    "1x1": { width: 1, depth: 1 },
    "2x2": { width: 2, depth: 2 },
    "2x4": { width: 2, depth: 4 },
  };
  return map[type] || { width: 1, depth: 1 };
}

function snapToGrid(point, brickType, occupiedStuds) {
  const dims = getBrickDimensions(brickType);

  const snappedX = Math.round(point.x / LEGO_UNIT) * LEGO_UNIT;
  const snappedZ = Math.round(point.z / LEGO_UNIT) * LEGO_UNIT;

  let layer = 0;
  while (true) {
    let collision = false;
    for (let dx = 0; dx < dims.width; dx++) {
      for (let dz = 0; dz < dims.depth; dz++) {
        const studX = Math.round(snappedX / LEGO_UNIT) + dx;
        const studZ = Math.round(snappedZ / LEGO_UNIT) + dz;
        if (occupiedStuds.has(`${studX},${layer},${studZ}`)) {
          collision = true;
          break;
        }
      }
      if (collision) break;
    }
    if (!collision) break;
    layer++;
  }

  const snappedY = BRICK_HEIGHT * layer + BRICK_HEIGHT / 2;
  return { position: [snappedX, snappedY, snappedZ], dims };
}

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

      // Actions
      addBrick: (brick) => {
        const { occupiedStuds } = get();
        const dims = getBrickDimensions(brick.type);
        const [x, y, z] = brick.position;
        const layer = Math.round(y / BRICK_HEIGHT);

        // mark studs
        for (let dx = 0; dx < dims.width; dx++) {
          for (let dz = 0; dz < dims.depth; dz++) {
            const studX = Math.round(x / LEGO_UNIT) + dx;
            const studZ = Math.round(z / LEGO_UNIT) + dz;
            occupiedStuds.add(`${studX},${layer},${studZ}`);
          }
        }

        set((state) => ({
          bricks: [...state.bricks, { ...brick, id: crypto.randomUUID() }],
          occupiedStuds: new Set(occupiedStuds),
        }));
      },

      removeBrick: (id) => {
        const brick = get().bricks.find((b) => b.id === id);
        if (brick) {
          const { occupiedStuds } = get();
          const dims = getBrickDimensions(brick.type);
          const [x, y, z] = brick.position;
          const layer = Math.round(y / BRICK_HEIGHT);

          for (let dx = 0; dx < dims.width; dx++) {
            for (let dz = 0; dz < dims.depth; dz++) {
              const studX = Math.round(x / LEGO_UNIT) + dx;
              const studZ = Math.round(z / LEGO_UNIT) + dz;
              occupiedStuds.delete(`${studX},${layer},${studZ}`);
            }
          }

          set((state) => ({
            bricks: state.bricks.filter((brick) => brick.id !== id),
            occupiedStuds: new Set(occupiedStuds),
            selectedBrickId:
              state.selectedBrickId === id ? null : state.selectedBrickId,
          }));
        }
      },

      snapPoint: (point) => {
        return snapToGrid(point, get().selectedBrickType, get().occupiedStuds);
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

      // Utility getters
      getSelectedBrick: () => {
        const { bricks, selectedBrickId } = get();
        return bricks.find((brick) => brick.id === selectedBrickId);
      },
      getBricksByType: (type) => {
        const { bricks } = get();
        return bricks.filter((brick) => brick.type === type);
      },
    })),
    { name: "brick-store" }
  )
);

export default useBrickStore;
