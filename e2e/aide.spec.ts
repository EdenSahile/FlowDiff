import { test, expect } from '@playwright/test'
import { collectCrashes, login, pageMain, sidebarLink } from './helpers'

/*
  Page Aide : un contenu statique, 4 sections d'explications.

  Il n'y a ni formulaire ni appel : ce qui peut casser ici, c'est le contenu
  qui disparaît ou une page qui ne s'affiche plus. Ces tests vérifient la
  présence des 4 sections et de leurs entrées, en se limitant à ce qui est
  vraiment porteur de sens pour un libraire.
*/

test.use({ viewport: { width: 1440, height: 900 } })

const SECTIONS = [
  {
    title: 'Rechercher un livre',
    // « Par ISBN / EAN » porte un badge « Rapide » dans le même élément.
    items: ['Par titre, auteur ou éditeur', 'Par ISBN / EAN'],
  },
  {
    title: 'Passer une commande',
    items: ['Ajouter au panier', 'Valider la commande', 'Remises automatiques'],
  },
  {
    title: 'Mon historique',
    items: ['Retrouver une commande', 'Dupliquer en 1 clic'],
  },
  {
    title: 'Besoin d\'aide supplémentaire ?',
    items: ['Contacter le support'],
  },
] as const

test.beforeEach(async ({ page }) => {
  await login(page)
  await sidebarLink(page, 'Aide').click()
  await expect(page.getByRole('heading', { name: 'Aide' })).toBeVisible()
})

test.describe('Contenu', () => {
  test('affiche le titre et le sous-titre', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Aide' })).toBeVisible()
    await expect(page.getByText('Découvrez comment utiliser FlowDiff au quotidien.')).toBeVisible()
  })

  for (const { title, items } of SECTIONS) {
    test(`la section « ${title} » et ses ${items.length} entrées sont présentes`, async ({ page }) => {
      // Plusieurs de ces libellés sont aussi des liens de la sidebar.
      await expect(pageMain(page).getByText(title, { exact: true })).toBeVisible()

      for (const item of items) {
        await expect(pageMain(page).getByText(item).first()).toBeVisible()
      }
    })
  }

  test('la recherche par ISBN est signalée comme rapide', async ({ page }) => {
    await expect(pageMain(page).getByText('Rapide', { exact: true })).toBeVisible()
  })

  // L'aide renvoie vers Contact : la page nomme le chemin, sans lien cliquable.
  test('oriente vers la page Contact pour le support', async ({ page }) => {
    await expect(page.getByText(/menu → "Contact"/)).toBeVisible()
  })
})

test.describe('Affichage', () => {
  test('la page s\'ouvre sans erreur JS et reste dans la navigation', async ({ page }) => {
    const crashes = collectCrashes(page)
    await page.reload()

    await expect(page.getByRole('heading', { name: 'Aide' })).toBeVisible()
    await expect(sidebarLink(page, 'Aide')).toBeVisible()
    expect(crashes).toEqual([])
  })
})
