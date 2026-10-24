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

/*
  Titre vendu dans les 2 formats. Chaque format de fichier est une reference
  a part, avec son ISBN, donc la fiche porte 2 boutons numeriques.
*/
const DEUX_FORMATS = {
  id:       'n-lit-01',
  pdf:      { label: 'Ebook (pdf)',  isbn: '9789990030011' },
  epub:     { label: 'Ebook (epub)', isbn: '9789990030055' },
}

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

  await page.goto(`/livre/${SANS_EBOOK}`)

  await expect(page.getByText(/^Ebook \(/)).toHaveCount(0)
})

/*
  Une edition de poche est un titre du catalogue, pas un bouton de la fiche du
  grand format : elle a son ISBN, sa collection, sa parution et son prix, et
  la fiche la presente comme un lien vers sa propre fiche.
*/
test('le grand format renvoie vers son édition de poche, et retour', async ({ page }) => {
  await login(page)

  await page.goto('/livre/f-lit-mathieu')

  await expect(page.getByText('Autres éditions')).toBeVisible()
  const lienPoche = page.getByRole('link', { name: /Poche · Babel/ })
  await expect(lienPoche).toContainText('9,90 € TTC')

  await lienPoche.click()

  await expect(page).toHaveURL('/livre/f-lit-mathieu-babel')
  await expect(page.getByText('9782330139179', { exact: true })).toBeVisible()

  await page.getByRole('link', { name: /Broché/ }).click()

  await expect(page).toHaveURL('/livre/f-lit-mathieu')
})

test('un titre sans autre édition n\'affiche pas le bloc', async ({ page }) => {
  await login(page)

  await page.goto(`/livre/${SANS_EBOOK}`)

  await expect(page.getByText('Autres éditions')).toHaveCount(0)
})

/*
  Le selecteur proposait un poche sur les 49 titres, a 62 % du prix du grand
  format. Un prix de livre est fixe par l'editeur, il ne se calcule pas, et
  un poche n'existe que s'il a ete publie.
*/
test('aucune fiche ne propose de format poche', async ({ page }) => {
  await login(page)

  for (const id of [EBOOK_PDF.id, SANS_EBOOK, 'f-bd-jjk-08']) {
    await page.goto(`/livre/${id}`)
    await expect(page.getByText('Poche', { exact: true })).toHaveCount(0)
  }
})

/*
  La ligne Format est toujours affichee, meme sans choix a faire : elle dit
  quelle edition la fiche presente. Sans elle, le bloc « Autres editions »
  restait seul en haut, et son edition se lisait comme celle de la page.
*/
test('un titre sans version numérique affiche quand même son format papier', async ({ page }) => {
  await login(page)

  await page.goto('/livre/f-lit-colombani')

  await expect(page.getByText('Broché', { exact: true })).toBeVisible()
  await expect(page.getByText(/^Ebook \(/)).toHaveCount(0)
})

test('la ligne Format nomme l\'édition de poche au lieu de ses dimensions', async ({ page }) => {
  await login(page)

  await page.goto('/livre/f-lit-mathieu-babel')

  await expect(page.getByText('Poche · Babel', { exact: true })).toBeVisible()
})

test('un titre vendu en PDF et en EPUB propose 2 boutons numériques', async ({ page }) => {
  await login(page)

  await page.goto(`/livre/${DEUX_FORMATS.id}`)

  await expect(page.getByText(DEUX_FORMATS.pdf.label, { exact: true })).toBeVisible()
  await expect(page.getByText(DEUX_FORMATS.epub.label, { exact: true })).toBeVisible()
})

test('chacun des 2 boutons porte son propre ISBN', async ({ page }) => {
  await login(page)
  await page.goto(`/livre/${DEUX_FORMATS.id}`)

  await page.getByText(DEUX_FORMATS.pdf.label, { exact: true }).click()

  await expect(page.getByText(DEUX_FORMATS.pdf.isbn, { exact: true })).toBeVisible()

  await page.getByText(DEUX_FORMATS.epub.label, { exact: true }).click()

  await expect(page.getByText(DEUX_FORMATS.epub.isbn, { exact: true })).toBeVisible()
  await expect(page.getByText(DEUX_FORMATS.pdf.isbn, { exact: true })).toHaveCount(0)
})

test('les 2 formats du même titre occupent 2 lignes de panier', async ({ page }) => {
  await login(page)
  await page.goto(`/livre/${DEUX_FORMATS.id}`)

  await page.getByText(DEUX_FORMATS.pdf.label, { exact: true }).click()
  await page.locator('button[aria-label="Ajouter au panier"]').first().click()
  await page.getByText(DEUX_FORMATS.epub.label, { exact: true }).click()
  await page.locator('button[aria-label="Ajouter au panier"]').first().click()
  await page.goto('/panier')

  await expect(page.getByText(`ISBN ${DEUX_FORMATS.pdf.isbn}`)).toBeVisible()
  await expect(page.getByText(`ISBN ${DEUX_FORMATS.epub.isbn}`)).toBeVisible()
  await expect(page.getByRole('button', { name: /^Panier — 2 articles/ })).toBeVisible()
})

test('le format annonce PDF ou EPUB selon l\'offre du titre', async ({ page }) => {
  await login(page)

  await page.goto(`/livre/${EBOOK_EPUB.id}`)

  await expect(page.getByText(EBOOK_EPUB.label, { exact: true })).toBeVisible()
})

/*
  Sur la fiche, le choix du format rebascule les metadonnees de la colonne de
  gauche : l'ebook est une reference distincte, avec son ISBN et son format de
  fichier. La ligne ISBN portait celui du papier quel que soit le choix, et la
  ligne Format repetait l'ISBN de l'ebook a la place de son format.
*/
test('la ligne ISBN de la fiche suit le format choisi', async ({ page }) => {
  await login(page)
  await page.goto(`/livre/${EBOOK_PDF.id}`)

  await expect(page.getByText(EBOOK_PDF.isbnPapier, { exact: true })).toBeVisible()

  await page.getByText(EBOOK_PDF.label, { exact: true }).click()

  await expect(page.getByText(EBOOK_PDF.isbn, { exact: true })).toBeVisible()
  await expect(page.getByText(EBOOK_PDF.isbnPapier, { exact: true })).toHaveCount(0)
})

test('la ligne Format annonce le format de fichier, pas des dimensions', async ({ page }) => {
  await login(page)
  await page.goto(`/livre/${EBOOK_PDF.id}`)

  await page.getByText(EBOOK_PDF.label, { exact: true }).click()

  await expect(page.getByText('PDF', { exact: true })).toBeVisible()
  await expect(page.getByText(/\d+ x \d+ mm/)).toHaveCount(0)
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

/*
  Le recapitulatif sommait le prix du papier, meme sur une ligne numerique :
  l'ebook d'Ikigai a 9,99 EUR etait compte a 14,50 EUR, et le total
  contredisait le prix affiche juste au-dessus.
*/
test('le total du panier retient le prix de l\'ebook, pas celui du papier', async ({ page }) => {
  await login(page)
  await page.goto(`/livre/${EBOOK_PDF.id}`)

  await page.getByText(EBOOK_PDF.label, { exact: true }).click()
  await page.locator('button[aria-label="Ajouter au panier"]').first().click()
  await page.goto('/panier')

  // 9,99 TTC, remise 35 % sur l'Adulte-pratique, donc 6,49 net TTC et 6,15 HT.
  await expect(page.getByText('Montant HT').locator('..')).toContainText('9,47')
  await expect(page.getByText('Total TTC').first().locator('..')).toContainText('6,49')
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

  await expect(page.locator('article')).toHaveCount(14)
})
