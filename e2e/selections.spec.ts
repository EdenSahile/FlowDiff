import { test, expect, type Page } from '@playwright/test'
import { MOCK_SERIES, type Serie } from '../src/data/mockSeries'
import { UNIVERSES } from '../src/data/mockBooks'
import { collectCrashes, login, sidebarLink } from './helpers'

/*
  Page Sélections : des sélections éditoriales groupées par catégorie, dont
  certaines portent une opération commerciale.

  Les catégories, les comptes et les sélections en offre se calculent depuis
  MOCK_SERIES. L'ouverture d'une sélection est déjà couverte par
  navigation.spec.ts ; ce fichier couvre les filtres, la recherche et
  l'indicateur d'offre, qui ne l'étaient pas.
*/

test.use({ viewport: { width: 1440, height: 900 } })

const CATEGORIES = [...new Set(MOCK_SERIES.map(serie => serie.categorie))]
const WITH_OFFER = MOCK_SERIES.filter(serie => serie.isOffreSpeciale)
const PRIZED = MOCK_SERIES.filter(serie => serie.isPrixLitteraire)

const SERIE = MOCK_SERIES[0]

const seriesOfUniverse = (universe: string) =>
  MOCK_SERIES.filter(serie => serie.univers === universe)

function tile(page: Page, serie: Serie) {
  return page.getByRole('button', { name: `Voir la sélection ${serie.nom}` })
}

function tiles(page: Page) {
  return page.locator('[aria-label^="Voir la sélection"]')
}

function filterPill(page: Page, label: string) {
  return page.getByRole('group', { name: 'Filtres' }).getByRole('button', { name: label, exact: true })
}

test.beforeEach(async ({ page }) => {
  await login(page)
  await sidebarLink(page, 'Sélections').click()
  await expect(page.getByRole('heading', { name: 'Sélections' })).toBeVisible()
})

/* ────────────────────────────────────────────
   1. Affichage
──────────────────────────────────────────── */
test.describe('Affichage', () => {
  test('affiche toutes les sélections du catalogue', async ({ page }) => {
    await expect(tiles(page)).toHaveCount(MOCK_SERIES.length)
  })

  test('groupe les sélections par catégorie, avec leur compte', async ({ page }) => {
    for (const categorie of CATEGORIES) {
      const count = MOCK_SERIES.filter(serie => serie.categorie === categorie).length
      const plural = count > 1 ? 'sélections' : 'sélection'

      // Le nom d'une catégorie est aussi celui d'une pastille de filtre :
      // c'est le titre de section, un h2, qui est visé ici.
      await expect(page.getByRole('heading', { name: categorie, level: 2 })).toBeVisible()
      await expect(page.getByText(`${count} ${plural}`).first()).toBeVisible()
    }
  })

  test('chaque sélection est atteignable par son nom', async ({ page }) => {
    for (const serie of MOCK_SERIES) {
      await expect(tile(page, serie)).toBeVisible()
    }
  })
})

/* ────────────────────────────────────────────
   2. Filtre par thématique
──────────────────────────────────────────── */
test.describe('Filtre par thématique', () => {
  for (const universe of UNIVERSES) {
    test(`le filtre ${universe} ne garde que ses sélections`, async ({ page }) => {
      const expected = seriesOfUniverse(universe)

      await filterPill(page, universe).click()

      await expect(tiles(page)).toHaveCount(expected.length)
      for (const serie of expected) {
        await expect(tile(page, serie)).toBeVisible()
      }
    })
  }

  test('revenir sur Tous réaffiche toutes les sélections', async ({ page }) => {
    await filterPill(page, UNIVERSES[0]).click()
    await expect(tiles(page)).not.toHaveCount(MOCK_SERIES.length)

    await filterPill(page, 'Tous').click()

    await expect(tiles(page)).toHaveCount(MOCK_SERIES.length)
  })

  test('le filtre Prix littéraire ne garde que les sélections primées', async ({ page }) => {
    await filterPill(page, 'Prix littéraire').click()

    await expect(tiles(page)).toHaveCount(PRIZED.length)
    for (const serie of PRIZED) {
      await expect(tile(page, serie)).toBeVisible()
    }
  })
})

/* ────────────────────────────────────────────
   3. Filtre des opérations commerciales
──────────────────────────────────────────── */
test.describe('Opérations commerciales', () => {
  /*
    L'indicateur d'offre est le point vert de la charte : il signale au
    libraire qu'une sélection porte une opération commerciale, donc une
    contrepartie à relayer en magasin.
  */
  test('le filtre OP commerciale ne garde que les sélections en offre', async ({ page }) => {
    await filterPill(page, 'OP commerciale').click()

    await expect(tiles(page)).toHaveCount(WITH_OFFER.length)
    for (const serie of WITH_OFFER) {
      await expect(tile(page, serie)).toBeVisible()
    }
  })

  test('les sélections sans offre disparaissent du filtre', async ({ page }) => {
    const withoutOffer = MOCK_SERIES.filter(serie => !serie.isOffreSpeciale)
    test.skip(withoutOffer.length === 0, 'Toutes les sélections portent une offre.')

    await filterPill(page, 'OP commerciale').click()

    for (const serie of withoutOffer) {
      await expect(tile(page, serie)).toHaveCount(0)
    }
  })

  test('le filtre se désactive au second clic', async ({ page }) => {
    await filterPill(page, 'OP commerciale').click()
    await expect(tiles(page)).toHaveCount(WITH_OFFER.length)

    await filterPill(page, 'OP commerciale').click()

    await expect(tiles(page)).toHaveCount(MOCK_SERIES.length)
  })
})

/* ────────────────────────────────────────────
   4. Recherche
──────────────────────────────────────────── */
test.describe('Recherche', () => {
  test('une recherche sans résultat affiche le message vide', async ({ page }) => {
    await page.getByPlaceholder('Rechercher par titre, auteur ou ISBN…').fill('zzzzzzz')

    await expect(page.getByText('Aucune sélection pour ce filtre.')).toBeVisible()
    await expect(tiles(page)).toHaveCount(0)
  })

  test('le bouton d\'effacement rétablit toutes les sélections', async ({ page }) => {
    await page.getByPlaceholder('Rechercher par titre, auteur ou ISBN…').fill('zzzzzzz')
    await expect(tiles(page)).toHaveCount(0)

    await page.getByRole('button', { name: 'Effacer' }).click()

    await expect(tiles(page)).toHaveCount(MOCK_SERIES.length)
  })
})

/* ────────────────────────────────────────────
   5. Ouverture d'une sélection
──────────────────────────────────────────── */
test.describe('Ouverture d\'une sélection', () => {
  test('une vignette ouvre sa sélection, et le retour ramène à la liste', async ({ page }) => {
    const crashes = collectCrashes(page)

    await tile(page, SERIE).click()

    await expect(page).toHaveURL(`/selections/${SERIE.id}`)

    await page.goBack()

    await expect(page).toHaveURL('/selections')
    expect(crashes).toEqual([])
  })

  test('une sélection en offre annonce son opération commerciale', async ({ page }) => {
    const withOffer = WITH_OFFER[0]
    test.skip(!withOffer, 'Aucune sélection ne porte d\'offre.')

    await tile(page, withOffer).click()

    await expect(page).toHaveURL(`/selections/${withOffer.id}`)
    await expect(page.getByText(withOffer.offreCommerciale!.titre)).toBeVisible()
  })
})
