import { test, expect, type Page } from '@playwright/test'
import { MOCK_ORDERS } from '../src/data/mockOrders'
import { VALID_CLIENT_CODES } from '../src/lib/mockUsers'
import { getCatalogueBooks, type Book } from '../src/data/mockBooks'
import { getPurchaseAvailability } from '../src/lib/bookUtils'
import { collectCrashes, DEMO_CODE_CLIENT, expectCartCount, login, sidebar, sidebarLink } from './helpers'

/*
  Isolation des données entre 2 librairies.

  Règle de sécurité du projet : les données sont isolées par codeClient, via
  des clés localStorage suffixées, donc 2 librairies ne se voient pas. Le
  panier et l'historique sont en revanche partagés entre tous les
  utilisateurs d'un même codeClient et survivent à la déconnexion.

  Rien ne vérifiait cette règle, et c'est le genre de règle qui casse en
  silence : une clé non suffixée ne provoque aucune erreur, elle montre
  simplement le panier d'un confrère.

  L'écran de connexion est verrouillé sur le compte de démonstration, ses 2
  champs étant désactivés. La seconde librairie s'atteint donc par
  l'inscription, qui connecte le compte créé.
*/

test.use({ viewport: { width: 1440, height: 900 } })

const SECOND = VALID_CLIENT_CODES.find(entry => entry.codeClient !== DEMO_CODE_CLIENT)!

// Satisfait registerSchema : 8 caractères, une majuscule, un chiffre, un spécial.
const PASSWORD = 'Libraire123!'

const isPlainlyOrderable = (book: Book) => {
  const availability = getPurchaseAvailability(book.type, book.statut)
  return availability.canAddToCart && !availability.isAParaitre && !availability.needsConfirm
}

const BOOK = getCatalogueBooks().find(isPlainlyOrderable)!
const OTHER_BOOK = getCatalogueBooks().filter(isPlainlyOrderable)[1]

const cartKeyOf = (codeClient: string) => `flowdiff_cart_${codeClient}`

async function addToCart(page: Page, book: Book) {
  await page.goto(`/livre/${book.id}`)
  await page.locator('button[aria-label="Ajouter au panier"]').first().click()
}

async function logout(page: Page) {
  await sidebar(page).getByRole('button', { name: 'Se déconnecter' }).click()
  await page.getByRole('button', { name: 'Se déconnecter' }).last().click()
  await expect(page).toHaveURL('/login')
}

// L'inscription vérifie que le code client existe et que l'email correspond,
// puis connecte le compte créé.
async function registerAs(page: Page, entry: { codeClient: string; email: string }) {
  await page.goto('/register')
  await page.getByLabel('Code client').fill(entry.codeClient)
  await page.getByLabel('Email professionnel').fill(entry.email)
  await page.getByLabel('Mot de passe', { exact: true }).fill(PASSWORD)
  await page.getByLabel('Confirmer le mot de passe').fill(PASSWORD)
  await page.getByRole('button', { name: 'Créer mon accès' }).click()
  await expect(page).toHaveURL('/')
  await page.locator('input[aria-label="Recherche globale"]').waitFor()
}

function storageKeys(page: Page) {
  return page.evaluate(() => Object.keys(localStorage).sort())
}

/* ────────────────────────────────────────────
   1. Le panier ne traverse pas les librairies
──────────────────────────────────────────── */
test.describe('Panier', () => {
  test('la seconde librairie ne voit pas le panier de la première', async ({ page }) => {
    const crashes = collectCrashes(page)
    await login(page)
    await addToCart(page, BOOK)
    await expectCartCount(page, 1)
    await logout(page)

    await registerAs(page, SECOND)

    await expectCartCount(page, 0)
    await page.goto('/panier')
    await expect(page.getByText('Votre panier est vide')).toBeVisible()
    expect(crashes).toEqual([])
  })

  test('chaque librairie écrit sa propre clé de panier', async ({ page }) => {
    await login(page)
    await addToCart(page, BOOK)
    await expectCartCount(page, 1)
    await logout(page)
    await registerAs(page, SECOND)
    await addToCart(page, OTHER_BOOK)
    await expectCartCount(page, 1)

    const keys = await storageKeys(page)

    expect(keys).toContain(cartKeyOf(DEMO_CODE_CLIENT))
    expect(keys).toContain(cartKeyOf(SECOND.codeClient))
  })

  test('remplir le panier de la seconde librairie ne touche pas celui de la première', async ({ page }) => {
    await login(page)
    await addToCart(page, BOOK)
    await expectCartCount(page, 1)
    const before = await page.evaluate(
      key => localStorage.getItem(key),
      cartKeyOf(DEMO_CODE_CLIENT),
    )
    await logout(page)

    await registerAs(page, SECOND)
    await addToCart(page, OTHER_BOOK)
    await expectCartCount(page, 1)

    const after = await page.evaluate(
      key => localStorage.getItem(key),
      cartKeyOf(DEMO_CODE_CLIENT),
    )
    expect(after).toEqual(before)
  })

  /*
    Le panier est attaché à la librairie, pas à la personne : un libraire qui
    se déconnecte et revient doit retrouver son panier, y compris après un
    passage par un autre compte.
  */
  test('revenir sur la première librairie restaure son panier', async ({ page }) => {
    await login(page)
    await addToCart(page, BOOK)
    await expectCartCount(page, 1)
    await logout(page)
    await registerAs(page, SECOND)
    await expectCartCount(page, 0)
    await logout(page)

    await login(page)

    await expectCartCount(page, 1)
  })
})

/* ────────────────────────────────────────────
   2. L'historique ne traverse pas non plus
──────────────────────────────────────────── */
test.describe('Historique', () => {
  const FIRST_ORDERS = MOCK_ORDERS[DEMO_CODE_CLIENT] ?? []
  const SECOND_ORDERS = MOCK_ORDERS[SECOND.codeClient] ?? []

  test('la première librairie voit ses commandes', async ({ page }) => {
    test.skip(FIRST_ORDERS.length === 0, 'Le compte de démonstration n\'a pas de commande.')
    await login(page)

    await sidebarLink(page, 'Mon historique').click()

    await expect(page.getByText(/^CMD\d{7}$/)).toHaveCount(FIRST_ORDERS.length)
  })

  test('la seconde librairie ne voit aucune commande de la première', async ({ page }) => {
    test.skip(SECOND_ORDERS.length > 0, 'La seconde librairie a ses propres commandes.')
    await registerAs(page, SECOND)

    await sidebarLink(page, 'Mon historique').click()

    await expect(page.getByText(/^CMD\d{7}$/)).toHaveCount(0)
    await expect(page.getByText("Vous n'avez pas encore passé de commande.")).toBeVisible()
  })

  test('aucun numéro de commande de la première ne fuit chez la seconde', async ({ page }) => {
    test.skip(FIRST_ORDERS.length === 0, 'Le compte de démonstration n\'a pas de commande.')
    await registerAs(page, SECOND)

    await sidebarLink(page, 'Mon historique').click()

    for (const order of FIRST_ORDERS) {
      await expect(page.getByText(order.numero, { exact: true })).toHaveCount(0)
    }
  })
})

/* ────────────────────────────────────────────
   3. Clés de stockage
──────────────────────────────────────────── */
test.describe('Clés de stockage', () => {
  /*
    Toute clé propre à une librairie doit porter son codeClient en suffixe.
    Une clé nue serait partagée par les 2 comptes sans que rien ne le signale.
    Le jeton de session et le compteur de commandes sont volontairement
    globaux : ils ne portent aucune donnée d'une librairie.
  */
  const GLOBAL_KEYS = [
    'flowdiff_token',
    'flowdiff_storage_version',
    'flowdiff_order_counter',
    // Période choisie sur le tableau de bord : un confort d'affichage, pas
    // une donnée de la librairie.
    'flowdiff.periodFilter',
  ]

  /*
    Le parcours doit toucher chaque écran qui écrit dans le localStorage,
    sinon le test ne voit pas les clés qu'il est censé contrôler et donne une
    fausse assurance. Le règlement d'une facture en fait partie : c'est lui
    qui écrit l'état des factures payées.
  */
  test('les clés de données portent toutes un codeClient en suffixe', async ({ page }) => {
    await login(page)
    await addToCart(page, BOOK)
    await page.goto('/historique')
    await page.goto('/parametres')
    await page.goto('/facturation')
    await page.getByRole('heading', { name: 'Facturation' }).waitFor()
    await page.getByRole('button', { name: /^Payer la facture/ }).first().click()
    const modal = page.getByRole('dialog', { name: 'Paiement de la facture' })
    await modal.getByRole('button', { name: /Virement/ }).click()
    await modal.getByRole('button', { name: 'Confirmer le virement' }).click()
    await expect(modal.getByText('Paiement confirmé')).toBeVisible()

    const keys = await storageKeys(page)
    const orphans = keys.filter(key =>
      !GLOBAL_KEYS.includes(key) && !/_(LIB\d+|guest)$/.test(key),
    )

    expect(orphans).toEqual([])
  })

  /*
    Les factures appartiennent à une librairie : l'état des règlements doit
    vivre sous sa clé. Une clé nue ferait voir à une librairie les factures
    qu'une autre a réglées.
  */
  test('l\'état des factures réglées vit sous la clé de la librairie', async ({ page }) => {
    await login(page)
    await page.goto('/facturation')
    await page.getByRole('heading', { name: 'Facturation' }).waitFor()

    await page.getByRole('button', { name: /^Payer la facture/ }).first().click()
    const modal = page.getByRole('dialog', { name: 'Paiement de la facture' })
    await modal.getByRole('button', { name: /Virement/ }).click()
    await modal.getByRole('button', { name: 'Confirmer le virement' }).click()
    await expect(modal.getByText('Paiement confirmé')).toBeVisible()

    const keys = await storageKeys(page)
    expect(keys).toContain(`flowdiff_paid_invoices_${DEMO_CODE_CLIENT}`)
    expect(keys).not.toContain('flowdiff_paid_invoices')
  })

  test('la déconnexion retire le jeton sans effacer le panier de la librairie', async ({ page }) => {
    await login(page)
    await addToCart(page, BOOK)
    await expectCartCount(page, 1)

    await logout(page)

    expect(await page.evaluate(() => localStorage.getItem('flowdiff_token'))).toBeNull()
    expect(await page.evaluate(
      key => localStorage.getItem(key),
      cartKeyOf(DEMO_CODE_CLIENT),
    )).not.toBeNull()
  })
})

/* ────────────────────────────────────────────
   4. Compte affiché
──────────────────────────────────────────── */
test.describe('Compte affiché', () => {
  test('chaque librairie voit son propre code client et ses coordonnées', async ({ page }) => {
    await login(page)
    await sidebarLink(page, 'Mon compte').click()
    await expect(page.getByText(`Code client : ${DEMO_CODE_CLIENT}`)).toBeVisible()
    await logout(page)

    await registerAs(page, SECOND)
    await sidebarLink(page, 'Mon compte').click()

    await expect(page.getByText(`Code client : ${SECOND.codeClient}`)).toBeVisible()
    await expect(page.getByText(`Code client : ${DEMO_CODE_CLIENT}`)).toHaveCount(0)
    await expect(page.getByText(SECOND.email)).toBeVisible()
  })
})
