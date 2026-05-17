import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { adminColors } from '@/admin/adminTheme'
import { StatutBadge } from '@/admin/components/StatutBadge'
import {
  getAllCommandes,
  getAllLibraires,
  countLivres,
  computeCAMois,
  computeTop5,
} from '@/admin/services/adminServices'
import type { Commande } from '@/admin/types'

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}

export function AdminDashboardPage() {
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [nbLibraires, setNbLibraires] = useState(0)
  const [nbLivres, setNbLivres] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [cmds, libs, nb] = await Promise.all([
        getAllCommandes(),
        getAllLibraires(),
        countLivres(),
      ])
      setCommandes(cmds)
      setNbLibraires(libs.filter(l => l.statut === 'actif').length)
      setNbLivres(nb)
      setLoading(false)
    }
    load()
  }, [])

  const caMois = computeCAMois(commandes)
  const enAttente = commandes.filter(c => c.statut === 'en_preparation').length
  const recentes = commandes.slice(0, 5)
  const top5 = computeTop5(commandes)

  return (
    <Page>
      <PageHeader>
        <PageTitle>Dashboard</PageTitle>
        <PageSub>Vue d'ensemble de l'activité FlowDiff</PageSub>
      </PageHeader>

      <KpiGrid>
        <KpiCard>
          <KpiLabel>CA du mois</KpiLabel>
          <KpiValue>{loading ? '…' : fmt(caMois)}</KpiValue>
        </KpiCard>
        <KpiCard>
          <KpiLabel>Commandes en attente</KpiLabel>
          <KpiValue>{loading ? '…' : enAttente}</KpiValue>
        </KpiCard>
        <KpiCard>
          <KpiLabel>Livres au catalogue</KpiLabel>
          <KpiValue>{loading ? '…' : nbLivres}</KpiValue>
        </KpiCard>
        <KpiCard>
          <KpiLabel>Librairies actives</KpiLabel>
          <KpiValue>{loading ? '…' : nbLibraires}</KpiValue>
        </KpiCard>
      </KpiGrid>

      <TablesRow>
        <TableSection>
          <TableHeader>
            <SectionTitle>Commandes récentes</SectionTitle>
            <SeeAll to="/admin/commandes">Voir tout →</SeeAll>
          </TableHeader>
          <Table>
            <thead>
              <tr>
                <Th>Date</Th>
                <Th>Librairie</Th>
                <Th>Montant TTC</Th>
                <Th>Statut</Th>
              </tr>
            </thead>
            <tbody>
              {recentes.map(c => (
                <Tr key={c.id}>
                  <Td>{new Date(c.date).toLocaleDateString('fr-FR')}</Td>
                  <Td>{c.librairie}</Td>
                  <Td>{fmt(c.montant_ttc)}</Td>
                  <Td><StatutBadge statut={c.statut} /></Td>
                </Tr>
              ))}
              {recentes.length === 0 && (
                <tr><Td colSpan={4} style={{ textAlign: 'center', color: adminColors.textSecondary }}>Aucune commande</Td></tr>
              )}
            </tbody>
          </Table>
        </TableSection>

        <TableSection>
          <TableHeader>
            <SectionTitle>Top livres commandés</SectionTitle>
          </TableHeader>
          <Table>
            <thead>
              <tr>
                <Th>#</Th>
                <Th>Titre</Th>
                <Th>ISBN</Th>
                <Th>Qté totale</Th>
              </tr>
            </thead>
            <tbody>
              {top5.map((b, i) => (
                <Tr key={b.isbn}>
                  <Td style={{ fontWeight: 700, color: adminColors.accent }}>{i + 1}</Td>
                  <Td>{b.titre}</Td>
                  <Td style={{ color: adminColors.textSecondary, fontSize: 12 }}>{b.isbn}</Td>
                  <Td><strong>{b.total}</strong></Td>
                </Tr>
              ))}
              {top5.length === 0 && (
                <tr><Td colSpan={4} style={{ textAlign: 'center', color: adminColors.textSecondary }}>Aucune donnée</Td></tr>
              )}
            </tbody>
          </Table>
        </TableSection>
      </TablesRow>
    </Page>
  )
}

const Page = styled.div`
  padding: 32px 40px;
  max-width: 1200px;
`

const PageHeader = styled.div`
  margin-bottom: 28px;
`

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${adminColors.textPrimary};
  margin: 0 0 4px;
`

const PageSub = styled.p`
  font-size: 14px;
  color: ${adminColors.textSecondary};
  margin: 0;
`

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
`

const KpiCard = styled.div`
  background: ${adminColors.surface};
  border-radius: 12px;
  padding: 20px 24px;
  border: 1px solid ${adminColors.border};
`

const KpiLabel = styled.p`
  font-size: 12px;
  font-weight: 600;
  color: ${adminColors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 8px;
`

const KpiValue = styled.p`
  font-size: 26px;
  font-weight: 700;
  color: ${adminColors.textPrimary};
  margin: 0;
`

const TablesRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
`

const TableSection = styled.div`
  background: ${adminColors.surface};
  border-radius: 12px;
  border: 1px solid ${adminColors.border};
  overflow: hidden;
`

const TableHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid ${adminColors.border};
`

const SectionTitle = styled.h2`
  font-size: 15px;
  font-weight: 700;
  color: ${adminColors.textPrimary};
  margin: 0;
`

const SeeAll = styled(Link)`
  font-size: 13px;
  color: ${adminColors.accent};
  text-decoration: none;
  &:hover { text-decoration: underline; }
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`

const Th = styled.th`
  text-align: left;
  padding: 10px 20px;
  font-size: 11px;
  font-weight: 700;
  color: ${adminColors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${adminColors.pageBg};
  border-bottom: 1px solid ${adminColors.border};
`

const Tr = styled.tr`
  &:nth-child(even) td { background: ${adminColors.rowAlt}; }
`

const Td = styled.td`
  padding: 12px 20px;
  font-size: 13px;
  color: ${adminColors.textPrimary};
  border-bottom: 1px solid ${adminColors.border};
`
