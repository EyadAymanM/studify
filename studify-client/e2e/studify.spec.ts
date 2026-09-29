import { test, expect } from '@playwright/test';

test.describe('Studify End-to-End Application Flow', () => {
  test('should render hero, input bar, starter notes, and handle light/dark mode', async ({ page }) => {
    await page.goto('/');

    // Verify brand logo and title
    await expect(page.getByTestId('brand-logo')).toBeVisible();
    await expect(page.locator('h1.hero-title')).toContainText('Clear your mind');

    // Verify Centered Smart Input Bar is present
    const textarea = page.getByTestId('smart-input-textarea');
    await expect(textarea).toBeVisible();

    // Verify Performance HUD is rendered
    await expect(page.getByTestId('perf-hud')).toBeVisible();

    // Verify Theme toggle switches to dark mode
    const themeBtn = page.getByTestId('theme-toggle-btn');
    await themeBtn.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // Toggle back to light mode
    await themeBtn.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('should capture a new definition with inline tags and display in notes grid', async ({ page }) => {
    await page.goto('/');

    const textarea = page.getByTestId('smart-input-textarea');
    await textarea.fill('Idempotence means an operation can be applied multiple times without changing the result #api #backend');

    // Select "Definition" category
    await page.getByText('Definition', { exact: true }).click();

    // Submit via Capture button
    const submitBtn = page.getByTestId('submit-note-btn');
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Verify note is rendered in grid
    await expect(page.getByText('Idempotence means an operation can be applied multiple times')).toBeVisible();
    await expect(page.getByText('#api')).toBeVisible();
    await expect(page.getByText('#backend').first()).toBeVisible();
  });

  test('should filter notes using search input and tag chips', async ({ page }) => {
    await page.goto('/');

    // Search by keyword
    const searchInput = page.getByTestId('search-input');
    await searchInput.fill('Closures');
    await expect(page.getByText('Closures in JavaScript')).toBeVisible();

    // Clear search
    await searchInput.fill('');

    // Filter by tag if available
    const frontendFilter = page.getByTestId('filter-tag-frontend');
    if (await frontendFilter.isVisible()) {
      await frontendFilter.click();
      await expect(page.getByTestId('clear-filters-btn')).toBeVisible();
      await page.getByTestId('clear-filters-btn').click();
    }
  });
});
