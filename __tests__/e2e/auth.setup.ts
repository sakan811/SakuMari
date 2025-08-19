import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Perform authentication steps
  await page.goto('/');
  
  // Click sign in button (use role to be more specific) - this opens credentials form
  await page.getByRole('button', { name: 'Sign In' }).click();
  
  // Wait for the NextAuth credentials signin page to load
  await page.waitForURL(/.*signin.*/);
  
  // Fill in credentials on the NextAuth signin form
  await page.fill('input[name="email"]', 'test@sakumari.local');
  await page.fill('input[name="password"]', 'TestPassword123!');
  
  // Click the credentials provider button specifically (not Google)
  await Promise.all([
    page.waitForURL('/'),
    page.click('form[action*="credentials"] button[type="submit"]')
  ]);
  
  // Verify authentication succeeded - wait for sign out button to appear
  await expect(page.getByText('Sign Out')).toBeVisible();
  await expect(page.getByText('ひらがな Hiragana Practice')).toBeVisible();
  await expect(page.getByText('カタカナ Katakana Practice')).toBeVisible();
  
  // Save authentication state
  await page.context().storageState({ path: authFile });
});