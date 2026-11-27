import { test, expect, type Page } from '@playwright/test'
import { VALID_CLIENT_CODES } from '../src/lib/mockUsers'
import { collectCrashes } from './helpers'

/*
  Parcours d'inscription. L'accès est réservé aux libraires, et la création
  d'accès passe une double vérification : le code client doit exister, et
  l'email doit être celui rattaché à ce code (AuthContext.register).

  Le couple code client / email valide se lit dans VALID_CLIENT_CODES, pas
  recopié ici : ajouter ou retirer une librairie de démonstration ne doit pas
  faire tomber la suite.
*/

test.use({ viewport: { width: 1440, height: 900 } })

const VALID = VALID_CLIENT_CODES[0]

// Un code client absent de la liste, quelle que soit la liste.
const UNKNOWN_CODE = 'ZZZ999'

// Satisfait registerSchema : 8 caractères, une majuscule, un chiffre, un spécial.
const VALID_PASSWORD = 'Libraire123!'

async function fillForm(
  page: Page,
  { codeClient, email, password, confirm }: {
    codeClient: string
    email: string
    password: string
    confirm: string
  },
) {
  await page.getByLabel('Code client').fill(codeClient)
  await page.getByLabel('Email professionnel').fill(email)
  await page.getByLabel('Mot de passe', { exact: true }).fill(password)
  await page.getByLabel('Confirmer le mot de passe').fill(confirm)
}

function submit(page: Page) {
  return page.getByRole('button', { name: 'Créer mon accès' }).click()
}

test.beforeEach(async ({ page }) => {
  await page.goto('/register')
  await expect(page.getByText('Créer votre accès')).toBeVisible()
})

/* ────────────────────────────────────────────
   1. Accès à l'écran
──────────────────────────────────────────── */
test.describe('Écran d\'inscription', () => {
  test('affiche les 4 champs et le lien vers la connexion', async ({ page }) => {
    await expect(page.getByLabel('Code client')).toBeVisible()
    await expect(page.getByLabel('Email professionnel')).toBeVisible()
    await expect(page.getByLabel('Mot de passe', { exact: true })).toBeVisible()
    await expect(page.getByLabel('Confirmer le mot de passe')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Se connecter' })).toBeVisible()
  })

  test('le lien ramène à la connexion', async ({ page }) => {
    await page.getByRole('link', { name: 'Se connecter' }).click()

    await expect(page).toHaveURL('/login')
  })

  // L'inscription est publique : c'est la seule porte d'entrée d'un libraire
  // qui n'a pas encore de compte.
  test('l\'écran est atteignable sans être connecté', async ({ page }) => {
    await expect(page).toHaveURL('/register')
  })
})

/* ────────────────────────────────────────────
   2. Validation du formulaire
──────────────────────────────────────────── */
test.describe('Validation du formulaire', () => {
  /*
    Chaque mot de passe ci-dessous ne viole qu'une seule règle de
    registerSchema. C'est volontaire : getZodErrors construit son objet avec
    Object.fromEntries, donc sur un champ qui cumule plusieurs erreurs, seule
    la dernière est conservée et le message affiché devient imprévisible.
  */
  const WEAK_PASSWORDS = [
    { password: 'libraire123!', message: 'Une majuscule requise' },
    { password: 'LibraireAbc!', message: 'Un chiffre requis' },
    { password: 'Libraire123',  message: 'Un caractère spécial requis' },
    { password: 'Lib1!',        message: 'Minimum 8 caractères' },
  ] as const

  for (const { password, message } of WEAK_PASSWORDS) {
    test(`un mot de passe est refusé pour « ${message} », avant tout envoi`, async ({ page }) => {
      await fillForm(page, {
        codeClient: VALID.codeClient,
        email: VALID.email,
        password,
        confirm: password,
      })

      await submit(page)

      await expect(page.getByRole('alert').filter({ hasText: message })).toBeVisible()
      await expect(page).toHaveURL('/register')
    })
  }

  test('deux mots de passe différents sont refusés', async ({ page }) => {
    await fillForm(page, {
      codeClient: VALID.codeClient,
      email: VALID.email,
      password: VALID_PASSWORD,
      confirm: `${VALID_PASSWORD}x`,
    })

    await submit(page)

    await expect(page.getByRole('alert').first()).toBeVisible()
    await expect(page).toHaveURL('/register')
  })

  test('un email mal formé est refusé', async ({ page }) => {
    await fillForm(page, {
      codeClient: VALID.codeClient,
      email: 'pas-un-email',
      password: VALID_PASSWORD,
      confirm: VALID_PASSWORD,
    })

    await submit(page)

    await expect(page.getByRole('alert').filter({ hasText: 'Adresse email invalide' })).toBeVisible()
  })

  test('le code client est mis en majuscules à la saisie', async ({ page }) => {
    await page.getByLabel('Code client').fill(VALID.codeClient.toLowerCase())

    await expect(page.getByLabel('Code client')).toHaveValue(VALID.codeClient)
  })
})

/* ────────────────────────────────────────────
   3. Double vérification code client / email
──────────────────────────────────────────── */
test.describe('Double vérification', () => {
  test('un code client inconnu est refusé', async ({ page }) => {
    await fillForm(page, {
      codeClient: UNKNOWN_CODE,
      email: VALID.email,
      password: VALID_PASSWORD,
      confirm: VALID_PASSWORD,
    })

    await submit(page)

    await expect(page.getByRole('alert').filter({ hasText: 'Code client non reconnu' })).toBeVisible()
    await expect(page).toHaveURL('/register')
  })

  test('un email qui ne correspond pas au code client est refusé', async ({ page }) => {
    await fillForm(page, {
      codeClient: VALID.codeClient,
      email: 'quelquun.dautre@exemple.fr',
      password: VALID_PASSWORD,
      confirm: VALID_PASSWORD,
    })

    await submit(page)

    await expect(page.getByRole('alert').filter({ hasText: 'ne correspond pas à ce code client' })).toBeVisible()
    await expect(page).toHaveURL('/register')
  })

  test('le couple code client et email valide crée l\'accès et connecte', async ({ page }) => {
    const crashes = collectCrashes(page)
    await fillForm(page, {
      codeClient: VALID.codeClient,
      email: VALID.email,
      password: VALID_PASSWORD,
      confirm: VALID_PASSWORD,
    })

    await submit(page)

    await expect(page).toHaveURL('/')
    // La recherche globale n'existe que dans l'en-tête des pages protégées.
    await expect(page.locator('input[aria-label="Recherche globale"]')).toBeVisible()
    expect(crashes).toEqual([])
  })
})

/* ────────────────────────────────────────────
   4. Affichage du mot de passe
──────────────────────────────────────────── */
test.describe('Affichage du mot de passe', () => {
  test('le bouton bascule entre masqué et visible', async ({ page }) => {
    const field = page.getByLabel('Mot de passe', { exact: true })
    await field.fill(VALID_PASSWORD)
    await expect(field).toHaveAttribute('type', 'password')

    await page.getByRole('button', { name: 'Afficher' }).first().click()

    await expect(field).toHaveAttribute('type', 'text')

    await page.getByRole('button', { name: 'Masquer' }).first().click()

    await expect(field).toHaveAttribute('type', 'password')
  })
})
