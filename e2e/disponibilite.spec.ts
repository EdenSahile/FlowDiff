import { test, expect, type Page } from '@playwright/test'

/*
  Disponibilité et filiation des références.

  Le statut de stock n'était annoncé que sur les cartes des listes : sur la
  fiche produit, la zone était enfermée dans la condition « commandable »,
  donc elle disparaissait précisément pour les titres épuisés et en rupture.

  Une édition épuisée est par ailleurs le plus souvent remplacée par une
  autre, qui porte un ISBN neuf. Les 2 doivent se répondre, et la carte de
  l'ancienne doit mener au titre que le libraire peut commander.
*/

test.use({ viewport: { width: 1440, height: 900 } })

const RUPTURE       = 'f-lit-vigan'            // Les Gratitudes, grand format
const EPUISE_SEUL   = 'f-lit-berest'           // La Carte postale, sans suite
const REMPLACEE     = 'f-lit-vuillard-babel'   // Babel 2021, épuisée
const REMPLACANTE   = 'f-lit-vuillard-babel-2' // Babel 2024
const ISBN_REMPLACEE   = '9782330153045'
const ISBN_REMPLACANTE = '9782330218676'

async function login(page: Page) {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await page.locator('input[aria-label="Recherche globale"]').waitFor()
}

test.describe('Disponibilité sur la fiche', () => {
  test('un titre en rupture l\'annonce sur sa fiche', async ({ page }) => {
    await login(page)

    await page.goto(`/livre/${RUPTURE}`)

    await expect(page.getByText('Rupture', { exact: true })).toBeVisible()
  })

  test('un titre épuisé l\'annonce sur sa fiche', async ({ page }) => {
    await login(page)

    await page.goto(`/livre/${EPUISE_SEUL}`)

    // L'épuisé est le seul statut sans point de couleur : il porte une croix.
    await expect(page.getByText('❌ Épuisé', { exact: true })).toBeVisible()
  })

  test('un titre disponible garde son délai de livraison', async ({ page }) => {
    await login(page)

    await page.goto(`/livre/${REMPLACANTE}`)

    await expect(page.getByText('Disponible', { exact: true })).toBeVisible()
    await expect(page.getByText(/Livraison 1–3 jours/)).toBeVisible()
  })
})

test.describe('Édition remplacée', () => {
  test('la fiche épuisée renvoie vers la nouvelle édition, et retour', async ({ page }) => {
    await login(page)

    await page.goto(`/livre/${REMPLACEE}`)

    await expect(page.getByText('Remplacé par')).toBeVisible()
    await expect(page.getByText(`ISBN ${ISBN_REMPLACANTE}`)).toBeVisible()

    await page.getByRole('link', { name: /Nouvelle édition/ }).click()

    await expect(page).toHaveURL(`/livre/${REMPLACANTE}`)
    await expect(page.getByText('Édition précédente')).toBeVisible()

    await page.getByRole('link', { name: /Épuisée/ }).click()

    await expect(page).toHaveURL(`/livre/${REMPLACEE}`)
  })

  test('le bouton d\'ajout au panier n\'existe que sur l\'édition commandable', async ({ page }) => {
    await login(page)

    await page.goto(`/livre/${REMPLACEE}`)

    await expect(page.locator('button[aria-label="Ajouter au panier"]')).toHaveCount(0)

    await page.goto(`/livre/${REMPLACANTE}`)

    await expect(page.locator('button[aria-label="Ajouter au panier"]')).toHaveCount(1)
  })

  /* Une édition remplacée n'est plus la référence courante : elle ne
     s'offre pas au choix depuis les autres fiches de l'œuvre. */
  test('l\'édition remplacée ne figure pas dans les autres éditions du grand format', async ({ page }) => {
    await login(page)

    await page.goto('/livre/f-lit-vuillard')

    await expect(page.getByText(`${ISBN_REMPLACEE}`)).toHaveCount(0)
  })

  test('la recherche par l\'ancien ISBN mène toujours à sa fiche', async ({ page }) => {
    await login(page)

    await page.locator('input[aria-label="Recherche globale"]').fill(ISBN_REMPLACEE)
    await page.locator('input[aria-label="Recherche globale"]').press('Enter')

    await expect(page).toHaveURL(`/livre/${REMPLACEE}`)
  })
})

test.describe('Cartes des listes', () => {
  test('la carte d\'une édition remplacée mène au titre commandable', async ({ page }) => {
    await login(page)

    await page.goto('/recherche?q=9782330153045')

    await expect(page).toHaveURL(`/livre/${REMPLACEE}`)
  })

  test('la carte du remplaçant renvoie vers l\'édition précédente', async ({ page }) => {
    await login(page)

    await page.goto("/recherche?q=Ordre du jour")

    const lien = page.getByRole('link', { name: /Remplace l'éd\. 2021/ }).first()

    await expect(lien).toHaveAttribute('href', `/livre/${REMPLACEE}`)
  })

  test('la carte épuisée propose la nouvelle édition à la place du bouton grisé', async ({ page }) => {
    await login(page)

    await page.goto("/recherche?q=Ordre du jour")

    const lien = page.getByRole('link', { name: /Voir la nouvelle édition/ }).first()

    await expect(lien).toHaveAttribute('href', `/livre/${REMPLACANTE}`)
  })
})
