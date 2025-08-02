import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, "../../playwright/.auth/user.json");

setup("authenticate", async ({ page }) => {
  // Navigate to the signin page
  await page.goto("/api/auth/signin");

  // Wait for the signin page to load
  await page.waitForLoadState("networkidle");

  // The custom credentials provider should be available when AUTH_CUSTOM_ENABLED=true or NODE_ENV=test
  // Look for the "Sign in with Custom User" form/button
  await page.waitForSelector("form", { timeout: 10000 });

  // Fill the username and password fields (custom credentials provider)
  const customUsername = process.env.AUTH_CUSTOM_USERNAME || "test@sakumari.local";
  const customPassword = process.env.AUTH_CUSTOM_PASSWORD || "test123";
  
  await page.fill('input[name="username"]', customUsername);
  await page.fill('input[name="password"]', customPassword);

  // Submit the form
  await page.click('button[type="submit"]');

  // Wait for redirect to home page after successful authentication
  await page.waitForURL("/", { timeout: 10000 });

  // Verify authentication was successful by checking for authenticated content
  await expect(page.getByText("ひらがな Hiragana Practice")).toBeVisible({
    timeout: 10000,
  });
  await expect(page.getByText("カタカナ Katakana Practice")).toBeVisible();

  // Save the authenticated state
  await page.context().storageState({ path: authFile });
});
