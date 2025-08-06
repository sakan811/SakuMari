import { test, expect } from "@playwright/test";

// Helper function to wait for kana to load
async function waitForKanaLoad(page: any, timeout = 10000) {
  await page.waitForSelector('[data-testid="current-kana"]', { timeout });
}

// Helper function to expect either result
async function expectResult(page: any, timeout = 5000) {
  await expect(
    page.getByText("Correct!").or(page.getByText("Incorrect!")),
  ).toBeVisible({ timeout });
}

test.describe("Flashcard Features", () => {
  test("should practice hiragana flashcards", async ({ page }) => {
    await page.goto("/hiragana");
    await waitForKanaLoad(page);

    // Should show typing mode by default
    await expect(
      page.getByPlaceholder("Type romaji equivalent..."),
    ).toBeVisible();

    // Test typing interaction (use generic answer since kana is random)
    await page.getByPlaceholder("Type romaji equivalent...").fill("a");
    await page.getByRole("button", { name: "Submit" }).click();

    // Should show result (either correct or incorrect)
    await expectResult(page);
  });

  test("should practice katakana flashcards", async ({ page }) => {
    await page.goto("/katakana");
    await waitForKanaLoad(page);

    // Should show typing interface
    await expect(
      page.getByPlaceholder("Type romaji equivalent..."),
    ).toBeVisible();

    // Test interaction with generic answer
    await page.getByPlaceholder("Type romaji equivalent...").fill("a");
    await page.getByRole("button", { name: "Submit" }).click();

    // Should show result
    await expectResult(page);
  });

  test("should validate empty input", async ({ page }) => {
    await page.goto("/hiragana");
    await waitForKanaLoad(page);

    // Try to submit without input
    await page.getByRole("button", { name: "Submit" }).click();

    // Should show validation error
    await expect(page.getByText("Please enter an answer")).toBeVisible();
  });

  test("should switch between interaction modes", async ({ page }) => {
    await page.goto("/hiragana");
    await waitForKanaLoad(page);

    // Should start in typing mode
    await expect(
      page.getByPlaceholder("Type romaji equivalent..."),
    ).toBeVisible();

    // Switch to multiple choice
    await page.getByTestId("multiple-choice-button").click();

    // Should hide typing input and show choices
    await expect(
      page.getByPlaceholder("Type romaji equivalent..."),
    ).not.toBeVisible();
    await expect(page.getByText("Tap to select your answer")).toBeVisible();

    // Switch back to typing
    await page.getByTestId("typing-button").click();

    // Should show typing input again
    await expect(
      page.getByPlaceholder("Type romaji equivalent..."),
    ).toBeVisible();
  });

  test("should use multiple choice mode", async ({ page }) => {
    await page.goto("/hiragana");
    await waitForKanaLoad(page);

    // Switch to multiple choice
    await page.getByTestId("multiple-choice-button").click();

    // Wait for instruction text to appear (indicates choices are loaded)
    await expect(page.getByText("Tap to select your answer")).toBeVisible({
      timeout: 10000,
    });

    // Wait for choice buttons to be present and visible
    await page.waitForSelector('[data-testid^="choice-button-"]', {
      timeout: 10000,
    });

    // Get the first choice button using the new specific testid
    const firstChoice = page.getByTestId("choice-button-0");

    // Ensure button is visible and enabled before clicking
    await expect(firstChoice).toBeVisible({ timeout: 5000 });
    await expect(firstChoice).toBeEnabled();

    // Wait for button to be in stable state
    await page.waitForTimeout(500);

    // Use force click to bypass potential overlay issues
    await firstChoice.click({ force: true });

    // Wait for selection state to update and verify
    await page.waitForTimeout(200);

    // Check if the button is now selected (has selection styles)
    await expect(firstChoice).toHaveClass(/border-\[#d1622b\]/);

    // Verify submit button is available and enabled
    const submitButton = page.getByRole("button", { name: "Submit" });
    await expect(submitButton).toBeEnabled({ timeout: 2000 });

    // Submit answer
    await submitButton.click();

    // Should show result
    await expectResult(page, 10000); // Increased timeout
  });

  test("should proceed to next card", async ({ page }) => {
    await page.goto("/hiragana");
    await waitForKanaLoad(page);

    // Answer current card
    await page.getByPlaceholder("Type romaji equivalent...").fill("a");
    await page.getByRole("button", { name: "Submit" }).click();

    // Wait for result
    await expectResult(page);

    // Click next card
    await page.getByRole("button", { name: "Next Card" }).click();

    // Should show new card (result should be hidden)
    await expect(page.getByText("Correct!")).not.toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText("Incorrect!")).not.toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.getByPlaceholder("Type romaji equivalent..."),
    ).toBeVisible();
  });

  test("should handle keyboard navigation", async ({ page }) => {
    await page.goto("/hiragana");
    await waitForKanaLoad(page);

    // Type answer and press Enter
    await page.getByPlaceholder("Type romaji equivalent...").fill("a");
    await page.getByPlaceholder("Type romaji equivalent...").press("Enter");

    // Should show result
    await expectResult(page);

    await page.waitForTimeout(10000);

    // Press Enter to go to next card
    await page.keyboard.press("Enter");

    // Wait for transition by checking that the input is empty and submit button is visible
    // This indicates we've moved to the next card
    await expect(
      page.getByPlaceholder("Type romaji equivalent..."),
    ).toHaveValue("");
    await expect(
      page.getByPlaceholder("Type romaji equivalent..."),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();

    // Ensure no result messages are visible (wait a bit for transition)
    await page.waitForTimeout(1000); // Give time for result to disappear
    await expect(page.getByText("Correct!")).not.toBeVisible();
    await expect(page.getByText("Incorrect!")).not.toBeVisible();
  });
});
