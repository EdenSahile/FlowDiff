import { test, expect, type Page } from '@playwright/test'

/*
  Tunnel de commande, de la connexion à la confirmation.

  C'est le flux le plus critique de l'application, et le seul parcours majeur
  qui n'avait aucun test e2e : sa logique est couverte en unitaire
  (checkoutTunnel, cartOperations, lot09-orders), mais rien ne vérifiait
  qu'elle s'enchaîne à l'écran.

  Les montants et les remises ne sont pas rejoués ici, computeTotals.test.ts
  les couvre. Ce fichier vérifie l'enchaînement : le panier se remplit, les
  3 étapes défilent, la commande part, le panier se vide, la commande arrive
  dans l'historique.
*/

test.use({ viewport: { width: 1440, height: 900 } })

/* ────────────────────────────────────────────
   Helpers
──────────────────────────────────────────── */

// En démo, les identifiants sont pré-remplis : se connecter se réduit au clic.
async function login(page: Page) {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await page.locator('input[aria-label="Recherche globale"]').waitFor()
}

// Titre réel du catalogue, commandable, déjà utilisé par navigation.spec.ts.
const BOOK_ID = 'n-lit-01'

function cartLink(page: Page) {
  return page.getByRole('button', { name: /^Panier — \d+ article/ })
}

// Le libellé du panier porte le compte : « Panier — 3 articles ».
// Assertion à réessai : le badge se met à jour au re-rendu du header.
async function expectCartCount(page: Page, count: number) {
  const plural = count === 1 ? 'article' : 'articles'
  await expect(cartLink(page)).toHaveAttribute('aria-label', `Panier — ${count} ${plural}`)
}

// On ajoute depuis la fiche produit, où le bouton est seul sur la page.
//
// Piège si on voulait le faire depuis une liste : la carte est un
// article[role=button] (BookCard.tsx:640) dont le nom accessible est calculé
// sur tout son texte, donc il contient « Ajouter au panier ». Un
// getByRole('button', { name: 'Ajouter au panier' }) sélectionne alors la
// carte, pas le bouton, et le clic tombe au centre de la carte, ce qui
// navigue vers la fiche. Il faut un sélecteur que la carte ne peut pas
// satisfaire, par exemple locator('button[aria-label="Ajouter au panier"]').
async function addBookToCart(page: Page) {
  await page.goto(`/livre/${BOOK_ID}`)
  await page.locator('button[aria-label="Ajouter au panier"]').first().click()
}

// Les numéros de commande suivent le format CMD + 7 chiffres.
function orderNumbers(page: Page) {
  return page.getByText(/^CMD\d{7}$/)
}

// Les exceptions JS non rattrapées sont le signe le plus net d'un écran cassé.
function collectCrashes(page: Page): string[] {
  const crashes: string[] = []
  page.on('pageerror', error => crashes.push(error.message))
  return crashes
}

// Déroule les 3 étapes du tunnel depuis le panier jusqu'à la confirmation.
async function runCheckout(page: Page) {
  await page.goto('/panier')

  await page.getByRole('button', { name: 'Valider la commande' }).click()
  await page.getByRole('button', { name: /^Suivant — Adresses/ }).click()
  await page.getByRole('button', { name: /^Suivant — Mode de transmission/ }).click()
  await page.getByRole('button', { name: 'Envoyer la commande' }).click()
}

/* ────────────────────────────────────────────
   Scénarios
──────────────────────────────────────────── */

test.describe('Tunnel de commande', () => {
  test('une session neuve démarre avec un panier vide', async ({ page }) => {
    await login(page)

    await expectCartCount(page, 0)
  })

  test('ajouter un titre incrémente le badge du panier', async ({ page }) => {
    await login(page)

    await addBookToCart(page)

    await expectCartCount(page, 1)
  })

  test('le panier affiche le titre ajouté et son total', async ({ page }) => {
    await login(page)
    await addBookToCart(page)

    await page.goto('/panier')

    await expect(page.getByText('Total TTC')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Valider la commande' })).toBeEnabled()
  })

  test('les 3 étapes du tunnel défilent jusqu\'à la confirmation', async ({ page }) => {
    await login(page)
    await addBookToCart(page)
    await page.goto('/panier')

    await page.getByRole('button', { name: 'Valider la commande' }).click()
    await expect(page.getByRole('button', { name: /^Suivant — Adresses/ })).toBeVisible()

    await page.getByRole('button', { name: /^Suivant — Adresses/ }).click()
    await expect(page.getByRole('button', { name: /^Suivant — Mode de transmission/ })).toBeVisible()

    await page.getByRole('button', { name: /^Suivant — Mode de transmission/ }).click()
    await expect(page.getByRole('button', { name: 'Envoyer la commande' })).toBeVisible()

    await page.getByRole('button', { name: 'Envoyer la commande' }).click()
    await expect(page.getByText('Commande envoyée !')).toBeVisible()
  })

  test('le panier est vidé après l\'envoi de la commande', async ({ page }) => {
    await login(page)
    await addBookToCart(page)

    await runCheckout(page)

    await expect(page.getByText('Commande envoyée !')).toBeVisible()
    await expectCartCount(page, 0)
  })

  test('la commande envoyée apparaît dans l\'historique', async ({ page }) => {
    await login(page)
    await page.goto('/historique')
    // count() ne patiente pas : sans cette attente, la référence vaudrait 0.
    await expect(orderNumbers(page).first()).toBeVisible()
    const countBeforeOrder = await orderNumbers(page).count()
    await addBookToCart(page)

    await runCheckout(page)
    await expect(page.getByText('Commande envoyée !')).toBeVisible()
    await page.goto('/historique')

    await expect(orderNumbers(page)).toHaveCount(countBeforeOrder + 1)
    await expect(page.getByText('en préparation').first()).toBeVisible()
  })

  test('le parcours complet ne déclenche aucune erreur JS', async ({ page }) => {
    const crashes = collectCrashes(page)
    await login(page)
    await addBookToCart(page)

    await runCheckout(page)
    await expect(page.getByText('Commande envoyée !')).toBeVisible()
    await page.goto('/historique')

    expect(crashes).toEqual([])
  })
})
