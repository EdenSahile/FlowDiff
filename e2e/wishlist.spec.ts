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

/*
  Ajout au panier depuis une liste. Une liste est permanente alors que le
  panier se vide : la mention « Ajouté au panier » dit au libraire ce qu'il a
  déjà retenu pour sa commande.
*/
test('ajouter au panier depuis une liste affiche une confirmation et la mention sur la ligne', async ({ page }) => {
  await page.goto('/fonds')
  const star = page.locator('button[aria-label="Ajouter à une liste"]').first()
  await star.click()
  const input = page.getByPlaceholder('Ex : Saint-Valentin…')
  await input.fill('Ma commande')
  await input.press('Enter')
  await expect(page.getByText('Titre ajouté à la liste « Ma commande »')).toBeVisible()

  await page.getByRole('button', { name: /^Mes listes — \d+ liste/ }).click()
  // La ligne de liste est un div cliquable sans rôle : on passe par son nom.
  const listsPanel = page.locator('[aria-label="Mes listes de commandes"]')
  await listsPanel.getByText('Ma commande', { exact: true }).click()
  // Scoper au panneau : les cartes de la page derrière ont un bouton au libellé proche.
  const addFromList = listsPanel.locator('button[aria-label$=" au panier"]').first()
  await expect(listsPanel.getByText('✓ Ajouté au panier')).toHaveCount(0)
  await addFromList.click()

  await expect(page.getByText(/ajouté au panier/)).toBeVisible()
  await expect(listsPanel.getByText('✓ Ajouté au panier')).toBeVisible()
  await expect(page.getByRole('button', { name: /^Panier — 1 article/ })).toBeVisible()
})
