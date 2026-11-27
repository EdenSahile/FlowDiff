import { test, expect } from '@playwright/test'
import { VALID_CLIENT_CODES } from '../src/lib/mockUsers'
import { collectCrashes } from './helpers'

/*
  Parcours « mot de passe oublié ». L'écran ne révèle jamais si un compte
  existe pour l'email saisi : la même confirmation s'affiche dans les 2 cas,
  et c'est le comportement attendu (ForgotPasswordPage). Aucun email réel
  n'est envoyé, l'envoi est simulé par un délai de 800 ms.
*/

test.use({ viewport: { width: 1440, height: 900 } })

const KNOWN_EMAIL = VALID_CLIENT_CODES[0].email
const UNKNOWN_EMAIL = 'personne@exemple-inexistant.fr'

test.beforeEach(async ({ page }) => {
  await page.goto('/forgot-password')
  await expect(page.getByText('Mot de passe oublié')).toBeVisible()
})

test.describe('Écran mot de passe oublié', () => {
  test('est atteignable sans être connecté et porte un seul champ', async ({ page }) => {
    await expect(page).toHaveURL('/forgot-password')
    await expect(page.getByLabel('Email professionnel')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Envoyer le lien' })).toBeVisible()
  })

  test('le lien ramène à la connexion', async ({ page }) => {
    await page.getByRole('link', { name: 'Retour à la connexion' }).click()

    await expect(page).toHaveURL('/login')
  })

  /*
    Le lien « Mot de passe oublié ? » de LoginPage ne mène pas ici : il affiche
    un message de blocage et reste sur place. L'écran n'est atteignable que par
    son URL. C'est l'état voulu de la démonstration, ce test le fixe pour qu'un
    changement de ce choix se voie.
  */
  test('le lien de la connexion affiche un blocage au lieu d\'ouvrir cet écran', async ({ page }) => {
    await page.goto('/login')

    await page.getByRole('link', { name: /Mot de passe oublié/ }).click()

    await expect(page).toHaveURL('/login')
    await expect(page.getByText('La réinitialisation de mot de passe a été bloquée.')).toBeVisible()
  })
})

test.describe('Validation', () => {
  test('un email mal formé est refusé sans rien envoyer', async ({ page }) => {
    await page.getByLabel('Email professionnel').fill('pas-un-email')

    await page.getByRole('button', { name: 'Envoyer le lien' }).click()

    await expect(page.getByRole('alert')).toHaveText('Adresse email invalide')
    await expect(page.getByRole('button', { name: 'Envoyer le lien' })).toBeVisible()
  })

  test('saisir à nouveau efface le message d\'erreur', async ({ page }) => {
    await page.getByLabel('Email professionnel').fill('pas-un-email')
    await page.getByRole('button', { name: 'Envoyer le lien' }).click()
    await expect(page.getByRole('alert')).toBeVisible()

    await page.getByLabel('Email professionnel').fill(KNOWN_EMAIL)

    await expect(page.getByRole('alert')).toHaveCount(0)
  })
})

test.describe('Envoi', () => {
  test('un email valide mène à la confirmation et reprend l\'adresse saisie', async ({ page }) => {
    const crashes = collectCrashes(page)
    await page.getByLabel('Email professionnel').fill(KNOWN_EMAIL)

    await page.getByRole('button', { name: 'Envoyer le lien' }).click()

    // L'envoi simulé dure 800 ms : le bouton annonce l'attente.
    await expect(page.getByRole('button', { name: 'Envoi en cours…' })).toBeVisible()
    await expect(page.getByText('Email envoyé')).toBeVisible()
    await expect(page.getByText(KNOWN_EMAIL)).toBeVisible()
    await expect(page.getByText('Pensez à vérifier vos spams')).toBeVisible()
    expect(crashes).toEqual([])
  })

  /*
    Un écran qui répondrait « cet email est inconnu » dirait à n'importe qui
    quelles adresses ont un compte. La confirmation est donc la même.
  */
  test('un email inconnu reçoit la même confirmation', async ({ page }) => {
    await page.getByLabel('Email professionnel').fill(UNKNOWN_EMAIL)

    await page.getByRole('button', { name: 'Envoyer le lien' }).click()

    await expect(page.getByText('Email envoyé')).toBeVisible()
    await expect(page.getByText(UNKNOWN_EMAIL)).toBeVisible()
  })

  test('après confirmation, le formulaire disparaît au profit du retour', async ({ page }) => {
    await page.getByLabel('Email professionnel').fill(KNOWN_EMAIL)
    await page.getByRole('button', { name: 'Envoyer le lien' }).click()
    await expect(page.getByText('Email envoyé')).toBeVisible()

    await expect(page.getByRole('button', { name: 'Envoyer le lien' })).toHaveCount(0)

    await page.getByRole('link', { name: 'Retour à la connexion' }).click()

    await expect(page).toHaveURL('/login')
  })
})
