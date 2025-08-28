import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./__tests__/setup.ts"],
    include: ["__tests__/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", "dist", ".next", "__tests__/db"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: "./coverage",
      exclude: [
        "node_modules/",
        "__tests__/",
        "**/*.d.ts",
        "next.config.js",
        "vitest.config.mts",
      ],
    },
  },
  define: {
    "process.env.NEXTAUTH_URL": '"http://localhost:3000"',
    "process.env.NEXTAUTH_SECRET": '"test-secret"',
    "process.env.NODE_ENV": '"development"',
  },
});
