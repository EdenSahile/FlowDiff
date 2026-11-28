import { test, expect } from '@playwright/test'
import { collectCrashes, login } from './helpers'

/*
  Page CGV : un contenu statique en 7 articles, atteint par le lien du footer.

  Il n'y a rien à piloter ici, et c'est justement pourquoi un test a sa place :
  des conditions générales qui disparaissent d'un déploiement ne provoquent
  aucune erreur, elles laissent seulement une page vide sur un écran qui
  engage la relation commerciale.
*/

test.use({ viewport: { width: 1440, height: 900 } })

const ARTICLES = [
  'Article 1 : Objet',
  'Article 2 : Commandes',
  'Article 3 : Prix et remises',
  'Article 4 : Livraison',
  'Article 5 : Retours',
  'Article 6 : Protection des données',
  'Article 7 : Droit applicable',
] as const

test.beforeEach(async ({ page }) => {
  await login(page)
})

test.describe('Accès', () => {
  test('le lien du footer ouvre les conditions générales', async ({ page }) => {
    await page.getByRole('link', { name: 'CGV' }).click()

    await expect(page).toHaveURL('/cgv')
    await expect(page.getByRole('heading', { name: 'Conditions Générales de Vente' })).toBeVisible()
  })

  test('la page s\'ouvre aussi par son URL, sans erreur JS', async ({ page }) => {
    const crashes = collectCrashes(page)

    await page.goto('/cgv')

    await expect(page.getByRole('heading', { name: 'Conditions Générales de Vente' })).toBeVisible()
    expect(crashes).toEqual([])
  })
})

test.describe('Contenu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cgv')
    await expect(page.getByRole('heading', { name: 'Conditions Générales de Vente' })).toBeVisible()
  })

  test(`affiche les ${ARTICLES.length} articles, dans l'ordre`, async ({ page }) => {
    await expect(page.getByRole('heading', { level: 2 })).toHaveText([...ARTICLES])
  })

  // Les 2 articles qui portent des règles du métier : la remise et le retour.
  test('l\'article des prix et remises est renseigné', async ({ page }) => {
    const article = page.getByRole('heading', { name: 'Article 3 : Prix et remises' })
    await expect(article).toBeVisible()

    await expect(article.locator('xpath=following-sibling::*[1]')).not.toBeEmpty()
  })

  test('l\'article des retours est renseigné', async ({ page }) => {
    const article = page.getByRole('heading', { name: 'Article 5 : Retours' })
    await expect(article).toBeVisible()

    await expect(article.locator('xpath=following-sibling::*[1]')).not.toBeEmpty()
  })
})
