import { test, expect, type Page } from '@playwright/test'
import { CHECKOUT_STEPS, getStepLabel } from '../src/pages/cart/checkoutSteps'
import { getCatalogueBooks, type Book } from '../src/data/mockBooks'
import { getPurchaseAvailability } from '../src/lib/bookUtils'
import { MOCK_USERS } from '../src/lib/mockUsers'
import { collectCrashes, DEMO_CODE_CLIENT, expectCartCount, login } from './helpers'

/*
  Parcours mobile, au-delà de la navigation.

  navigation-mobile.spec.ts couvre la coquille : bottom bar, menu burger,
  logo, recherche. Ce fichier couvre ce qui se passe DANS les écrans à
  largeur de téléphone, et d'abord la mise en page : toutes les autres specs
  fixent un écran de 1440 px, donc rien ne voyait un écran qui déborde.

  390 x 844 correspond à un iPhone courant, sous le palier mobile de 768 px
  (theme.breakpoints.mobile), là où la sidebar disparaît.
*/

test.use({ viewport: { width: 390, height: 844 } })

const USER = MOCK_USERS.find(u => u.codeClient === DEMO_CODE_CLIENT)!

const isPlainlyOrderable = (book: Book) => {
  const availability = getPurchaseAvailability(book.type, book.statut)
  return availability.canAddToCart && !availability.isAParaitre && !availability.needsConfirm
}

const BOOK = getCatalogueBooks().find(isPlainlyOrderable)!

const SUCCESS_TEXT = 'Votre commande a été enregistrée sur FlowDiff.'

/*
  Toutes les routes atteignables par un libraire connecté. La fiche produit et
  la page auteur prennent un identifiant du catalogue, pas une valeur écrite
  à la main.
*/
const ROUTES = [
  '/',
  '/a-paraitre',
  '/nouveautes',
  '/fonds',
  '/top-ventes',
  '/selections',
  '/flash-infos',
  '/compte',
  '/historique',
  '/facturation',
  '/parametres',
  '/edi',
  '/offices',
  '/contact',
  '/aide',
  '/cgv',
  '/panier',
  '/recherche?q=roman',
  `/livre/${BOOK.id}`,
] as const

/*
  Un écran qui déborde en largeur se traduit par une barre de défilement
  horizontale sur la page entière : le libraire doit balayer de côté pour lire
  une colonne, et le contenu sort du cadre. Un tableau large est en revanche
  légitime quand il défile DANS son propre cadre, ce que fait la facturation.

  1 px de tolérance pour les arrondis sous-pixel des mises en page fluides.
*/
async function expectNoHorizontalScroll(page: Page) {
  const { documentWidth, viewportWidth } = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }))

  expect(documentWidth, `la page déborde de ${documentWidth - viewportWidth} px`)
    .toBeLessThanOrEqual(viewportWidth + 1)
}

async function addToCart(page: Page, book: Book) {
  await page.goto(`/livre/${book.id}`)
  await page.locator('button[aria-label="Ajouter au panier"]').first().click()
}

function cartLine(page: Page, book: Book) {
  return page.locator('article, div').filter({ hasText: book.title }).last()
}

/* ────────────────────────────────────────────
   1. Mise en page : aucun débordement
──────────────────────────────────────────── */
test.describe('Mise en page', () => {
  for (const route of ROUTES) {
    test(`${route} tient dans la largeur du téléphone`, async ({ page }) => {
      const crashes = collectCrashes(page)
      await login(page)

      await page.goto(route)
      await expect(page.getByRole('heading').first()).toBeVisible()

      await expectNoHorizontalScroll(page)
      expect(crashes).toEqual([])
    })
  }

  // Le panier plein a une mise en page différente du panier vide.
  test('le panier rempli tient dans la largeur', async ({ page }) => {
    await login(page)
    await addToCart(page, BOOK)

    await page.goto('/panier')
    await expect(page.getByText('Total TTC')).toBeVisible()

    await expectNoHorizontalScroll(page)
  })

  /*
    Le tableau de la facturation est plus large qu'un téléphone, et c'est
    assumé : son cadre défile horizontalement. Ce qui ne doit pas déborder,
    c'est la page.
  */
  test('le tableau de facturation défile dans son cadre, pas dans la page', async ({ page }) => {
    await login(page)
    await page.goto('/facturation')
    await expect(page.getByRole('heading', { name: 'Facturation' })).toBeVisible()

    const tableOverflows = await page.locator('table').evaluate(table => {
      const frame = table.parentElement!
      return table.scrollWidth > frame.clientWidth
    })

    expect(tableOverflows).toBe(true)
    await expectNoHorizontalScroll(page)
  })
})

/* ────────────────────────────────────────────
   2. Tunnel de commande au téléphone
──────────────────────────────────────────── */
test.describe('Tunnel de commande', () => {
  /*
    Le flux le plus critique de l'application, jamais joué à cette largeur :
    les boutons d'une étape peuvent sortir de l'écran ou passer sous la bottom
    bar sans qu'aucun test de 1440 px ne le voie.
  */
  test('les étapes défilent jusqu\'à la confirmation', async ({ page }) => {
    const crashes = collectCrashes(page)
    await login(page)
    await addToCart(page, BOOK)
    await page.goto('/panier')

    await page.getByRole('button', { name: 'Valider la commande' }).click()

    for (const step of CHECKOUT_STEPS) {
      await expect(page.getByRole('list', { name: 'Étapes de la commande' })
        .locator('[aria-current="step"]'))
        .toHaveAttribute('aria-label', getStepLabel(step))
      await expectNoHorizontalScroll(page)

      if (step !== CHECKOUT_STEPS[CHECKOUT_STEPS.length - 1]) {
        await page.getByRole('button', { name: 'Vérifier ma commande' }).click()
      }
    }

    await page.getByRole('button', { name: 'Valider ma commande' }).click()

    await expect(page.getByText(SUCCESS_TEXT)).toBeVisible()
    await expectCartCount(page, 0)
    expect(crashes).toEqual([])
  })

  /*
    Sur un téléphone, le bouton de validation est sous la ligne de flottaison
    et on y descend : ce n'est pas un défaut. Le défaut serait qu'il arrive
    SOUS la bottom bar, qui est fixée en bas de l'écran. Un bouton recouvert
    reste visible et paraît cliquable, mais le doigt touche la barre.
  */
  test('le bouton de validation n\'est pas recouvert par la bottom bar', async ({ page }) => {
    await login(page)
    await addToCart(page, BOOK)
    await page.goto('/panier')

    const validate = page.getByRole('button', { name: 'Valider la commande' })
    await validate.scrollIntoViewIfNeeded()

    const button = await validate.boundingBox()
    const bar = await page.getByRole('navigation', { name: 'Navigation principale' }).boundingBox()
    expect(button).toBeTruthy()
    expect(bar).toBeTruthy()
    expect(button!.y + button!.height).toBeLessThanOrEqual(bar!.y)
  })

  /*
    Le clic de Playwright échoue si un autre élément intercepte le pointeur :
    dérouler le tunnel au doigt prouve donc qu'aucun bouton d'étape n'est
    recouvert.
  */
  test('chaque bouton d\'étape reçoit le clic', async ({ page }) => {
    await login(page)
    await addToCart(page, BOOK)
    await page.goto('/panier')

    await page.getByRole('button', { name: 'Valider la commande' }).click()
    await page.getByRole('button', { name: 'Vérifier ma commande' }).click()

    await expect(page.getByRole('button', { name: 'Valider ma commande' })).toBeVisible()
  })
})

/* ────────────────────────────────────────────
   3. Panier au téléphone
──────────────────────────────────────────── */
test.describe('Panier', () => {
  test('ajouter depuis une fiche met à jour le badge', async ({ page }) => {
    await login(page)

    await addToCart(page, BOOK)

    await expectCartCount(page, 1)
  })

  test('la quantité se modifie au téléphone', async ({ page }) => {
    await login(page)
    await addToCart(page, BOOK)
    await page.goto('/panier')

    await cartLine(page, BOOK).getByRole('button', { name: 'Augmenter' }).click()

    await expectCartCount(page, 2)
  })

  test('la suppression d\'une ligne se confirme au téléphone', async ({ page }) => {
    await login(page)
    await addToCart(page, BOOK)
    await page.goto('/panier')

    await page.getByRole('button', { name: `Supprimer ${BOOK.title}` }).click()
    await expect(page.getByText('Supprimer cet article ?')).toBeVisible()
    await expectNoHorizontalScroll(page)
    await page.getByRole('button', { name: 'Supprimer', exact: true }).click()

    await expect(page.getByText('Votre panier est vide')).toBeVisible()
  })
})

/* ────────────────────────────────────────────
   4. Menu burger
──────────────────────────────────────────── */
test.describe('Menu burger', () => {
  // L'identité de la librairie est en en-tête du menu, là où la sidebar la
  // porte en desktop.
  test('l\'en-tête du menu porte la librairie et son code client', async ({ page }) => {
    await login(page)

    await page.getByRole('button', { name: /[Mm]enu/ }).first().click()

    const menu = page.getByRole('dialog', { name: 'Menu principal' })
    await expect(menu.getByText(USER.nomLibrairie.trim())).toBeVisible()
    await expect(menu.getByText(`Code client : ${USER.codeClient}`)).toBeVisible()
  })

  test('le menu ouvert ne fait pas déborder la page', async ({ page }) => {
    await login(page)

    await page.getByRole('button', { name: /[Mm]enu/ }).first().click()
    await expect(page.getByRole('dialog', { name: 'Menu principal' })).toBeVisible()

    await expectNoHorizontalScroll(page)
  })
})
