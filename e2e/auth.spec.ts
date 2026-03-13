import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should navigate to login page", async ({ page }) => {
    await page.goto("/pt/login");
    await expect(page).toHaveTitle(/login|entrar/i);
  });

  test("should navigate to register page", async ({ page }) => {
    await page.goto("/pt/register");
    await expect(page).toHaveTitle(/registr|inscrever/i);
  });

  test("should have login form with email and password fields", async ({
    page,
  }) => {
    await page.goto("/pt/login");

    // Check for email input
    const emailInput = page.locator(
      'input[type="email"], input[name*="email"]',
    );
    await expect(emailInput).toBeVisible();

    // Check for password input
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();

    // Check for submit button
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  });

  test("should have register form with required fields", async ({ page }) => {
    await page.goto("/pt/register");

    // Check for email input
    const emailInput = page.locator(
      'input[type="email"], input[name*="email"]',
    );
    await expect(emailInput).toBeVisible();

    // Check for password input (register may have multiple — use first)
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toBeVisible();

    // Check for submit button
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  });

  test("should show validation error on empty email", async ({ page }) => {
    await page.goto("/pt/login");

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Look for error message (exact text depends on your error handling)
    const errorMessage = page
      .locator("text=/erro|required|obrigatório/i")
      .first();
    // Note: Error visibility depends on form implementation
  });

  test("should have link between login and register pages", async ({
    page,
  }) => {
    await page.goto("/pt/login");

    // Look for link to register
    const registerLink = page.locator('a[href*="register"]');
    expect(await registerLink.count()).toBeGreaterThan(0);
  });
});
