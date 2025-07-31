import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./__tests__/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,
  reporter: "html",

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
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
      name: "seo-chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
      testMatch: /.*seo-metadata\.spec\.ts/,
    },

    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
      testIgnore: /.*seo-metadata\.spec\.ts/,
    },
    {
      name: "firefox",
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
      testIgnore: /.*seo-metadata\.spec\.ts/,
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
      testIgnore: /.*seo-metadata\.spec\.ts/,
    },
  ],

  webServer: {
    command: "NODE_ENV=test PORT=3000 HOSTNAME=0.0.0.0 node .next/standalone/server.js",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    env: {
      NODE_ENV: "test",
      PORT: "3000",
      HOSTNAME: "0.0.0.0",
    },
  },
});
