import { test, expect, type Page } from '@playwright/test'
import { getCatalogueBooks, type Book, type Universe } from '../src/data/mockBooks'
import { getPurchaseAvailability } from '../src/lib/bookUtils'
import { MOCK_USERS } from '../src/lib/mockUsers'
import { collectCrashes, DEMO_CODE_CLIENT, expectCartCount, login } from './helpers'

/*
  Panier, avant le tunnel : quantités, suppression, vidage, groupement par
  univers et taux de remise affiché.

  Les montants en euros ne sont pas rejoués ici, computeTotals.test.ts les
  couvre, et les lignes d'ebook non plus, ebook.spec.ts s'en charge. Ce fichier
  vérifie ce que le libraire peut faire de son panier et le taux qu'il y lit.

  Les taux viennent de MOCK_USERS : ils sont personnalisés par librairie et
  s'appliquent par thématique, donc les recopier ici ferait passer un test
  quand bien même le compte changerait de remise.
*/

test.use({ viewport: { width: 1440, height: 900 } })

const USER = MOCK_USERS.find(u => u.codeClient === DEMO_CODE_CLIENT)!
const RATES = USER.remisesParUnivers

/*
  Titres de référence : commandables sans confirmation, sur papier, dans 2
  univers aux taux de remise différents, pour que le récapitulatif ait une
  raison d'annoncer une remise « variable ».
*/
const isPlainlyOrderable = (book: Book) => {
  const availability = getPurchaseAvailability(book.type, book.statut)
  return availability.canAddToCart && !availability.isAParaitre && !availability.needsConfirm
}

function firstOrderableOf(universe: Universe): Book {
  const book = getCatalogueBooks().find(b => b.universe === universe && isPlainlyOrderable(b))
  if (!book) throw new Error(`Aucun titre commandable en ${universe}`)
  return book
}

const UNIVERSES_WITH_RATE = (Object.keys(RATES) as Universe[])
const FIRST_UNIVERSE = UNIVERSES_WITH_RATE[0]
const OTHER_UNIVERSE = UNIVERSES_WITH_RATE.find(u => RATES[u] !== RATES[FIRST_UNIVERSE])!

const BOOK = firstOrderableOf(FIRST_UNIVERSE)
const OTHER_BOOK = firstOrderableOf(OTHER_UNIVERSE)

async function addToCart(page: Page, book: Book) {
  await page.goto(`/livre/${book.id}`)
  await page.locator('button[aria-label="Ajouter au panier"]').first().click()
}

function lineOf(page: Page, book: Book) {
  return page.locator('article, div').filter({ hasText: book.title }).last()
}

function deleteButton(page: Page, book: Book) {
  return page.getByRole('button', { name: `Supprimer ${book.title}` })
}

test.beforeEach(async ({ page }) => {
  await login(page)
})

/* ────────────────────────────────────────────
   1. Panier vide
──────────────────────────────────────────── */
test.describe('Panier vide', () => {
  test('annonce qu\'il est vide et renvoie au catalogue', async ({ page }) => {
    await page.goto('/panier')

    await expect(page.getByText('Votre panier est vide')).toBeVisible()
    await expect(page.getByText('Parcourez le catalogue pour ajouter des titres.')).toBeVisible()

    await page.getByRole('button', { name: 'Voir le catalogue' }).click()

    await expect(page).toHaveURL('/fonds')
  })

  test('n\'affiche ni récapitulatif ni validation', async ({ page }) => {
    await page.goto('/panier')

    await expect(page.getByText('Total TTC')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Valider la commande' })).toHaveCount(0)
  })
})

/* ────────────────────────────────────────────
   2. Contenu
──────────────────────────────────────────── */
test.describe('Contenu du panier', () => {
  test('la ligne porte le titre, l\'ISBN et le taux de remise de son univers', async ({ page }) => {
    await addToCart(page, BOOK)

    await page.goto('/panier')

    await expect(page.getByText(BOOK.title).first()).toBeVisible()
    await expect(page.getByText(`ISBN ${BOOK.isbn}`, { exact: false }).first()).toBeVisible()
    await expect(lineOf(page, BOOK).getByText(`−${RATES[BOOK.universe]} %`)).toBeVisible()
  })

  test('les lignes sont regroupées par univers', async ({ page }) => {
    await addToCart(page, BOOK)
    await addToCart(page, OTHER_BOOK)

    await page.goto('/panier')

    await expect(page.getByText(BOOK.universe, { exact: true }).first()).toBeVisible()
    await expect(page.getByText(OTHER_BOOK.universe, { exact: true }).first()).toBeVisible()
  })

  test('le récapitulatif compte les articles', async ({ page }) => {
    await addToCart(page, BOOK)
    await addToCart(page, OTHER_BOOK)

    await page.goto('/panier')

    // Le compte figure aussi dans la ligne du code client : match exact.
    await expect(page.getByText('2 articles', { exact: true })).toBeVisible()
  })

  /*
    Un panier à un seul taux annonce ce taux. Dès que 2 univers aux taux
    différents cohabitent, le récapitulatif ne peut plus donner un chiffre
    unique et annonce « variable ».
  */
  test('un seul univers affiche son taux dans le récapitulatif', async ({ page }) => {
    await addToCart(page, BOOK)

    await page.goto('/panier')

    await expect(page.getByText(`−${RATES[BOOK.universe].toFixed(1)}%`)).toBeVisible()
  })

  test('deux univers aux taux différents affichent une remise variable', async ({ page }) => {
    await addToCart(page, BOOK)
    await addToCart(page, OTHER_BOOK)

    await page.goto('/panier')

    await expect(page.getByText('variable')).toBeVisible()
  })
})

/* ────────────────────────────────────────────
   3. Quantités
──────────────────────────────────────────── */
test.describe('Quantités', () => {
  test('augmenter la quantité met à jour le badge du panier', async ({ page }) => {
    await addToCart(page, BOOK)
    await page.goto('/panier')

    await lineOf(page, BOOK).getByRole('button', { name: 'Augmenter' }).click()

    await expectCartCount(page, 2)
    await expect(page.getByText('2 articles', { exact: true })).toBeVisible()
  })

  test('diminuer la quantité la ramène à sa valeur précédente', async ({ page }) => {
    await addToCart(page, BOOK)
    await page.goto('/panier')
    await lineOf(page, BOOK).getByRole('button', { name: 'Augmenter' }).click()
    await expectCartCount(page, 2)

    await lineOf(page, BOOK).getByRole('button', { name: 'Diminuer' }).click()

    await expectCartCount(page, 1)
  })

  // Une ligne à 1 ne descend pas à 0 : c'est la suppression qui retire la ligne.
  test('le bouton diminuer est désactivé à une unité', async ({ page }) => {
    await addToCart(page, BOOK)
    await page.goto('/panier')

    await expect(lineOf(page, BOOK).getByRole('button', { name: 'Diminuer' })).toBeDisabled()
  })
})

/* ────────────────────────────────────────────
   4. Suppression d'une ligne
──────────────────────────────────────────── */
test.describe('Suppression d\'une ligne', () => {
  test('la suppression demande confirmation et annuler ne retire rien', async ({ page }) => {
    await addToCart(page, BOOK)
    await page.goto('/panier')

    await deleteButton(page, BOOK).click()

    await expect(page.getByText('Supprimer cet article ?')).toBeVisible()
    await expect(page.getByText(`"${BOOK.title}" sera retiré de votre panier.`)).toBeVisible()

    await page.getByRole('button', { name: 'Annuler' }).click()

    await expectCartCount(page, 1)
    await expect(deleteButton(page, BOOK)).toBeVisible()
  })

  test('confirmer retire la ligne du panier', async ({ page }) => {
    await addToCart(page, BOOK)
    await addToCart(page, OTHER_BOOK)
    await page.goto('/panier')

    await deleteButton(page, BOOK).click()
    await page.getByRole('button', { name: 'Supprimer', exact: true }).click()

    await expectCartCount(page, 1)
    await expect(deleteButton(page, BOOK)).toHaveCount(0)
    await expect(deleteButton(page, OTHER_BOOK)).toBeVisible()
  })

  test('supprimer la dernière ligne ramène au panier vide', async ({ page }) => {
    await addToCart(page, BOOK)
    await page.goto('/panier')

    await deleteButton(page, BOOK).click()
    await page.getByRole('button', { name: 'Supprimer', exact: true }).click()

    await expect(page.getByText('Votre panier est vide')).toBeVisible()
    await expectCartCount(page, 0)
  })
})

/* ────────────────────────────────────────────
   5. Vidage complet
──────────────────────────────────────────── */
test.describe('Vidage complet', () => {
  test('vider demande confirmation et annuler garde le panier', async ({ page }) => {
    await addToCart(page, BOOK)
    await addToCart(page, OTHER_BOOK)
    await page.goto('/panier')

    await page.getByRole('button', { name: 'Vider tout le panier' }).click()

    await expect(page.getByText('Vider le panier ?')).toBeVisible()
    await expect(page.getByText(/Cette action est irréversible/)).toBeVisible()

    await page.getByRole('button', { name: 'Annuler' }).click()

    await expectCartCount(page, 2)
  })

  test('confirmer vide tout le panier', async ({ page }) => {
    const crashes = collectCrashes(page)
    await addToCart(page, BOOK)
    await addToCart(page, OTHER_BOOK)
    await page.goto('/panier')

    await page.getByRole('button', { name: 'Vider tout le panier' }).click()
    await page.getByRole('button', { name: 'Supprimer', exact: true }).click()

    await expect(page.getByText('Votre panier est vide')).toBeVisible()
    await expectCartCount(page, 0)
    expect(crashes).toEqual([])
  })
})

/* ────────────────────────────────────────────
   6. Date de livraison
──────────────────────────────────────────── */
test.describe('Date de livraison', () => {
  test('le délai habituel est choisi par défaut et laisse valider', async ({ page }) => {
    await addToCart(page, BOOK)
    await page.goto('/panier')

    await expect(page.getByRole('radio', { name: /Délai habituel/ })).toBeChecked()
    await expect(page.getByRole('button', { name: 'Valider la commande' })).toBeEnabled()
  })

  /*
    Choisir une date spécifique sans la renseigner bloque la validation :
    laisser passer une commande dont la date est « à préciser » ferait partir
    une livraison sans date.
  */
  test('une date spécifique non renseignée bloque la validation', async ({ page }) => {
    await addToCart(page, BOOK)
    await page.goto('/panier')

    await page.getByRole('radio', { name: 'Date spécifique' }).check()

    await expect(page.getByRole('button', { name: 'Valider la commande' })).toBeDisabled()
  })

  test('revenir au délai habituel débloque la validation', async ({ page }) => {
    await addToCart(page, BOOK)
    await page.goto('/panier')
    await page.getByRole('radio', { name: 'Date spécifique' }).check()
    await expect(page.getByRole('button', { name: 'Valider la commande' })).toBeDisabled()

    await page.getByRole('radio', { name: /Délai habituel/ }).check()

    await expect(page.getByRole('button', { name: 'Valider la commande' })).toBeEnabled()
  })
})

/* ────────────────────────────────────────────
   7. Persistance entre les pages
──────────────────────────────────────────── */
test.describe('Persistance', () => {
  /*
    Le panier est partagé par tous les utilisateurs d'un même codeClient et
    survit à la navigation : un libraire qui repart au catalogue ne doit pas
    retrouver un panier vide.
  */
  test('le panier survit à un aller-retour vers le catalogue', async ({ page }) => {
    await addToCart(page, BOOK)
    await page.goto('/fonds')
    await expectCartCount(page, 1)

    await page.goto('/panier')

    await expect(deleteButton(page, BOOK)).toBeVisible()
  })

  /*
    Au premier rendu d'un chargement de page, l'utilisateur n'est pas encore
    restauré : la clé du panier vaut « guest » et le panier est vide. Quand
    l'authentification arrive, la clé devient celle du libraire. Si l'effet de
    persistance s'exécute avant que le panier chargé n'atteigne l'état, il
    écrit le panier vide sous la nouvelle clé et efface le panier stocké.

    Ce test observe les écritures dès le premier script de la page : la clé du
    libraire ne doit jamais recevoir un panier vide alors qu'elle en contenait
    un. Sinon un rechargement tombant dans cette fenêtre perd le panier.
  */
  test('un chargement de page n\'écrase jamais le panier stocké', async ({ page }) => {
    const CART_KEY = `flowdiff_cart_${DEMO_CODE_CLIENT}`
    await addToCart(page, BOOK)
    await page.goto('/panier')
    await expectCartCount(page, 1)

    await page.addInitScript((key: string) => {
      const writes: string[] = []
      const realSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = function (name: string, value: string) {
        if (name === key) writes.push(value)
        return realSetItem.call(this, name, value)
      }
      ;(window as unknown as { __cartWrites: string[] }).__cartWrites = writes
    }, CART_KEY)
    await page.goto('/panier')
    await expectCartCount(page, 1)

    const writes = await page.evaluate(() => (window as unknown as { __cartWrites: string[] }).__cartWrites)
    expect(writes.filter(value => value.includes('"items":[]'))).toEqual([])
  })

  test('le panier survit à un rechargement de la page', async ({ page }) => {
    await addToCart(page, BOOK)
    await page.goto('/panier')

    await page.reload()

    // Le badge est le premier signe que le panier s'est réhydraté depuis le
    // localStorage : l'attendre avant la ligne évite un échec de minutage.
    await expectCartCount(page, 1)
    await expect(deleteButton(page, BOOK)).toBeVisible()
  })
})
