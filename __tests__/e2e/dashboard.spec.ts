import { test, expect } from "@playwright/test";

test.describe("Dashboard Features", () => {
  test.beforeEach(async ({ page }) => {
    // Practice a few cards to generate data for dashboard
    await page.goto("/hiragana");

    // Submit a few answers to create practice data
    for (let i = 0; i < 3; i++) {
      // Wait for input to be ready
      await page.waitForSelector(
        'input[placeholder="Type romaji equivalent..."]',
        { timeout: 10000 },
      );

      await page.getByPlaceholder("Type romaji equivalent...").fill("a");
      await page.getByRole("button", { name: "Submit" }).click();

      // Wait for result and go to next card
      await expect(
        page.getByText("Correct!").or(page.getByText("Incorrect!")),
      ).toBeVisible({ timeout: 5000 });

      await page.getByRole("button", { name: "Next Card" }).click();
    }
  });

  test("should display progress statistics", async ({ page }) => {
    await page.goto("/dashboard");

    // Should show dashboard title
    await expect(page.getByText("Dashboard")).toBeVisible();

    // Should show progress section
    await expect(page.getByText("Your Progress")).toBeVisible();

    // Should show stat cards
    await expect(page.getByText("Total Characters Practiced")).toBeVisible();
    await expect(page.getByText("Average Accuracy")).toBeVisible();
    await expect(page.getByText("Total Attempts")).toBeVisible();

    // Should show character progress table
    await expect(page.getByText("Character Progress")).toBeVisible();
  });

  test("should filter by kana type", async ({ page }) => {
    await page.goto("/dashboard");

    // Should show filter buttons
    await expect(page.getByTestId("filter-all")).toBeVisible();
    await expect(page.getByTestId("filter-hiragana")).toBeVisible();
    await expect(page.getByTestId("filter-katakana")).toBeVisible();

    // Click Hiragana filter
    await page.getByTestId("filter-hiragana").click();

    // Filter should be active
    await expect(page.getByTestId("filter-hiragana")).toHaveClass(
      /bg-\[#d1622b\]/,
    );

    // Click Katakana filter
    await page.getByTestId("filter-katakana").click();

    // Filter should be active
    await expect(page.getByTestId("filter-katakana")).toHaveClass(
      /bg-\[#d1622b\]/,
    );

    // Click All filter
    await page.getByTestId("filter-all").click();

    // Filter should be active
    await expect(page.getByTestId("filter-all")).toHaveClass(/bg-\[#d1622b\]/);
  });

  test("should sort character data", async ({ page }) => {
    await page.goto("/dashboard");

    // Should show sortable headers
    await expect(page.getByTestId("sort-character")).toBeVisible();
    await expect(page.getByTestId("sort-romaji")).toBeVisible();
    await expect(page.getByTestId("sort-attempts")).toBeVisible();
    await expect(page.getByTestId("sort-accuracy")).toBeVisible();

    // Click character header to sort
    await page.getByTestId("sort-character").click();

    // Should show sort indicator (either up or down arrow)
    await expect(
      page
        .getByTestId("sort-character")
        .getByText("↑")
        .or(page.getByTestId("sort-character").getByText("↓")),
    ).toBeVisible();

    // Click again to reverse sort
    await page.getByTestId("sort-character").click();

    // Should show sort indicator (arrow should change or remain)
    await expect(
      page
        .getByTestId("sort-character")
        .getByText("↑")
        .or(page.getByTestId("sort-character").getByText("↓")),
    ).toBeVisible();
  });

  test("should navigate back to practice", async ({ page }) => {
    await page.goto("/dashboard");

    // Should show back to home button
    await expect(page.getByText("Back to Home")).toBeVisible();

    // Click back to home
    await page.getByText("Back to Home").click();

    // Should navigate to home page
    await page.waitForURL("/");
    await expect(page.getByText("🌸 SakuMari 🌸")).toBeVisible();
  });

  test("should be responsive on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/dashboard");

    // Should show dashboard content
    await expect(page.getByText("Dashboard")).toBeVisible();
    await expect(page.getByText("Your Progress")).toBeVisible();

    // Filter buttons should be visible and functional
    await expect(page.getByTestId("filter-all")).toBeVisible();
    await expect(page.getByTestId("filter-hiragana")).toBeVisible();
    await expect(page.getByTestId("filter-katakana")).toBeVisible();

    // Should be able to interact with filters
    await page.getByTestId("filter-hiragana").click();
    await expect(page.getByTestId("filter-hiragana")).toHaveClass(
      /bg-\[#d1622b\]/,
    );
  });
});
