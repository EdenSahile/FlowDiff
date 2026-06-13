import type { Facture } from '@/data/mockFactures'
import { VENDEUR } from '@/data/mockFactures'

/* ── Helpers ── */
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })

const fmtEur = (n: number) =>
  n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'

const fmtPct = (n: number) =>
  n === 0 ? '—' : n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %'

/* ── HTML template ── */
function buildHtml(f: Facture): string {
  const lignesHtml = f.lignes.map((l, i) => {
    // ppHT = donnée source (tarif éditeur) ; le prix public TTC en est dérivé
    const ppTTC = l.ppHT * 1.055
    return `
    <tr class="${i % 2 === 0 ? 'row-even' : 'row-odd'}">
      <td class="center">${i + 1}</td>
      <td>${l.designation}</td>
      <td class="mono">${l.isbn}</td>
      <td>${l.editeur}</td>
      <td class="center">${l.quantite}</td>
      <td class="right gray">${fmtEur(ppTTC)}</td>
      <td class="right gray">${fmtEur(l.ppHT)}</td>
      <td class="center remise-pct">${fmtPct(l.remisePct)}</td>
      <td class="right bold">${fmtEur(l.puHT)}</td>
      <td class="right bold">${fmtEur(l.montantHT)}</td>
      <td class="right">${fmtEur(l.montantTTC)}</td>
    </tr>`
  }).join('')

  const modePaiementLabel: Record<string, string> = {
    virement:    'Virement bancaire',
    cheque:      'Chèque',
    prelevement: 'Prélèvement automatique',
  }

  const totalsRemiseLine = f.remiseMontant > 0 ? `
        <tr>
          <td>Total brut H.T.</td>
          <td>${fmtEur(f.totalBrutHT)}</td>
        </tr>
        <tr>
          <td>Remise totale</td>
          <td style="color:#C0392B;font-weight:600">− ${fmtEur(f.remiseMontant)}</td>
        </tr>` : ''

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Facture ${f.numero}</title>
<style>
  /* ── Reset ── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 11px;
    color: #1a1a1a;
    background: #f0f0ec;
  }

  /* ── Barre d'actions (masquée à l'impression) ── */
  .toolbar {
    background: #232f3e;
    color: #fff;
    padding: 12px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    font-size: 13px;
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .toolbar-title { font-weight: 600; letter-spacing: 0.02em; }
  .toolbar-actions { display: flex; gap: 10px; }
  .btn {
    padding: 8px 18px;
    border: none;
    border-radius: 3px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    letter-spacing: 0.02em;
  }
  .btn-primary { background: #C9A84C; color: #232f3e; }
  .btn-primary:hover { background: #b8943f; }
  .btn-secondary {
    background: rgba(255,255,255,0.12);
    color: #fff;
    border: 1px solid rgba(255,255,255,0.25);
  }
  .btn-secondary:hover { background: rgba(255,255,255,0.2); }

  /* ── Page A4 ── */
  .page-wrap { padding: 24px 16px 48px; }
  .invoice {
    background: #fff;
    max-width: 860px;
    margin: 0 auto;
    padding: 32px 36px 40px;
    box-shadow: 0 2px 16px rgba(0,0,0,0.10);
  }

  /* ── En-tête ── */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 28px;
    padding-bottom: 20px;
    border-bottom: 2px solid #232f3e;
  }
  .brand-name {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: #232f3e;
    line-height: 1;
  }
  .brand-diff { color: #C9A84C; }
  .brand-pro {
    display: inline-block;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #C9A84C;
    border: 1.5px solid #C9A84C;
    padding: 1px 4px;
    border-radius: 2px;
    margin-left: 4px;
    vertical-align: middle;
    line-height: 1.4;
  }
  .brand-tagline { font-size: 9px; color: #666; margin-top: 3px; letter-spacing: 0.2px; }
  .invoice-ref { text-align: right; }
  .invoice-ref-title { font-size: 18px; font-weight: 800; color: #232f3e; letter-spacing: -0.3px; }
  .invoice-ref-num { font-size: 11px; color: #444; margin-top: 2px; font-family: 'Courier New', monospace; }
  .invoice-date { font-size: 10px; color: #666; margin-top: 6px; }

  /* ── Bloc adresses ── */
  .addresses { display: flex; gap: 24px; margin-bottom: 20px; }
  .addr-block {
    flex: 1;
    padding: 14px 16px;
    background: #f7f7f5;
    border-left: 3px solid #232f3e;
  }
  .addr-block.client-block { border-left-color: #C9A84C; }
  .addr-label { font-size: 8px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #888; margin-bottom: 8px; }
  .addr-name { font-size: 12px; font-weight: 700; color: #111; margin-bottom: 4px; }
  .addr-line { font-size: 10px; color: #444; line-height: 1.6; }
  .addr-meta { font-size: 9px; color: #888; margin-top: 6px; line-height: 1.6; }
  .client-code-block { margin-top: 10px; padding-top: 8px; border-top: 1px solid #ddd; }
  .client-code-label { font-size: 8px; text-transform: uppercase; letter-spacing: 1.5px; color: #888; font-weight: 700; display: block; margin-bottom: 3px; }
  .client-code-value { font-size: 15px; font-weight: 800; color: #232f3e; font-family: 'Courier New', monospace; letter-spacing: 0.05em; }

  /* ── Références commande ── */
  .ref-bar {
    background: #f0f0ec;
    border: 1px solid #e0e0db;
    padding: 8px 16px;
    margin-bottom: 20px;
    display: flex;
    gap: 32px;
    font-size: 10px;
    flex-wrap: wrap;
  }
  .ref-item { display: flex; flex-direction: column; gap: 2px; }
  .ref-item-label { font-size: 8px; text-transform: uppercase; letter-spacing: 1px; color: #888; font-weight: 600; }
  .ref-item-value { font-weight: 600; color: #111; font-family: 'Courier New', monospace; }

  /* ── Tableau lignes ── */
  .table-wrapper { margin-bottom: 16px; overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 9px; }
  thead tr { background: #232f3e; color: #fff; }
  thead th {
    padding: 7px 6px;
    text-align: left;
    font-size: 8px;
    font-weight: 600;
    letter-spacing: 0.4px;
    white-space: nowrap;
  }
  thead th.right { text-align: right; }
  thead th.center { text-align: center; }
  tbody td {
    padding: 5px 6px;
    vertical-align: top;
    border-bottom: 1px solid #eee;
    line-height: 1.4;
  }
  .row-even { background: #fff; }
  .row-odd  { background: #f9f9f7; }
  td.right  { text-align: right; white-space: nowrap; }
  td.center { text-align: center; }
  td.mono   { font-family: 'Courier New', monospace; font-size: 8px; }
  td.gray   { color: #888; }
  td.bold   { font-weight: 700; }
  td.remise-pct { color: #C0392B; font-weight: 600; }

  /* ── Totaux ── */
  .totals-block { display: flex; justify-content: flex-end; margin-bottom: 24px; }
  .totals-table { min-width: 300px; border: 1px solid #ddd; }
  .totals-table td { padding: 6px 14px; font-size: 10px; border-bottom: 1px solid #eee; }
  .totals-table td:first-child { color: #555; }
  .totals-table td:last-child { text-align: right; font-weight: 600; }
  .totals-total-row td {
    background: #232f3e;
    color: #fff !important;
    font-weight: 700 !important;
    font-size: 12px !important;
    border-bottom: none !important;
  }

  /* ── Paiement ── */
  .payment-section { display: flex; gap: 20px; margin-bottom: 24px; flex-wrap: wrap; }
  .payment-block { flex: 1; min-width: 200px; padding: 12px 14px; background: #f7f7f5; border: 1px solid #e0e0db; }
  .payment-title { font-size: 9px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #888; margin-bottom: 6px; }
  .payment-value { font-size: 11px; font-weight: 600; color: #111; }
  .payment-sub { font-size: 9px; color: #666; margin-top: 3px; line-height: 1.5; }

  /* ── Mentions légales ── */
  .legal { border-top: 1px solid #e0e0db; padding-top: 14px; font-size: 8.5px; color: #888; line-height: 1.6; }
  .legal p + p { margin-top: 4px; }
  .legal strong { color: #555; }

  /* ── Pied de page ── */
  .page-footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #ddd; font-size: 8.5px; color: #aaa; text-align: center; line-height: 1.7; }

  /* ── Print ── */
  @media print {
    body { background: #fff; }
    .toolbar { display: none !important; }
    .page-wrap { padding: 0; }
    .invoice { box-shadow: none; max-width: 100%; padding: 14mm 16mm 18mm; }
    @page { size: A4 landscape; margin: 0; }
  }
</style>
</head>
<body>

<div class="toolbar">
  <span class="toolbar-title">FlowDiff PRO — ${f.numero}</span>
  <div class="toolbar-actions">
    <button class="btn btn-secondary" onclick="window.close()">✕ Fermer</button>
    <button class="btn btn-primary" onclick="window.print()">⬇&nbsp; Télécharger en PDF</button>
  </div>
</div>

<div class="page-wrap">
<div class="invoice">

  <!-- En-tête -->
  <div class="header">
    <div class="brand-block">
      <div class="brand-name">Flow<span class="brand-diff">Diff</span><span class="brand-pro">PRO</span></div>
      <div class="brand-tagline">La diffusion au service des libraires.</div>
    </div>
    <div class="invoice-ref">
      <div class="invoice-ref-title">FACTURE</div>
      <div class="invoice-ref-num">${f.numero}</div>
      <div class="invoice-date">Émise le ${fmtDate(f.date)}</div>
    </div>
  </div>

  <!-- Bandeau factice -->
  <div style="
    background: repeating-linear-gradient(
      -45deg,
      #fff3cd,
      #fff3cd 12px,
      #ffe69c 12px,
      #ffe69c 24px
    );
    border: 2px solid #d4a017;
    padding: 10px 20px;
    margin-bottom: 20px;
    text-align: center;
    font-size: 13px;
    font-weight: 700;
    color: #7a5800;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  ">
    ⚠ Document fictif — à des fins de démonstration uniquement
  </div>

  <!-- Adresses -->
  <div class="addresses">
    <div class="addr-block">
      <div class="addr-label">Émetteur</div>
      <div class="addr-name">${VENDEUR.raisonSociale}</div>
      <div class="addr-line">${VENDEUR.adresse}</div>
      <div class="addr-line">${VENDEUR.codePostal} ${VENDEUR.ville}</div>
      <div class="addr-meta">
        SIRET&nbsp;: ${VENDEUR.siret}<br>
        TVA Intracom.&nbsp;: ${VENDEUR.numTVA}<br>
        RCS ${VENDEUR.rcs}<br>
        Capital social&nbsp;: ${VENDEUR.capital}<br>
        APE&nbsp;: ${VENDEUR.codeAPE}
      </div>
    </div>
    <div class="addr-block client-block">
      <div class="addr-label">Destinataire</div>
      <div class="addr-name">${f.client.nomLibrairie}</div>
      <div class="addr-line">${f.client.adresse}</div>
      <div class="addr-line">${f.client.codePostal} ${f.client.ville}</div>
      <div class="client-code-block">
        <span class="client-code-label">Code client</span>
        <span class="client-code-value">${f.client.codeClient}</span>
      </div>
    </div>
  </div>

  <!-- Références -->
  <div class="ref-bar">
    <div class="ref-item">
      <span class="ref-item-label">N° Facture</span>
      <span class="ref-item-value">${f.numero}</span>
    </div>
    <div class="ref-item">
      <span class="ref-item-label">Date d'émission</span>
      <span class="ref-item-value">${fmtDate(f.date)}</span>
    </div>
    <div class="ref-item">
      <span class="ref-item-label">Date d'échéance</span>
      <span class="ref-item-value">${fmtDate(f.dateEcheance)}</span>
    </div>
    <div class="ref-item">
      <span class="ref-item-label">Date de livraison</span>
      <span class="ref-item-value">${fmtDate(f.dateLivraison)}</span>
    </div>
    <div class="ref-item">
      <span class="ref-item-label">Réf. commande</span>
      <span class="ref-item-value">${f.refCommande}</span>
    </div>
  </div>

  <!-- Tableau des lignes -->
  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th style="width:22px" class="center">N°</th>
          <th>Désignation</th>
          <th style="width:96px">ISBN</th>
          <th style="width:72px">Éditeur</th>
          <th style="width:28px" class="center">Qté</th>
          <th style="width:56px" class="right">PP T.T.C.</th>
          <th style="width:54px" class="right">PP H.T.</th>
          <th style="width:44px" class="center">Rem %</th>
          <th style="width:58px" class="right">PU H.T.</th>
          <th style="width:66px" class="right">Mnt H.T.</th>
          <th style="width:68px" class="right">Mnt T.T.C.</th>
        </tr>
      </thead>
      <tbody>
        ${lignesHtml}
      </tbody>
    </table>
  </div>

  <!-- Totaux -->
  <div class="totals-block">
    <table class="totals-table">
      <tbody>
        ${totalsRemiseLine}
        <tr>
          <td>Net H.T.</td>
          <td>${fmtEur(f.netHT)}</td>
        </tr>
        <tr>
          <td>TVA ${f.tauxTVA}&nbsp;% (livres)</td>
          <td>${fmtEur(f.montantTVA)}</td>
        </tr>
        <tr class="totals-total-row">
          <td>Total T.T.C.</td>
          <td>${fmtEur(f.totalTTC)}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Paiement -->
  <div class="payment-section">
    <div class="payment-block">
      <div class="payment-title">Mode de règlement</div>
      <div class="payment-value">${modePaiementLabel[f.modePaiement] ?? f.modePaiement}</div>
    </div>
    <div class="payment-block">
      <div class="payment-title">Conditions de paiement</div>
      <div class="payment-value">${f.conditionsPaiement}</div>
      <div class="payment-sub">Date d'échéance&nbsp;: <strong>${fmtDate(f.dateEcheance)}</strong></div>
    </div>
    <div class="payment-block">
      <div class="payment-title">Coordonnées bancaires</div>
      <div class="payment-sub">
        Nom banque - Ville<br>
        IBAN&nbsp;: FR76 XXXX XXXX XXXX XXXX XXXX XXX<br>
        BIC&nbsp;: XXXXXXXXX
      </div>
    </div>
  </div>

  <!-- Mentions légales obligatoires (art. L.441-9 et L.441-10 C.com.) -->
  <div class="legal">
    <p><strong>Pénalités de retard</strong>&nbsp;: En cas de non-paiement à l'échéance, des pénalités de retard au taux de 3&nbsp;fois le taux d'intérêt légal en vigueur seront exigibles de plein droit, sans mise en demeure préalable (art.&nbsp;L.441-10 C.com.). Le taux d'intérêt légal applicable est celui fixé par décret semestriel.</p>
    <p><strong>Indemnité forfaitaire pour frais de recouvrement</strong>&nbsp;: Tout retard de paiement entraîne de plein droit le versement d'une indemnité forfaitaire de <strong>40&nbsp;€</strong> pour frais de recouvrement (décret&nbsp;n°&nbsp;2012-1115 du 02/10/2012). Lorsque les frais de recouvrement exposés sont supérieurs à ce montant, une indemnité complémentaire pourra être réclamée sur justificatif.</p>
    <p><strong>Pas d'escompte</strong> pour paiement anticipé. Facture soumise à la TVA au taux de ${f.tauxTVA}&nbsp;% (taux réduit applicable aux livres — art.&nbsp;278-0 bis CGI). TVA collectée sur les débits.</p>
  </div>

  <!-- Pied de page -->
  <div class="page-footer">
    ${VENDEUR.raisonSociale} — ${VENDEUR.adresse}, ${VENDEUR.codePostal} ${VENDEUR.ville}<br>
    Tél.&nbsp;: ${VENDEUR.telephone} — ${VENDEUR.email}<br>
    SIRET&nbsp;: ${VENDEUR.siret} — N°&nbsp;TVA&nbsp;: ${VENDEUR.numTVA} — RCS ${VENDEUR.rcs} — Capital&nbsp;: ${VENDEUR.capital}
  </div>

</div>
</div>

</body>
</html>`
}

/* ── Export principal ── */
export function openInvoicePDF(facture: Facture): void {
  const html   = buildHtml(facture)
  const blob   = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url    = URL.createObjectURL(blob)
  const newTab = window.open(url, '_blank')

  if (newTab) {
    newTab.addEventListener('load', () => URL.revokeObjectURL(url), { once: true })
  }
}
