import { defineConfig, devices } from "@playwright/test";

// Set environment variables for E2E testing
process.env.CREDS_PROVIDER = "true";
process.env.CREDS_TEST_EMAIL =
  process.env.CREDS_TEST_EMAIL || "test@sakumari.local";
process.env.CREDS_TEST_PASSWORD =
  process.env.CREDS_TEST_PASSWORD || "TestPassword123!";

export default defineConfig({
  testDir: "./__tests__/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: "html",
  timeout: 60 * 1000, // 60 seconds per test
  globalTimeout: 10 * 60 * 1000, // 10 minutes for entire test run
  expect: {
    timeout: 15 * 1000, // 15 seconds for assertions
  },

  // Playwright will manage the Next.js server
  webServer: {
    command: "cross-env CREDS_PROVIDER=true NODE_ENV=production pnpm start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes
    env: {
      CREDS_PROVIDER: "true",
      NODE_ENV: "production",
    },
  },

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    actionTimeout: 15 * 1000, // 15 seconds for actions
    navigationTimeout: 30 * 1000, // 30 seconds for navigation
  },

  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
      teardown: "cleanup",
    },

    {
      name: "cleanup",
      testMatch: /.*\.teardown\.ts/,
    },

    {
      name: "desktop-essential",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
      testMatch: /.*essential-.*\.spec\.ts$/,
    },

    {
      name: "desktop-cross-browser",
      use: {
        ...devices["Desktop Firefox"],
        storageState: "playwright/.auth/user.json",
        launchOptions: {
          ...(process.env.CI
            ? {}
            : {
                env: {
                  HOME: "/root",
                },
              }),
        },
      },
      dependencies: ["setup"],
      testMatch: /.*essential-.*\.spec\.ts$/,
    },

    {
      name: "mobile-essential",
      use: {
        ...devices["iPhone 12"],
        storageState: "playwright/.auth/user.json",
        hasTouch: true,
        actionTimeout: 20 * 1000, // 20 seconds for mobile actions
        navigationTimeout: 40 * 1000, // 40 seconds for mobile navigation
      },
      dependencies: ["setup"],
      testMatch: /.*essential-.*\.spec\.ts$/,
    },

    {
      name: "seo-health",
      use: {
        ...devices["Desktop Chrome"],
      },
      testMatch: /.*seo-health\.spec\.ts$/,
    },
  ],
});
