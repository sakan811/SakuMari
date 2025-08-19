import { test, expect } from "@playwright/test";

test.describe("Dashboard Features", () => {
  test("should display progress statistics", async ({ page }) => {
    // Generate some practice data first
    await page.goto("/hiragana");
    await page.waitForSelector('[data-testid="current-kana"]');
    
    for (let i = 0; i < 2; i++) {
      await page.getByPlaceholder("Type romaji equivalent...").fill("a");
      await page.getByRole("button", { name: "Submit" }).click();
      await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
      await page.getByRole("button", { name: "Next Card" }).click();
    }
    
    // Now check dashboard
    await page.goto("/dashboard");
    
    await expect(page.getByText("Dashboard")).toBeVisible();
    await expect(page.getByText("Your Progress")).toBeVisible();
    await expect(page.getByText("Total Characters Practiced")).toBeVisible();
    await expect(page.getByText("Average Accuracy")).toBeVisible();
    await expect(page.getByText("Total Attempts")).toBeVisible();
    await expect(page.getByText("Character Progress")).toBeVisible();
  });

  test("should filter by kana type", async ({ page }) => {
    await page.goto("/dashboard");
    
    // Should show filter buttons
    await expect(page.getByTestId("filter-all")).toBeVisible();
    await expect(page.getByTestId("filter-hiragana")).toBeVisible();
    await expect(page.getByTestId("filter-katakana")).toBeVisible();
    
    // Test filters
    await page.getByTestId("filter-hiragana").click();
    await expect(page.getByTestId("filter-hiragana")).toHaveClass(/bg-\[#d1622b\]/);
    
    await page.getByTestId("filter-katakana").click();
    await expect(page.getByTestId("filter-katakana")).toHaveClass(/bg-\[#d1622b\]/);
    
    await page.getByTestId("filter-all").click();
    await expect(page.getByTestId("filter-all")).toHaveClass(/bg-\[#d1622b\]/);
  });

  test("should sort character data", async ({ page }) => {
    await page.goto("/dashboard");
    
    // Should show sortable headers
    await expect(page.getByTestId("sort-character")).toBeVisible();
    await expect(page.getByTestId("sort-romaji")).toBeVisible();
    await expect(page.getByTestId("sort-attempts")).toBeVisible();
    await expect(page.getByTestId("sort-correct-attempts")).toBeVisible();
    await expect(page.getByTestId("sort-accuracy")).toBeVisible();
    
    // Test sorting
    await page.getByTestId("sort-character").click();
    await expect(
      page.getByTestId("sort-character").getByText("↑").or(
        page.getByTestId("sort-character").getByText("↓")
      )
    ).toBeVisible();
    
    // Test reverse sort
    await page.getByTestId("sort-character").click();
    await expect(
      page.getByTestId("sort-character").getByText("↑").or(
        page.getByTestId("sort-character").getByText("↓")
      )
    ).toBeVisible();
  });

  test("should navigate back to home", async ({ page }) => {
    await page.goto("/dashboard");
    
    await expect(page.getByText("Back to Home")).toBeVisible();
    await page.getByText("Back to Home").click();
    
    await page.waitForURL("/");
    await expect(page.getByText("🌸 SakuMari 🌸")).toBeVisible();
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/dashboard");
    
    await expect(page.getByText("Dashboard")).toBeVisible();
    await expect(page.getByText("Your Progress")).toBeVisible();
    
    // Filter buttons should work on mobile
    await expect(page.getByTestId("filter-all")).toBeVisible();
    await page.getByTestId("filter-hiragana").click();
    await expect(page.getByTestId("filter-hiragana")).toHaveClass(/bg-\[#d1622b\]/);
  });
});