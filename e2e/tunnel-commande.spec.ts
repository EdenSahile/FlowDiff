import { test, expect, type Page } from '@playwright/test'
import { CHECKOUT_STEPS, getStepLabel } from '../src/pages/cart/checkoutSteps'

/*
  Tunnel de commande, de la connexion à la confirmation.

  C'est le flux le plus critique de l'application, et sa logique est couverte
  en unitaire (checkoutTunnel, cartOperations, lot09-orders). Ce fichier
  vérifie l'enchaînement à l'écran : le panier se remplit, les étapes
  défilent, la commande part, le panier se vide, la commande arrive dans
  l'historique.

  Les montants et les remises ne sont pas rejoués ici, computeTotals.test.ts
  les couvre.

  Le nombre d'étapes se lit dans CHECKOUT_STEPS et leur libellé dans
  getStepLabel : passer de 3 à 2 étapes, ou renommer une étape, ne doit pas
  faire tomber la suite.
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
  return page.getByRole('button', { name: /^Panier : \d+ article/ })
}

// Le libellé du panier porte le compte : « Panier : 3 articles ».
// Assertion à réessai : le badge se met à jour au re-rendu du header.
async function expectCartCount(page: Page, count: number) {
  const plural = count === 1 ? 'article' : 'articles'
  await expect(cartLink(page)).toHaveAttribute('aria-label', `Panier : ${count} ${plural}`)
}

// On ajoute depuis la fiche produit, où le bouton est seul sur la page.
//
// Le sélecteur reste ciblé sur un vrai <button> : une carte de liste contient
// le texte « Ajouter au panier » dans son propre contenu, et une recherche par
// rôle et par nom moins précise a déjà sélectionné la carte au lieu du bouton.
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

/*
  Le stepper est la marque d'étape qui ne dépend d'aucun libellé de bouton :
  chaque pastille porte en aria-label le nom de son étape, et la pastille de
  l'étape courante porte en plus aria-current="step".
*/
function stepper(page: Page) {
  return page.getByRole('list', { name: 'Étapes de la commande' })
}

async function expectOnStep(page: Page, step: (typeof CHECKOUT_STEPS)[number]) {
  await expect(stepper(page).locator('[aria-current="step"]'))
    .toHaveAttribute('aria-label', getStepLabel(step))
}

/*
  Avance d'une étape. Le bouton d'avancement porte le nom de l'action qu'il
  déclenche, non celui de l'étape visée : « Vérifier ma commande » quitte
  l'étape des adresses. Un tunnel à plus de 2 étapes demanderait un libellé
  par étape intermédiaire.
*/
async function goToNextStep(page: Page) {
  await page.getByRole('button', { name: 'Vérifier ma commande' }).click()
}

// Déroule le tunnel depuis le panier jusqu'à la confirmation.
async function runCheckout(page: Page) {
  await page.goto('/panier')
  await page.getByRole('button', { name: 'Valider la commande' }).click()

  // Une étape de moins que d'étapes : la dernière se quitte par la validation.
  for (let i = 0; i < CHECKOUT_STEPS.length - 1; i++) {
    await goToNextStep(page)
  }

  await page.getByRole('button', { name: 'Valider ma commande' }).click()
}

const SUCCESS_TEXT = 'Votre commande a été enregistrée sur FlowDiff.'

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

  test('les étapes du tunnel défilent jusqu\'à la confirmation', async ({ page }) => {
    await login(page)
    await addBookToCart(page)
    await page.goto('/panier')

    await page.getByRole('button', { name: 'Valider la commande' }).click()

    // Le stepper annonce toutes les étapes, dans l'ordre déclaré.
    await expect(stepper(page).getByRole('listitem'))
      .toHaveText(CHECKOUT_STEPS.map(step => new RegExp(getStepLabel(step))))

    for (const step of CHECKOUT_STEPS) {
      await expectOnStep(page, step)
      if (step !== CHECKOUT_STEPS[CHECKOUT_STEPS.length - 1]) {
        await goToNextStep(page)
      }
    }

    await page.getByRole('button', { name: 'Valider ma commande' }).click()

    await expect(page.getByText(SUCCESS_TEXT)).toBeVisible()
  })

  test('revenir en arrière ramène à l\'étape précédente', async ({ page }) => {
    test.skip(CHECKOUT_STEPS.length < 2, 'Le tunnel n\'a qu\'une étape.')
    await login(page)
    await addBookToCart(page)
    await page.goto('/panier')
    await page.getByRole('button', { name: 'Valider la commande' }).click()
    await goToNextStep(page)
    await expectOnStep(page, CHECKOUT_STEPS[1])

    await page.getByRole('button', { name: /Modifier les adresses/ }).click()

    await expectOnStep(page, CHECKOUT_STEPS[0])
  })

  test('le panier est vidé après l\'envoi de la commande', async ({ page }) => {
    await login(page)
    await addBookToCart(page)

    await runCheckout(page)

    await expect(page.getByText(SUCCESS_TEXT)).toBeVisible()
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
    await expect(page.getByText(SUCCESS_TEXT)).toBeVisible()
    await page.goto('/historique')

    await expect(orderNumbers(page)).toHaveCount(countBeforeOrder + 1)
    await expect(page.getByText('en préparation').first()).toBeVisible()
  })

  test('le parcours complet ne déclenche aucune erreur JS', async ({ page }) => {
    const crashes = collectCrashes(page)
    await login(page)
    await addBookToCart(page)

    await runCheckout(page)
    await expect(page.getByText(SUCCESS_TEXT)).toBeVisible()
    await page.goto('/historique')

    expect(crashes).toEqual([])
  })
})
