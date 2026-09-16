import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the correct title', async ({ page }) => {
    // Check that the page title is correct
    await expect(page).toHaveTitle('Tailspin Toys - Crowdfunding your new favorite game!');
  });

  test('should display the main heading', async ({ page }) => {
    // Check that the main page heading is present
    await expect(page.getByRole('heading', { name: 'Welcome to Tailspin Toys', exact: true })).toBeVisible();
  });

  test('should display the site branding in header', async ({ page }) => {
    // Check that the site branding is present in the header (no longer an h1)
    await expect(page.getByText('Tailspin Toys').first()).toBeVisible();
  });

  test('should display the welcome message', async ({ page }) => {
    // Check that the welcome message is present using more specific locator
    await expect(page.getByText('Find your next game! And maybe even back one! Explore our collection!')).toBeVisible();
  });

  test('should filter games by category and publisher together', async ({ page }) => {
    const visibleCards = page.locator('[data-testid="game-card"]:visible');
    const strategyFilter = page.locator('label', { hasText: 'Strategy' }).locator('input[type="checkbox"]');
    const publisherFilter = page.getByTestId('publisher-filter');
    const allGamesCount = await visibleCards.count();

    await strategyFilter.check();
    const strategyGamesCount = await visibleCards.count();
    expect(strategyGamesCount).toBeGreaterThan(0);
    expect(strategyGamesCount).toBeLessThan(allGamesCount);
    await expect(page.getByTestId('filter-status')).toHaveText(`Showing ${strategyGamesCount} games`);

    await publisherFilter.selectOption({ label: 'CodeForge Studios' });
    const combinedGamesCount = await visibleCards.count();
    expect(combinedGamesCount).toBeGreaterThan(0);
    expect(combinedGamesCount).toBeLessThan(strategyGamesCount);
  });

  test('should clear active filters and show all games again', async ({ page }) => {
    const visibleCards = page.locator('[data-testid="game-card"]:visible');

    await page.locator('label', { hasText: 'Puzzle' }).locator('input[type="checkbox"]').check();
    await page.getByTestId('publisher-filter').selectOption({ label: 'GitHub Games' });
    expect(await visibleCards.count()).toBeGreaterThan(0);

    await page.getByTestId('reset-filters').click();
    const allGamesCount = await visibleCards.count();
    await expect(page.getByTestId('filter-status')).toHaveText(`Showing ${allGamesCount} games`);
  });
});
