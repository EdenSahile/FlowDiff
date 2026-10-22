import { test, expect } from '@playwright/test'

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
    await expect(page.getByText('15 factures')).toBeVisible()
  })

  test('affiche 10 lignes sur la page 1 et la pagination Page 1 / 2', async ({ page }) => {
    const rows = page.locator('tbody tr')
    await expect(rows).toHaveCount(10)
    await expect(page.getByText('Page 1 / 2')).toBeVisible()
  })

  test('la premiere facture affichee est FAC202602144739 (tri date descendant)', async ({ page }) => {
    const firstInvoiceNumber = page.locator('tbody tr').first().locator('td').nth(2)
    await expect(firstInvoiceNumber).toHaveText('FAC202602144739')
  })
})

/* ────────────────────────────────────────────
   2. Pagination
──────────────────────────────────────────── */
test.describe('Pagination', () => {
  test('page 2 affiche les 5 factures restantes', async ({ page }) => {
    await page.getByRole('button', { name: 'Page 2' }).click()
    const rows = page.locator('tbody tr')
    await expect(rows).toHaveCount(5)
    await expect(page.getByText('Page 2 / 2')).toBeVisible()
  })

  test('bouton precedent revient a la page 1', async ({ page }) => {
    await page.getByRole('button', { name: 'Page 2' }).click()
    await page.getByRole('button', { name: 'Page précédente' }).click()
    await expect(page.getByText('Page 1 / 2')).toBeVisible()
    await expect(page.locator('tbody tr')).toHaveCount(10)
  })

  test('bouton derniere page et premiere page fonctionnent', async ({ page }) => {
    await page.getByRole('button', { name: 'Aller à la dernière page' }).click()
    await expect(page.getByText('Page 2 / 2')).toBeVisible()

    await page.getByRole('button', { name: 'Aller à la première page' }).click()
    await expect(page.getByText('Page 1 / 2')).toBeVisible()
  })
})

/* ────────────────────────────────────────────
   3. Recherche par numéro de facture
──────────────────────────────────────────── */
test.describe('Recherche', () => {
  test('filtrer par numéro affiche la bonne facture et met à jour le compteur', async ({ page }) => {
    const searchInput = page.locator('input[aria-label="Rechercher par numéro de facture"]')
    await searchInput.fill('4739')

    await expect(page.locator('tbody tr')).toHaveCount(1)
    await expect(page.locator('tbody tr').first().locator('td').nth(2)).toHaveText('FAC202602144739')
    await expect(page.getByText('1 facture')).toBeVisible()
  })

  test('vider la recherche réaffiche toutes les factures', async ({ page }) => {
    const searchInput = page.locator('input[aria-label="Rechercher par numéro de facture"]')
    await searchInput.fill('4739')
    await expect(page.locator('tbody tr')).toHaveCount(1)

    await searchInput.clear()
    await expect(page.getByText('15 factures')).toBeVisible()
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

    // "Du" picker: set to 2026-01-01
    const duBtn = page.locator('button[aria-haspopup="true"]').first()
    await duBtn.click()
    // Calendar opens in months view. Default year = 2026 (current year).
    await page.getByRole('button', { name: 'Janvier' }).click()
    // Days view: click day 1
    await page.getByRole('button', { name: '01/01/2026' }).click()

    // "Au" picker: set to 2026-12-31
    const auBtn = page.locator('button[aria-haspopup="true"]').nth(1)
    await auBtn.click()
    await page.getByRole('button', { name: 'Décembre' }).click()
    await page.getByRole('button', { name: '31/12/2026' }).click()

    await expect(page.getByText('2 factures')).toBeVisible()

    // Date filter auto-selects matching factures
    const checkboxes = page.locator('tbody input[type="checkbox"]')
    await expect(checkboxes).toHaveCount(2)
    await expect(checkboxes.first()).toBeChecked()
    await expect(checkboxes.nth(1)).toBeChecked()
  })
})

/* ────────────────────────────────────────────
   5. Tri
──────────────────────────────────────────── */
test.describe('Tri', () => {
  test('cliquer sur Date fact. inverse le tri', async ({ page }) => {
    // Default: desc. First row = FAC202602144739 (most recent).
    const firstCell = () => page.locator('tbody tr').first().locator('td').nth(2)
    await expect(firstCell()).toHaveText('FAC202602144739')

    // Click to sort asc
    await page.getByText('Date fact.').click()
    await expect(firstCell()).toHaveText('FAC202506019284')
  })

  test('cliquer sur Numéro fact. trie par numéro', async ({ page }) => {
    await page.getByText('Numéro fact.').click()
    // desc by default when switching column
    const firstCell = page.locator('tbody tr').first().locator('td').nth(2)
    await expect(firstCell).toHaveText('FAC202602144739')
  })
})

/* ────────────────────────────────────────────
   6. Sélection (checkboxes)
──────────────────────────────────────────── */
test.describe('Sélection', () => {
  test('le checkbox header sélectionne et désélectionne toutes les factures visibles', async ({ page }) => {
    const headerCheckbox = page.locator('input[aria-label="Sélectionner toutes les factures"]')
    await headerCheckbox.click()

    // All visible rows (10) should be checked
    const rowCheckboxes = page.locator('tbody input[type="checkbox"]')
    for (let i = 0; i < 10; i++) {
      await expect(rowCheckboxes.nth(i)).toBeChecked()
    }

    // Uncheck all
    await headerCheckbox.click()
    for (let i = 0; i < 10; i++) {
      await expect(rowCheckboxes.nth(i)).not.toBeChecked()
    }
  })

  test('sélectionner une facture individuelle fonctionne', async ({ page }) => {
    const firstRowCheckbox = page.locator('input[aria-label="Sélectionner la facture FAC202602144739"]')
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
    // Select 3 invoices
    const checkboxes = page.locator('tbody input[type="checkbox"]')
    await checkboxes.nth(0).click()
    await checkboxes.nth(1).click()
    await checkboxes.nth(2).click()

    const exportBtn = page.locator('button[aria-label="Exporter les factures en CSV"]')
    await expect(exportBtn).toContainText('Export CSV (3 sélectionnées)')
  })
})

/* ────────────────────────────────────────────
   8. Paiement par carte bancaire
──────────────────────────────────────────── */
test.describe('Paiement par carte bancaire', () => {
  test('ouvre la modale, remplit le formulaire CB et confirme le paiement', async ({ page }) => {
    // Click "Payer" on the first row
    await page.getByRole('button', { name: 'Payer la facture FAC202602144739' }).click()

    // Modal opens
    const modal = page.getByRole('dialog', { name: 'Paiement de la facture' })
    await expect(modal).toBeVisible()

    // Subtitle shows the invoice number and amount
    await expect(modal.getByText('FAC202602144739 · 137,03')).toBeVisible()

    // CB tab is active by default, fill form
    await modal.locator('input[placeholder="1234 5678 9012 3456"]').fill('4111111111111111')
    await modal.locator('input[placeholder="MM/AA"]').fill('1228')
    await modal.locator('input[placeholder="123"]').fill('456')

    // Click pay
    await modal.getByRole('button', { name: 'Confirmer le paiement' }).click()

    // Loading state
    await expect(modal.getByText('Traitement en cours')).toBeVisible()

    // Success state (after 1600ms setTimeout)
    await expect(modal.getByText('Paiement confirmé')).toBeVisible({ timeout: 5000 })

    // Close the modal (2 "Fermer" buttons exist: the X and the success button, both close)
    await modal.getByRole('button', { name: 'Fermer' }).first().click()
    await expect(modal).not.toBeVisible()

    // Row now shows "Payé" badge
    await expect(page.locator('[aria-label="Facture payée"]').first()).toBeVisible()
  })
})

/* ────────────────────────────────────────────
   9. Paiement par virement
──────────────────────────────────────────── */
test.describe('Paiement par virement', () => {
  test('affiche les coordonnées bancaires et confirme le virement', async ({ page }) => {
    await page.getByRole('button', { name: 'Payer la facture FAC202602144739' }).click()

    const modal = page.getByRole('dialog', { name: 'Paiement de la facture' })
    await expect(modal).toBeVisible()

    // Switch to "Virement" tab
    await modal.getByRole('button', { name: /Virement/ }).click()

    // IBAN, BIC, Reference visible
    await expect(modal.getByText('FR76 9999 9000 0012 3456 7890 077')).toBeVisible()
    await expect(modal.getByText('FICTFR99XXX')).toBeVisible()
    // Reference appears both in subtitle and IBAN block; target the exact match in IbanValue
    await expect(modal.getByText('FAC202602144739', { exact: true })).toBeVisible()

    // "Copier" buttons exist
    const copyButtons = modal.getByRole('button', { name: 'Copier' })
    await expect(copyButtons).toHaveCount(3)

    // Confirm transfer
    await modal.getByRole('button', { name: 'Confirmer le virement' }).click()

    // Success
    await expect(modal.getByText('Paiement confirmé')).toBeVisible()
  })
})

/* ────────────────────────────────────────────
   10. Boutons PDF
──────────────────────────────────────────── */
test.describe('PDF', () => {
  test('chaque ligne a un bouton PDF cliquable', async ({ page }) => {
    const pdfBtn = page.locator('button[aria-label="Ouvrir la facture FAC202602144739 en PDF"]')
    await expect(pdfBtn).toBeVisible()
    await expect(pdfBtn).toBeEnabled()
  })
})

/* ────────────────────────────────────────────
   11. Réinitialisation des paiements
──────────────────────────────────────────── */
test.describe('Réinitialisation des paiements', () => {
  test('après paiement, le bouton réinitialiser restaure les boutons Payer', async ({ page }) => {
    // Pay one invoice via virement (instant, no timeout)
    await page.getByRole('button', { name: 'Payer la facture FAC202602144739' }).click()
    const modal = page.getByRole('dialog', { name: 'Paiement de la facture' })
    await modal.getByRole('button', { name: /Virement/ }).click()
    await modal.getByRole('button', { name: 'Confirmer le virement' }).click()
    await expect(modal.getByText('Paiement confirmé')).toBeVisible()
    await modal.getByRole('button', { name: 'Fermer' }).first().click()

    // "Payé" badge visible
    await expect(page.locator('[aria-label="Facture payée"]').first()).toBeVisible()

    // Reset button appears
    const resetBtn = page.locator('button[aria-label="Réinitialiser les paiements de démonstration"]')
    await expect(resetBtn).toBeVisible()
    await resetBtn.click()

    // "Payé" badge gone, "Payer" button back
    await expect(page.locator('[aria-label="Facture payée"]')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Payer la facture FAC202602144739' })).toBeVisible()
  })
})

/* ────────────────────────────────────────────
   12. Fermeture de la modale
──────────────────────────────────────────── */
test.describe('Fermeture de la modale', () => {
  test('le bouton X ferme la modale', async ({ page }) => {
    await page.getByRole('button', { name: 'Payer la facture FAC202602144739' }).click()
    const modal = page.getByRole('dialog', { name: 'Paiement de la facture' })
    await expect(modal).toBeVisible()

    await page.getByRole('button', { name: 'Fermer' }).click()
    await expect(modal).not.toBeVisible()
  })

  test('cliquer sur l overlay ferme la modale', async ({ page }) => {
    await page.getByRole('button', { name: 'Payer la facture FAC202602144739' }).click()
    const modal = page.getByRole('dialog', { name: 'Paiement de la facture' })
    await expect(modal).toBeVisible()

    // Click on the overlay (top-left corner, outside the modal box)
    await page.mouse.click(5, 5)
    await expect(modal).not.toBeVisible()
  })
})

/* ────────────────────────────────────────────
   13. Bannière de simulation
──────────────────────────────────────────── */
test.describe('Bannière de simulation', () => {
  test('la bannière est visible avant le paiement et disparaît après', async ({ page }) => {
    await page.getByRole('button', { name: 'Payer la facture FAC202602144739' }).click()
    const modal = page.getByRole('dialog', { name: 'Paiement de la facture' })

    // Banner visible before payment
    const banner = modal.locator('[role="note"]')
    await expect(banner).toBeVisible()
    await expect(banner).toContainText('Application de démonstration')

    // Pay via virement (instant)
    await modal.getByRole('button', { name: /Virement/ }).click()
    await modal.getByRole('button', { name: 'Confirmer le virement' }).click()

    // Banner disappears after success
    await expect(banner).not.toBeVisible()
  })
})
