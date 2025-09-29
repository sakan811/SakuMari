import { test, expect } from "@playwright/test";

// Skip authentication for SEO tests
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("SEO and Health Monitoring", () => {
  test.describe("SEO Essentials", () => {
    test("should have proper meta tags on home page", async ({ page }) => {
      await page.goto("/");

      // Basic meta tags
      await expect(page).toHaveTitle(/SakuMari.*Master Japanese Kana/);

      const description = page.locator('meta[name="description"]');
      await expect(description).toHaveAttribute(
        "content",
        /Master Japanese Hiragana and Katakana.*interactive flashcards/,
      );

      const viewport = page.locator('meta[name="viewport"]');
      await expect(viewport).toHaveAttribute(
        "content",
        /width=device-width.*initial-scale=1/,
      );

      // OpenGraph tags
      const ogTitle = page.locator('meta[property="og:title"]');
      await expect(ogTitle).toHaveAttribute(
        "content",
        /SakuMari.*Master Japanese Kana/,
      );

      const ogType = page.locator('meta[property="og:type"]');
      await expect(ogType).toHaveAttribute("content", "website");
    });

    test("should have proper HTML structure", async ({ page }) => {
      await page.goto("/");

      // Wait for page to be fully loaded
      await expect(page.locator("h1")).toBeVisible();

      // Language declaration
      const htmlLang = await page.getAttribute("html", "lang");
      expect(htmlLang).toBe("en");

      // Single H1 tag
      const h1Count = await page.locator("h1").count();
      expect(h1Count).toBe(1);

      const h1Text = await page.locator("h1").textContent();
      expect(h1Text).toContain("SakuMari");

      // Should have H2 tags
      const h2Count = await page.locator("h2").count();
      expect(h2Count).toBeGreaterThan(0);
    });

    test("should have meaningful content", async ({ page }) => {
      await page.goto("/");

      // Key SEO content should be present
      await expect(page.locator("text=SakuMari").first()).toBeVisible();
      await expect(page.locator("text=Japanese").first()).toBeVisible();
      await expect(page.locator("text=Hiragana").first()).toBeVisible();
      await expect(page.locator("text=Katakana").first()).toBeVisible();
      await expect(page.locator("text=Flashcard").first()).toBeVisible();

      // For unauthenticated users, should show welcome content
      await expect(
        page.locator("text=Welcome to SakuMari!").first(),
      ).toBeVisible();
      await expect(page.locator("text=practice").first()).toBeVisible();
    });

    test("should have no duplicate meta tags", async ({ page }) => {
      await page.goto("/");

      // Check for single instances of key meta tags
      const charsetTags = await page.locator("meta[charset]").count();
      expect(charsetTags).toBe(1);

      const viewportTags = await page.locator('meta[name="viewport"]').count();
      expect(viewportTags).toBe(1);

      const descriptionTags = await page
        .locator('meta[name="description"]')
        .count();
      expect(descriptionTags).toBe(1);
    });
  });

  test.describe("Health Monitoring", () => {
    test("should have good performance", async ({ page }) => {
      const startTime = Date.now();
      await page.goto("/");

      // Wait for key content to be visible
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator('meta[name="description"]')).toBeAttached();

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000);
    });

    test("should have minimal console errors", async ({ page }) => {
      const consoleErrors: string[] = [];

      page.on("console", (msg) => {
        if (msg.type() === "error") {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto("/");
      await expect(page.locator("h1")).toBeVisible();

      // Filter out non-critical errors
      const criticalErrors = consoleErrors.filter(
        (error) =>
          !error.includes("favicon") &&
          !error.includes("404") &&
          !error.includes("net::ERR_FAILED"),
      );

      expect(criticalErrors.length).toBeLessThan(2);
    });

    test("should check API health endpoint", async ({ request }) => {
      // Test the health endpoint directly
      const response = await request.get("http://localhost:3000/api/health");
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body).toHaveProperty("status");
      expect(body.status).toBe("healthy");
      expect(body).toHaveProperty("timestamp");
    });
  });
});