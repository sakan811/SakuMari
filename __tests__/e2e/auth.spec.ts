import { test, expect } from "@playwright/test";

// Auth tests should not use storageState since they test authentication flow
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Authentication Flow", () => {
  test("should authenticate and access protected routes", async ({ page }) => {
    // Login via credentials provider
    await page.goto("/");
    await page.getByRole("button", { name: "Sign In" }).click();

    // Wait for NextAuth signin page
    await page.waitForURL(/.*signin.*/);

    await page.fill('input[name="email"]', "test@sakumari.local");
    await page.fill('input[name="password"]', "TestPassword123!");
    await page.click('form[action*="credentials"] button[type="submit"]');
    await page.waitForURL("/");

    // Should show authenticated content
    await expect(page.getByText("ひらがな Hiragana Practice")).toBeVisible();
    await expect(page.getByText("カタカナ Katakana Practice")).toBeVisible();
    await expect(page.getByText("📊 View Your Progress")).toBeVisible();
  });

  test("should access practice pages when authenticated", async ({ page }) => {
    // First authenticate
    await page.goto("/");
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL(/.*signin.*/);
    await page.fill('input[name="email"]', "test@sakumari.local");
    await page.fill('input[name="password"]', "TestPassword123!");
    await page.click('form[action*="credentials"] button[type="submit"]');
    await page.waitForURL("/");

    // Then access practice pages
    await page.goto("/hiragana");
    await expect(
      page.getByPlaceholder("Type romaji equivalent..."),
    ).toBeVisible();
    await expect(page.getByTestId("typing-button")).toBeVisible();

    await page.goto("/katakana");
    await expect(
      page.getByPlaceholder("Type romaji equivalent..."),
    ).toBeVisible();
  });

  test("should access dashboard when authenticated", async ({ page }) => {
    // First authenticate
    await page.goto("/");
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL(/.*signin.*/);
    await page.fill('input[name="email"]', "test@sakumari.local");
    await page.fill('input[name="password"]', "TestPassword123!");
    await page.click('form[action*="credentials"] button[type="submit"]');
    await page.waitForURL("/");

    // Then access dashboard
    await page.goto("/dashboard");
    await expect(page.getByText("Dashboard")).toBeVisible();
    await expect(page.getByText("Your Progress")).toBeVisible();
  });

  test("should logout and redirect unauthenticated users", async ({ page }) => {
    // First authenticate
    await page.goto("/");
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL(/.*signin.*/);
    await page.fill('input[name="email"]', "test@sakumari.local");
    await page.fill('input[name="password"]', "TestPassword123!");
    await page.click('form[action*="credentials"] button[type="submit"]');
    await page.waitForURL("/");

    // Then logout
    await page.getByText("Sign Out").click();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();

    // Protected routes should redirect to home
    await page.goto("/hiragana");
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  });
});
