import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, "../../playwright/.auth/user.json");

setup("authenticate", async ({ page }) => {
  // Check if CREDS_PROVIDER is enabled
  const credsProvider = process.env.CREDS_PROVIDER === "true";
  if (!credsProvider) {
    throw new Error("E2E tests require CREDS_PROVIDER=true to be set in environment variables");
  }

  // Navigate to home page
  await page.goto("/");

  // Wait for the page to load
  await page.waitForLoadState("networkidle");

  // Wait for header to load by looking for the SakuMari title
  await expect(page.getByText("🌸 SakuMari 🌸")).toBeVisible({
    timeout: 15000,
  });

  // Debug: Check what buttons are available
  const allButtons = await page.locator("button").all();
  console.log(`Found ${allButtons.length} buttons`);

  for (let i = 0; i < allButtons.length; i++) {
    const buttonText = await allButtons[i].textContent();
    const isVisible = await allButtons[i].isVisible();
    console.log(`Button ${i}: "${buttonText}" (visible: ${isVisible})`);
  }

  // Wait for and click the "Sign In" button (now directly goes to credentials)
  const signInButton = page.locator('button:has-text("Sign In")').first();
  await expect(signInButton).toBeVisible({ timeout: 10000 });

  console.log(`Clicking Sign In button...`);
  await signInButton.click();

  // Debug: Check what happened after click
  await page.waitForTimeout(2000);
  console.log(`URL after clicking Sign In: ${page.url()}`);

  // Check what's on the current page
  const pageTitle = await page.title();
  console.log(`Page title: ${pageTitle}`);

  // Now we're on the NextAuth.js credentials page - wait for form fields
  await page.waitForSelector('input[name="email"]', { timeout: 10000 });
  console.log("Found email input field");

  // Fill the email and password fields
  const testEmail = process.env.CREDS_TEST_EMAIL || "test@sakumari.local";
  const testPassword = process.env.CREDS_TEST_PASSWORD || "TestPassword123!";

  console.log(`Using credentials: ${testEmail} / [REDACTED PASSWORD]`);

  await page.fill('input[name="email"]', testEmail);
  await page.fill('input[name="password"]', testPassword);

  // Verify form values
  const emailValue = await page.inputValue('input[name="email"]');
  await page.inputValue('input[name="password"]'); // Verify password field is filled
  console.log(
    `Form values filled: email="${emailValue}", password="***REDACTED***"`,
  );

  // Look for the credentials provider submit button specifically
  console.log("Looking for credentials submit button...");

  // Check all submit buttons on the page
  const submitButtons = await page.locator('button[type="submit"]').all();
  console.log(`Found ${submitButtons.length} submit buttons`);

  for (let i = 0; i < submitButtons.length; i++) {
    const buttonText = await submitButtons[i].textContent();
    console.log(`Submit button ${i}: "${buttonText}"`);
  }

  // Look for the credentials-specific submit button (usually in a form with credentials provider)
  const credentialsSubmit = page
    .locator("form")
    .filter({ has: page.locator('input[name="email"]') })
    .locator('button[type="submit"]');

  if (await credentialsSubmit.isVisible()) {
    console.log("Using credentials form submit button");
    await credentialsSubmit.click();
  } else {
    console.log("Using first submit button");
    await page.click('button[type="submit"]');
  }

  // Debug: Check what happens after form submission
  await page.waitForTimeout(3000);
  console.log(`URL after form submit: ${page.url()}`);

  // Check if there are any error messages
  const errorMessages = await page
    .locator("text=/error|invalid|failed/i")
    .all();
  if (errorMessages.length > 0) {
    for (const error of errorMessages) {
      const errorText = await error.textContent();
      console.log(`Error message found: ${errorText}`);
    }
  }

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
