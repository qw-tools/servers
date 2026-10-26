import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        servers: "index.html",
        map: "map.html",
      },
    },
  },
  plugins: [react(), tailwindcss()],
});
