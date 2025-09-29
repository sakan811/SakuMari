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
        "__tests__/api",
        "__tests__/auth",
        "__tests__/e2e",
        "__tests__/flashcard-provider",
        "__tests__/hooks",
        "__tests__/seo",
        "__tests__/utils",
        "__tests__/*.{tsx,ts}",
        "**/*.d.ts",
        "next.config.js",
        "vitest.config.db.mts",
        "prisma/",
        "scripts/",
        "public/",
        "styles/",
        "eslint.config.mjs",
        "**.config.{js,ts,mts,mjs}",
        ".next/",
        "generated/",
        "coverage/lcov-report",
        "__tests__/db/generated",
      ],
    },
  },
});
