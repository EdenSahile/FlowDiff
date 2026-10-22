import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await page.locator('input[aria-label="Recherche globale"]').waitFor()
})

test('ajouter un titre à une liste déjà existante', async ({ page }) => {
  await page.goto('/fonds')

  const stars = page.locator('button[aria-label="Ajouter à une liste"]')

  await stars.first().click()
  const input = page.getByPlaceholder('Ex : Saint-Valentin…')
  await input.fill('Mes coups de cœur')
  await input.press('Enter')
  await expect(page.getByText('Titre ajouté à la liste « Mes coups de cœur »')).toBeVisible()

  await stars.nth(1).click()
  await page.getByRole('button', { name: /Mes coups de cœur/ }).click()
  await expect(page.getByText('Titre ajouté à la liste « Mes coups de cœur »')).toBeVisible()
})

test('créer une nouvelle liste et y ajouter un titre', async ({ page }) => {
  await page.goto('/fonds')

  const star = page.locator('button[aria-label="Ajouter à une liste"]').first()
  await star.click()

  const input = page.getByPlaceholder('Ex : Saint-Valentin…')
  await input.fill('BD & Mangas')
  await input.press('Enter')

  await expect(page.getByText('Titre ajouté à la liste « BD & Mangas »')).toBeVisible()
})
