import { create } from "zustand";

const useUIStore = create((set) => ({
  // UI State
  sidebarOpen: true,
  showGrid: true,
  showStuds: true,
  cameraMode: "orbit", // 'orbit', 'first-person'

  // Actions
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  toggleStuds: () => set((state) => ({ showStuds: !state.showStuds })),
  setCameraMode: (mode) => set({ cameraMode: mode }),
}));

export default useUIStore;
