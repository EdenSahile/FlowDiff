import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { adminColors } from '@/admin/adminTheme'
import { AdminModal } from '@/admin/components/AdminModal'
import { StatutBadge } from '@/admin/components/StatutBadge'
import { getAllCommandes, updateCommandeStatut } from '@/admin/services/adminServices'
import type { Commande, StatutCommande } from '@/admin/types'

const STATUTS: StatutCommande[] = ['en_preparation', 'expedie', 'livre', 'annule']
const STATUT_LABELS: Record<StatutCommande, string> = {
  en_preparation: 'En préparation',
  expedie:        'Expédié',
  livre:          'Livré',
  annule:         'Annulé',
}

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}

export function AdminCommandesPage() {
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [filtered, setFiltered] = useState<Commande[]>([])
  const [search, setSearch] = useState('')
  const [statutFilter, setStatutFilter] = useState('tous')
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState<Commande | null>(null)

  async function reload() {
    setLoading(true)
    const data = await getAllCommandes()
    setCommandes(data)
    setLoading(false)
  }

  useEffect(() => { reload() }, [])

  useEffect(() => {
    let list = commandes
    if (statutFilter !== 'tous') list = list.filter(c => c.statut === statutFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.librairie.toLowerCase().includes(q) ||
        c.code_client.toLowerCase().includes(q)
      )
    }
    setFiltered(list)
  }, [commandes, search, statutFilter])

  async function handleStatutChange(id: string, statut: StatutCommande) {
    await updateCommandeStatut(id, statut)
    setCommandes(prev => prev.map(c => c.id === id ? { ...c, statut } : c))
  }

  return (
    <Page>
      <PageHeader>
        <div>
          <PageTitle>Commandes</PageTitle>
          <PageSub>{filtered.length} commande{filtered.length > 1 ? 's' : ''}</PageSub>
        </div>
      </PageHeader>

      <Toolbar>
        <SearchInput
          placeholder="Rechercher librairie, code client…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <TypeSelect value={statutFilter} onChange={e => setStatutFilter(e.target.value)}>
          <option value="tous">Tous les statuts</option>
          {STATUTS.map(s => <option key={s} value={s}>{STATUT_LABELS[s]}</option>)}
        </TypeSelect>
      </Toolbar>

      <TableWrap>
        <Table>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Code client</Th>
              <Th>Librairie</Th>
              <Th>Montant TTC</Th>
              <Th>Statut</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><Td colSpan={6} style={{ textAlign: 'center', color: adminColors.textSecondary }}>Chargement…</Td></tr>}
            {!loading && filtered.map(c => (
              <Tr key={c.id}>
                <Td>{new Date(c.date).toLocaleDateString('fr-FR')}</Td>
                <Td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{c.code_client}</Td>
                <Td>{c.librairie}</Td>
                <Td style={{ fontWeight: 600 }}>{fmt(c.montant_ttc)}</Td>
                <Td>
                  <StatutSelect
                    value={c.statut}
                    onChange={e => handleStatutChange(c.id, e.target.value as StatutCommande)}
                  >
                    {STATUTS.map(s => <option key={s} value={s}>{STATUT_LABELS[s]}</option>)}
                  </StatutSelect>
                </Td>
                <Td>
                  <ActionBtn onClick={() => setDetail(c)}>Détail</ActionBtn>
                </Td>
              </Tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><Td colSpan={6} style={{ textAlign: 'center', color: adminColors.textSecondary }}>Aucune commande</Td></tr>
            )}
          </tbody>
        </Table>
      </TableWrap>

      {detail && (
        <AdminModal title={`Commande — ${detail.librairie}`} onClose={() => setDetail(null)} width={600}>
          <DetailGrid>
            <DetailRow><DetailLabel>Librairie</DetailLabel><DetailVal>{detail.librairie}</DetailVal></DetailRow>
            <DetailRow><DetailLabel>Code client</DetailLabel><DetailVal style={{ fontFamily: 'monospace' }}>{detail.code_client}</DetailVal></DetailRow>
            <DetailRow><DetailLabel>Date</DetailLabel><DetailVal>{new Date(detail.date).toLocaleDateString('fr-FR')}</DetailVal></DetailRow>
            <DetailRow><DetailLabel>Statut</DetailLabel><DetailVal><StatutBadge statut={detail.statut} /></DetailVal></DetailRow>
          </DetailGrid>
          <ArticlesTitle>Articles commandés</ArticlesTitle>
          <Table style={{ marginBottom: 16 }}>
            <thead>
              <tr>
                <Th>Titre</Th>
                <Th>ISBN</Th>
                <Th style={{ textAlign: 'right' }}>Qté</Th>
                <Th style={{ textAlign: 'right' }}>Prix unit.</Th>
                <Th style={{ textAlign: 'right' }}>Sous-total</Th>
              </tr>
            </thead>
            <tbody>
              {detail.articles.map((art, i) => (
                <Tr key={i}>
                  <Td>{art.titre}</Td>
                  <Td style={{ fontFamily: 'monospace', fontSize: 12, color: adminColors.textSecondary }}>{art.isbn}</Td>
                  <Td style={{ textAlign: 'right' }}>{art.quantite}</Td>
                  <Td style={{ textAlign: 'right' }}>{art.prix_ttc.toFixed(2)} €</Td>
                  <Td style={{ textAlign: 'right', fontWeight: 600 }}>{(art.quantite * art.prix_ttc).toFixed(2)} €</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
          <Totals>
            <TotalRow><span>Montant HT</span><span>{fmt(detail.montant_ht)}</span></TotalRow>
            <TotalRow><span>TVA 5,5%</span><span>{fmt(detail.montant_ttc - detail.montant_ht)}</span></TotalRow>
            <TotalRow style={{ fontWeight: 700, fontSize: 15 }}><span>Total TTC</span><span>{fmt(detail.montant_ttc)}</span></TotalRow>
          </Totals>
        </AdminModal>
      )}
    </Page>
  )
}

const Page = styled.div` padding: 32px 40px; max-width: 1200px; `
const PageHeader = styled.div` display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; `
const PageTitle = styled.h1` font-size: 24px; font-weight: 700; color: ${adminColors.textPrimary}; margin: 0 0 4px; `
const PageSub = styled.p` font-size: 14px; color: ${adminColors.textSecondary}; margin: 0; `
const Toolbar = styled.div` display: flex; gap: 12px; margin-bottom: 16px; `
const SearchInput = styled.input`
  flex: 1; border: 1px solid ${adminColors.border}; border-radius: 8px;
  padding: 9px 14px; font-size: 14px; font-family: 'Open Sans', sans-serif;
  &:focus { outline: none; border-color: ${adminColors.accent}; }
`
const TypeSelect = styled.select`
  border: 1px solid ${adminColors.border}; border-radius: 8px; padding: 9px 14px;
  font-size: 14px; font-family: 'Open Sans', sans-serif; background: ${adminColors.surface};
`
const StatutSelect = styled.select`
  border: 1px solid ${adminColors.border}; border-radius: 6px; padding: 4px 8px;
  font-size: 12px; font-family: 'Open Sans', sans-serif; background: ${adminColors.surface}; cursor: pointer;
`
const TableWrap = styled.div` background: ${adminColors.surface}; border-radius: 12px; border: 1px solid ${adminColors.border}; overflow: hidden; `
const Table = styled.table` width: 100%; border-collapse: collapse; `
const Th = styled.th`
  text-align: left; padding: 10px 16px; font-size: 11px; font-weight: 700;
  color: ${adminColors.textSecondary}; text-transform: uppercase; letter-spacing: 0.5px;
  background: ${adminColors.pageBg}; border-bottom: 1px solid ${adminColors.border};
`
const Tr = styled.tr` &:nth-child(even) td { background: ${adminColors.rowAlt}; } `
const Td = styled.td` padding: 10px 16px; font-size: 13px; color: ${adminColors.textPrimary}; border-bottom: 1px solid ${adminColors.border}; `
const ActionBtn = styled.button`
  background: none; border: 1px solid ${adminColors.accent}; color: ${adminColors.accent};
  border-radius: 6px; padding: 4px 12px; font-size: 12px; cursor: pointer; font-family: 'Open Sans', sans-serif;
  &:hover { background: ${adminColors.accent}; color: #fff; }
`
const DetailGrid = styled.div` display: grid; gap: 8px; margin-bottom: 20px; `
const DetailRow = styled.div` display: flex; gap: 16px; `
const DetailLabel = styled.span` font-size: 13px; color: ${adminColors.textSecondary}; width: 120px; flex-shrink: 0; `
const DetailVal = styled.span` font-size: 13px; color: ${adminColors.textPrimary}; font-weight: 500; `
const ArticlesTitle = styled.h3` font-size: 14px; font-weight: 700; color: ${adminColors.textPrimary}; margin: 0 0 12px; `
const Totals = styled.div` border-top: 2px solid ${adminColors.border}; padding-top: 12px; display: flex; flex-direction: column; gap: 6px; `
const TotalRow = styled.div` display: flex; justify-content: space-between; font-size: 14px; color: ${adminColors.textPrimary}; `
