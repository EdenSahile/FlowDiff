import { test, expect, type Page } from '@playwright/test'
import { getCatalogueBooks, UNIVERSES, type Book, type BookType } from '../src/data/mockBooks'
import { collectCrashes, login, sidebarLink } from './helpers'

/*
  Pages Nouveautés et Fonds. Les 2 portent les mêmes commandes, recherche,
  filtre par thématique et tri, sur 2 sous-ensembles du catalogue, d'où une
  seule spec paramétrée : écrire 2 fois les mêmes tests aurait doublé la
  relecture sans rien couvrir de plus.

  Les attendus se calculent depuis getCatalogueBooks, la source du service que
  les pages appellent. Le type d'un titre dépendant de sa date de parution,
  recopier un compte ici le ferait tomber à la prochaine parution.
*/

test.use({ viewport: { width: 1440, height: 900 } })

interface CataloguePage {
  readonly label: string
  readonly path: string
  readonly type: BookType
  readonly searchLabel: string
  readonly sortId: string
  readonly emptyWithoutQuery: string
}

const PAGES: CataloguePage[] = [
  {
    label: 'Nouveautés',
    path: '/nouveautes',
    type: 'nouveaute',
    searchLabel: 'Rechercher dans les nouveautés',
    sortId: 'nouveautes-sort',
    emptyWithoutQuery: 'Aucun titre pour cet univers ce mois-ci.',
  },
  {
    label: 'Fonds',
    path: '/fonds',
    type: 'fonds',
    searchLabel: 'Rechercher dans les fonds',
    sortId: 'fonds-sort',
    emptyWithoutQuery: 'Aucun titre avec ces filtres.',
  },
]

const booksOf = (type: BookType) => getCatalogueBooks().filter(book => book.type === type)

const countLabel = (books: Book[]) => `${books.length} titre${books.length > 1 ? 's' : ''}`

function searchField(page: Page, pageDef: CataloguePage) {
  return page.locator(`input[aria-label="${pageDef.searchLabel}"]`)
}

function universeFilter(page: Page) {
  return page.getByRole('group', { name: 'Filtrer par univers' })
}

// Les cartes portent le lien de leur titre : c'est lui qui donne l'ordre réel.
function cardLinks(page: Page) {
  return page.locator('article a[href^="/livre/"]')
}

/*
  Une carte d'édition épuisée pointe sur l'édition qui la remplace, et non sur
  elle-même : c'est le titre commandable que le libraire cherche. Le lien
  attendu suit donc la même règle que BookCard.
*/
const hrefOf = (book: Book) => `/livre/${book.replacedById ?? book.id}`

// Plusieurs éditions partagent parfois le même prix : l'attendu est alors un
// ensemble de liens possibles, pas un seul.
const hrefsAtPrice = (books: Book[], price: number) =>
  books.filter(book => book.priceTTC === price).map(hrefOf)

for (const pageDef of PAGES) {
  test.describe(pageDef.label, () => {
    const BOOKS = booksOf(pageDef.type)
    const BOOK = BOOKS[0]

    test.beforeEach(async ({ page }) => {
      await login(page)
      await sidebarLink(page, pageDef.label).click()
      await expect(page.getByRole('heading', { name: pageDef.label })).toBeVisible()
    })

    /* ── Affichage ── */
    test('affiche tous les titres de son type et leur compte', async ({ page }) => {
      await expect(page.getByText(countLabel(BOOKS))).toBeVisible()
      await expect(page.locator('article')).toHaveCount(BOOKS.length)
    })

    test('annonce le périmètre sans filtre', async ({ page }) => {
      await expect(page.getByText('toutes thématiques')).toBeVisible()
    })

    /* ── Recherche ── */
    test('la recherche par titre ne garde que les titres correspondants', async ({ page }) => {
      const expected = BOOKS.filter(book =>
        book.title.toLowerCase().includes(BOOK.title.toLowerCase()),
      )

      await searchField(page, pageDef).fill(BOOK.title)

      await expect(page.locator('article')).toHaveCount(expected.length)
      await expect(page.getByText(countLabel(expected))).toBeVisible()
    })

    test('la recherche par ISBN mène au bon titre', async ({ page }) => {
      await searchField(page, pageDef).fill(BOOK.isbn)

      await expect(cardLinks(page).first()).toHaveAttribute('href', hrefOf(BOOK))
    })

    test('une recherche sans résultat affiche le message vide', async ({ page }) => {
      await searchField(page, pageDef).fill('zzzzzzz')

      await expect(page.getByText('Aucun résultat pour « zzzzzzz »')).toBeVisible()
    })

    test('vider la recherche réaffiche tout', async ({ page }) => {
      await searchField(page, pageDef).fill(BOOK.title)
      await expect(page.locator('article')).not.toHaveCount(BOOKS.length)

      await searchField(page, pageDef).fill('')

      await expect(page.locator('article')).toHaveCount(BOOKS.length)
    })

    /* ── Filtre par thématique ── */
    for (const universe of UNIVERSES) {
      test(`le filtre ${universe} ne garde que sa thématique`, async ({ page }) => {
        const expected = BOOKS.filter(book => book.universe === universe)

        await universeFilter(page).getByRole('button', { name: universe }).click()

        if (expected.length === 0) {
          await expect(page.getByText(pageDef.emptyWithoutQuery)).toBeVisible()
          return
        }
        await expect(page.locator('article')).toHaveCount(expected.length)
        await expect(page.getByText(`· ${universe}`)).toBeVisible()
      })
    }

    /* ── Tri ── */
    test('le tri par titre classe de A à Z', async ({ page }) => {
      const expected = [...BOOKS].sort((a, b) => a.title.localeCompare(b.title))

      await page.locator(`#${pageDef.sortId}`).selectOption('titre')

      await expect(cardLinks(page).first()).toHaveAttribute('href', hrefOf(expected[0]))
      await expect(cardLinks(page).last()).toHaveAttribute('href', hrefOf(expected[expected.length - 1]))
    })

    test('le tri par prix croissant commence par le moins cher', async ({ page }) => {
      const lowest = Math.min(...BOOKS.map(book => book.priceTTC))

      await page.locator(`#${pageDef.sortId}`).selectOption('prix_asc')

      expect(hrefsAtPrice(BOOKS, lowest)).toContain(await cardLinks(page).first().getAttribute('href'))
    })

    test('le tri par prix décroissant commence par le plus cher', async ({ page }) => {
      const highest = Math.max(...BOOKS.map(book => book.priceTTC))

      await page.locator(`#${pageDef.sortId}`).selectOption('prix_desc')

      expect(hrefsAtPrice(BOOKS, highest)).toContain(await cardLinks(page).first().getAttribute('href'))
    })

    /* ── Sortie ── */
    test('une carte ouvre la fiche de son titre', async ({ page }) => {
      const crashes = collectCrashes(page)

      await cardLinks(page).first().click()

      await expect(page).toHaveURL(/\/livre\//)
      expect(crashes).toEqual([])
    })
  })
}

/* ────────────────────────────────────────────
   Ce qui distingue les 2 pages
──────────────────────────────────────────── */
test.describe('Périmètres distincts', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  /*
    Un titre appartient à un seul des 2 périmètres : les nouveautés sont parues
    dans les 6 derniers mois, le fonds avant. Une page qui montrerait un titre
    de l'autre tromperait le libraire sur le moment commercial du titre.
  */
  test('aucun titre du fonds n\'apparaît dans les nouveautés', async ({ page }) => {
    const fonds = booksOf('fonds')
    await page.goto('/nouveautes')
    await expect(page.getByRole('heading', { name: 'Nouveautés' })).toBeVisible()

    const shown = await cardLinks(page).evaluateAll(links =>
      links.map(link => link.getAttribute('href')),
    )

    for (const book of fonds) {
      expect(shown).not.toContain(hrefOf(book))
    }
  })

  test('aucune nouveauté n\'apparaît dans le fonds', async ({ page }) => {
    const nouveautes = booksOf('nouveaute')
    await page.goto('/fonds')
    await expect(page.getByRole('heading', { name: 'Fonds' })).toBeVisible()

    const shown = await cardLinks(page).evaluateAll(links =>
      links.map(link => link.getAttribute('href')),
    )

    for (const book of nouveautes) {
      expect(shown).not.toContain(hrefOf(book))
    }
  })

  // Le fonds ajoute un filtre que les nouveautés n'ont pas.
  test('seul le fonds propose un filtre de disponibilité', async ({ page }) => {
    await page.goto('/fonds')
    await expect(page.getByText('Disponibilité')).toBeVisible()

    await page.goto('/nouveautes')

    await expect(page.getByText('Disponibilité')).toHaveCount(0)
  })
})
