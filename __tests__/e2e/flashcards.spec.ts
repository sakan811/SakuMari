import { test, expect } from "@playwright/test";

test.describe("Flashcard Practice", () => {
  test("should practice hiragana in typing mode", async ({ page }) => {
    await page.goto("/hiragana");
    
    // Wait for kana to load
    await page.waitForSelector('[data-testid="current-kana"]');
    
    // Should show typing interface by default
    await expect(page.getByPlaceholder("Type romaji equivalent...")).toBeVisible();
    
    // Submit an answer
    await page.getByPlaceholder("Type romaji equivalent...").fill("a");
    await page.getByRole("button", { name: "Submit" }).click();
    
    // Should show result
    await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
  });

  test("should practice katakana in typing mode", async ({ page }) => {
    await page.goto("/katakana");
    await page.waitForSelector('[data-testid="current-kana"]');
    
    await page.getByPlaceholder("Type romaji equivalent...").fill("a");
    await page.getByRole("button", { name: "Submit" }).click();
    
    await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
  });

  test("should validate empty input", async ({ page }) => {
    await page.goto("/hiragana");
    await page.waitForSelector('[data-testid="current-kana"]');
    
    // Try to submit without input
    await page.getByRole("button", { name: "Submit" }).click();
    
    // Should show validation error
    await expect(page.getByText("Please enter an answer")).toBeVisible();
  });

  test("should switch to multiple choice mode", async ({ page }) => {
    await page.goto("/hiragana");
    await page.waitForSelector('[data-testid="current-kana"]');
    
    // Switch to multiple choice
    await page.getByTestId("multiple-choice-button").click();
    
    // Should hide typing input and show choices
    await expect(page.getByPlaceholder("Type romaji equivalent...")).not.toBeVisible();
    await expect(page.getByText("Tap to select your answer")).toBeVisible();
    
    // Switch back to typing
    await page.getByTestId("typing-button").click();
    await expect(page.getByPlaceholder("Type romaji equivalent...")).toBeVisible();
  });

  test("should use multiple choice mode", async ({ page }) => {
    await page.goto("/hiragana");
    await page.waitForSelector('[data-testid="current-kana"]');
    
    // Switch to multiple choice
    await page.getByTestId("multiple-choice-button").click();
    await expect(page.getByText("Tap to select your answer")).toBeVisible();
    
    // Wait for choice buttons and click first one
    await page.waitForSelector('[data-testid^="choice-button-"]');
    const firstChoice = page.getByTestId("choice-button-0");
    await firstChoice.click();
    
    // Should be selected
    await expect(firstChoice).toHaveClass(/border-\[#d1622b\]/);
    
    // Submit answer
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
  });

  test("should proceed to next card", async ({ page }) => {
    await page.goto("/hiragana");
    await page.waitForSelector('[data-testid="current-kana"]');
    
    // Answer current card
    await page.getByPlaceholder("Type romaji equivalent...").fill("a");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
    
    // Go to next card
    await page.getByRole("button", { name: "Next Card" }).click();
    
    // Should show new card
    await expect(page.getByText("Correct!")).not.toBeVisible();
    await expect(page.getByText("Incorrect!")).not.toBeVisible();
    await expect(page.getByPlaceholder("Type romaji equivalent...")).toBeVisible();
  });

  test("should handle keyboard navigation", async ({ page }) => {
    await page.goto("/hiragana");
    await page.waitForSelector('[data-testid="current-kana"]');
    
    // Type answer and press Enter
    const input = page.getByPlaceholder("Type romaji equivalent...");
    await input.fill("a");
    await input.press("Enter");
    
    // Should show result
    await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
    
    // Press Enter to go to next card
    await page.keyboard.press("Enter");
    
    // Should show new card with empty input
    await expect(input).toHaveValue("");
    await expect(input).toBeVisible();
  });
});