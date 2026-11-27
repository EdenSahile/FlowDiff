import { test, expect, type Page } from '@playwright/test'
import { MOCK_ORDERS, ORDER_STATUSES, ORDER_STATUS_LABELS, type Order } from '../src/data/mockOrders'
import { MOCK_BOOKS } from '../src/data/mockBooks'
import { collectCrashes, DEMO_CODE_CLIENT, expectCartCount, login, sidebarLink } from './helpers'

/*
  Page Mon historique, et surtout la duplication d'une commande en 1 clic,
  règle métier annoncée par CLAUDE.md et jusqu'ici sans test de parcours.

  Les commandes attendues viennent de MOCK_ORDERS, et le nombre d'exemplaires
  qu'une duplication met au panier est recalculé par la même règle que
  HistoriquePage.handleDupliquer : il ne reprend que les lignes dont le livre
  existe encore dans MOCK_BOOKS.
*/

test.use({ viewport: { width: 1440, height: 900 } })

const CATALOGUE_IDS = new Set(MOCK_BOOKS.map(book => book.id))

// Tri de la page : date décroissante.
const ORDERS = [...(MOCK_ORDERS[DEMO_CODE_CLIENT] ?? [])]
  .sort((a, b) => b.date.localeCompare(a.date))

const duplicableItems = (order: Order) =>
  order.items.filter(item => CATALOGUE_IDS.has(item.bookId))

const duplicableCopies = (order: Order) =>
  duplicableItems(order).reduce((sum, item) => sum + item.quantity, 0)

/*
  2 commandes de démonstration contiennent des lignes dont le livre a quitté
  le catalogue. La duplication les ignore en silence, d'où ces 2 jeux
  distincts : l'un pour la duplication complète, l'autre pour la partielle.
*/
const FULLY_DUPLICABLE = ORDERS.find(order => duplicableItems(order).length === order.items.length)!
const PARTIALLY_DUPLICABLE = ORDERS.find(order =>
  duplicableItems(order).length > 0 && duplicableItems(order).length < order.items.length,
)!

const SEARCHABLE_ITEM = duplicableItems(FULLY_DUPLICABLE)[0]

const ordersMatching = (predicate: (order: Order) => boolean) => ORDERS.filter(predicate)

function duplicateButton(page: Page, order: Order) {
  return page.getByRole('button', { name: `Dupliquer la commande ${order.numero}` })
}

function orderNumbers(page: Page) {
  return page.getByText(/^CMD\d{7}$/)
}

test.beforeEach(async ({ page }) => {
  await login(page)
  await sidebarLink(page, 'Mon historique').click()
  await expect(page.getByRole('heading', { name: 'Mon historique' })).toBeVisible()
})

/* ────────────────────────────────────────────
   1. Affichage
──────────────────────────────────────────── */
test.describe('Affichage', () => {
  test('liste toutes les commandes du compte', async ({ page }) => {
    await expect(orderNumbers(page)).toHaveCount(ORDERS.length)

    for (const order of ORDERS) {
      await expect(page.getByText(order.numero, { exact: true })).toBeVisible()
    }
  })

  /*
    Le compteur est un élément à part dans le bouton : le nom accessible colle
    « Mes commandes » et le nombre avec une espace d'écart variable, d'où
    l'expression régulière plutôt qu'un nom exact.
  */
  test('l\'onglet des commandes porte leur nombre', async ({ page }) => {
    await expect(page.getByRole('button', { name: new RegExp(`^Mes commandes\\s*${ORDERS.length}$`) }))
      .toBeVisible()
  })

  test('classe les commandes de la plus récente à la plus ancienne', async ({ page }) => {
    await expect(orderNumbers(page).first()).toHaveText(ORDERS[0].numero)
    await expect(orderNumbers(page).last()).toHaveText(ORDERS[ORDERS.length - 1].numero)
  })

  test('chaque commande porte son statut', async ({ page }) => {
    for (const status of ORDER_STATUSES) {
      const count = ordersMatching(order => order.status === status).length
      if (count === 0) continue

      await expect(page.getByText(ORDER_STATUS_LABELS[status], { exact: true })).toHaveCount(count + 1)
    }
  })

  /*
    Le panier ne crée que des commandes « Site FlowDiff », l'EDI étant simulé
    à part. Le compte attendu de chaque pastille se déduit des données.
  */
  test('chaque commande annonce son canal d\'origine', async ({ page }) => {
    const fromSite = ordersMatching(order => order.transmissionMode !== 'EDI').length
    const fromEdi = ordersMatching(order => order.transmissionMode === 'EDI').length

    await expect(page.getByText('Site FlowDiff', { exact: true })).toHaveCount(fromSite)
    await expect(page.getByText('EDI — simulation', { exact: true })).toHaveCount(fromEdi)
  })
})

/* ────────────────────────────────────────────
   2. Recherche et filtres
──────────────────────────────────────────── */
test.describe('Recherche et filtres', () => {
  test('la recherche par titre ne garde que les commandes concernées', async ({ page }) => {
    const expected = ordersMatching(order =>
      order.items.some(item => item.title.toLowerCase().includes(SEARCHABLE_ITEM.title.toLowerCase())),
    )

    await page.getByPlaceholder('Titre ou ISBN…').fill(SEARCHABLE_ITEM.title)

    await expect(orderNumbers(page)).toHaveCount(expected.length)
    await expect(page.getByText(`${expected.length} commande${expected.length !== 1 ? 's' : ''} trouvée`)).toBeVisible()
  })

  test('la recherche par ISBN ne garde que les commandes concernées', async ({ page }) => {
    const expected = ordersMatching(order =>
      order.items.some(item => item.isbn.includes(SEARCHABLE_ITEM.isbn)),
    )

    await page.getByPlaceholder('Titre ou ISBN…').fill(SEARCHABLE_ITEM.isbn)

    await expect(orderNumbers(page)).toHaveCount(expected.length)
  })

  test('une recherche sans résultat affiche le message vide', async ({ page }) => {
    await page.getByPlaceholder('Titre ou ISBN…').fill('zzzzzzz')

    await expect(page.getByText('Aucune commande ne correspond à votre recherche.')).toBeVisible()
  })

  for (const status of ORDER_STATUSES) {
    test(`le filtre « ${ORDER_STATUS_LABELS[status]} » ne garde que son statut`, async ({ page }) => {
      const expected = ordersMatching(order => order.status === status)

      await page.getByRole('button', { name: ORDER_STATUS_LABELS[status], exact: true }).click()

      await expect(orderNumbers(page)).toHaveCount(expected.length)
    })
  }

  test('le filtre se désactive au second clic', async ({ page }) => {
    const status = ORDER_STATUSES[0]
    await page.getByRole('button', { name: ORDER_STATUS_LABELS[status], exact: true }).click()
    await expect(orderNumbers(page)).not.toHaveCount(ORDERS.length)

    await page.getByRole('button', { name: ORDER_STATUS_LABELS[status], exact: true }).click()

    await expect(orderNumbers(page)).toHaveCount(ORDERS.length)
  })
})

/* ────────────────────────────────────────────
   3. Duplication en 1 clic
──────────────────────────────────────────── */
test.describe('Duplication en 1 clic', () => {
  test('dupliquer une commande remplit le panier de ses exemplaires', async ({ page }) => {
    const crashes = collectCrashes(page)
    await expectCartCount(page, 0)

    await duplicateButton(page, FULLY_DUPLICABLE).click()

    await expectCartCount(page, duplicableCopies(FULLY_DUPLICABLE))
    expect(crashes).toEqual([])
  })

  test('le bouton confirme l\'ajout, puis redevient Dupliquer', async ({ page }) => {
    await duplicateButton(page, FULLY_DUPLICABLE).click()

    await expect(duplicateButton(page, FULLY_DUPLICABLE)).toHaveText('Ajouté au panier')

    // La confirmation retombe après 3 s (handleDupliquer, setTimeout).
    await expect(duplicateButton(page, FULLY_DUPLICABLE)).toHaveText('Dupliquer', { timeout: 6000 })
  })

  test('dupliquer deux fois cumule dans le panier', async ({ page }) => {
    const copies = duplicableCopies(FULLY_DUPLICABLE)

    await duplicateButton(page, FULLY_DUPLICABLE).click()
    await expectCartCount(page, copies)
    await expect(duplicateButton(page, FULLY_DUPLICABLE)).toHaveText('Dupliquer', { timeout: 6000 })
    await duplicateButton(page, FULLY_DUPLICABLE).click()

    await expectCartCount(page, copies * 2)
  })

  /*
    Un titre à paraître ajouté depuis une carte du catalogue passe par une
    modale de confirmation. La duplication, elle, appelle addToCart
    directement : rééditer une commande n'est pas découvrir un titre, le
    libraire a déjà accepté la règle du noté lors de la commande d'origine.
  */
  test('dupliquer une commande de titres à paraître ne demande pas de confirmation', async ({ page }) => {
    const withForthcoming = ORDERS.find(order =>
      duplicableItems(order).length === order.items.length &&
      order.items.some(item => item.typeCommande === 'A paraître'),
    )
    test.skip(!withForthcoming, 'Aucune commande de démonstration ne porte de titre à paraître.')

    await duplicateButton(page, withForthcoming!).click()

    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expectCartCount(page, duplicableCopies(withForthcoming!))
  })

  /*
    Une commande peut porter un titre qui a quitté le catalogue depuis.
    handleDupliquer ne reprend que les lignes qu'il retrouve dans MOCK_BOOKS,
    et le libraire doit l'apprendre : sans message, il croit avoir remis au
    panier une commande de 18 exemplaires alors qu'il en a 8.
  */
  test('les lignes dont le livre a quitté le catalogue sont signalées', async ({ page }) => {
    const ordered = PARTIALLY_DUPLICABLE.items.reduce((sum, item) => sum + item.quantity, 0)
    const copies = duplicableCopies(PARTIALLY_DUPLICABLE)
    const skipped = PARTIALLY_DUPLICABLE.items.length - duplicableItems(PARTIALLY_DUPLICABLE).length
    expect(copies).toBeLessThan(ordered)

    await duplicateButton(page, PARTIALLY_DUPLICABLE).click()

    await expectCartCount(page, copies)
    await expect(page.getByText(
      `${skipped} titre${skipped > 1 ? 's' : ''} de cette commande ${skipped > 1 ? 'ne sont' : 'n\'est'} plus au catalogue et ${skipped > 1 ? "n'ont" : "n'a"} pas été repris.`,
    )).toBeVisible()
  })

  test('une duplication complète ne signale rien', async ({ page }) => {
    await duplicateButton(page, FULLY_DUPLICABLE).click()

    await expectCartCount(page, duplicableCopies(FULLY_DUPLICABLE))
    await expect(page.getByText(/plus au catalogue/)).toHaveCount(0)
  })

  test('la commande dupliquée se retrouve dans le panier', async ({ page }) => {
    await duplicateButton(page, FULLY_DUPLICABLE).click()
    await expectCartCount(page, duplicableCopies(FULLY_DUPLICABLE))

    await page.goto('/panier')

    for (const item of duplicableItems(FULLY_DUPLICABLE)) {
      await expect(page.getByText(item.title).first()).toBeVisible()
    }
  })
})

/* ────────────────────────────────────────────
   4. Export et onglets
──────────────────────────────────────────── */
test.describe('Export et onglets', () => {
  test('chaque commande offre son export CSV, et le tout un export global', async ({ page }) => {
    await expect(page.getByRole('button', { name: /^Exporter la commande/ })).toHaveCount(ORDERS.length)
    await expect(page.getByRole('button', { name: 'Exporter tout' })).toBeVisible()
  })

  test('l\'onglet des retours remplace la liste des commandes', async ({ page }) => {
    const crashes = collectCrashes(page)

    await page.getByRole('button', { name: /^Mes retours/ }).click()

    await expect(orderNumbers(page)).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Exporter tout' })).toHaveCount(0)
    expect(crashes).toEqual([])
  })

  test('revenir aux commandes restaure la liste', async ({ page }) => {
    await page.getByRole('button', { name: /^Mes retours/ }).click()
    await expect(orderNumbers(page)).toHaveCount(0)

    await page.getByRole('button', { name: /^Mes commandes/ }).click()

    await expect(orderNumbers(page)).toHaveCount(ORDERS.length)
  })
})
