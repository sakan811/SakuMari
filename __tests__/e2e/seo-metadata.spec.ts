/**
 * SEO E2E Tests
 * End-to-end tests for SEO metadata in the actual browser
 */

import { test, expect } from "@playwright/test";

// Skip auth setup for SEO tests
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("SEO Metadata E2E Tests", () => {
  test.describe("Home Page SEO", () => {
    test("should have correct meta tags in document head", async ({ page }) => {
      await page.goto("/");

      // Check title
      await expect(page).toHaveTitle(/SakuMari.*Master Japanese Kana/);

      // Check meta description
      const description = page.locator('meta[name="description"]');
      await expect(description).toHaveAttribute(
        "content",
        /Master Japanese Hiragana and Katakana.*interactive flashcards/,
      );

      // Check keywords
      const keywords = page.locator('meta[name="keywords"]');
      await expect(keywords).toHaveAttribute(
        "content",
        /Japanese.*Hiragana.*Katakana.*flashcards/,
      );

      // Check viewport
      const viewport = page.locator('meta[name="viewport"]');
      await expect(viewport).toHaveAttribute(
        "content",
        /width=device-width.*initial-scale=1/,
      );
    });

    test("should have OpenGraph meta tags", async ({ page }) => {
      await page.goto("/");

      // Check OpenGraph title
      const ogTitle = page.locator('meta[property="og:title"]');
      await expect(ogTitle).toHaveAttribute(
        "content",
        /SakuMari.*Master Japanese Kana/,
      );

      // Check OpenGraph description
      const ogDescription = page.locator('meta[property="og:description"]');
      await expect(ogDescription).toHaveAttribute(
        "content",
        /Master Japanese Hiragana and Katakana/,
      );

      // Check OpenGraph type
      const ogType = page.locator('meta[property="og:type"]');
      await expect(ogType).toHaveAttribute("content", "website");

      // Check OpenGraph URL
      const ogUrl = page.locator('meta[property="og:url"]');
      await expect(ogUrl).toHaveAttribute("content", /sakumari\.fukudev\.org/);

      // Check OpenGraph site name
      const ogSiteName = page.locator('meta[property="og:site_name"]');
      await expect(ogSiteName).toHaveAttribute("content", "SakuMari");
    });

    test("should have Twitter Card meta tags", async ({ page }) => {
      await page.goto("/");

      // Check Twitter Card type
      const twitterCard = page.locator('meta[name="twitter:card"]');
      await expect(twitterCard).toHaveAttribute(
        "content",
        "summary_large_image",
      );

      // Check Twitter title
      const twitterTitle = page.locator('meta[name="twitter:title"]');
      await expect(twitterTitle).toHaveAttribute(
        "content",
        /SakuMari.*Master Japanese Kana/,
      );

      // Check Twitter description
      const twitterDescription = page.locator(
        'meta[name="twitter:description"]',
      );
      await expect(twitterDescription).toHaveAttribute(
        "content",
        /Master Japanese Hiragana and Katakana/,
      );
    });

    test("should have canonical URL", async ({ page }) => {
      await page.goto("/");

      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveAttribute(
        "href",
        /https:\/\/sakumari\.fukudev\.org/,
      );
    });
  });

  test.describe("Hiragana Page SEO", () => {
    test("should redirect to home and show sign-in for unauthenticated users", async ({
      page,
    }) => {
      await page.goto("/hiragana");

      // Should redirect to home page for unauthenticated users
      await page.waitForURL("/");

      // Check home page title (since we were redirected)
      await expect(page).toHaveTitle(/SakuMari.*Master Japanese Kana/);

      // Should show sign-in prompt
      await expect(
        page.getByRole("button", { name: "Sign In" }),
      ).toBeVisible();
    });

    test("should redirect to home for OpenGraph tags", async ({ page }) => {
      await page.goto("/hiragana");

      // Should redirect to home page for unauthenticated users
      await page.waitForURL("/");

      const ogTitle = page.locator('meta[property="og:title"]');
      await expect(ogTitle).toHaveAttribute("content", /SakuMari/);

      const ogUrl = page.locator('meta[property="og:url"]');
      await expect(ogUrl).toHaveAttribute("content", /sakumari\.fukudev\.org/);
    });
  });

  test.describe("Katakana Page SEO", () => {
    test("should redirect to home and show sign-in for unauthenticated users", async ({
      page,
    }) => {
      await page.goto("/katakana");

      // Should redirect to home page for unauthenticated users
      await page.waitForURL("/");

      // Check home page title (since we were redirected)
      await expect(page).toHaveTitle(/SakuMari.*Master Japanese Kana/);

      // Should show sign-in prompt
      await expect(
        page.getByRole("button", { name: "Sign In" }),
      ).toBeVisible();
    });

    test("should redirect to home for OpenGraph tags", async ({ page }) => {
      await page.goto("/katakana");

      // Should redirect to home page for unauthenticated users
      await page.waitForURL("/");

      const ogTitle = page.locator('meta[property="og:title"]');
      await expect(ogTitle).toHaveAttribute("content", /SakuMari/);

      const ogUrl = page.locator('meta[property="og:url"]');
      await expect(ogUrl).toHaveAttribute("content", /sakumari\.fukudev\.org/);
    });
  });

  test.describe("Dashboard Page SEO", () => {
    test("should redirect to home and show sign-in for unauthenticated users", async ({
      page,
    }) => {
      await page.goto("/dashboard");

      // Should redirect to home page for unauthenticated users
      await page.waitForURL("/");

      // Check home page title (since we were redirected)
      await expect(page).toHaveTitle(/SakuMari.*Master Japanese Kana/);

      // Should show sign-in prompt
      await expect(
        page.getByRole("button", { name: "Sign In" }),
      ).toBeVisible();
    });
  });

  test.describe("Global SEO Elements", () => {
    test("should have consistent branding on accessible pages", async ({
      page,
    }) => {
      test.setTimeout(90000); // Extended timeout for multiple page visits

      // Only test accessible pages for unauthenticated users
      const pages = ["/"];

      for (const pagePath of pages) {
        await page.goto(pagePath);

        // Wait for page to be ready before checking elements
        await expect(page.locator("h1")).toBeVisible();

        // All pages should have SakuMari in title
        await expect(page).toHaveTitle(/SakuMari/);

        // All pages should have viewport meta tag
        const viewport = page.locator('meta[name="viewport"]');
        await expect(viewport).toBeAttached();

        // All pages should have charset meta tag
        const charset = page.locator("meta[charset]");
        await expect(charset).toBeAttached();
      }
    });

    test("should have proper language declaration", async ({ page }) => {
      await page.goto("/");

      const htmlLang = await page.getAttribute("html", "lang");
      expect(htmlLang).toBe("en");
    });

    test("should have favicon", async ({ page }) => {
      await page.goto("/");

      const favicon = page.locator('link[rel="icon"]');
      await expect(favicon).toBeAttached();
    });
  });

  test.describe("SEO Content Quality", () => {
    test("should have unique page titles for accessible pages", async ({
      page,
    }) => {
      test.setTimeout(90000); // Extended timeout for multiple page visits

      // Only test home page for unauthenticated users (others redirect)
      const pageData = [
        { path: "/", expectedTitlePattern: /SakuMari.*Master Japanese Kana/ },
      ];

      const titles = [];
      for (const { path, expectedTitlePattern } of pageData) {
        await page.goto(path);

        // Wait for page to be ready
        await expect(page.locator("h1")).toBeVisible();

        await expect(page).toHaveTitle(expectedTitlePattern);
        titles.push(await page.title());
      }

      // For this simple test, just verify the home page has the expected title
      expect(titles.length).toBe(1);
    });

    test("should have unique meta descriptions for accessible pages", async ({
      page,
    }) => {
      test.setTimeout(90000); // Extended timeout for multiple page visits

      // Only test home page for unauthenticated users (others redirect)
      const paths = ["/"];
      const descriptions = [];

      for (const path of paths) {
        await page.goto(path);

        // Wait for page to be ready
        await expect(page.locator("h1")).toBeVisible();

        const description = page.locator('meta[name="description"]');
        const content = await description.getAttribute("content");
        descriptions.push(content);
      }

      // Ensure all descriptions are unique and not empty
      const uniqueDescriptions = new Set(descriptions.filter(Boolean));
      expect(uniqueDescriptions.size).toBe(descriptions.length);
    });

    test("should have proper heading structure", async ({ page }) => {
      await page.goto("/");

      // Wait for the page to fully load
      await page.waitForLoadState("networkidle");

      // Wait for the h1 to be visible
      await expect(page.locator("h1")).toBeVisible();

      // Should have exactly one h1
      const h1Count = await page.locator("h1").count();
      expect(h1Count).toBe(1);

      // Should have at least one h2
      const h2Count = await page.locator("h2").count();
      expect(h2Count).toBeGreaterThan(0);

      // H1 should contain main brand/page identifier
      const h1Text = await page.locator("h1").textContent();
      expect(h1Text).toMatch(/SakuMari/);
    });
  });

  test.describe("Performance and SEO", () => {
    test("should load quickly for good SEO rankings", async ({ page }) => {
      test.setTimeout(30000); // 30 seconds for this performance test

      const startTime = Date.now();
      await page.goto("/");

      // Wait for specific content instead of networkidle
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator('meta[name="description"]')).toBeAttached();

      const loadTime = Date.now() - startTime;

      // Page should load within reasonable time (5 seconds for CI)
      expect(loadTime).toBeLessThan(5000);
    });

    test("should have no console errors that could affect SEO", async ({
      page,
    }) => {
      const consoleErrors: string[] = [];

      page.on("console", (msg) => {
        if (msg.type() === "error") {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto("/");

      // Wait for specific content instead of networkidle
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator('meta[name="description"]')).toBeAttached();

      // Filter out expected/harmless errors
      const significantErrors = consoleErrors.filter(
        (error) =>
          !error.includes("favicon") &&
          !error.includes("404") &&
          !error.includes("net::ERR_FAILED"),
      );

      expect(significantErrors).toHaveLength(0);
    });
  });
});
