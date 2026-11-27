import { test, expect } from '@playwright/test'
import { CURRENT_OFFICE } from '../src/data/mockOffices'
import { collectCrashes, login, pageMain, sidebarLink } from './helpers'

/*
  Page Offices.

  ⚠️ La page servie par la route /offices n'est PAS le bordereau d'office :
  c'est un écran « Bientôt disponible ». Le bordereau complet existe dans le
  même fichier sous le nom OfficesPageFull, mais App.tsx route OfficesPage,
  et rien ne rend OfficesPageFull. Son code est donc présent, compilé, et
  inatteignable.

  Ces tests fixent ce qui est réellement servi, plus 2 garde-fous :
  la section reste atteignable par la navigation, et aucune donnée du
  bordereau ne fuit sur l'écran d'attente. Le jour où le bordereau est
  branché, ces 2 derniers tests tombent, et c'est le signal attendu.
*/

test.use({ viewport: { width: 1440, height: 900 } })

test.beforeEach(async ({ page }) => {
  await login(page)
  await sidebarLink(page, 'Offices').click()
  await expect(page).toHaveURL('/offices')
})

/* ────────────────────────────────────────────
   1. Écran d'attente
──────────────────────────────────────────── */
test.describe('Écran d\'attente', () => {
  test('annonce une section à venir', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Bientôt disponible' })).toBeVisible()
    await expect(page.getByText('La gestion de vos offices arrive prochainement')).toBeVisible()
  })

  test('s\'ouvre sans erreur JS', async ({ page }) => {
    const crashes = collectCrashes(page)

    await page.reload()

    await expect(page.getByRole('heading', { name: 'Bientôt disponible' })).toBeVisible()
    expect(crashes).toEqual([])
  })

  test('offre un retour en arrière', async ({ page }) => {
    await expect(pageMain(page).getByRole('button', { name: /Retour/ })).toBeVisible()
  })
})

/* ────────────────────────────────────────────
   2. Place dans la navigation
──────────────────────────────────────────── */
test.describe('Navigation', () => {
  test('la section reste listée dans la sidebar et atteignable', async ({ page }) => {
    await expect(sidebarLink(page, 'Offices')).toBeVisible()

    await sidebarLink(page, 'Accueil').click()
    await expect(page).toHaveURL('/')

    await sidebarLink(page, 'Offices').click()

    await expect(page).toHaveURL('/offices')
    await expect(page.getByRole('heading', { name: 'Bientôt disponible' })).toBeVisible()
  })
})

/* ────────────────────────────────────────────
   3. Aucune fuite du bordereau non branché
──────────────────────────────────────────── */
test.describe('Bordereau non branché', () => {
  /*
    OfficesPageFull n'est pas routé : ni le libellé de l'office, ni ses
    titres, ni ses actions ne doivent apparaître. Si l'un d'eux surgit, c'est
    que le bordereau a été branché et que les tests du bordereau sont à
    écrire.
  */
  test('n\'affiche ni l\'office en cours ni ses titres', async ({ page }) => {
    await expect(page.getByText(CURRENT_OFFICE.label)).toHaveCount(0)
    await expect(page.getByText(CURRENT_OFFICE.books[0].title)).toHaveCount(0)
  })

  test('n\'offre aucune action de bordereau', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Valider mon office' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Exporter office' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /de l'office$/ })).toHaveCount(0)
  })
})
