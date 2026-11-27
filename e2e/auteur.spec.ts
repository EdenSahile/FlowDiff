import { test, expect } from '@playwright/test'
import { getCatalogueBooks, type Book } from '../src/data/mockBooks'
import { slugifyAuthor } from '../src/lib/slugify'
import { collectCrashes, login } from './helpers'

/*
  Page auteur : tous les titres d'un auteur présents au catalogue, du plus
  récent au plus ancien (AuteurPage).

  L'auteur de référence est choisi dans les données, pas nommé ici : le test
  prend celui qui a le plus de titres, ce qui garantit que le tri a quelque
  chose à trier.
*/

test.use({ viewport: { width: 1440, height: 900 } })

function booksByAuthorSlug(): Map<string, Book[]> {
  const index = new Map<string, Book[]>()
  for (const book of getCatalogueBooks()) {
    for (const author of book.authors) {
      const slug = slugifyAuthor(author)
      index.set(slug, [...(index.get(slug) ?? []), book])
    }
  }
  return index
}

const [SLUG, AUTHOR_BOOKS] = [...booksByAuthorSlug().entries()]
  .sort(([, a], [, b]) => b.length - a.length)[0]

// Même tri que la page : publication décroissante.
const SORTED = [...AUTHOR_BOOKS].sort((a, b) => b.publicationDate.localeCompare(a.publicationDate))
const AUTHOR_NAME = SORTED[0].authors.find(author => slugifyAuthor(author) === SLUG)!

test.beforeEach(async ({ page }) => {
  await login(page)
})

/* ────────────────────────────────────────────
   1. Fiche de l'auteur
──────────────────────────────────────────── */
test.describe('Fiche de l\'auteur', () => {
  test('affiche le nom et le nombre de titres au catalogue', async ({ page }) => {
    await page.goto(`/auteur/${SLUG}`)

    const plural = AUTHOR_BOOKS.length > 1 ? 'titres' : 'titre'
    await expect(page.getByText(AUTHOR_NAME, { exact: true }).first()).toBeVisible()
    await expect(page.getByText(`${AUTHOR_BOOKS.length} ${plural} dans notre catalogue`)).toBeVisible()
  })

  test('affiche une carte par titre de l\'auteur', async ({ page }) => {
    await page.goto(`/auteur/${SLUG}`)

    await expect(page.locator('article')).toHaveCount(AUTHOR_BOOKS.length)
  })

  test('classe les titres du plus récent au plus ancien', async ({ page }) => {
    await page.goto(`/auteur/${SLUG}`)

    await expect(page.locator('article a[href^="/livre/"]').first())
      .toHaveAttribute('href', `/livre/${SORTED[0].id}`)
    await expect(page.locator('article a[href^="/livre/"]').last())
      .toHaveAttribute('href', `/livre/${SORTED[SORTED.length - 1].id}`)
  })

  test('l\'avatar porte les initiales de l\'auteur', async ({ page }) => {
    await page.goto(`/auteur/${SLUG}`)

    const initials = AUTHOR_NAME.split(' ').map(word => word[0]).slice(0, 2).join('').toUpperCase()

    await expect(page.getByText(initials, { exact: true }).first()).toBeVisible()
  })
})

/* ────────────────────────────────────────────
   2. Entrée et sortie
──────────────────────────────────────────── */
test.describe('Entrée et sortie', () => {
  test('la fiche produit mène à la page de son auteur', async ({ page }) => {
    const crashes = collectCrashes(page)

    await page.goto(`/livre/${SORTED[0].id}`)
    await page.getByRole('button', { name: /Voir tous les ouvrages de/ }).click()

    await expect(page).toHaveURL(/\/auteur\//)
    expect(crashes).toEqual([])
  })

  test('une carte de la page auteur ouvre sa fiche produit', async ({ page }) => {
    await page.goto(`/auteur/${SLUG}`)

    await page.locator('article a[href^="/livre/"]').first().click()

    await expect(page).toHaveURL(`/livre/${SORTED[0].id}`)
  })

  /*
    Le bouton de retour n'apparaît que si l'historique a une page précédente
    (AuteurPage, canGoBack) : un accès direct par l'URL n'en a pas.
  */
  test('le retour n\'apparaît qu\'après une navigation interne', async ({ page }) => {
    await page.goto(`/auteur/${SLUG}`)
    await expect(page.getByRole('button', { name: '← Retour' })).toHaveCount(0)

    await page.goto(`/livre/${SORTED[0].id}`)
    await page.getByRole('button', { name: /Voir tous les ouvrages de/ }).click()

    await expect(page.getByRole('button', { name: '← Retour' })).toBeVisible()
  })

  test('le retour ramène à la fiche d\'où l\'on vient', async ({ page }) => {
    await page.goto(`/livre/${SORTED[0].id}`)
    await page.getByRole('button', { name: /Voir tous les ouvrages de/ }).click()
    await expect(page).toHaveURL(/\/auteur\//)

    await page.getByRole('button', { name: '← Retour' }).click()

    await expect(page).toHaveURL(`/livre/${SORTED[0].id}`)
  })
})

/* ────────────────────────────────────────────
   3. Auteur inconnu
──────────────────────────────────────────── */
test.describe('Auteur inconnu', () => {
  /*
    Un slug qui ne correspond à personne ne redirige pas : la page s'affiche
    avec le slug en guise de nom et un état vide. C'est voulu, une URL
    partagée ne doit pas atterrir ailleurs sans explication.
  */
  test('affiche un état vide sans rediriger', async ({ page }) => {
    const crashes = collectCrashes(page)

    await page.goto('/auteur/auteur-qui-nexiste-pas')

    await expect(page).toHaveURL('/auteur/auteur-qui-nexiste-pas')
    await expect(page.getByText('Aucun titre trouvé')).toBeVisible()
    await expect(page.getByText('Cet auteur n\'a pas de parution dans notre catalogue.')).toBeVisible()
    await expect(page.locator('article')).toHaveCount(0)
    expect(crashes).toEqual([])
  })

  test('n\'annonce aucun compte de titres', async ({ page }) => {
    await page.goto('/auteur/auteur-qui-nexiste-pas')

    await expect(page.getByText(/dans notre catalogue/)).toHaveCount(0)
  })
})
