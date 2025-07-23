import { defineConfig, devices } from “@playwright/test”;

export default defineConfig({
testDir: “./**tests**/e2e”,
fullyParallel: true,
forbidOnly: !!process.env.CI,
retries: process.env.CI ? 2 : 0,
workers: process.env.CI ? 1 : 4,
reporter: “html”,

use: {
baseURL: “http://localhost:3000”,
trace: “on-first-retry”,
screenshot: “only-on-failure”,
},

projects: [
// Setup project
{
name: “setup”,
testMatch: /.*.setup.ts/,
teardown: “cleanup”,
},

```
// Cleanup project
{
  name: "cleanup",
  testMatch: /.*\.teardown\.ts/,
},

// SEO tests (no auth required)
{
  name: "seo-chromium",
  use: {
    ...devices["Desktop Chrome"],
  },
  testMatch: /.*seo-metadata\.spec\.ts/,
},

// Main test projects that depend on setup
{
  name: "chromium",
  use: {
    ...devices["Desktop Chrome"],
    // Use prepared auth state
    storageState: "playwright/.auth/user.json",
  },
  dependencies: ["setup"],
  testIgnore: /.*seo-metadata\.spec\.ts/,
},
{
  name: "firefox",
  use: {
    ...devices["Desktop Firefox"],
    // Use prepared auth state
    storageState: "playwright/.auth/user.json",
    launchOptions: {
      // Only set HOME env var when not in CI (for WSL compatibility)
      ...(process.env.CI ? {} : {
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
    // Use prepared auth state
    storageState: "playwright/.auth/user.json",
  },
  dependencies: ["setup"],
  testIgnore: /.*seo-metadata\.spec\.ts/,
},
```

],

webServer: {
command: “pnpm run start”,
url: “http://localhost:3000”,
reuseExistingServer: !process.env.CI,
env: {
NODE_ENV: “test”,
},
},
});