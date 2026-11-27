import { test, expect, type Page } from '@playwright/test'
import { MOCK_FACTURES } from '../src/data/mockFactures'

/*
  Les attendus de ce fichier se calculent depuis MOCK_FACTURES, jamais depuis
  un nombre de factures ou un numéro recopié à la main : ajouter une facture
  au jeu de démonstration ne doit pas faire tomber la suite.
*/

const CODE_CLIENT = 'LIB001'
const FACTURES = MOCK_FACTURES[CODE_CLIENT]

/*
  Taille de page de FacturationPage. C'est un choix d'affichage du composant,
  pas une donnée : il n'est pas exporté, et il ne bouge pas quand le catalogue
  de factures bouge.
*/
const PAGE_SIZE = 10

const INVOICE_COUNT = FACTURES.length
const TOTAL_PAGES   = Math.ceil(INVOICE_COUNT / PAGE_SIZE)
const FIRST_PAGE_ROWS = Math.min(PAGE_SIZE, INVOICE_COUNT)
const LAST_PAGE_ROWS  = INVOICE_COUNT - PAGE_SIZE * (TOTAL_PAGES - 1)

const byDate   = (dir: 'asc' | 'desc') =>
  [...FACTURES].sort((a, b) => (dir === 'asc' ? 1 : -1) * a.date.localeCompare(b.date))
const byNumero = (dir: 'asc' | 'desc') =>
  [...FACTURES].sort((a, b) => (dir === 'asc' ? 1 : -1) * a.numero.localeCompare(b.numero))

// Tri par défaut de la page : date descendante.
const NEWEST = byDate('desc')[0]
const OLDEST = byDate('asc')[0]
const HIGHEST_NUMERO = byNumero('desc')[0]

// Montant tel que la page le formate (fr-FR, 2 décimales minimum).
const fmtAmount = (n: number) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2 })

const plural = (n: number) => `${n} facture${n !== 1 ? 's' : ''}`

/*
  Recherche partielle : le fragment et ses correspondances se déduisent des
  données, de sorte qu'un nouveau numéro partageant ces 4 chiffres ne casse
  pas le test mais change simplement l'attendu.
*/
const SEARCH_FRAGMENT = NEWEST.numero.slice(-4)
const SEARCH_MATCHES  = byDate('desc').filter(f => f.numero.includes(SEARCH_FRAGMENT))

// Fenêtre du filtre date exercé plus bas : l'année civile en cours.
const FILTER_YEAR = String(new Date().getFullYear())
const FILTER_MATCHES = FACTURES.filter(f => f.date.startsWith(FILTER_YEAR))

// La 3e colonne du tableau porte le numéro de facture.
function numeroCell(page: Page, rowIndex: number) {
  return page.locator('tbody tr').nth(rowIndex).locator('td').nth(2)
}

// Clear paid invoices before each test so every test starts from a clean state.
test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.evaluate(() => localStorage.removeItem('flowdiff_paid_invoices'))
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await page.locator('input[aria-label="Recherche globale"]').waitFor()
  await page.goto('/facturation')
  await page.getByRole('heading', { name: 'Facturation' }).waitFor()
})

/* ────────────────────────────────────────────
   1. Affichage initial
──────────────────────────────────────────── */
test.describe('Affichage initial', () => {
  test('affiche le titre, le sous-titre et le compteur de factures', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Facturation' })).toBeVisible()
    await expect(page.getByText(/Retrouvez l.ensemble de vos factures/)).toBeVisible()
    await expect(page.getByText(plural(INVOICE_COUNT))).toBeVisible()
  })

  test('affiche une page pleine de lignes et la pagination correspondante', async ({ page }) => {
    await expect(page.locator('tbody tr')).toHaveCount(FIRST_PAGE_ROWS)
    await expect(page.getByText(`Page 1 / ${TOTAL_PAGES}`)).toBeVisible()
  })

  test('la premiere facture affichee est la plus recente (tri date descendant)', async ({ page }) => {
    await expect(numeroCell(page, 0)).toHaveText(NEWEST.numero)
  })
})

/* ────────────────────────────────────────────
   2. Pagination
──────────────────────────────────────────── */
test.describe('Pagination', () => {
  test('la derniere page affiche les factures restantes', async ({ page }) => {
    await page.getByRole('button', { name: `Page ${TOTAL_PAGES}` }).click()

    await expect(page.locator('tbody tr')).toHaveCount(LAST_PAGE_ROWS)
    await expect(page.getByText(`Page ${TOTAL_PAGES} / ${TOTAL_PAGES}`)).toBeVisible()
  })

  test('bouton precedent revient a la page 1', async ({ page }) => {
    await page.getByRole('button', { name: 'Page 2' }).click()
    await page.getByRole('button', { name: 'Page précédente' }).click()

    await expect(page.getByText(`Page 1 / ${TOTAL_PAGES}`)).toBeVisible()
    await expect(page.locator('tbody tr')).toHaveCount(FIRST_PAGE_ROWS)
  })

  test('bouton derniere page et premiere page fonctionnent', async ({ page }) => {
    await page.getByRole('button', { name: 'Aller à la dernière page' }).click()
    await expect(page.getByText(`Page ${TOTAL_PAGES} / ${TOTAL_PAGES}`)).toBeVisible()

    await page.getByRole('button', { name: 'Aller à la première page' }).click()
    await expect(page.getByText(`Page 1 / ${TOTAL_PAGES}`)).toBeVisible()
  })
})

/* ────────────────────────────────────────────
   3. Recherche par numéro de facture
──────────────────────────────────────────── */
test.describe('Recherche', () => {
  test('filtrer par numéro affiche les bonnes factures et met à jour le compteur', async ({ page }) => {
    const searchInput = page.locator('input[aria-label="Rechercher par numéro de facture"]')
    await searchInput.fill(SEARCH_FRAGMENT)

    await expect(page.locator('tbody tr')).toHaveCount(SEARCH_MATCHES.length)
    await expect(numeroCell(page, 0)).toHaveText(SEARCH_MATCHES[0].numero)
    await expect(page.getByText(plural(SEARCH_MATCHES.length))).toBeVisible()
  })

  test('vider la recherche réaffiche toutes les factures', async ({ page }) => {
    const searchInput = page.locator('input[aria-label="Rechercher par numéro de facture"]')
    await searchInput.fill(SEARCH_FRAGMENT)
    await expect(page.locator('tbody tr')).toHaveCount(SEARCH_MATCHES.length)

    await searchInput.clear()

    await expect(page.getByText(plural(INVOICE_COUNT))).toBeVisible()
  })

  test('recherche sans résultat affiche le message vide', async ({ page }) => {
    const searchInput = page.locator('input[aria-label="Rechercher par numéro de facture"]')
    await searchInput.fill('zzzzz')

    await expect(page.getByText('Aucune facture ne correspond')).toBeVisible()
  })
})

/* ────────────────────────────────────────────
   4. Filtre par date
──────────────────────────────────────────── */
test.describe('Filtre par date', () => {
  test('un filtre date réduit les résultats et auto-sélectionne', async ({ page }) => {
    // The DatePicker is a custom calendar widget, not a native input[type="date"].
    // To select a date: click the button to open, pick month, then day.

    // "Du" picker : 1er janvier de l'année en cours.
    await page.locator('button[aria-haspopup="true"]').first().click()
    await page.getByRole('button', { name: 'Janvier' }).click()
    await page.getByRole('button', { name: `01/01/${FILTER_YEAR}` }).click()

    // "Au" picker : 31 décembre de la même année.
    await page.locator('button[aria-haspopup="true"]').nth(1).click()
    await page.getByRole('button', { name: 'Décembre' }).click()
    await page.getByRole('button', { name: `31/12/${FILTER_YEAR}` }).click()

    await expect(page.getByText(plural(FILTER_MATCHES.length))).toBeVisible()

    // Date filter auto-selects matching factures
    const checkboxes = page.locator('tbody input[type="checkbox"]')
    await expect(checkboxes).toHaveCount(Math.min(FILTER_MATCHES.length, PAGE_SIZE))
    for (let i = 0; i < Math.min(FILTER_MATCHES.length, PAGE_SIZE); i++) {
      await expect(checkboxes.nth(i)).toBeChecked()
    }
  })
})

/* ────────────────────────────────────────────
   5. Tri
──────────────────────────────────────────── */
test.describe('Tri', () => {
  test('cliquer sur Date fact. inverse le tri', async ({ page }) => {
    await expect(numeroCell(page, 0)).toHaveText(NEWEST.numero)

    await page.getByText('Date fact.').click()

    await expect(numeroCell(page, 0)).toHaveText(OLDEST.numero)
  })

  test('cliquer sur Numéro fact. trie par numéro', async ({ page }) => {
    await page.getByText('Numéro fact.').click()

    // Changer de colonne repart en descendant.
    await expect(numeroCell(page, 0)).toHaveText(HIGHEST_NUMERO.numero)
  })
})

/* ────────────────────────────────────────────
   6. Sélection (checkboxes)
──────────────────────────────────────────── */
test.describe('Sélection', () => {
  test('le checkbox header sélectionne et désélectionne toutes les factures visibles', async ({ page }) => {
    const headerCheckbox = page.locator('input[aria-label="Sélectionner toutes les factures"]')
    const rowCheckboxes  = page.locator('tbody input[type="checkbox"]')

    await headerCheckbox.click()
    for (let i = 0; i < FIRST_PAGE_ROWS; i++) {
      await expect(rowCheckboxes.nth(i)).toBeChecked()
    }

    await headerCheckbox.click()
    for (let i = 0; i < FIRST_PAGE_ROWS; i++) {
      await expect(rowCheckboxes.nth(i)).not.toBeChecked()
    }
  })

  test('sélectionner une facture individuelle fonctionne', async ({ page }) => {
    const firstRowCheckbox = page.locator(`input[aria-label="Sélectionner la facture ${NEWEST.numero}"]`)
    await firstRowCheckbox.click()

    await expect(firstRowCheckbox).toBeChecked()
  })
})

/* ────────────────────────────────────────────
   7. Export CSV
──────────────────────────────────────────── */
test.describe('Export CSV', () => {
  test('le bouton Export CSV existe avec le bon label par défaut', async ({ page }) => {
    const exportBtn = page.locator('button[aria-label="Exporter les factures en CSV"]')

    await expect(exportBtn).toBeVisible()
    await expect(exportBtn).toContainText('Export CSV')
  })

  test('le label du bouton change quand des factures sont sélectionnées', async ({ page }) => {
    const selectionSize = Math.min(3, FIRST_PAGE_ROWS)
    const checkboxes = page.locator('tbody input[type="checkbox"]')
    for (let i = 0; i < selectionSize; i++) {
      await checkboxes.nth(i).click()
    }

    const exportBtn = page.locator('button[aria-label="Exporter les factures en CSV"]')

    await expect(exportBtn).toContainText(`Export CSV (${selectionSize} sélectionnées)`)
  })
})

/* ────────────────────────────────────────────
   8. Paiement par carte bancaire
──────────────────────────────────────────── */
test.describe('Paiement par carte bancaire', () => {
  test('ouvre la modale, remplit le formulaire CB et confirme le paiement', async ({ page }) => {
    await page.getByRole('button', { name: `Payer la facture ${NEWEST.numero}` }).click()

    const modal = page.getByRole('dialog', { name: 'Paiement de la facture' })
    await expect(modal).toBeVisible()
    await expect(modal.getByText(`${NEWEST.numero} · ${fmtAmount(NEWEST.totalTTC)}`)).toBeVisible()

    await modal.locator('input[placeholder="1234 5678 9012 3456"]').fill('4111111111111111')
    await modal.locator('input[placeholder="MM/AA"]').fill('1228')
    await modal.locator('input[placeholder="123"]').fill('456')

    await modal.getByRole('button', { name: 'Confirmer le paiement' }).click()

    await expect(modal.getByText('Traitement en cours')).toBeVisible()
    // L'écran de succès arrive après un setTimeout de 1600 ms.
    await expect(modal.getByText('Paiement confirmé')).toBeVisible({ timeout: 5000 })

    // Deux boutons « Fermer » coexistent, la croix et le bouton de succès.
    await modal.getByRole('button', { name: 'Fermer' }).first().click()
    await expect(modal).not.toBeVisible()

    await expect(page.locator('[aria-label="Facture payée"]').first()).toBeVisible()
  })
})

/* ────────────────────────────────────────────
   9. Paiement par virement
──────────────────────────────────────────── */
test.describe('Paiement par virement', () => {
  test('affiche les coordonnées bancaires et confirme le virement', async ({ page }) => {
    await page.getByRole('button', { name: `Payer la facture ${NEWEST.numero}` }).click()

    const modal = page.getByRole('dialog', { name: 'Paiement de la facture' })
    await expect(modal).toBeVisible()

    await modal.getByRole('button', { name: /Virement/ }).click()

    await expect(modal.getByText('FR76 9999 9000 0012 3456 7890 077')).toBeVisible()
    await expect(modal.getByText('FICTFR99XXX')).toBeVisible()
    // Le numéro apparaît aussi dans le sous-titre : cibler la correspondance exacte.
    await expect(modal.getByText(NEWEST.numero, { exact: true })).toBeVisible()
    await expect(modal.getByRole('button', { name: 'Copier' })).toHaveCount(3)

    await modal.getByRole('button', { name: 'Confirmer le virement' }).click()

    await expect(modal.getByText('Paiement confirmé')).toBeVisible()
  })
})

/* ────────────────────────────────────────────
   10. Boutons PDF
──────────────────────────────────────────── */
test.describe('PDF', () => {
  test('chaque ligne a un bouton PDF cliquable', async ({ page }) => {
    const pdfBtn = page.locator(`button[aria-label="Ouvrir la facture ${NEWEST.numero} en PDF"]`)

    await expect(pdfBtn).toBeVisible()
    await expect(pdfBtn).toBeEnabled()
  })
})

/* ────────────────────────────────────────────
   11. Réinitialisation des paiements
──────────────────────────────────────────── */
test.describe('Réinitialisation des paiements', () => {
  test('après paiement, le bouton réinitialiser restaure les boutons Payer', async ({ page }) => {
    // Le virement est immédiat, contrairement à la CB qui attend un setTimeout.
    await page.getByRole('button', { name: `Payer la facture ${NEWEST.numero}` }).click()
    const modal = page.getByRole('dialog', { name: 'Paiement de la facture' })
    await modal.getByRole('button', { name: /Virement/ }).click()
    await modal.getByRole('button', { name: 'Confirmer le virement' }).click()
    await expect(modal.getByText('Paiement confirmé')).toBeVisible()
    await modal.getByRole('button', { name: 'Fermer' }).first().click()
    await expect(page.locator('[aria-label="Facture payée"]').first()).toBeVisible()

    const resetBtn = page.locator('button[aria-label="Réinitialiser les paiements de démonstration"]')
    await expect(resetBtn).toBeVisible()
    await resetBtn.click()

    await expect(page.locator('[aria-label="Facture payée"]')).toHaveCount(0)
    await expect(page.getByRole('button', { name: `Payer la facture ${NEWEST.numero}` })).toBeVisible()
  })
})

/* ────────────────────────────────────────────
   12. Fermeture de la modale
──────────────────────────────────────────── */
test.describe('Fermeture de la modale', () => {
  test('le bouton X ferme la modale', async ({ page }) => {
    await page.getByRole('button', { name: `Payer la facture ${NEWEST.numero}` }).click()
    const modal = page.getByRole('dialog', { name: 'Paiement de la facture' })
    await expect(modal).toBeVisible()

    await page.getByRole('button', { name: 'Fermer' }).click()

    await expect(modal).not.toBeVisible()
  })

  test('cliquer sur l overlay ferme la modale', async ({ page }) => {
    await page.getByRole('button', { name: `Payer la facture ${NEWEST.numero}` }).click()
    const modal = page.getByRole('dialog', { name: 'Paiement de la facture' })
    await expect(modal).toBeVisible()

    // Coin haut-gauche : l'overlay, en dehors de la boîte de la modale.
    await page.mouse.click(5, 5)

    await expect(modal).not.toBeVisible()
  })
})

/* ────────────────────────────────────────────
   13. Bannière de simulation
──────────────────────────────────────────── */
test.describe('Bannière de simulation', () => {
  test('la bannière est visible avant le paiement et disparaît après', async ({ page }) => {
    await page.getByRole('button', { name: `Payer la facture ${NEWEST.numero}` }).click()
    const modal = page.getByRole('dialog', { name: 'Paiement de la facture' })
    const banner = modal.locator('[role="note"]')
    await expect(banner).toBeVisible()
    await expect(banner).toContainText('Application de démonstration')

    await modal.getByRole('button', { name: /Virement/ }).click()
    await modal.getByRole('button', { name: 'Confirmer le virement' }).click()

    await expect(banner).not.toBeVisible()
  })
})
