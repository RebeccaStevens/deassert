import type { UserConfig } from "vitest/config";

export default {
  test: {
    include: ["./**/*.test.ts"],
    exclude: ["bin", "dist", "node_modules"],
    coverage: {
      all: true,
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
} as UserConfig;
