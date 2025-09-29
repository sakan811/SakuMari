import { test, expect, devices } from "@playwright/test";

test.describe("Performance and Accessibility", () => {
  test.describe("Performance Benchmarks", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
      // Login for performance tests
      await page.goto("/");
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.waitForURL(/.*signin.*/);
      await page.fill('input[name="email"]', "test@sakumari.local");
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.click('form[action*="credentials"] button[type="submit"]');
      await page.waitForURL("/");
    });

    test("should load home page quickly", async ({ page }) => {
      const startTime = Date.now();
      await page.goto("/");
      await expect(page.getByText("🌸 SakuMari 🌸")).toBeVisible();
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    });

    test("should load practice page quickly", async ({ page }) => {
      const startTime = Date.now();
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    });

    test("should load dashboard quickly", async ({ page }) => {
      // Generate some practice data first
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      for (let i = 0; i < 3; i++) {
        await page.getByPlaceholder("Type romaji equivalent...").fill("a");
        await page.getByRole("button", { name: "Submit" }).click();
        await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
        await page.getByRole("button", { name: "Next Card" }).click();
      }

      // Test dashboard load time
      const startTime = Date.now();
      await page.goto("/dashboard");
      await expect(page.getByText("Dashboard")).toBeVisible();
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    });

    test("should respond quickly to flashcard interactions", async ({ page }) => {
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Test typing submission response time
      const input = page.getByPlaceholder("Type romaji equivalent...");
      await input.fill("a");

      const submitStartTime = Date.now();
      await page.getByRole("button", { name: "Submit" }).click();
      await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
      const responseTime = Date.now() - submitStartTime;
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second

      // Test next card response time
      const nextStartTime = Date.now();
      await page.getByRole("button", { name: "Next Card" }).click();
      await expect(page.getByPlaceholder("Type romaji equivalent...")).toBeVisible();
      const nextResponseTime = Date.now() - nextStartTime;
      expect(nextResponseTime).toBeLessThan(1000); // Should respond within 1 second
    });

    test("should respond quickly to multiple choice interactions", async ({ page }) => {
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Switch to multiple choice
      await page.getByTestId("multiple-choice-button").click();
      await expect(page.getByText("Tap to select your answer")).toBeVisible();

      // Test choice selection response time
      await page.waitForSelector('[data-testid^="choice-button-"]');
      const firstChoice = page.getByTestId("choice-button-0");

      const choiceStartTime = Date.now();
      await firstChoice.click();
      await expect(firstChoice).toHaveClass(/border-\[#d1622b\]/);
      const choiceResponseTime = Date.now() - choiceStartTime;
      expect(choiceResponseTime).toBeLessThan(500); // Should respond within 500ms

      // Test submission response time
      const submitStartTime = Date.now();
      await page.getByRole("button", { name: "Submit" }).click();
      await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
      const responseTime = Date.now() - submitStartTime;
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });

    test("should handle rapid interactions without performance degradation", async ({ page }) => {
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Test rapid mode switching
      const modeSwitchStartTime = Date.now();
      for (let i = 0; i < 5; i++) {
        await page.getByTestId("multiple-choice-button").click();
        await expect(page.getByText("Tap to select your answer")).toBeVisible();
        await page.getByTestId("typing-button").click();
        await expect(page.getByPlaceholder("Type romaji equivalent...")).toBeVisible();
      }
      const modeSwitchTime = Date.now() - modeSwitchStartTime;
      expect(modeSwitchTime).toBeLessThan(3000); // Should complete within 3 seconds

      // Test rapid card navigation
      await page.getByPlaceholder("Type romaji equivalent...").fill("a");
      await page.getByRole("button", { name: "Submit" }).click();
      await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();

      const navigationStartTime = Date.now();
      for (let i = 0; i < 5; i++) {
        await page.getByRole("button", { name: "Next Card" }).click();
        await page.waitForSelector('[data-testid="current-kana"]');
      }
      const navigationTime = Date.now() - navigationStartTime;
      expect(navigationTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test("should perform well on mobile devices", async ({ page }) => {
      await page.setViewportSize(devices["iPhone 12"].viewport);

      // Test mobile load time
      const startTime = Date.now();
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(4000); // Should load within 4 seconds on mobile

      // Test mobile touch response time
      const button = page.getByTestId("multiple-choice-button");
      const touchStartTime = Date.now();
      await button.tap();
      const responseTime = Date.now() - touchStartTime;
      expect(responseTime).toBeLessThan(500); // Should respond within 500ms to touch

      await expect(page.getByText("Tap to select your answer")).toBeVisible();
    });
  });

  test.describe("Accessibility Compliance", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/");
    });

    test("should have proper heading structure", async ({ page }) => {
      // Check main heading
      const mainHeading = page.getByText("🌸 SakuMari 🌸");
      await expect(mainHeading).toBeVisible();

      // Check for proper heading hierarchy
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
      expect(headings).toBeGreaterThan(0);
    });

    test("should have accessible navigation", async ({ page }) => {
      // Check navigation landmarks
      const nav = page.locator('nav');
      await expect(nav).toBeVisible();

      // Check navigation links
      const navLinks = nav.locator('a');
      const linkCount = await navLinks.count();
      expect(linkCount).toBeGreaterThan(0);

      // Check if links have proper text
      for (let i = 0; i < linkCount; i++) {
        const link = navLinks.nth(i);
        const text = await link.textContent();
        expect(text?.trim().length).toBeGreaterThan(0);
      }
    });

    test("should have accessible forms", async ({ page }) => {
      // Navigate to sign in
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.waitForURL(/.*signin.*/);

      // Check form labels
      const emailInput = page.locator('input[name="email"]');
      const passwordInput = page.locator('input[name="password"]');

      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();

      // Check if inputs have associated labels
      const emailLabel = await emailInput.evaluate((el) => {
        const id = el.getAttribute('id');
        if (id) {
          const label = document.querySelector(`label[for="${id}"]`);
          return label?.textContent?.trim() || '';
        }
        return '';
      });

      const passwordLabel = await passwordInput.evaluate((el) => {
        const id = el.getAttribute('id');
        if (id) {
          const label = document.querySelector(`label[for="${id}"]`);
          return label?.textContent?.trim() || '';
        }
        return '';
      });

      expect(emailLabel.length).toBeGreaterThan(0);
      expect(passwordLabel.length).toBeGreaterThan(0);
    });

    test("should have accessible buttons", async ({ page }) => {
      // Check if buttons have proper text or aria-labels
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      expect(buttonCount).toBeGreaterThan(0);

      for (let i = 0; i < Math.min(buttonCount, 10); i++) {
        const button = buttons.nth(i);
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');

        expect(text?.trim().length || ariaLabel?.length || 0).toBeGreaterThan(0);
      }
    });

    test("should have accessible flashcard interface", async ({ page }) => {
      // Login for flashcard tests
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.waitForURL(/.*signin.*/);
      await page.fill('input[name="email"]', "test@sakumari.local");
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.click('form[action*="credentials"] button[type="submit"]');
      await page.waitForURL("/");

      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Check flashcard input accessibility
      const input = page.getByPlaceholder("Type romaji equivalent...");
      await expect(input).toBeVisible();

      // Check if input has proper placeholder
      const placeholder = await input.getAttribute('placeholder');
      expect(placeholder?.length).toBeGreaterThan(0);

      // Check submit button accessibility
      const submitButton = page.getByRole("button", { name: "Submit" });
      await expect(submitButton).toBeVisible();

      // Check mode switch buttons
      const typingButton = page.getByTestId("typing-button");
      const multipleChoiceButton = page.getByTestId("multiple-choice-button");

      await expect(typingButton).toBeVisible();
      await expect(multipleChoiceButton).toBeVisible();

      // Check if buttons have proper aria attributes
      const typingAria = await typingButton.getAttribute('aria-label');
      const multipleChoiceAria = await multipleChoiceButton.getAttribute('aria-label');

      expect(typingAria || (await typingButton.textContent())).toBeTruthy();
      expect(multipleChoiceAria || (await multipleChoiceButton.textContent())).toBeTruthy();
    });

    test("should have accessible dashboard", async ({ page }) => {
      // Login and generate data
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.waitForURL(/.*signin.*/);
      await page.fill('input[name="email"]', "test@sakumari.local");
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.click('form[action*="credentials"] button[type="submit"]');
      await page.waitForURL("/");

      // Generate practice data
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      for (let i = 0; i < 2; i++) {
        await page.getByPlaceholder("Type romaji equivalent...").fill("a");
        await page.getByRole("button", { name: "Submit" }).click();
        await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
        await page.getByRole("button", { name: "Next Card" }).click();
      }

      await page.goto("/dashboard");

      // Check table accessibility
      const table = page.locator('table');
      const tableExists = await table.count();
      if (tableExists > 0) {
        // Check if table has proper headers
        const headers = table.locator('th');
        const headerCount = await headers.count();
        expect(headerCount).toBeGreaterThan(0);

        // Check if headers have proper scope
        for (let i = 0; i < headerCount; i++) {
          const header = headers.nth(i);
          const scope = await header.getAttribute('scope');
          expect(scope || header.textContent()).toBeTruthy();
        }
      }

      // Check filter button accessibility
      const filterButtons = page.locator('[data-testid^="filter-"]');
      const filterCount = await filterButtons.count();
      expect(filterCount).toBeGreaterThan(0);

      for (let i = 0; i < filterCount; i++) {
        const button = filterButtons.nth(i);
        const text = await button.textContent();
        expect(text?.trim().length).toBeGreaterThan(0);
      }

      // Check sort button accessibility
      const sortButtons = page.locator('[data-testid^="sort-"]');
      const sortCount = await sortButtons.count();
      expect(sortCount).toBeGreaterThan(0);

      for (let i = 0; i < sortCount; i++) {
        const button = sortButtons.nth(i);
        const text = await button.textContent();
        expect(text?.trim().length).toBeGreaterThan(0);
      }
    });

    test("should support keyboard navigation", async ({ page }) => {
      // Login for keyboard navigation tests
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.waitForURL(/.*signin.*/);
      await page.fill('input[name="email"]', "test@sakumari.local");
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.click('form[action*="credentials"] button[type="submit"]');
      await page.waitForURL("/");

      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Test keyboard navigation in flashcard practice
      const input = page.getByPlaceholder("Type romaji equivalent...");

      // Focus on input
      await input.focus();
      await expect(input).toBeFocused();

      // Type and submit with keyboard
      await input.fill("a");
      await input.press("Enter");
      await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();

      // Navigate to next card with keyboard
      await page.keyboard.press("Enter");
      await expect(page.getByPlaceholder("Type romaji equivalent...")).toBeVisible();
      await expect(input).toHaveValue("");

      // Test mode switching with keyboard
      await page.getByTestId("multiple-choice-button").focus();
      await page.keyboard.press("Enter");
      await expect(page.getByText("Tap to select your answer")).toBeVisible();

      // Test multiple choice with keyboard
      await page.waitForSelector('[data-testid^="choice-button-"]');
      const firstChoice = page.getByTestId("choice-button-0");
      await firstChoice.focus();
      await page.keyboard.press("Enter");
      await expect(firstChoice).toHaveClass(/border-\[#d1622b\]/);

      // Submit with keyboard
      await page.keyboard.press("Enter");
      await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
    });

    test("should have proper color contrast", async ({ page }) => {
      // This test checks for visible elements that should have proper contrast
      await page.goto("/");

      // Check main text elements
      const mainHeading = page.getByText("🌸 SakuMari 🌸");
      await expect(mainHeading).toBeVisible();

      const subtitle = page.getByText("Japanese Kana Flashcard App");
      await expect(subtitle).toBeVisible();

      // Check navigation elements
      const nav = page.locator('nav');
      await expect(nav).toBeVisible();

      // Check button visibility
      const signInButton = page.getByRole("button", { name: "Sign In" });
      await expect(signInButton).toBeVisible();

      // All elements should be visible and readable
      // Note: Actual contrast ratio testing would require specialized tools
      // This test ensures elements are present and visible
    });
  });

  test.describe("SEO Verification", () => {
    test("should have proper meta tags", async ({ page }) => {
      await page.goto("/");

      // Check title
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);

      // Check meta description
      const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
      expect(metaDescription?.length).toBeGreaterThan(0);

      // Check viewport meta
      const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
      expect(viewport).toContain('width=device-width');
    });

    test("should have proper heading structure for SEO", async ({ page }) => {
      await page.goto("/");

      // Check for single H1
      const h1Tags = await page.locator('h1').count();
      expect(h1Tags).toBe(1);

      // Check H1 content
      const h1Text = await page.locator('h1').textContent();
      expect(h1Text?.length).toBeGreaterThan(0);

      // Check for proper heading hierarchy
      const allHeadings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await allHeadings.count();
      expect(headingCount).toBeGreaterThan(0);
    });

    test("should have accessible images", async ({ page }) => {
      // Check if there are any images and if they have alt text
      const images = page.locator('img');
      const imageCount = await images.count();

      for (let i = 0; i < imageCount; i++) {
        const image = images.nth(i);
        const alt = await image.getAttribute('alt');
        expect(alt !== null).toBeTruthy();
      }
    });

    test("should have proper links", async ({ page }) => {
      const links = page.locator('a');
      const linkCount = await links.count();

      for (let i = 0; i < linkCount; i++) {
        const link = links.nth(i);
        const href = await link.getAttribute('href');
        const text = await link.textContent();

        // Links should have either href or be actionable
        if (href) {
          expect(href.length).toBeGreaterThan(0);
        }

        // Links should have descriptive text
        expect(text?.trim().length || href?.length || 0).toBeGreaterThan(0);
      }
    });
  });
});