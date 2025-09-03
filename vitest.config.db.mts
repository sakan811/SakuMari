import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./__tests__/db/setup.ts"],
    include: ["__tests__/db/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", "dist", ".next"],
    // CRITICAL: Sequential execution for SQLite
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // No concurrent tests
    maxConcurrency: 1,
    // Longer timeouts for database operations
    testTimeout: 30000,
    hookTimeout: 60000,
    // Disable file parallelism
    fileParallelism: false,
    coverage: {
      provider: "istanbul",
      reporter: ["text", "lcov"],
      reportsDirectory: "./coverage-db",
      exclude: [
        "node_modules/",
        "__tests__/",
        "**/*.d.ts",
        "next.config.js",
        "vitest.config.mts",
        "vitest.config.db.mts",
        "prisma/",
        "scripts/",
        "public/",
        "styles/",
      ],
    },
  },
});
