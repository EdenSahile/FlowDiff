import { test, expect, type Page } from '@playwright/test'

test.use({ viewport: { width: 1440, height: 900 } })

async function login(page: Page) {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await page.locator('input[aria-label="Recherche globale"]').waitFor()
}

test('la simulation EDI confirme l’ajout et mène à son historique', async ({ page }) => {
  await login(page)
  await page.goto('/edi')

  await page.getByRole('button', { name: 'Simuler une nouvelle commande EDI' }).click()

  const confirmation = page.getByRole('status')
  await expect(confirmation).toContainText('Commande EDI simulée. Les échanges ont été ajoutés à l’historique.')

  await confirmation.getByRole('link', { name: 'Voir l’historique' }).click()

  await expect(page).toHaveURL('/edi#historique')
  await expect(page.locator('#historique')).toBeInViewport()
  await expect(page.getByRole('button', { name: 'Simuler une autre commande EDI' })).toBeVisible()
})
