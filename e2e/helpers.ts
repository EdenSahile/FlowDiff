import { expect, type Page } from '@playwright/test'

/*
  Helpers partagés par les specs ajoutées pour combler les trous de
  couverture. Les specs antérieures gardent leurs copies locales : les
  modifier n'apporterait rien et risquerait de casser une suite verte.
*/

// Compte de démonstration pré-rempli par LoginPage.
export const DEMO_CODE_CLIENT = 'LIB001'

// En démo, les identifiants sont pré-remplis : se connecter se réduit au clic.
export async function login(page: Page) {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await page.locator('input[aria-label="Recherche globale"]').waitFor()
}

// Les exceptions JS non rattrapées sont le signe le plus net d'un écran cassé.
export function collectCrashes(page: Page): string[] {
  const crashes: string[] = []
  page.on('pageerror', error => crashes.push(error.message))
  return crashes
}

// La page compte 2 <aside> : la sidebar et la bannière de démonstration.
// On identifie la sidebar par son nav Catalogue, qu'elle seule possède.
export function sidebar(page: Page) {
  return page.locator('aside').filter({ has: page.locator('nav[aria-label="Catalogue"]') })
}

export function sidebarLink(page: Page, label: string) {
  return sidebar(page).getByRole('link', { name: label, exact: true })
}

// Le libellé du panier porte le compte : « Panier : 3 articles ».
export function cartButton(page: Page) {
  return page.getByRole('button', { name: /^Panier : \d+ article/ })
}

export async function expectCartCount(page: Page, count: number) {
  const plural = count === 1 ? 'article' : 'articles'
  await expect(cartButton(page)).toHaveAttribute('aria-label', `Panier : ${count} ${plural}`)
}

/*
  Zone de contenu de la page, hors sidebar et hors en-tête (AppLayout rend un
  <main>). Indispensable dès qu'un libellé de la page existe aussi dans la
  navigation, « Mon historique » par exemple.
*/
export function pageMain(page: Page) {
  return page.locator('main')
}

/*
  Carte d'une liste, identifiée par son titre. Les pages de contenu rendent
  chaque entrée dans un <article>, et le titre y porte le rôle heading.
*/
export function cardByTitle(page: Page, title: string) {
  return page.locator('article').filter({ has: page.getByRole('heading', { name: title }) })
}
