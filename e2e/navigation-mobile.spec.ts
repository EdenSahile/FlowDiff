import { test, expect, type Page } from '@playwright/test'

/*
  Navigation mobile : même objectif que navigation.spec.ts, circuler partout
  sans écran cassé ni cul-de-sac, mais par les points d'entrée mobiles.

  Sous 768px (theme.breakpoints.mobile), la sidebar disparaît et la navigation
  passe par la bottom bar, le menu burger et le logo du header.
*/

test.use({ viewport: { width: 390, height: 844 } })

/* ────────────────────────────────────────────
   Données et helpers
──────────────────────────────────────────── */

// Les 5 onglets de la bottom bar.
const BOTTOM_NAV_TABS = [
  { label: 'Accueil',    path: '/'           },
  { label: 'À paraître', path: '/a-paraitre' },
  { label: 'Nouveautés', path: '/nouveautes' },
  { label: 'Fonds',      path: '/fonds'      },
  { label: 'Sélections', path: '/selections' },
] as const

// Les 11 liens de navigation du menu burger. Le libellé diffère parfois de
// celui de la sidebar pour une même route : EDI ici, Transmissions en desktop.
const BURGER_LINKS = [
  { label: 'Top Ventes',     path: '/top-ventes'  },
  { label: 'Mon compte',     path: '/compte'      },
  { label: 'Mon historique', path: '/historique'  },
  { label: 'Facturation',    path: '/facturation' },
  { label: 'EDI',            path: '/edi'         },
  { label: 'Offices',        path: '/offices'     },
  { label: 'Contact',        path: '/contact'     },
  { label: 'Flash Infos',    path: '/flash-infos' },
  { label: 'Paramètres',     path: '/parametres'  },
  { label: 'Aide',           path: '/aide'        },
  { label: 'CGV',            path: '/cgv'         },
] as const

const BOOK = {
  id:   'n-lit-01',
  isbn: '9782258210271',
} as const

async function login(page: Page) {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await page.locator('input[aria-label="Recherche globale"]').waitFor()
}

function collectCrashes(page: Page): string[] {
  const crashes: string[] = []
  page.on('pageerror', error => crashes.push(error.message))
  return crashes
}

function bottomNav(page: Page) {
  return page.getByRole('navigation', { name: 'Navigation principale' })
}

function burgerPanel(page: Page) {
  return page.getByRole('dialog', { name: 'Menu principal' })
}

async function openBurger(page: Page) {
  await page.getByRole('button', { name: 'Ouvrir le menu' }).click()
  await expect(burgerPanel(page).getByRole('button', { name: 'Se déconnecter' })).toBeVisible()
}

/* ────────────────────────────────────────────
   1. Structure mobile
──────────────────────────────────────────── */
test.describe('Structure mobile', () => {
  test('la sidebar est masquée et la bottom bar visible', async ({ page }) => {
    await login(page)

    const sidebar = page.locator('aside').filter({ has: page.locator('nav[aria-label="Catalogue"]') })

    await expect(sidebar).toBeHidden()
    await expect(bottomNav(page)).toBeVisible()
  })

  test('les 5 onglets de la bottom bar sont présents', async ({ page }) => {
    await login(page)

    for (const { label } of BOTTOM_NAV_TABS) {
      await expect(bottomNav(page).getByRole('link', { name: label, exact: true })).toBeVisible()
    }
  })
})

/* ────────────────────────────────────────────
   2. Bottom bar : les 5 onglets
──────────────────────────────────────────── */
test.describe('Bottom bar', () => {
  for (const { label, path } of BOTTOM_NAV_TABS) {
    test(`l'onglet ${label} ouvre ${path} sans planter`, async ({ page }) => {
      const crashes = collectCrashes(page)
      await login(page)

      await bottomNav(page).getByRole('link', { name: label, exact: true }).click()

      await expect(page).toHaveURL(path)
      await expect(bottomNav(page)).toBeVisible()
      await expect.soft(page.getByRole('heading').first()).toBeVisible()
      expect(crashes).toEqual([])
    })
  }
})

/* ────────────────────────────────────────────
   3. Menu burger
──────────────────────────────────────────── */
test.describe('Menu burger', () => {
  test('le menu s\'ouvre et se ferme', async ({ page }) => {
    await login(page)

    await openBurger(page)
    await page.getByRole('button', { name: 'Fermer le menu' }).click()

    await expect(burgerPanel(page).getByRole('button', { name: 'Se déconnecter' })).toBeHidden()
  })

  for (const { label, path } of BURGER_LINKS) {
    test(`le lien ${label} ouvre ${path} sans planter`, async ({ page }) => {
      const crashes = collectCrashes(page)
      await login(page)
      await openBurger(page)

      await burgerPanel(page).getByRole('button', { name: label, exact: true }).click()

      await expect(page).toHaveURL(path)
      await expect.soft(page.getByRole('heading').first()).toBeVisible()
      expect(crashes).toEqual([])
    })
  }

  test('la déconnexion ramène à la connexion et reverrouille les routes protégées', async ({ page }) => {
    await login(page)
    await openBurger(page)

    await burgerPanel(page).getByRole('button', { name: 'Se déconnecter' }).click()
    await page.getByRole('button', { name: 'Se déconnecter' }).last().click()

    await expect(page).toHaveURL('/login')

    await page.goto('/historique')

    await expect(page).toHaveURL('/login')
  })
})

/* ────────────────────────────────────────────
   4. Header mobile
──────────────────────────────────────────── */
test.describe('Header mobile', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  // Contrairement au desktop, le logo du header est visible en mobile.
  test('le logo ramène à l\'accueil', async ({ page }) => {
    await bottomNav(page).getByRole('link', { name: 'Fonds', exact: true }).click()
    await expect(page).toHaveURL('/fonds')

    await page.locator('header').getByRole('link').first().click()

    await expect(page).toHaveURL('/')
  })

  test('une recherche par ISBN exact ouvre directement la fiche produit', async ({ page }) => {
    await page.locator('input[aria-label="Recherche globale"]').fill(BOOK.isbn)
    await page.locator('input[aria-label="Recherche globale"]').press('Enter')

    await expect(page).toHaveURL(`/livre/${BOOK.id}`)
  })

  test('le panier est accessible depuis le header', async ({ page }) => {
    await page.getByRole('button', { name: /^Panier/ }).click()

    await expect(page).toHaveURL('/panier')
  })
})
