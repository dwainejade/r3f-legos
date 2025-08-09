import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // aliases
  resolve: {
    alias: {
      "@": "/src",
      components: "/src/components",
      styles: "/src/styles",
      store: "/src/store",
      ui: "/src/components/UI",
      "3d": "/src/components/3D",
    },
  },
});
