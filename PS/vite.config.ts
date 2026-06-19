import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "@/context/SettingsContext",
        replacement: path.resolve(__dirname, "src/providers/PsSettingsProvider.tsx"),
      },
      { find: "@ps", replacement: path.resolve(__dirname, "src") },
      { find: "@", replacement: path.resolve(__dirname, "../src") },
    ],
  },
  server: {
    port: 5174,
    fs: {
      allow: [path.resolve(__dirname, "..")],
    },
  },
});