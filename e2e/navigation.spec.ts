import { test, expect, type Page } from '@playwright/test'

/*
  Navigation desktop : on vérifie qu'un libraire peut circuler partout sans
  tomber sur un écran cassé, un lien mort ou un cul-de-sac. La logique métier
  est couverte par les tests unitaires, elle n'est pas rejouée ici.

  La navigation mobile (BottomNav, BurgerMenu) fait l'objet d'un lot séparé.
*/

test.use({ viewport: { width: 1440, height: 900 } })

/* ────────────────────────────────────────────
   Données et helpers
──────────────────────────────────────────── */

// Les 15 liens de la Sidebar, groupés comme dans Sidebar.tsx.
const SIDEBAR_LINKS = [
  { label: 'Accueil',        path: '/'            },
  { label: 'À paraître',     path: '/a-paraitre'  },
  { label: 'Nouveautés',     path: '/nouveautes'  },
  { label: 'Fonds',          path: '/fonds'       },
  { label: 'Top Ventes',     path: '/top-ventes'  },
  { label: 'Sélections',     path: '/selections'  },
  { label: 'Mon compte',     path: '/compte'      },
  { label: 'Mon historique', path: '/historique'  },
  { label: 'Facturation',    path: '/facturation' },
  { label: 'Paramètres',     path: '/parametres'  },
  { label: 'Transmissions',  path: '/edi'         },
  { label: 'Offices',        path: '/offices'     },
  { label: 'Contact',        path: '/contact'     },
  { label: 'Flash Infos',    path: '/flash-infos' },
  { label: 'Aide',           path: '/aide'        },
] as const

// Livre réel du catalogue, utilisé pour la recherche et la fiche produit.
const BOOK = {
  id:     'n-lit-01',
  isbn:   '9782258210271',
  author: 'Daoud',
} as const

// En démo, les identifiants sont pré-remplis : se connecter se réduit au clic.
async function login(page: Page) {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await page.locator('input[aria-label="Recherche globale"]').waitFor()
}

// Les exceptions JS non rattrapées sont le signe le plus net d'un écran cassé.
function collectCrashes(page: Page): string[] {
  const crashes: string[] = []
  page.on('pageerror', error => crashes.push(error.message))
  return crashes
}

// La page compte 2 <aside> : la sidebar et la bannière de démonstration.
// On identifie la sidebar par son nav Catalogue, qu'elle seule possède.
function sidebar(page: Page) {
  return page.locator('aside').filter({ has: page.locator('nav[aria-label="Catalogue"]') })
}

function sidebarLink(page: Page, label: string) {
  return sidebar(page).getByRole('link', { name: label, exact: true })
}

/* ────────────────────────────────────────────
   1. Connexion et accès protégé
──────────────────────────────────────────── */
test.describe('Connexion et accès protégé', () => {
  test('la connexion mène à l\'accueil', async ({ page }) => {
    await login(page)

    await expect(page).toHaveURL('/')
  })

  test('une route protégée renvoie vers la connexion, puis y revient une fois connecté', async ({ page }) => {
    await page.goto('/fonds')

    await expect(page).toHaveURL('/login')

    await page.getByRole('button', { name: 'Se connecter' }).click()

    await expect(page).toHaveURL('/fonds')
  })

  test('la déconnexion ramène à la connexion et reverrouille les routes protégées', async ({ page }) => {
    await login(page)

    await page.locator('aside').getByRole('button', { name: 'Se déconnecter' }).click()
    await page.getByRole('button', { name: 'Se déconnecter' }).last().click()

    await expect(page).toHaveURL('/login')

    await page.goto('/historique')

    await expect(page).toHaveURL('/login')
  })
})

/* ────────────────────────────────────────────
   2. Sidebar : les 15 liens
──────────────────────────────────────────── */
test.describe('Sidebar', () => {
  for (const { label, path } of SIDEBAR_LINKS) {
    test(`le lien ${label} ouvre ${path} sans planter`, async ({ page }) => {
      const crashes = collectCrashes(page)
      await login(page)

      await sidebarLink(page, label).click()

      await expect(page).toHaveURL(path)
      await expect(sidebar(page)).toBeVisible()
      await expect.soft(page.getByRole('heading').first()).toBeVisible()
      expect(crashes).toEqual([])
    })
  }

  test('les 15 liens restent atteignables depuis n\'importe quelle page', async ({ page }) => {
    await login(page)
    await sidebarLink(page, 'Offices').click()

    for (const { label } of SIDEBAR_LINKS) {
      await expect(sidebarLink(page, label)).toBeVisible()
    }
  })
})

/* ────────────────────────────────────────────
   3. Header : logo, recherche, panier
──────────────────────────────────────────── */
test.describe('Header', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  // Le logo du header est masqué en desktop (Header.tsx, LogoWrap) : la marque
  // vit dans la sidebar. C'est donc elle qui porte le retour à l'accueil.
  test('la marque de la sidebar ramène à l\'accueil', async ({ page }) => {
    await sidebarLink(page, 'Fonds').click()
    await expect(page).toHaveURL('/fonds')

    await sidebar(page).getByRole('link', { name: /FlowDiff/ }).click()

    await expect(page).toHaveURL('/')
  })

  test('une recherche par mot-clé ouvre la page de résultats', async ({ page }) => {
    await page.locator('input[aria-label="Recherche globale"]').fill(BOOK.author)
    await page.locator('input[aria-label="Recherche globale"]').press('Enter')

    await expect(page).toHaveURL(/\/recherche\?/)
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

/* ────────────────────────────────────────────
   4. Fiche produit : entrée et sortie
──────────────────────────────────────────── */
test.describe('Fiche produit', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  // La carte est cliquable à la souris, mais c'est le lien de son titre qui
  // porte la navigation et la rend atteignable au clavier.
  test('un livre d\'une liste ouvre sa fiche, et le retour ramène à la liste', async ({ page }) => {
    await sidebarLink(page, 'Fonds').click()
    await page.locator('article a[href^="/livre/"]').first().click()

    await expect(page).toHaveURL(/\/livre\//)

    await page.goBack()

    await expect(page).toHaveURL('/fonds')
  })

  test('la fiche mène à la page de l\'auteur', async ({ page }) => {
    await page.goto(`/livre/${BOOK.id}`)

    await page.getByRole('button', { name: /Voir tous les ouvrages de/ }).click()

    await expect(page).toHaveURL(/\/auteur\//)
  })
})

/* ────────────────────────────────────────────
   5. Sélections : entrée et sortie
──────────────────────────────────────────── */
test.describe('Sélections', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('ouvrir une sélection change l\'URL, et le retour navigateur ramène à la liste', async ({ page }) => {
    await sidebarLink(page, 'Sélections').click()
    await page.locator('[aria-label^="Voir la sélection"]').first().click()

    await expect(page).toHaveURL(/\/selections\/.+/)

    await page.goBack()

    await expect(page).toHaveURL('/selections')
  })
})

/* ────────────────────────────────────────────
   6. Footer et URL inconnue
──────────────────────────────────────────── */
test.describe('Footer et routes inconnues', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('le lien CGV du footer ouvre les conditions générales', async ({ page }) => {
    await page.getByRole('link', { name: 'CGV' }).click()

    await expect(page).toHaveURL('/cgv')
  })

  test('une URL inconnue redirige vers l\'accueil', async ({ page }) => {
    await page.goto('/cette-page-nexiste-pas')

    await expect(page).toHaveURL('/')
  })
})
