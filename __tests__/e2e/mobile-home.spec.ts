import { test, expect } from "@playwright/test";

test.describe("Mobile Home Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test.describe("Unauthenticated User", () => {
    test("should display properly on mobile", async ({ page }) => {
      await page.goto("/");

      // Hero section should be visible
      await expect(page.getByText("🌸 SakuMari 🌸")).toBeVisible();
      await expect(page.getByText("Master Japanese Characters")).toBeVisible();
      await expect(page.getByText("Interactive Flashcards")).toBeVisible();

      // Sign in button should be visible and accessible
      const signInButton = page.getByRole("button", { name: "Sign In" });
      await expect(signInButton).toBeVisible();

      const signInBox = await signInButton.boundingBox();
      expect(signInBox?.height).toBeGreaterThanOrEqual(44);
      expect(signInBox?.width).toBeGreaterThanOrEqual(44);
    });

    test("should show feature cards properly", async ({ page }) => {
      await page.goto("/");

      // Feature cards should be visible
      await expect(page.getByText("📚 Learn Japanese Characters")).toBeVisible();
      await expect(page.getByText("🎯 Adaptive Learning")).toBeVisible();
      await expect(page.getByText("📊 Progress Tracking")).toBeVisible();
      await expect(page.getByText("🧠 AI-Powered Tips")).toBeVisible();
    });

    test("should handle mobile navigation menu", async ({ page }) => {
      await page.goto("/");

      // Menu button should be visible
      const menuButton = page.getByLabel("Toggle mobile menu");
      await expect(menuButton).toBeVisible();

      // Open menu
      await menuButton.click();

      // Should show sign in options
      await expect(page.getByText("Sign In with Google")).toBeVisible();
      await expect(page.getByText("Sign In with Credentials")).toBeVisible();
    });

    test("should be scrollable on small screens", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 500 }); // Even smaller screen
      await page.goto("/");

      // Should be able to scroll
      const initialScrollPosition = await page.evaluate(() => window.scrollY);
      await page.evaluate(() => window.scrollTo(0, 100));
      const finalScrollPosition = await page.evaluate(() => window.scrollY);

      expect(finalScrollPosition).toBeGreaterThan(initialScrollPosition);
    });

    test("should maintain proper spacing on mobile", async ({ page }) => {
      await page.goto("/");

      // Check that elements have proper spacing
      const heroSection = page.locator("text=🌸 SakuMari 🌸").first();
      const heroBox = await heroSection.boundingBox();

      // Should have reasonable top margin
      expect(heroBox?.y).toBeGreaterThan(20);

      // Features should be stacked vertically
      const features = page.locator("text=📚 Learn Japanese Characters");
      const featuresBox = await features.boundingBox();
      expect(featuresBox?.y).toBeGreaterThan(heroBox?.y || 0);
    });
  });

  test.describe("Authenticated User", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
      // Login via credentials provider
      await page.goto("/");
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.waitForURL(/.*signin.*/);
      await page.fill('input[name="email"]', "test@sakumari.local");
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.click('form[action*="credentials"] button[type="submit"]');
      await page.waitForURL("/");
    });

    test("should show authenticated content on mobile", async ({ page }) => {
      await page.goto("/");

      // Should show practice options
      await expect(page.getByText("ひらがな Hiragana Practice")).toBeVisible();
      await expect(page.getByText("カタカナ Katakana Practice")).toBeVisible();
      await expect(page.getByText("📊 View Your Progress")).toBeVisible();

      // Should not show sign in button
      await expect(page.getByRole("button", { name: "Sign In" })).not.toBeVisible();
    });

    test("should navigate to practice pages from mobile home", async ({ page }) => {
      await page.goto("/");

      // Navigate to hiragana
      await page.getByText("ひらがな Hiragana Practice").click();
      await page.waitForURL("/hiragana");
      await expect(page.getByPlaceholder("Type romaji equivalent...")).toBeVisible();

      // Go back to home
      await page.goto("/");

      // Navigate to katakana
      await page.getByText("カタカナ Katakana Practice").click();
      await page.waitForURL("/katakana");
      await expect(page.getByPlaceholder("Type romaji equivalent...")).toBeVisible();

      // Go back to home
      await page.goto("/");

      // Navigate to dashboard
      await page.getByText("📊 View Your Progress").click();
      await page.waitForURL("/dashboard");
      await expect(page.getByText("Dashboard")).toBeVisible();
    });

    test("should show mobile navigation menu for authenticated users", async ({ page }) => {
      await page.goto("/");

      // Menu button should be visible
      const menuButton = page.getByLabel("Toggle mobile menu");
      await expect(menuButton).toBeVisible();

      // Open menu
      await menuButton.click();

      // Should show navigation options
      await expect(page.getByText("ひらがな Hiragana")).toBeVisible();
      await expect(page.getByText("カタカナ Katakana")).toBeVisible();
      await expect(page.getByText("📊 Dashboard")).toBeVisible();
      await expect(page.getByText("Test User")).toBeVisible();
      await expect(page.getByText("Sign Out")).toBeVisible();
    });

    test("should handle touch interactions on practice cards", async ({ page }) => {
      await page.goto("/");

      // Practice cards should be tappable
      const hiraganaCard = page.getByText("ひらがな Hiragana Practice");
      await hiraganaCard.tap();
      await page.waitForURL("/hiragana");
      await expect(page.getByPlaceholder("Type romaji equivalent...")).toBeVisible();
    });

    test("should maintain proper layout when mobile menu is open", async ({ page }) => {
      await page.goto("/");

      // Open mobile menu
      await page.getByLabel("Toggle mobile menu").click();
      await expect(page.getByText("ひらがな Hiragana")).toBeVisible();

      // Content should still be visible but pushed down
      await expect(page.getByText("🌸 SakuMari 🌸")).toBeVisible();
      await expect(page.getByText("ひらがな Hiragana Practice")).toBeVisible();

      // Check that menu overlays properly
      const menuContent = page.getByText("ひらがな Hiragana");
      const menuBox = await menuContent.boundingBox();
      const heroContent = page.getByText("🌸 SakuMari 🌸");
      const heroBox = await heroContent.boundingBox();

      expect(menuBox?.y).toBeGreaterThan(heroBox?.y || 0);
    });
  });

  test.describe("Mobile Performance", () => {
    test("should load quickly on mobile", async ({ page }) => {
      const startTime = Date.now();
      await page.goto("/");
      await expect(page.getByText("🌸 SakuMari 🌸")).toBeVisible();
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(2000); // Should load within 2 seconds
    });

    test("should handle rapid navigation on mobile", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByText("🌸 SakuMari 🌸")).toBeVisible();

      // Test rapid menu open/close
      const menuButton = page.getByLabel("Toggle mobile menu");
      for (let i = 0; i < 3; i++) {
        await menuButton.tap();
        await expect(page.getByText("Sign In with Google")).toBeVisible();
        await menuButton.tap();
        await expect(page.getByText("Sign In with Google")).not.toBeVisible();
      }
    });
  });

  test.describe("Mobile Orientation Handling", () => {
    test("should handle portrait to landscape transition", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");
      await expect(page.getByText("🌸 SakuMari 🌸")).toBeVisible();

      // Switch to landscape
      await page.setViewportSize({ width: 667, height: 375 });

      // Should still display properly
      await expect(page.getByText("🌸 SakuMari 🌸")).toBeVisible();
      await expect(page.getByText("Master Japanese Characters")).toBeVisible();

      // Menu button should still be accessible
      const menuButton = page.getByLabel("Toggle mobile menu");
      await expect(menuButton).toBeVisible();
      const menuBox = await menuButton.boundingBox();
      expect(menuBox?.height).toBeGreaterThanOrEqual(44);
    });

    test("should handle landscape to portrait transition", async ({ page }) => {
      await page.setViewportSize({ width: 667, height: 375 });
      await page.goto("/");
      await expect(page.getByText("🌸 SakuMari 🌸")).toBeVisible();

      // Switch to portrait
      await page.setViewportSize({ width: 375, height: 667 });

      // Should still display properly
      await expect(page.getByText("🌸 SakuMari 🌸")).toBeVisible();
      await expect(page.getByText("Master Japanese Characters")).toBeVisible();
    });
  });

  test.describe("Mobile Accessibility", () => {
    test("should have proper touch target sizes", async ({ page }) => {
      await page.goto("/");

      // Check various interactive elements
      const elements = [
        page.getByRole("button", { name: "Sign In" }),
        page.getByLabel("Toggle mobile menu"),
        page.getByText("ひらがな Hiragana Practice"),
        page.getByText("カタカナ Katakana Practice"),
        page.getByText("📊 View Your Progress"),
      ];

      for (const element of elements) {
        if (await element.isVisible()) {
          const box = await element.boundingBox();
          expect(box?.height).toBeGreaterThanOrEqual(44);
          expect(box?.width).toBeGreaterThanOrEqual(44);
        }
      }
    });

    test("should maintain text readability on mobile", async ({ page }) => {
      await page.goto("/");

      // Check main heading
      const heading = page.getByText("🌸 SakuMari 🌸");
      const headingBox = await heading.boundingBox();
      expect(headingBox?.height).toBeGreaterThan(20);

      // Check feature text
      const featureText = page.getByText("📚 Learn Japanese Characters");
      const featureBox = await featureText.boundingBox();
      expect(featureBox?.height).toBeGreaterThan(15);
    });

    test("should handle mobile zoom properly", async ({ page }) => {
      await page.goto("/");

      // Simulate zoom by evaluating viewport scale
      const initialScale = await page.evaluate(() => window.visualViewport?.scale || 1);
      expect(initialScale).toBe(1);

      // Content should still be visible
      await expect(page.getByText("🌸 SakuMari 🌸")).toBeVisible();
      await expect(page.getByText("Master Japanese Characters")).toBeVisible();
    });
  });
});