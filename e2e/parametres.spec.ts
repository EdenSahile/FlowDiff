import { test, expect, type Locator, type Page } from '@playwright/test'
import { UNIVERSES } from '../src/data/mockBooks'
import { MOCK_USERS } from '../src/lib/mockUsers'
import { collectCrashes, DEMO_CODE_CLIENT, login, sidebarLink } from './helpers'

/*
  Page Paramètres : préférences de notification, newsletters, univers suivis
  et notifications EDI.

  Rien n'est persisté. Les préférences vivent dans l'état du composant, et
  « Enregistrer » affiche un toast après 700 ms sans écrire quoi que ce soit
  (ParametresPage.handleSave). Ces tests vérifient donc les bascules, la
  validation et la confirmation, pas la persistance : affirmer qu'un réglage
  survit au rechargement serait faux.
*/

test.use({ viewport: { width: 1440, height: 900 } })

const USER = MOCK_USERS.find(u => u.codeClient === DEMO_CODE_CLIENT)!

// Les 3 notifications globales et les 4 newsletters, dans l'ordre de la page.
const NOTIFICATIONS = ['Nouveautés du mois', 'Flash Infos', 'Offres & promotions'] as const
const NEWSLETTERS = ['Nouveautés du mois', 'À paraître', 'Flash Infos', 'Top Ventes'] as const

function section(page: Page, title: string) {
  return page.locator('form > div > div').filter({ hasText: title }).first()
}

/*
  Les interrupteurs sont une case à cocher de 0 par 0 pixel, masquée dans une
  piste visible de 44 par 24 (ParametresPage, HiddenCheckbox et ToggleTrack).
  Playwright refuse de cliquer un élément sans surface : c'est la piste qu'on
  clique, comme le fait un libraire.
*/
function toggleTrack(checkbox: Locator) {
  return checkbox.locator('..')
}

async function expectToggleFlips(checkbox: Locator) {
  const before = await checkbox.isChecked()

  await toggleTrack(checkbox).click()

  await expect(checkbox).toBeChecked({ checked: !before })
}

test.beforeEach(async ({ page }) => {
  await login(page)
  await sidebarLink(page, 'Paramètres').click()
  await expect(page.getByRole('heading', { name: 'Paramètres' })).toBeVisible()
})

/* ────────────────────────────────────────────
   1. Affichage
──────────────────────────────────────────── */
test.describe('Affichage', () => {
  test('affiche les 4 sections de réglages', async ({ page }) => {
    await expect(page.getByText('Notifications', { exact: true })).toBeVisible()
    await expect(page.getByText('Newsletters', { exact: true })).toBeVisible()
    await expect(page.getByText('Univers suivis', { exact: true })).toBeVisible()
    await expect(page.getByText('EDI : Échanges de données')).toBeVisible()
  })

  test('liste les notifications et les newsletters', async ({ page }) => {
    for (const label of NOTIFICATIONS) {
      await expect(page.getByText(label).first()).toBeVisible()
    }
    for (const label of NEWSLETTERS) {
      await expect(page.getByText(label).first()).toBeVisible()
    }
  })

  test('liste un réglage par univers du catalogue', async ({ page }) => {
    const universSection = section(page, 'Univers suivis')

    for (const universe of UNIVERSES) {
      await expect(universSection.getByText(universe, { exact: true })).toBeVisible()
    }
    await expect(universSection.locator('input[type="checkbox"]')).toHaveCount(UNIVERSES.length)
  })

  test('l\'email de réception est celui du compte connecté', async ({ page }) => {
    await expect(page.getByLabel('Adresse email de réception')).toHaveValue(USER.email)
  })
})

/* ────────────────────────────────────────────
   2. Bascules
──────────────────────────────────────────── */
test.describe('Bascules', () => {
  test('un interrupteur de notification change d\'état au clic', async ({ page }) => {
    await expectToggleFlips(section(page, 'Notifications').locator('input[type="checkbox"]').first())
  })

  test('un interrupteur d\'univers change d\'état au clic', async ({ page }) => {
    await expectToggleFlips(section(page, 'Univers suivis').locator('input[type="checkbox"]').first())
  })

  test('une newsletter se décoche puis se recoche', async ({ page }) => {
    const checkbox = section(page, 'Newsletters').locator('input[type="checkbox"]').first()
    const before = await checkbox.isChecked()

    await checkbox.click()
    await expect(checkbox).toBeChecked({ checked: !before })

    await checkbox.click()

    await expect(checkbox).toBeChecked({ checked: before })
  })

  test('l\'interrupteur EDI change d\'état au clic', async ({ page }) => {
    await expectToggleFlips(section(page, 'EDI : Échanges de données').locator('input[type="checkbox"]').first())
  })

  // Une case de 0 par 0 pixel reste atteignable au clavier : la barre d'espace
  // la bascule, c'est le seul chemin d'un libraire qui n'utilise pas la souris.
  test('l\'interrupteur d\'univers est aussi actionnable au clavier', async ({ page }) => {
    const toggle = section(page, 'Univers suivis').locator('input[type="checkbox"]').first()
    const before = await toggle.isChecked()

    await toggle.focus()
    await page.keyboard.press('Space')

    await expect(toggle).toBeChecked({ checked: !before })
  })
})

/* ────────────────────────────────────────────
   3. Enregistrement
──────────────────────────────────────────── */
test.describe('Enregistrement', () => {
  test('un email vide désactive le bouton', async ({ page }) => {
    await page.getByLabel('Adresse email de réception').fill('')

    await expect(page.getByRole('button', { name: 'Enregistrer les préférences' })).toBeDisabled()
  })

  /*
    Le champ est un <input type="email"> dans un <form> sans novalidate : la
    validation du navigateur bloque l'envoi avant que handleSave ne tourne.
    Le message Zod « Adresse email invalide » n'est donc jamais atteint depuis
    l'interface, et c'est le navigateur qui refuse. Ce test fixe ce qui se
    passe réellement.
  */
  test('un email mal formé est refusé par le navigateur, sans enregistrement', async ({ page }) => {
    const email = page.getByLabel('Adresse email de réception')
    await email.fill('pas-un-email')

    await page.getByRole('button', { name: 'Enregistrer les préférences' }).click()

    expect(await email.evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(false)
    await expect(page.getByText('Préférences enregistrées.')).toHaveCount(0)
  })

  // newsletterSchema exige au moins une newsletter cochée.
  test('aucune newsletter cochée est refusé', async ({ page }) => {
    const checkboxes = section(page, 'Newsletters').locator('input[type="checkbox"]')
    const count = await checkboxes.count()
    for (let i = 0; i < count; i++) {
      if (await checkboxes.nth(i).isChecked()) await checkboxes.nth(i).click()
    }

    await page.getByRole('button', { name: 'Enregistrer les préférences' }).click()

    await expect(page.getByText('Choisissez au moins une newsletter')).toBeVisible()
  })

  test('un formulaire valide confirme l\'enregistrement', async ({ page }) => {
    const crashes = collectCrashes(page)

    await page.getByRole('button', { name: 'Enregistrer les préférences' }).click()

    // L'enregistrement simulé dure 700 ms : le bouton annonce l'attente.
    await expect(page.getByRole('button', { name: 'Enregistrement…' })).toBeVisible()
    await expect(page.getByText('Préférences enregistrées.')).toBeVisible()
    expect(crashes).toEqual([])
  })
})

/* ────────────────────────────────────────────
   4. Tour guidé
──────────────────────────────────────────── */
test.describe('Tour guidé', () => {
  test('le bouton de relance du tour est présent et cliquable', async ({ page }) => {
    const crashes = collectCrashes(page)
    const tourButton = page.getByRole('button', { name: /Revoir le tour guidé/ })
    await expect(tourButton).toBeVisible()

    await tourButton.click()

    expect(crashes).toEqual([])
  })
})
