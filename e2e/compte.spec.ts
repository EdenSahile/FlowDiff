import { test, expect } from '@playwright/test'
import { MOCK_USERS } from '../src/lib/mockUsers'
import { collectCrashes, DEMO_CODE_CLIENT, login, pageMain, sidebarLink } from './helpers'

/*
  Page Mon compte : la fiche du compte connecté, en lecture seule.

  Toutes les valeurs attendues viennent de MOCK_USERS, la source que
  AuthContext sert à la page. Changer les remises ou l'adresse du compte de
  démonstration ne doit pas faire tomber la suite.
*/

test.use({ viewport: { width: 1440, height: 900 } })

const USER = MOCK_USERS.find(u => u.codeClient === DEMO_CODE_CLIENT)!
const REMISES = Object.entries(USER.remisesParUnivers)

test.beforeEach(async ({ page }) => {
  await login(page)
  await sidebarLink(page, 'Mon compte').click()
  await expect(page.getByRole('heading', { name: 'Mon compte' })).toBeVisible()
})

/* ────────────────────────────────────────────
   1. Identité de la librairie
──────────────────────────────────────────── */
test.describe('Identité', () => {
  test('affiche le nom de la librairie et son code client', async ({ page }) => {
    // Le nom de la librairie figure aussi dans la sidebar : on reste dans la page.
    await expect(pageMain(page).getByText(USER.nomLibrairie.trim())).toBeVisible()
    await expect(page.getByText(`Code client : ${USER.codeClient}`)).toBeVisible()
  })

  test('affiche les coordonnées du compte', async ({ page }) => {
    await expect(page.getByText(USER.email)).toBeVisible()
    await expect(page.getByText(USER.telephone)).toBeVisible()
    await expect(page.getByText(USER.adresseLivraison)).toBeVisible()
  })

  test('l\'avatar porte l\'initiale de la librairie', async ({ page }) => {
    const initiale = USER.nomLibrairie.trim()[0].toUpperCase()

    await expect(pageMain(page).getByText(initiale, { exact: true }).first()).toBeVisible()
  })
})

/* ────────────────────────────────────────────
   2. Remises
──────────────────────────────────────────── */
test.describe('Remises', () => {
  test('affiche une tuile par univers remisé, avec son taux', async ({ page }) => {
    for (const [univers, taux] of REMISES) {
      await expect(page.getByText(univers, { exact: true })).toBeVisible()
      await expect(page.getByText(`${taux} %`, { exact: true }).first()).toBeVisible()
    }
  })

  /*
    Les remises sont personnalisées par librairie et s'appliquent par
    thématique : la page ne doit jamais retomber sur le taux global unique
    quand le détail par univers existe.
  */
  test('ne retombe pas sur le taux global quand le détail existe', async ({ page }) => {
    test.skip(REMISES.length === 0, 'Le compte n\'a pas de remise par univers.')

    await expect(page.getByText(`${USER.remise} % sur tous les titres`)).toHaveCount(0)
  })
})

/* ────────────────────────────────────────────
   3. Règles de gestion des commandes
──────────────────────────────────────────── */
test.describe('Gestion des commandes', () => {
  test('affiche le reliquat accepté du compte', async ({ page }) => {
    const expected = USER.reliquatAccepte ? 'Oui' : 'Non'

    await expect(page.getByText('Reliquat accepté')).toBeVisible()
    await expect(page.getByText(expected, { exact: true })).toBeVisible()
  })

  test('rappelle les 2 règles de conservation', async ({ page }) => {
    await expect(page.getByText('Notés : titres à paraître')).toBeVisible()
    await expect(page.getByText('Conservés indéfiniment')).toBeVisible()
    await expect(page.getByText('Reliquats : titres en réassort')).toBeVisible()
    await expect(page.getByText('3 mois (fin de mois)')).toBeVisible()
  })
})

/* ────────────────────────────────────────────
   4. Lecture seule
──────────────────────────────────────────── */
test.describe('Lecture seule', () => {
  /*
    La page n'offre aucune modification : les coordonnées se changent par le
    représentant ou le service clients. Aucun champ de saisie ne doit
    apparaître, c'est la propriété qui tient la règle.
  */
  test('ne contient aucun champ modifiable', async ({ page }) => {
    const crashes = collectCrashes(page)

    await expect(page.locator('main input, main textarea, main select')).toHaveCount(0)
    await expect(page.getByText(/veuillez contacter votre\s+représentant commercial ou le service clients/)).toBeVisible()
    expect(crashes).toEqual([])
  })
})
