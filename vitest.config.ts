import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@ps": path.resolve(__dirname, "./PS/src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "PS/src/**/*.test.ts"],
  },
});