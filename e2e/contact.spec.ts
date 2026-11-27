import { test, expect } from '@playwright/test'
import { MOCK_USERS } from '../src/lib/mockUsers'
import { getCatalogueBooks } from '../src/data/mockBooks'
import { collectCrashes, DEMO_CODE_CLIENT, login, sidebarLink } from './helpers'

/*
  Page Contact. Le formulaire ne part nulle part : l'envoi est simulé par un
  délai de 800 ms, puis un toast de confirmation (ContactPage.handleSubmit).
  Ces tests vérifient la validation, le changement de destinataire et la
  remise à zéro après envoi.

  L'identité affichée vient du compte de démonstration, lue dans MOCK_USERS.
*/

test.use({ viewport: { width: 1440, height: 900 } })

const USER = MOCK_USERS.find(u => u.codeClient === DEMO_CODE_CLIENT)!

// Satisfait contactSchema : 2 caractères minimum pour le sujet, 10 pour le message.
const VALID_SUBJECT = 'Demande de renseignement'
const VALID_MESSAGE = 'Bonjour, je souhaite des informations sur une commande.'

// Un titre dont la fiche propose « Contacter le représentant » : pas un à paraître.
const BOOK = getCatalogueBooks().find(book => book.type !== 'a-paraitre' && !!book.isbn)!

test.beforeEach(async ({ page }) => {
  await login(page)
  await sidebarLink(page, 'Contact').click()
  await expect(page.getByRole('heading', { name: 'Contact' })).toBeVisible()
})

/* ────────────────────────────────────────────
   1. Affichage
──────────────────────────────────────────── */
test.describe('Affichage', () => {
  /*
    Le champ « De » n'a ni id ni htmlFor, il n'est donc pas atteignable par
    son libellé. C'est le seul champ en lecture seule de la page.
  */
  test('reprend l\'identité du compte connecté, en lecture seule', async ({ page }) => {
    const from = page.locator('input[readonly]')

    await expect(from).toHaveValue(`${USER.nomLibrairie} (${USER.email})`)
  })

  test('ouvre sur le représentant et affiche son téléphone', async ({ page }) => {
    await expect(page.getByText('Votre représentant commercial')).toBeVisible()
    await expect(page.getByRole('link', { name: USER.telephone })).toBeVisible()
  })

  test('le bouton d\'envoi nomme le destinataire courant', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Envoyer à mon représentant' })).toBeVisible()
  })
})

/* ────────────────────────────────────────────
   2. Choix du destinataire
──────────────────────────────────────────── */
test.describe('Destinataire', () => {
  test('basculer sur le service clients change le bloc d\'informations', async ({ page }) => {
    await page.getByRole('button', { name: 'Service clients' }).click()

    await expect(page.getByText('Service clients FlowDiff')).toBeVisible()
    await expect(page.getByText('Délai de réponse : sous 24h ouvrées')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Envoyer à le service clients' })).toBeVisible()
  })

  test('revenir au représentant restaure son bloc', async ({ page }) => {
    await page.getByRole('button', { name: 'Service clients' }).click()
    await expect(page.getByText('Service clients FlowDiff')).toBeVisible()

    await page.getByRole('button', { name: 'Mon représentant' }).click()

    await expect(page.getByText('Votre représentant commercial')).toBeVisible()
  })

  // Changer de destinataire ne doit pas effacer ce qui est déjà écrit.
  test('changer de destinataire conserve la saisie', async ({ page }) => {
    await page.getByLabel('Sujet *').fill(VALID_SUBJECT)
    await page.getByLabel('Message *').fill(VALID_MESSAGE)

    await page.getByRole('button', { name: 'Service clients' }).click()

    await expect(page.getByLabel('Sujet *')).toHaveValue(VALID_SUBJECT)
    await expect(page.getByLabel('Message *')).toHaveValue(VALID_MESSAGE)
  })
})

/* ────────────────────────────────────────────
   3. Validation
──────────────────────────────────────────── */
test.describe('Validation', () => {
  test('un formulaire vide affiche les deux erreurs', async ({ page }) => {
    await page.getByRole('button', { name: /^Envoyer à/ }).click()

    await expect(page.getByText('Sujet trop court (2 caractères min.)')).toBeVisible()
    await expect(page.getByText('Message trop court (10 caractères min.)')).toBeVisible()
  })

  test('un sujet valide et un message trop court ne laissent que l\'erreur du message', async ({ page }) => {
    await page.getByLabel('Sujet *').fill(VALID_SUBJECT)
    await page.getByLabel('Message *').fill('court')

    await page.getByRole('button', { name: /^Envoyer à/ }).click()

    await expect(page.getByText('Sujet trop court (2 caractères min.)')).toHaveCount(0)
    await expect(page.getByText('Message trop court (10 caractères min.)')).toBeVisible()
  })

  test('corriger un champ efface son erreur', async ({ page }) => {
    await page.getByRole('button', { name: /^Envoyer à/ }).click()
    await expect(page.getByText('Sujet trop court (2 caractères min.)')).toBeVisible()

    await page.getByLabel('Sujet *').fill(VALID_SUBJECT)

    await expect(page.getByText('Sujet trop court (2 caractères min.)')).toHaveCount(0)
  })
})

/* ────────────────────────────────────────────
   4. Envoi
──────────────────────────────────────────── */
test.describe('Envoi', () => {
  test('un formulaire complet confirme l\'envoi et vide les champs', async ({ page }) => {
    const crashes = collectCrashes(page)
    await page.getByLabel('Sujet *').fill(VALID_SUBJECT)
    await page.getByLabel('Message *').fill(VALID_MESSAGE)

    await page.getByRole('button', { name: /^Envoyer à/ }).click()

    // L'envoi simulé dure 800 ms : le bouton annonce l'attente.
    await expect(page.getByRole('button', { name: 'Envoi en cours…' })).toBeVisible()
    await expect(page.getByText('Votre message a été envoyé')).toBeVisible()
    await expect(page.getByLabel('Sujet *')).toHaveValue('')
    await expect(page.getByLabel('Message *')).toHaveValue('')
    expect(crashes).toEqual([])
  })
})

/* ────────────────────────────────────────────
   5. Entrée depuis une fiche produit
──────────────────────────────────────────── */
test.describe('Demande de renseignement sur un titre', () => {
  /*
    La fiche produit passe le titre dans le state de navigation, et Contact
    pré-remplit alors le sujet et le message. Un accès direct à /contact
    n'a pas ce state, d'où le passage par la fiche.
  */
  test('la fiche produit pré-remplit le sujet et le message', async ({ page }) => {
    await page.goto(`/livre/${BOOK.id}`)

    await page.getByRole('button', { name: /Contacter (le|mon) représentant/ }).first().click()

    await expect(page).toHaveURL('/contact')
    await expect(page.getByLabel('Sujet *')).toHaveValue(`Renseignement : ${BOOK.title}`)
    await expect(page.getByLabel('Message *')).toHaveValue(new RegExp(`ISBN : ${BOOK.isbn}`))
  })
})
