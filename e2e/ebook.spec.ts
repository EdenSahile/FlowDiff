import { test, expect, type Page } from '@playwright/test'

/*
  Commande d'une version ebook.

  Un ebook est une référence commerciale distincte du papier : son ISBN, son
  format et son prix lui sont propres, et il occupe sa propre ligne de panier.
  Ces tests vérifient que le choix du format sur la fiche produit se retrouve
  bien dans le panier.
*/

test.use({ viewport: { width: 1440, height: 900 } })

// Titres du catalogue portant une offre, un par format.
const EBOOK_PDF  = { id: 'n-pra-02',      label: 'Ebook (pdf)',  isbn: '9789990030022', price: '9,99', isbnPapier: '9782823854169' }
const EBOOK_EPUB = { id: 'f-lit-mathieu', label: 'Ebook (epub)', isbn: '9782330990033', price: '12,99' }
const SANS_EBOOK = 'n-lit-02'

async function login(page: Page) {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await page.locator('input[aria-label="Recherche globale"]').waitFor()
}

test('le choix du format n\'affiche l\'ebook que si le titre en propose un', async ({ page }) => {
  await login(page)

  await page.goto(`/livre/${EBOOK_PDF.id}`)
  await expect(page.getByText(EBOOK_PDF.label, { exact: true })).toBeVisible()
  await expect(page.getByText('Broché', { exact: true })).toBeVisible()
  await expect(page.getByText('Poche', { exact: true })).toBeVisible()

  await page.goto(`/livre/${SANS_EBOOK}`)

  await expect(page.getByText(/^Ebook \(/)).toHaveCount(0)
})

test('le format annonce PDF ou EPUB selon l\'offre du titre', async ({ page }) => {
  await login(page)

  await page.goto(`/livre/${EBOOK_EPUB.id}`)

  await expect(page.getByText(EBOOK_EPUB.label, { exact: true })).toBeVisible()
})

test('un ebook ajouté au panier y porte son ISBN, son format et son prix', async ({ page }) => {
  await login(page)
  await page.goto(`/livre/${EBOOK_PDF.id}`)

  await page.getByText(EBOOK_PDF.label, { exact: true }).click()
  await page.locator('button[aria-label="Ajouter au panier"]').first().click()
  await page.goto('/panier')

  await expect(page.getByText(`ISBN ${EBOOK_PDF.isbn}`)).toBeVisible()
  await expect(page.getByText(/EBOOK · PDF/)).toBeVisible()
  await expect(page.getByText(EBOOK_PDF.price, { exact: false }).first()).toBeVisible()
})

test('le papier et l\'ebook du même titre occupent 2 lignes de panier', async ({ page }) => {
  await login(page)
  await page.goto(`/livre/${EBOOK_PDF.id}`)

  await page.locator('button[aria-label="Ajouter au panier"]').first().click()
  await page.getByText(EBOOK_PDF.label, { exact: true }).click()
  await page.locator('button[aria-label="Ajouter au panier"]').first().click()
  await page.goto('/panier')

  await expect(page.getByText(`ISBN ${EBOOK_PDF.isbn}`)).toBeVisible()
  await expect(page.getByText(`ISBN ${EBOOK_PDF.isbnPapier}`)).toBeVisible()
  await expect(page.getByRole('button', { name: /^Panier — 2 articles/ })).toBeVisible()
})

/*
  Filtre « Format » de la recherche avancée. Les pastilles comparaient le nom
  du format aux dimensions du livre, donc aucune ne correspondait jamais et
  toutes restaient grisées.
*/
test('le filtre Numérique ne retient que les titres ayant une offre ebook', async ({ page }) => {
  await login(page)

  await page.goto('/recherche?formats=Num%C3%A9rique')

  // Les 3 titres du catalogue portant une offre, et eux seuls.
  await expect(page.locator('article')).toHaveCount(3)
  await expect(page.getByText('Leurs enfants après eux').first()).toBeVisible()
  await expect(page.getByText('Ikigaï', { exact: false }).first()).toBeVisible()
})

test('les pastilles de format sont cliquables, sauf celles sans titre correspondant', async ({ page }) => {
  await login(page)

  await page.getByRole('button', { name: 'Filtres avancés' }).click()

  for (const format of ['Poche', 'Grand format', 'Broché', 'Numérique']) {
    await expect(page.getByRole('button', { name: format, exact: true })).toBeEnabled()
  }
  // Aucun titre du catalogue n'est relié : la pastille reste inactive.
  await expect(page.getByRole('button', { name: 'Relié', exact: true })).toBeDisabled()
})

test('le filtre Poche retient les titres aux dimensions de poche', async ({ page }) => {
  await login(page)

  await page.goto('/recherche?formats=Poche')

  await expect(page.locator('article')).toHaveCount(11)
})
