import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        details: "index.html",
        map: "map.html",
      },
    },
  },
  define: {
    "process.env": process.env,
  },
  plugins: [react()],
})
