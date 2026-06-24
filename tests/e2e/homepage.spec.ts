import { expect, test } from '@playwright/test'

test('homepage displays the main heading', async ({ page }) => {
  await page.goto('/blog/')

  await expect(
    page.getByRole('heading', { level: 1, name: 'Lvce Editor' }),
  ).toBeVisible()
})
