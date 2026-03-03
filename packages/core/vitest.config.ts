import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["./**/*.test.ts"],
    exclude: ["bin", "dist", "node_modules"],
    coverage: {
      include: ["src"],
      exclude: ["bin", "dist"],
      reporter: ["lcov", "text"],
      watermarks: {
        lines: [80, 95],
        functions: [80, 95],
        branches: [80, 95],
        statements: [80, 95],
      },
    },
  },
});
