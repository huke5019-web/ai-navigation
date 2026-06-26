import { resolve } from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(process.cwd()),
    },
  },
  test: {
    environment: "jsdom",
    passWithNoTests: true,
    setupFiles: [resolve(process.cwd(), "tests/setup.ts")],
  },
});
