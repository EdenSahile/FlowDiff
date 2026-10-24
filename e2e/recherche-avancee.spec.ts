import { test, expect, type Page, type Locator } from '@playwright/test'

/*
  Recherche avancée : le panneau de filtres du header, et les résultats qu'il
  produit sur /recherche.

  Les attendus sont dérivés du catalogue de démonstration (49 titres), pas du
  code qui filtre. Répartition relevée sur les données :

    Thématique  Littérature 15 · BD/Mangas 15 · Adulte-pratique 11 · Jeunesse 8
    Langue      Français 25 · Japonais 11 · Anglais 10 · Espagnol 2 · Suédois 1
    Prix        5 à 10 EUR 10 · 10 à 20 EUR 28 · 20 à 50 EUR 11, les 2 autres 0
    Format      Broché 33 · Poche 11 · Grand format 5 · Numérique 3 · Relié 0

  Règles attendues : un filtre restreint le catalogue, plusieurs pastilles d'un
  même groupe s'additionnent (OU), des groupes différents se croisent (ET), et
  le compteur du panneau annonce exactement ce que la page de résultats
  affichera ensuite.
*/

test.use({ viewport: { width: 1440, height: 900 } })

const CATALOGUE_SIZE = 49

async function login(page: Page) {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await page.locator('input[aria-label="Recherche globale"]').waitFor()
}

function panel(page: Page): Locator {
  return page.getByRole('dialog', { name: 'Filtres de recherche avancée' })
}

function chip(page: Page, name: string): Locator {
  return panel(page).getByRole('button', { name, exact: true })
}

/* Le pied du panneau annonce « N ouvrages » pour la sélection en cours. */
function counter(page: Page): Locator {
  return panel(page).getByText(/^\d+ ouvrages?$/)
}

async function countedBooks(page: Page): Promise<number> {
  const text = await counter(page).textContent()
  return Number(text!.match(/\d+/)![0])
}

async function openPanel(page: Page) {
  await login(page)
  await page.getByRole('button', { name: 'Filtres avancés' }).click()
  await expect(panel(page)).toBeVisible()
}

/* ────────────────────────────────────────────
   1. Ouverture et fermeture du panneau
──────────────────────────────────────────── */
test.describe('Panneau de filtres', () => {
  test('le bouton ouvre le panneau, la croix le referme', async ({ page }) => {
    await openPanel(page)

    await panel(page).getByRole('button', { name: 'Fermer les filtres' }).click()

    await expect(panel(page)).toBeHidden()
  })

  test('la touche Échap referme le panneau', async ({ page }) => {
    await openPanel(page)

    await page.keyboard.press('Escape')

    await expect(panel(page)).toBeHidden()
  })

  test('un clic hors du panneau le referme', async ({ page }) => {
    await openPanel(page)

    await page.mouse.click(20, 500)

    await expect(panel(page)).toBeHidden()
  })

  test('sans aucun filtre, le compteur annonce tout le catalogue', async ({ page }) => {
    await openPanel(page)

    await expect(counter(page)).toHaveText(`${CATALOGUE_SIZE} ouvrages`)
  })
})

/* ────────────────────────────────────────────
   2. Chaque groupe de filtres, pris seul
──────────────────────────────────────────── */
test.describe('Un seul groupe de filtres', () => {
  test('une thématique restreint le compteur et ouvre le groupe Genre', async ({ page }) => {
    await openPanel(page)

    await expect(panel(page).getByText('Genre', { exact: true })).toHaveCount(0)

    await chip(page, 'Littérature').click()

    await expect(counter(page)).toHaveText('15 ouvrages')
    await expect(panel(page).getByText('Genre', { exact: true })).toBeVisible()
  })

  test('un genre restreint à l\'intérieur de sa thématique', async ({ page }) => {
    await openPanel(page)

    await chip(page, 'Littérature').click()
    await chip(page, 'Roman contemporain').click()

    await expect(counter(page)).toHaveText('11 ouvrages')
  })

  test('retirer la thématique retire aussi le genre retenu', async ({ page }) => {
    await openPanel(page)
    await chip(page, 'Littérature').click()
    await chip(page, 'Roman contemporain').click()

    await chip(page, 'Littérature').click()

    await expect(counter(page)).toHaveText(`${CATALOGUE_SIZE} ouvrages`)
    await expect(panel(page).getByText('Genre', { exact: true })).toHaveCount(0)
  })

  test('une langue restreint le compteur', async ({ page }) => {
    await openPanel(page)

    await chip(page, 'Japonais').click()

    await expect(counter(page)).toHaveText('11 ouvrages')
  })

  test('une tranche de prix restreint le compteur', async ({ page }) => {
    await openPanel(page)

    await chip(page, '10 à 20 EUR').click()

    await expect(counter(page)).toHaveText('28 ouvrages')
  })

  test('un format restreint le compteur', async ({ page }) => {
    await openPanel(page)

    await chip(page, 'Poche').click()

    await expect(counter(page)).toHaveText('11 ouvrages')
  })

  test('les tranches de prix qu\'aucun titre n\'atteint restent grisées', async ({ page }) => {
    await openPanel(page)

    await expect(chip(page, 'Jusqu\'à 5 EUR')).toBeDisabled()
    await expect(chip(page, '50 EUR et plus')).toBeDisabled()
    await expect(chip(page, '10 à 20 EUR')).toBeEnabled()
  })

  test('« Réinitialiser » efface toutes les sélections', async ({ page }) => {
    await openPanel(page)
    await chip(page, 'Littérature').click()
    await chip(page, 'Français').click()
    await chip(page, '10 à 20 EUR').click()

    await panel(page).getByText('Réinitialiser les filtres').click()

    await expect(counter(page)).toHaveText(`${CATALOGUE_SIZE} ouvrages`)
  })
})

/* ────────────────────────────────────────────
   3. Plusieurs pastilles d'un même groupe : OU
──────────────────────────────────────────── */
test.describe('Plusieurs choix dans un même groupe', () => {
  test('2 thématiques additionnent leurs titres', async ({ page }) => {
    await openPanel(page)

    await chip(page, 'Littérature').click()
    await chip(page, 'BD/Mangas').click()

    await expect(counter(page)).toHaveText('30 ouvrages')
  })

  test('2 langues additionnent leurs titres', async ({ page }) => {
    await openPanel(page)

    await chip(page, 'Japonais').click()
    await chip(page, 'Anglais').click()

    await expect(counter(page)).toHaveText('21 ouvrages')
  })

  test('2 tranches de prix additionnent leurs titres', async ({ page }) => {
    await openPanel(page)

    await chip(page, '5 à 10 EUR').click()
    await chip(page, '10 à 20 EUR').click()

    await expect(counter(page)).toHaveText('38 ouvrages')
  })

  test('cliquer 2 fois la même pastille la désélectionne', async ({ page }) => {
    await openPanel(page)

    await chip(page, 'Japonais').click()
    await chip(page, 'Japonais').click()

    await expect(counter(page)).toHaveText(`${CATALOGUE_SIZE} ouvrages`)
  })
})

/* ────────────────────────────────────────────
   4. Groupes différents : ET
──────────────────────────────────────────── */
test.describe('Croisement de groupes', () => {
  test('thématique et langue se croisent', async ({ page }) => {
    await openPanel(page)

    await chip(page, 'Littérature').click()
    await chip(page, 'Français').click()

    await expect(counter(page)).toHaveText('14 ouvrages')
  })

  test('thématique et format se croisent', async ({ page }) => {
    await openPanel(page)

    await chip(page, 'Littérature').click()
    await chip(page, 'Numérique').click()

    await expect(counter(page)).toHaveText('2 ouvrages')
  })

  // Aucun titre de littérature n'a les dimensions du poche ni du grand format.
  test('une thématique grise les formats qu\'aucun de ses titres ne porte', async ({ page }) => {
    await openPanel(page)

    await chip(page, 'Littérature').click()

    await expect(chip(page, 'Poche')).toBeDisabled()
    await expect(chip(page, 'Grand format')).toBeDisabled()
    await expect(chip(page, 'Broché')).toBeEnabled()
  })

  // Les 8 titres jeunesse sont tous entre 10 et 20 EUR.
  test('une thématique grise les tranches de prix hors de sa fourchette', async ({ page }) => {
    await openPanel(page)

    await chip(page, 'Jeunesse').click()

    await expect(chip(page, '20 à 50 EUR')).toBeDisabled()
    await expect(chip(page, '10 à 20 EUR')).toBeEnabled()
  })
})

/* ────────────────────────────────────────────
   5. Application des filtres sur /recherche
──────────────────────────────────────────── */
test.describe('Résultats', () => {
  test('« Voir les résultats » affiche exactement le nombre annoncé', async ({ page }) => {
    await openPanel(page)
    await chip(page, 'Littérature').click()
    const annonce = await countedBooks(page)

    await panel(page).getByRole('button', { name: 'Voir les résultats' }).click()

    await expect(page).toHaveURL(/\/recherche\?.*universe=/)
    await expect(page.getByRole('heading', { name: `${annonce} résultats` })).toBeVisible()
    await expect(page.locator('article')).toHaveCount(annonce)
  })

  test('le nombre annoncé reste juste avec 2 thématiques', async ({ page }) => {
    await openPanel(page)
    await chip(page, 'Littérature').click()
    await chip(page, 'BD/Mangas').click()
    const annonce = await countedBooks(page)

    await panel(page).getByRole('button', { name: 'Voir les résultats' }).click()

    await expect(page.locator('article')).toHaveCount(annonce)
  })

  test('le nombre annoncé reste juste avec 2 tranches de prix', async ({ page }) => {
    await openPanel(page)
    await chip(page, '5 à 10 EUR').click()
    await chip(page, '10 à 20 EUR').click()
    const annonce = await countedBooks(page)

    await panel(page).getByRole('button', { name: 'Voir les résultats' }).click()

    await expect(page.locator('article')).toHaveCount(annonce)
  })

  test('la page de résultats rappelle les filtres actifs', async ({ page }) => {
    await openPanel(page)
    await chip(page, 'Jeunesse').click()
    await chip(page, '10 à 20 EUR').click()

    await panel(page).getByRole('button', { name: 'Voir les résultats' }).click()

    await expect(page.getByText(/Filtres actifs :.*Jeunesse/)).toBeVisible()
    await expect(page.getByText(/Filtres actifs :.*10 à 20 EUR/)).toBeVisible()
  })

  test('un filtre se combine au texte saisi dans la barre de recherche', async ({ page }) => {
    await openPanel(page)
    await chip(page, 'Littérature').click()
    await panel(page).getByRole('button', { name: 'Voir les résultats' }).click()
    await expect(page).toHaveURL(/universe=/)

    await page.locator('input[aria-label="Recherche globale"]').fill('Daoud')
    await page.locator('input[aria-label="Recherche globale"]').press('Enter')

    await expect(page).toHaveURL(/q=Daoud/)
    await expect(page).toHaveURL(/universe=/)
    await expect(page.getByRole('heading', { name: /pour « Daoud »/ })).toBeVisible()
  })

  test('un filtre seul suffit à lancer la recherche au clavier', async ({ page }) => {
    await openPanel(page)
    await chip(page, 'Japonais').click()
    await panel(page).getByRole('button', { name: 'Fermer les filtres' }).click()

    await page.locator('input[aria-label="Recherche globale"]').press('Enter')

    await expect(page).toHaveURL(/\/recherche\?langues=/)
  })

  test('sans filtre ni texte, la touche Entrée ne quitte pas la page', async ({ page }) => {
    await login(page)

    await page.locator('input[aria-label="Recherche globale"]').press('Enter')

    await expect(page).toHaveURL('/')
  })

  test('une combinaison sans titre correspondant affiche l\'écran vide', async ({ page }) => {
    await login(page)

    await page.goto('/recherche?universe=Jeunesse&langues=Su%C3%A9dois')

    await expect(page.getByText('Aucun titre trouvé')).toBeVisible()
    await expect(page.locator('article')).toHaveCount(0)
  })

  test('les filtres survivent au rechargement, l\'URL les porte', async ({ page }) => {
    await login(page)
    await page.goto('/recherche?universe=Litt%C3%A9rature')
    await expect(page.locator('article')).toHaveCount(15)

    await page.reload()

    await expect(page.locator('article')).toHaveCount(15)
  })

  // La pastille porte son propre compte, qui doit être celui de l'affichage.
  test('le filtre thématique des résultats restreint l\'affichage sans toucher l\'URL', async ({ page }) => {
    await login(page)
    await page.goto('/recherche?langues=Fran%C3%A7ais')
    await expect(page.locator('article')).toHaveCount(25)

    const jeunesse = page.getByRole('button', { name: /^Jeunesse \(\d+\)$/ })
    const annonce = Number((await jeunesse.textContent())!.match(/\((\d+)\)/)![1])
    await jeunesse.click()

    await expect(page).toHaveURL('/recherche?langues=Fran%C3%A7ais')
    await expect(page.getByText(`${annonce} titres dans cette thématique`)).toBeVisible()
    await expect(page.locator('article')).toHaveCount(annonce)
  })

  test('le retour navigateur ramène des résultats filtrés à la page précédente', async ({ page }) => {
    await openPanel(page)
    await chip(page, 'Littérature').click()
    await panel(page).getByRole('button', { name: 'Voir les résultats' }).click()
    await expect(page).toHaveURL(/universe=/)

    await page.goBack()

    await expect(page).toHaveURL('/')
  })
})
