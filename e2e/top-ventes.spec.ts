import { test, expect, type Page } from '@playwright/test'
import { getCatalogueBooks, UNIVERSES, type Universe } from '../src/data/mockBooks'
import { getPurchaseAvailability } from '../src/lib/bookUtils'
import { collectCrashes, expectCartCount, login, sidebarLink } from './helpers'

/*
  Page Top Ventes : 2 classements, nouveautés et fonds, par thématique.

  Le tableau des ventes qui donne le classement (SALES) est privé au module de
  la page : on ne peut donc pas prédire l'ordre depuis l'extérieur, et ce
  fichier ne l'essaie pas. Il vérifie ce qui est vérifiable du dehors : la
  structure du podium, le fait qu'un onglet de thématique ne laisse que des
  titres de cette thématique, et l'ajout au panier depuis une ligne du
  classement.

  L'appartenance d'un titre à un univers se lit dans getCatalogueBooks, pas
  recopiée ici.
*/

test.use({ viewport: { width: 1440, height: 900 } })

const CATALOGUE = new Map(getCatalogueBooks().map(book => [book.id, book]))

// Identifiant du titre derrière une carte, en suivant le lien de son titre.
async function shownBookIds(page: Page): Promise<string[]> {
  const hrefs = await page.locator('article a[href^="/livre/"]')
    .evaluateAll(links => links.map(link => link.getAttribute('href') ?? ''))
  return hrefs.map(href => href.replace('/livre/', ''))
}

function tab(page: Page, label: string) {
  return page.getByRole('button', { name: label, exact: true })
}

test.beforeEach(async ({ page }) => {
  await login(page)
  await sidebarLink(page, 'Top Ventes').click()
  await expect(page.getByRole('heading', { name: 'Top Ventes' })).toBeVisible()
})

/* ────────────────────────────────────────────
   1. Structure des classements
──────────────────────────────────────────── */
test.describe('Classements', () => {
  test('affiche les 2 classements, nouveautés et fonds', async ({ page }) => {
    await expect(page.getByText('Top Nouveautés')).toBeVisible()
    await expect(page.getByText('Top Fonds')).toBeVisible()
  })

  /*
    Les 2 classements doivent porter des titres, pas seulement leur libellé.
    Un classement vide est exactement la panne qui est passée inaperçue : la
    table des ventes désignait des titres écrits comme nouveautés, et le type
    d'un titre se déduisant de sa date de parution, ils sont tous devenus du
    fonds. Le libellé « Top Nouveautés » restait affiché au-dessus de
    « Aucune donnée disponible ».

    L'attendu se calcule depuis le catalogue : un classement montre en podium
    autant de titres que son type en compte, dans la limite de 3.
  */
  for (const [label, type] of [['Top Nouveautés', 'nouveaute'], ['Top Fonds', 'fonds']] as const) {
    test(`${label} montre des titres, pas seulement son libellé`, async ({ page }) => {
      const available = getCatalogueBooks().filter(book => book.type === type).length
      const expectedPodium = Math.min(available, 3)
      expect(expectedPodium).toBeGreaterThan(0)

      const section = page.locator('section').filter({
        has: page.getByRole('heading', { name: label, level: 2 }),
      })

      await expect(section.getByText('Aucune donnée disponible')).toHaveCount(0)
      await expect(section.locator('article')).toHaveCount(expectedPodium)
    })
  }

  // Le podium porte les 3 premiers rangs en badge, le reste en liste compacte.
  test('chaque classement porte un podium de 3 rangs', async ({ page }) => {
    for (const rank of [1, 2, 3]) {
      await expect(page.getByText(String(rank), { exact: true }).first()).toBeVisible()
    }
    await expect(page.getByText('TOP').first()).toBeVisible()
  })

  test('annonce le volume vendu sur le réseau', async ({ page }) => {
    await expect(page.getByText(/ex\. vendus \(30j réseau\)/).first()).toBeVisible()
  })

  test('s\'ouvre sans erreur JS', async ({ page }) => {
    const crashes = collectCrashes(page)

    await page.reload()

    await expect(page.getByText('Top Nouveautés')).toBeVisible()
    expect(crashes).toEqual([])
  })
})

/* ────────────────────────────────────────────
   2. Filtre par thématique
──────────────────────────────────────────── */
test.describe('Filtre par thématique', () => {
  for (const universe of UNIVERSES) {
    test(`l'onglet ${universe} ne laisse que des titres de cette thématique`, async ({ page }) => {
      await tab(page, universe).click()

      const ids = await shownBookIds(page)
      expect(ids.length).toBeGreaterThan(0)
      for (const id of ids) {
        expect(CATALOGUE.get(id)?.universe).toBe(universe)
      }
    })
  }

  test('l\'onglet Tous mélange les thématiques', async ({ page }) => {
    await tab(page, 'Tous').click()

    const universes = new Set(
      (await shownBookIds(page))
        .map(id => CATALOGUE.get(id)?.universe)
        .filter((u): u is Universe => !!u),
    )

    expect(universes.size).toBeGreaterThan(1)
  })

})

/* ────────────────────────────────────────────
   3. Période annoncée, non sélectionnable
──────────────────────────────────────────── */
test.describe('Période', () => {
  /*
    La page portait 2 boutons, « 30 jours » et « 3 mois », qui ne changeaient
    que leur propre surbrillance : l'état period était déclaré avec un
    eslint-disable pour variable inutilisée et n'était jamais lu, et le
    sous-titre des sections écrivait « 30j réseau » quoi qu'on clique.

    Un contrôle qui ne fait rien est pire que pas de contrôle : le premier
    réflexe devant un classement est de cliquer sur la période, et il n'en
    sort rien. Les chiffres portent une seule période, la page le dit en une
    phrase. Une vraie sélection demanderait d'inventer un second jeu de
    chiffres de ventes.
  */
  test('la période est annoncée en clair', async ({ page }) => {
    await expect(page.getByText('Ventes des 30 derniers jours sur le réseau')).toBeVisible()
  })

  test('aucun sélecteur de période ne subsiste', async ({ page }) => {
    await expect(page.getByRole('button', { name: '30 jours' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: '3 mois' })).toHaveCount(0)
  })
})

/* ────────────────────────────────────────────
   4. Commande depuis le classement
──────────────────────────────────────────── */
test.describe('Commande depuis le classement', () => {
  /*
    Le titre visé est choisi parmi ceux réellement affichés, et seulement s'il
    est commandable sans confirmation : un titre à paraître ou en commande
    spéciale ouvrirait une modale au lieu d'aller au panier, et le test
    mesurerait alors autre chose.
  */
  test('une carte du classement s\'ajoute au panier', async ({ page }) => {
    const target = (await shownBookIds(page)).find(id => {
      const book = CATALOGUE.get(id)
      if (!book) return false
      const availability = getPurchaseAvailability(book.type, book.statut)
      return availability.canAddToCart && !availability.isAParaitre && !availability.needsConfirm
    })
    expect(target).toBeTruthy()
    await expectCartCount(page, 0)

    const card = page.locator('article').filter({ has: page.locator(`a[href="/livre/${target}"]`) })
    await card.locator('button[aria-label="Ajouter au panier"]').first().click()

    await expectCartCount(page, 1)
  })

  /*
    Les rangs 4 à 10 sont rendus en lignes compactes, hors des cartes, avec
    leur propre bouton d'ajout : c'est le seul endroit de l'application où
    l'ajout au panier ne passe pas par une carte de catalogue.
  */
  test('les rangs suivants portent aussi un bouton d\'ajout', async ({ page }) => {
    const podiumButtons = await page.locator('article button[aria-label="Ajouter au panier"]').count()
    const allButtons = await page.locator('button[aria-label="Ajouter au panier"]').count()

    expect(allButtons).toBeGreaterThan(podiumButtons)
  })

  test('une carte du podium ouvre la fiche de son titre', async ({ page }) => {
    const ids = await shownBookIds(page)

    await page.locator('article a[href^="/livre/"]').first().click()

    await expect(page).toHaveURL(`/livre/${ids[0]}`)
  })
})
