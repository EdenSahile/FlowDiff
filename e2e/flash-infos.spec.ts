import { test, expect, type Page } from '@playwright/test'
import { MOCK_FLASH_INFOS, FLASH_CATEGORIES, type FlashInfo } from '../src/data/mockFlashInfos'
import { getCatalogueBookById, UNIVERSES } from '../src/data/mockBooks'
import { getPurchaseAvailability } from '../src/lib/bookUtils'
import { collectCrashes, expectCartCount, login, sidebarLink } from './helpers'

/*
  Page Flash Infos, et surtout l'ajout au panier depuis une flash info.

  Une flash info peut porter un titre du catalogue, et l'ajout suit alors les
  mêmes règles que le catalogue (FlashInfosPage.handleAdd) :
  indisponible refusé, à paraître et commande spéciale confirmés d'abord,
  le reste ajouté directement.

  Les flash infos de chaque cas se choisissent en rejouant
  getPurchaseAvailability sur les données, pas en recopiant un identifiant :
  changer le statut d'un titre déplace le test sur une autre flash info au
  lieu de le casser.
*/

test.use({ viewport: { width: 1440, height: 900 } })

/*
  Une flash info porteuse d'un lien externe rend sa carte cliquable, et le
  clic ouvre un nouvel onglet. Les scénarios d'ajout écartent ces cartes :
  le bouton arrête la propagation, mais un onglet de plus ne sert à rien.
*/
function withBook(predicate: (a: ReturnType<typeof getPurchaseAvailability>) => boolean) {
  return MOCK_FLASH_INFOS.find(fi => {
    if (!fi.bookId || fi.link) return false
    const book = getCatalogueBookById(fi.bookId)
    if (!book) return false
    return predicate(getPurchaseAvailability(book.type, book.statut))
  })
}

const SIMPLE      = withBook(a => a.canAddToCart && !a.isAParaitre && !a.needsConfirm)!
const A_PARAITRE  = withBook(a => a.isAParaitre)!
const SUR_COMMANDE = withBook(a => a.needsConfirm)!
const INDISPONIBLE = withBook(a => !a.canAddToCart)!

function card(page: Page, fi: FlashInfo) {
  return page.locator('article').filter({ has: page.getByRole('heading', { name: fi.title }) })
}

function addButton(page: Page, fi: FlashInfo) {
  return card(page, fi).getByRole('button', { name: 'Ajouter au panier' })
}

const plural = (n: number) => `${n} flash info${n !== 1 ? 's' : ''}`

test.beforeEach(async ({ page }) => {
  await login(page)
  await sidebarLink(page, 'Flash Infos').click()
  await expect(page.getByRole('heading', { name: 'Flash Infos' })).toBeVisible()
})

/* ────────────────────────────────────────────
   1. Affichage et filtres
──────────────────────────────────────────── */
test.describe('Affichage et filtres', () => {
  test('affiche toutes les flash infos et leur compte', async ({ page }) => {
    await expect(page.getByText(plural(MOCK_FLASH_INFOS.length))).toBeVisible()
    await expect(page.locator('article')).toHaveCount(MOCK_FLASH_INFOS.length)
  })

  for (const universe of UNIVERSES) {
    test(`le filtre de rayon ${universe} ne garde que son rayon`, async ({ page }) => {
      const expectedCount = MOCK_FLASH_INFOS.filter(fi => fi.universe === universe).length

      await page.getByRole('button', { name: universe, exact: true }).click()

      await expect(page.getByText(plural(expectedCount))).toBeVisible()
      await expect(page.locator('article')).toHaveCount(expectedCount)
    })
  }

  for (const category of FLASH_CATEGORIES) {
    test(`le filtre de type ${category} ne garde que son type`, async ({ page }) => {
      const expectedCount = MOCK_FLASH_INFOS.filter(fi => fi.category === category).length

      await page.getByRole('button', { name: category, exact: true }).click()

      await expect(page.locator('article')).toHaveCount(expectedCount)
    })
  }

  test('croiser un rayon et un type sans intersection affiche le message vide', async ({ page }) => {
    // On cherche un couple rayon et type que les données ne contiennent pas.
    const empty = UNIVERSES.flatMap(universe =>
      FLASH_CATEGORIES.map(category => ({ universe, category })),
    ).find(({ universe, category }) =>
      !MOCK_FLASH_INFOS.some(fi => fi.universe === universe && fi.category === category),
    )
    test.skip(!empty, 'Tous les couples rayon et type existent dans les données.')

    await page.getByRole('button', { name: empty!.universe, exact: true }).click()
    await page.getByRole('button', { name: empty!.category, exact: true }).click()

    await expect(page.getByText('Aucune info flash pour cette sélection.')).toBeVisible()
  })

  test('le filtre se désactive au second clic', async ({ page }) => {
    const universe = UNIVERSES[0]
    await page.getByRole('button', { name: universe, exact: true }).click()
    await expect(page.locator('article')).not.toHaveCount(MOCK_FLASH_INFOS.length)

    await page.getByRole('button', { name: universe, exact: true }).click()

    await expect(page.locator('article')).toHaveCount(MOCK_FLASH_INFOS.length)
  })
})

/* ────────────────────────────────────────────
   2. Ajout au panier, cas direct
──────────────────────────────────────────── */
test.describe('Ajout au panier', () => {
  test('un titre disponible part au panier sans confirmation', async ({ page }) => {
    const crashes = collectCrashes(page)

    await addButton(page, SIMPLE).click()

    await expect(page.getByText('Ouvrage ajouté au panier')).toBeVisible()
    await expectCartCount(page, 1)
    expect(crashes).toEqual([])
  })

  test('la quantité choisie sur la carte est celle ajoutée', async ({ page }) => {
    await card(page, SIMPLE).getByRole('button', { name: 'Augmenter la quantité' }).click()
    await card(page, SIMPLE).getByRole('button', { name: 'Augmenter la quantité' }).click()

    await addButton(page, SIMPLE).click()

    await expectCartCount(page, 3)
  })

  // Le compteur revient à 1 après l'ajout, pour ne pas rejouer la quantité.
  test('la quantité de la carte retombe à 1 après l\'ajout', async ({ page }) => {
    await card(page, SIMPLE).getByRole('button', { name: 'Augmenter la quantité' }).click()
    await addButton(page, SIMPLE).click()
    await expectCartCount(page, 2)

    await addButton(page, SIMPLE).click()

    await expectCartCount(page, 3)
  })

  test('deux ajouts cumulent dans le panier', async ({ page }) => {
    await addButton(page, SIMPLE).click()
    await expectCartCount(page, 1)

    await addButton(page, SIMPLE).click()

    await expectCartCount(page, 2)
  })
})

/* ────────────────────────────────────────────
   3. Ajout au panier, cas à confirmer
──────────────────────────────────────────── */
test.describe('Confirmations avant ajout', () => {
  test('un titre à paraître demande confirmation, et annuler n\'ajoute rien', async ({ page }) => {
    await addButton(page, A_PARAITRE).click()

    const modal = page.getByRole('dialog')
    await expect(modal.getByText('Titre à paraître')).toBeVisible()
    await expect(modal.getByText(/noté/)).toBeVisible()
    await expectCartCount(page, 0)

    await modal.getByRole('button', { name: 'Annuler' }).click()

    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expectCartCount(page, 0)
  })

  test('un titre à paraître confirmé part au panier', async ({ page }) => {
    await addButton(page, A_PARAITRE).click()

    await page.getByRole('dialog').getByRole('button', { name: 'OK' }).click()

    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expectCartCount(page, 1)
  })

  test('une commande spéciale demande confirmation avant l\'ajout', async ({ page }) => {
    await addButton(page, SUR_COMMANDE).click()

    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    await expectCartCount(page, 0)

    await modal.getByRole('button', { name: 'Confirmer la commande' }).click()

    await expectCartCount(page, 1)
  })
})

/* ────────────────────────────────────────────
   4. Titre indisponible
──────────────────────────────────────────── */
test.describe('Titre indisponible', () => {
  test('n\'offre aucun ajout et annonce l\'indisponibilité', async ({ page }) => {
    await expect(card(page, INDISPONIBLE).getByText('Ouvrage indisponible')).toBeVisible()
    await expect(addButton(page, INDISPONIBLE)).toHaveCount(0)
  })
})
