import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "server-only": path.resolve(rootDir, "test/stubs/server-only.ts"),
      "@": rootDir,
    },
  },
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
});
