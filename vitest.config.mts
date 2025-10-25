import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    globals: true,
    testTimeout: 10000,
    setupFiles: ["./__tests__/setup.ts"],
    include: ["__tests__/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", "dist", ".next", "__tests__/db"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      reportsDirectory: "./coverage",
      exclude: [
        "node_modules/",
        "__tests__/",
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
        "coverage-db/lcov-report",
        "types/common.ts",
        "app/globals.css"
      ],
    },
  },
  define: {
    "process.env.NEXTAUTH_URL": '"http://localhost:3000"',
    "process.env.NEXTAUTH_SECRET": '"test-secret"',
  },
});
