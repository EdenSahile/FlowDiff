import { test, expect } from '@playwright/test'
import { getCatalogueBooks } from '../src/data/mockBooks'
import { collectCrashes, expectCartCount, login, sidebarLink } from './helpers'

/*
  Page « À paraître ».

  ⚠️ La règle réelle de l'application n'est PAS « consultation seule, non
  commandable ». Un titre à paraître est commandable, et c'est ce que dit
  CLAUDE.md : « les 3 types de titres (fonds, nouveautés, à paraître) sont
  commandables ». Ce que l'application ajoute, c'est une étape de
  confirmation : la carte ouvre une modale « Titre à paraître » avant tout
  ajout (BookCard.handleAdd, branche isAParaitre), et le titre est alors
  enregistré en « noté », conservé indéfiniment.

  Ces tests fixent donc le comportement en place : commandable APRÈS
  confirmation, et jamais sans elle.

  Le catalogue des titres à paraître se lit depuis getCatalogueBooks, la même
  source que le service de la page, et il dépend de la date : un titre à
  paraître devient une nouveauté le jour de sa parution.
*/

test.use({ viewport: { width: 1440, height: 900 } })

const A_PARAITRE = getCatalogueBooks().filter(book => book.type === 'a-paraitre')
const PROGRAMMES = [...new Set(A_PARAITRE.map(book => book.programme ?? 'Autres'))].sort()
const UNIVERSES_PRESENTS = [...new Set(A_PARAITRE.map(book => book.universe))]

// Titre de référence des scénarios d'ajout.
const BOOK = A_PARAITRE[0]

function cardOf(page: import('@playwright/test').Page, title: string) {
  return page.locator('article').filter({ has: page.getByRole('link', { name: title, exact: true }) })
}

test.beforeEach(async ({ page }) => {
  await login(page)
  await sidebarLink(page, 'À paraître').click()
  await expect(page.getByRole('heading', { name: 'À paraître' })).toBeVisible()
})

/* ────────────────────────────────────────────
   1. Affichage
──────────────────────────────────────────── */
test.describe('Affichage', () => {
  test('annonce la règle des titres notés', async ({ page }) => {
    await expect(page.getByText(/enregistrés comme « notés » et conservés indéfiniment/)).toBeVisible()
  })

  test('groupe les titres par programme', async ({ page }) => {
    for (const programme of PROGRAMMES) {
      const count = A_PARAITRE.filter(book => (book.programme ?? 'Autres') === programme).length
      const plural = count > 1 ? 'titres' : 'titre'

      // Le titre de programme contient aussi son compteur : pas de match exact.
      await expect(page.getByText(programme).first()).toBeVisible()
      await expect(page.getByText(`${count} ${plural}`).first()).toBeVisible()
    }
  })

  test('affiche tous les titres à paraître du catalogue', async ({ page }) => {
    await expect(page.locator('article')).toHaveCount(A_PARAITRE.length)
  })

  /*
    La page rend ses cartes en mode coverFirst, qui n'affiche pas le badge
    « À paraître » : sur une page qui ne contient que des titres à paraître,
    il ne distinguerait rien. C'est la pastille d'univers que chaque carte
    porte.
  */
  test('chaque carte porte la pastille de son univers', async ({ page }) => {
    for (const universe of UNIVERSES_PRESENTS) {
      const expectedCount = A_PARAITRE.filter(book => book.universe === universe).length

      await expect(page.locator('article').getByText(universe, { exact: true }))
        .toHaveCount(expectedCount)
    }
  })
})

/* ────────────────────────────────────────────
   2. Recherche et filtre
──────────────────────────────────────────── */
test.describe('Recherche et filtre', () => {
  test('la recherche par titre ne garde que les titres correspondants', async ({ page }) => {
    await page.locator('input[aria-label="Rechercher dans les titres à paraître"]').fill(BOOK.title)

    await expect(page.locator('article')).toHaveCount(1)
    await expect(cardOf(page, BOOK.title)).toBeVisible()
  })

  test('une recherche sans résultat affiche le message vide', async ({ page }) => {
    await page.locator('input[aria-label="Rechercher dans les titres à paraître"]').fill('zzzzzzz')

    await expect(page.getByText('Aucun résultat pour « zzzzzzz »')).toBeVisible()
  })

  test('le filtre par thématique ne garde que son univers', async ({ page }) => {
    const universe = UNIVERSES_PRESENTS[0]
    const expectedCount = A_PARAITRE.filter(book => book.universe === universe).length

    await page.getByRole('group', { name: 'Filtres' }).getByRole('button', { name: universe }).click()

    await expect(page.locator('article')).toHaveCount(expectedCount)
  })
})

/* ────────────────────────────────────────────
   3. Commande : confirmation obligatoire
──────────────────────────────────────────── */
test.describe('Commande d\'un titre à paraître', () => {
  test('le bouton d\'ajout est présent et actif', async ({ page }) => {
    const addButton = cardOf(page, BOOK.title).locator('button[aria-label="Ajouter au panier"]')

    await expect(addButton).toBeVisible()
    await expect(addButton).toBeEnabled()
  })

  test('cliquer ouvre la modale d\'avertissement sans rien ajouter', async ({ page }) => {
    await cardOf(page, BOOK.title).locator('button[aria-label="Ajouter au panier"]').click()

    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    await expect(modal.getByText('Titre à paraître')).toBeVisible()
    await expect(modal.getByText(/noté/)).toBeVisible()
    await expectCartCount(page, 0)
  })

  test('confirmer ajoute le titre au panier', async ({ page }) => {
    await cardOf(page, BOOK.title).locator('button[aria-label="Ajouter au panier"]').click()

    await page.getByRole('dialog').getByRole('button', { name: 'OK' }).click()

    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expectCartCount(page, 1)
    await expect(page.getByText(`"${BOOK.title}" ajouté au panier`)).toBeVisible()
  })

  test('fermer la modale par Échap n\'ajoute rien', async ({ page }) => {
    await cardOf(page, BOOK.title).locator('button[aria-label="Ajouter au panier"]').click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.keyboard.press('Escape')

    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expectCartCount(page, 0)
  })

  test('la quantité choisie est reprise dans le panier', async ({ page }) => {
    const card = cardOf(page, BOOK.title)
    await card.getByRole('button', { name: 'Augmenter la quantité' }).click()
    await card.getByRole('button', { name: 'Augmenter la quantité' }).click()

    await card.locator('button[aria-label="Ajouter au panier"]').click()
    await page.getByRole('dialog').getByRole('button', { name: 'OK' }).click()

    await expectCartCount(page, 3)
  })
})

/* ────────────────────────────────────────────
   4. Sortie de page
──────────────────────────────────────────── */
test.describe('Navigation', () => {
  test('le titre d\'une carte ouvre sa fiche produit', async ({ page }) => {
    const crashes = collectCrashes(page)

    await cardOf(page, BOOK.title).getByRole('link', { name: BOOK.title, exact: true }).click()

    await expect(page).toHaveURL(`/livre/${BOOK.id}`)
    expect(crashes).toEqual([])
  })
})
