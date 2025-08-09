import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";

const useBrickStore = create()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // State
      bricks: [],
      selectedBrickId: null,
      selectedBrickType: "2x4",
      selectedColor: "#ff0000",
      buildMode: "place", // 'place', 'remove', 'select'

      // Actions
      addBrick: (brick) =>
        set((state) => ({
          bricks: [...state.bricks, { ...brick, id: crypto.randomUUID() }],
        })),

      removeBrick: (id) =>
        set((state) => ({
          bricks: state.bricks.filter((brick) => brick.id !== id),
          selectedBrickId:
            state.selectedBrickId === id ? null : state.selectedBrickId,
        })),

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
