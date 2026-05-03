import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'
import { useAuthContext } from '@/contexts/AuthContext'
import { useEDI } from '@/contexts/EDIContext'
import { theme } from '@/lib/theme'
import { useToast } from '@/contexts/ToastContext'
import { EDIMessageModal } from '@/components/edi/EDIMessageModal'
import { DesadvGroupedList } from '@/components/edi/DesadvGroupedList'
import { exportToCSV } from '@/lib/csv'
import {
  filterEDIMessages,
  messageContainsISBN,
  getFluxCounts,
  formatEDITypeLabel,
  formatEDIStatusLabel,
  getBusinessStatus,
  type EDIMessage,
  type EDIFilter,
} from '@/lib/ediUtils'

/* ════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════ */
function fmtDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' '
    + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

const DIFFUSEURS = [
  'Diffuseur 1',
  'Diffuseur 2',
  'Diffuseur 3',
  'Diffuseur 4',
  'Diffuseur 5',
]

/* ════════════════════════════════════════════════════
   STYLED — layout racine
════════════════════════════════════════════════════ */
const Page = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 1200px;
  margin: 0 auto;
`

const PageHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`

const TitleBlock = styled.div``

const Title = styled.h1`
  font-size: 1.375rem;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  letter-spacing: -0.4px;
  margin-bottom: 4px;
`

const Subtitle = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.gray[400]};
`

const DocBtn = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  font-size: 0.8125rem;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.navy};
  text-decoration: none;
  white-space: nowrap;
  &:hover { background: ${({ theme }) => theme.colors.gray[50]}; }
`

/* ── Grille 3 statcards ── */
const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`

const Card = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  padding: 20px;
`

const CardTitle = styled.div`
  font-size: 0.8125rem;
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.gray[600]};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
`

/* statcard 1 — Statut */
const ConnectedBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${({ theme }) => theme.colors.primaryLight};
  padding: 10px 14px;
  margin-bottom: 16px;
`

const GreenDot = styled.span`
  width: 8px; height: 8px;
  background: ${({ theme }) => theme.colors.success};
  border-radius: 50%;
  flex-shrink: 0;
`

const ConnectedLabel = styled.div`
  font-size: 0.875rem;
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.success};
`

const SyncLabel = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.gray[400]};
`

const MetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  font-size: 0.8125rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[100]};
  &:last-child { border-bottom: none; }
`

const MetaLabel = styled.span`
  color: ${({ theme }) => theme.colors.gray[400]};
`

const MetaValue = styled.span`
  color: ${({ theme }) => theme.colors.navy};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  font-size: 0.75rem;
`

const ActiveBadge = styled.span`
  padding: 2px 8px;
  background: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.success};
  font-size: 0.75rem;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
`

/* statcard 2 — Diffuseurs */
const DiffuseurItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 0.8125rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[100]};
  &:last-of-type { border-bottom: none; }
`

const DiffName = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.navy};
`

const GererBtn = styled.button`
  width: 100%;
  margin-top: 14px;
  padding: 8px;
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  background: ${({ theme }) => theme.colors.white};
  font-size: 0.8125rem;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  color: ${({ theme }) => theme.colors.navy};
  cursor: default;
  opacity: 0.7;
`

/* statcard 3 — Flux */
const FluxGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`

const FluxItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
`

const FluxIcon = styled.div`
  width: 36px; height: 36px;
  background: ${({ theme }) => theme.colors.gray[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
`

const FluxCount = styled.div`
  font-size: 1.375rem;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  line-height: 1;
`

const FluxLabel = styled.div`
  font-size: 0.8125rem;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.navy};
`

const FluxSub = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.gray[400]};
`

/* ════════════════════════════════════════════════════
   STYLED — layout principal (table + panel)
════════════════════════════════════════════════════ */
const MainLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`

/* ── Section Historique ── */
const HistoriqueSection = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  padding: 20px;
`

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`

const SectionTitle = styled.h2`
  font-size: 1rem;
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.navy};
`

const SectionActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const DateRange = styled.span`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.gray[400]};
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
`

const ExportBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  background: ${({ theme }) => theme.colors.white};
  font-size: 0.8125rem;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.navy};
  cursor: pointer;
  &:hover { background: ${({ theme }) => theme.colors.gray[50]}; }
`

/* Recherche ISBN */
const SearchRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`

const SearchIcon = styled.span`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.gray[400]};
  flex-shrink: 0;
`

const ISBNInput = styled.input`
  flex: 1;
  max-width: 280px;
  padding: 7px 10px;
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  font-size: 0.8125rem;
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  color: ${({ theme }) => theme.colors.navy};
  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.navy}; }
  &::placeholder { font-family: ${({ theme }) => theme.typography.fontFamily}; color: ${({ theme }) => theme.colors.gray[400]}; }
`

const ClearBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.gray[400]};
  padding: 4px;
  line-height: 1;
  &:hover { color: ${({ theme }) => theme.colors.navy}; }
`

/* Onglets filtres */
const TabsRow = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`

const Tab = styled.button<{ $active: boolean }>`
  padding: 6px 12px;
  font-size: 0.8125rem;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-weight: ${({ $active, theme }) =>
    $active ? theme.typography.weights.semibold : theme.typography.weights.normal};
  border: 1.5px solid ${({ $active, theme }) =>
    $active ? theme.colors.navy : theme.colors.gray[200]};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.navy : theme.colors.white};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.white : theme.colors.navy};
  cursor: pointer;
  &:hover {
    background: ${({ $active, theme }) =>
      $active ? theme.colors.navy : theme.colors.gray[50]};
  }
`

/* Tableau */
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
`

const Th = styled.th`
  text-align: left;
  padding: 8px 10px;
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.gray[600]};
  border-bottom: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  white-space: nowrap;
`

const Td = styled.td`
  padding: 10px 10px;
  color: ${({ theme }) => theme.colors.navy};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[100]};
  vertical-align: middle;
`

const StatusBadgeTable = styled.span<{ $status: string }>`
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  background: ${({ $status, theme }) =>
    $status === 'ERROR'  ? '#FDECEA' :
    $status === 'ORDERS' ? theme.colors.accentLight :
    theme.colors.primaryLight};
  color: ${({ $status, theme }) =>
    $status === 'ERROR'  ? theme.colors.error :
    $status === 'ORDERS' ? '#8B6914' :
    theme.colors.success};
`

const DetailBadge = styled.span<{ $variant: 'warning' | 'error' }>`
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  background: ${({ $variant, theme }) =>
    $variant === 'error' ? '#FDECEA' : '#FFF7ED'};
  color: ${({ $variant, theme }) =>
    $variant === 'error' ? theme.colors.error : '#C2410C'};
`

const EyeBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.gray[400]};
  font-size: 1rem;
  padding: 4px;
  &:hover { color: ${({ theme }) => theme.colors.navy}; }
`

const VoirTout = styled.div`
  text-align: center;
  margin-top: 14px;
`

const VoirToutLink = styled.button`
  background: none;
  border: none;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.navy};
  cursor: pointer;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  text-decoration: underline;
  &:hover { color: ${({ theme }) => theme.colors.primaryHover}; }
`

/* ── Panneau droit ── */
const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const PanelCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  padding: 18px;
`

const PanelTitle = styled.h3`
  font-size: 0.9375rem;
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: 10px;
`

const PanelText = styled.p`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.gray[400]};
  margin-bottom: 12px;
  line-height: 1.5;
`

const PrimaryBtn = styled.button`
  width: 100%;
  padding: 10px;
  background: ${({ theme }) => theme.colors.navy};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  font-size: 0.875rem;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  cursor: pointer;
  margin-bottom: 10px;
  &:hover { background: ${({ theme }) => theme.colors.primaryHover}; }
`

const LinkSmall = styled.button`
  background: none;
  border: none;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.navy};
  cursor: pointer;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  text-decoration: underline;
  padding: 0;
`

const RefRow = styled.div`
  display: flex;
  gap: 8px;
`

const RefInput = styled.input`
  flex: 1;
  padding: 8px 10px;
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  font-size: 0.8125rem;
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  color: ${({ theme }) => theme.colors.navy};
  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.navy}; }
`

const AfficherBtn = styled.button`
  padding: 8px 14px;
  border: 1.5px solid ${({ theme }) => theme.colors.navy};
  background: ${({ theme }) => theme.colors.white};
  font-size: 0.8125rem;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.navy};
  cursor: pointer;
  &:hover { background: ${({ theme }) => theme.colors.gray[50]}; }
`

const HelpRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-bottom: 6px;
`

const ContactBtn = styled.button`
  width: 100%;
  margin-top: 12px;
  padding: 8px;
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  background: ${({ theme }) => theme.colors.white};
  font-size: 0.8125rem;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  color: ${({ theme }) => theme.colors.navy};
  cursor: pointer;
  &:hover { background: ${({ theme }) => theme.colors.gray[50]}; }
`

/* ════════════════════════════════════════════════════
   STYLED — Paramètres EDI
════════════════════════════════════════════════════ */
const ParamsCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  padding: 20px;
  margin-bottom: 24px;
`

const ParamsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`

const ToggleRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[100]};
  &:last-child { border-bottom: none; }
`

const ToggleIcon = styled.div`
  width: 32px; height: 32px;
  background: ${({ theme }) => theme.colors.gray[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 0.875rem;
`

const ToggleInfo = styled.div`
  flex: 1;
`

const ToggleLabel = styled.div`
  font-size: 0.875rem;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: 2px;
`

const ToggleSub = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.gray[400]};
`

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
  cursor: pointer;

  input { opacity: 0; width: 0; height: 0; }

  span {
    position: absolute;
    inset: 0;
    background: ${({ theme }) => theme.colors.gray[200]};
    transition: 0.2s;
    &::before {
      content: '';
      position: absolute;
      width: 18px; height: 18px;
      left: 3px; bottom: 3px;
      background: white;
      transition: 0.2s;
    }
  }

  input:checked + span {
    background: ${({ theme }) => theme.colors.accent};
  }

  input:checked + span::before {
    transform: translateX(20px);
  }
`

const ParamsRight = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const DelayRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

const DelayLabel = styled.span`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.navy};
`

const DelaySelect = styled.select`
  padding: 8px 12px;
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  background: ${({ theme }) => theme.colors.white};
  font-size: 0.875rem;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  color: ${({ theme }) => theme.colors.navy};
  cursor: pointer;
  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.navy}; }
`

const ModifierBtn = styled.button`
  align-self: flex-end;
  padding: 8px 18px;
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  background: ${({ theme }) => theme.colors.white};
  font-size: 0.875rem;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.navy};
  cursor: pointer;
  &:hover { background: ${({ theme }) => theme.colors.gray[50]}; }
`

/* ════════════════════════════════════════════════════
   STYLED — Footer EDI
════════════════════════════════════════════════════ */
const EDIFooter = styled.footer`
  border-top: 1px solid ${({ theme }) => theme.colors.gray[200]};
  background: ${({ theme }) => theme.colors.gray[100]};
  padding: 14px 24px;
  text-align: center;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.gray[400]};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 8px;
`

/* ════════════════════════════════════════════════════
   COMPOSANT
════════════════════════════════════════════════════ */
export function EDIPage() {
  const { user } = useAuthContext()
  const { messages, lastSync, params, updateParams } = useEDI()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const initialFilter = (searchParams.get('filter') as EDIFilter | null) ?? 'ALL'
  const [activeFilter, setActiveFilter] = useState<EDIFilter>(initialFilter)
  const [selectedMessage, setSelectedMessage] = useState<EDIMessage | null>(null)
  const [refInput, setRefInput] = useState('')
  const [isbnSearch, setIsbnSearch] = useState('')

  const isbnFiltered = isbnSearch.trim()
    ? messages.filter(m => messageContainsISBN(m, isbnSearch))
    : messages

  const filtered = filterEDIMessages(isbnFiltered, activeFilter)
  const counts   = getFluxCounts(messages)

  const previewRows = [...filtered]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(isbnSearch.trim() ? 0 : -5)

  const pendingOrdersCount = messages.filter(m => m.type === 'ORDERS' && m.status === 'PENDING').length

  function handleExport() {
    exportToCSV(
      `edi-${user?.codeClient ?? 'export'}`,
      ['Date', 'Type', 'Diffuseur', 'Référence', 'Statut', 'Détail'],
      filtered.map(m => [
        fmtDateTime(m.createdAt),
        formatEDITypeLabel(m.type),
        m.diffuseur,
        m.documentRef,
        formatEDIStatusLabel(m.status),
        m.detail,
      ])
    )
  }

  function handleShowMessage() {
    const found = messages.find(m =>
      m.documentRef.toLowerCase() === refInput.trim().toLowerCase()
    )
    if (found) {
      setSelectedMessage(found)
    } else {
      showToast('Référence introuvable', 'error')
    }
  }

  function handleSaveParams() {
    showToast('Paramètres sauvegardés')
  }

  const today   = new Date()
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const dateRange = `${fmtDate(weekAgo.toISOString())} → ${fmtDate(today.toISOString())}`

  return (
    <>
      <Page>
        {/* ── Header ── */}
        <PageHeader>
          <TitleBlock>
            <Title>EDI — Échanges de données informatisés</Title>
            <Subtitle>
              Suivez vos flux EDI avec Dilicom et consultez l'historique des échanges avec vos diffuseurs.
            </Subtitle>
          </TitleBlock>
          <DocBtn
            href="https://www.dilicom.net/fr/documentation"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation Dilicom ↗
          </DocBtn>
        </PageHeader>

        {/* ── Statcards ── */}
        <StatsRow>
          {/* Statut de connexion */}
          <Card>
            <CardTitle>Statut de connexion ⓘ</CardTitle>
            <ConnectedBadge>
              <GreenDot />
              <div>
                <ConnectedLabel>Connecté à Dilicom</ConnectedLabel>
                <SyncLabel>
                  Dernière synchronisation : {new Date(lastSync).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </SyncLabel>
              </div>
            </ConnectedBadge>
            <MetaRow>
              <MetaLabel>Identifiant Dilicom</MetaLabel>
              <MetaValue>301234XXXXXXX</MetaValue>
            </MetaRow>
            <MetaRow>
              <MetaLabel>Code librairie (GLN)</MetaLabel>
              <MetaValue>301234XXXXXXX</MetaValue>
            </MetaRow>
            <MetaRow>
              <MetaLabel>Statut</MetaLabel>
              <ActiveBadge>Actif</ActiveBadge>
            </MetaRow>
            <MetaRow>
              <MetaLabel>Depuis le</MetaLabel>
              <MetaValue>12/03/2024</MetaValue>
            </MetaRow>
          </Card>

          {/* Diffuseurs connectés */}
          <Card>
            <CardTitle>Diffuseurs connectés ({DIFFUSEURS.length})</CardTitle>
            {DIFFUSEURS.map(d => (
              <DiffuseurItem key={d}>
                <DiffName>
                  <GreenDot />
                  {d}
                </DiffName>
                <ActiveBadge>Actif</ActiveBadge>
              </DiffuseurItem>
            ))}
            <GererBtn
              onClick={() => showToast('Fonctionnalité disponible prochainement', 'error')}
            >
              Gérer mes partenaires
            </GererBtn>
          </Card>

          {/* Flux en cours */}
          <Card>
            <CardTitle>Flux en cours</CardTitle>
            <FluxGrid>
              <FluxItem>
                <FluxIcon>↑</FluxIcon>
                <div>
                  <FluxCount>{counts.orders}</FluxCount>
                  <FluxLabel>Commandes</FluxLabel>
                  <FluxSub>En attente d'accusé</FluxSub>
                </div>
              </FluxItem>
              <FluxItem>
                <FluxIcon>🚚</FluxIcon>
                <div>
                  <FluxCount>{counts.expeditions}</FluxCount>
                  <FluxLabel>Expéditions</FluxLabel>
                  <FluxSub>En cours</FluxSub>
                </div>
              </FluxItem>
              <FluxItem>
                <FluxIcon>📄</FluxIcon>
                <div>
                  <FluxCount>{counts.factures}</FluxCount>
                  <FluxLabel>Facture</FluxLabel>
                  <FluxSub>En attente</FluxSub>
                </div>
              </FluxItem>
              <FluxItem>
                <FluxIcon>↻</FluxIcon>
                <div>
                  <FluxCount>{counts.errors}</FluxCount>
                  <FluxLabel>Erreur</FluxLabel>
                  <FluxSub>À traiter</FluxSub>
                </div>
              </FluxItem>
            </FluxGrid>
          </Card>
        </StatsRow>

        {/* ── Corps (table + panel droit) ── */}
        <MainLayout>
          {/* Table historique */}
          <HistoriqueSection>
            <SectionHeader>
              <SectionTitle>Historique des échanges</SectionTitle>
              <SectionActions>
                <DateRange>📅 {dateRange}</DateRange>
                <ExportBtn onClick={handleExport}>↓ Exporter</ExportBtn>
              </SectionActions>
            </SectionHeader>

            <SearchRow>
              <SearchIcon>🔍</SearchIcon>
              <ISBNInput
                type="text"
                placeholder="Rechercher par ISBN / EAN ou N° commande"
                value={isbnSearch}
                onChange={e => setIsbnSearch(e.target.value)}
              />
              {isbnSearch && (
                <ClearBtn onClick={() => setIsbnSearch('')} aria-label="Effacer la recherche">✕</ClearBtn>
              )}
            </SearchRow>

            <TabsRow>
              {([
                { key: 'ALL',    label: 'Tous' },
                { key: 'ORDERS', label: 'Commandes' },
                { key: 'ORDRSP', label: 'Accusés (ORDRSP)' },
                { key: 'DESADV', label: 'Expéditions (DESADV)' },
                { key: 'INVOIC', label: 'Factures (INVOIC)' },
              ] as { key: EDIFilter; label: string }[]).map(({ key, label }) => (
                <Tab key={key} $active={activeFilter === key} onClick={() => setActiveFilter(key)}>
                  {label}
                </Tab>
              ))}
            </TabsRow>

            {activeFilter === 'DESADV' ? (
              <DesadvGroupedList
                messages={isbnFiltered}
                onSelect={setSelectedMessage}
                isbnFilter={isbnSearch.trim() || undefined}
              />
            ) : (
              <>
                <Table>
                  <thead>
                    <tr>
                      <Th>Date / Heure</Th>
                      <Th>Type de message</Th>
                      <Th>Diffuseur</Th>
                      <Th>N° commande</Th>
                      <Th>Statut</Th>
                      <Th>Détail</Th>
                      <Th>Voir</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map(msg => (
                      <tr key={msg.id}>
                        <Td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                          {fmtDate(msg.createdAt)} {fmtTime(msg.createdAt)}
                        </Td>
                        <Td>{formatEDITypeLabel(msg.type)}</Td>
                        <Td>{msg.diffuseur}</Td>
                        <Td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                          {msg.documentRef}
                        </Td>
                        <Td>
                          <StatusBadgeTable $status={msg.status === 'ERROR' ? 'ERROR' : msg.type}>
                            {getBusinessStatus(msg.type)}
                          </StatusBadgeTable>
                        </Td>
                        <Td>
                          {msg.detail === 'Refusée' ? (
                            <DetailBadge $variant="error">Refusée</DetailBadge>
                          ) : msg.detail === 'Partielle' ? (
                            <DetailBadge $variant="warning">Partielle</DetailBadge>
                          ) : (
                            msg.detail
                          )}
                        </Td>
                        <Td>
                          <EyeBtn onClick={() => setSelectedMessage(msg)} aria-label="Voir le message">
                            👁
                          </EyeBtn>
                        </Td>
                      </tr>
                    ))}
                    {previewRows.length === 0 && (
                      <tr>
                        <Td colSpan={7} style={{ textAlign: 'center', color: '#6B6B68', padding: '24px' }}>
                          {isbnSearch.trim() && activeFilter === 'INVOIC'
                            ? 'Aucun message disponible.'
                            : 'Aucun message pour ce filtre.'}
                        </Td>
                      </tr>
                    )}
                  </tbody>
                </Table>

                <VoirTout>
                  <VoirToutLink onClick={() => setActiveFilter('ALL')}>
                    Voir tout l'historique →
                  </VoirToutLink>
                </VoirTout>
              </>
            )}
          </HistoriqueSection>

          {/* Panneau droit */}
          <RightPanel>
            <PanelCard>
              <PanelTitle>Envoyer une commande via EDI</PanelTitle>
              <PanelText>
                Vos commandes sont envoyées automatiquement.<br />
                Vous pouvez aussi envoyer manuellement une commande.
              </PanelText>
              <PrimaryBtn onClick={() => navigate('/panier')}>
                ↑ Envoyer une commande
              </PrimaryBtn>
              <LinkSmall onClick={() => setActiveFilter('ORDERS')}>
                Voir les commandes en attente ({pendingOrdersCount}) →
              </LinkSmall>
            </PanelCard>

            <PanelCard>
              <PanelTitle>Voir un message EDI</PanelTitle>
              <PanelText>
                Collez un numéro de document pour afficher le message.
              </PanelText>
              <RefRow>
                <RefInput
                  placeholder="Ex. CMD-2026-0426-001"
                  value={refInput}
                  onChange={e => setRefInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleShowMessage()}
                />
                <AfficherBtn onClick={handleShowMessage}>Afficher</AfficherBtn>
              </RefRow>
            </PanelCard>

            <PanelCard>
              <PanelTitle>Besoin d'aide ?</PanelTitle>
              <PanelText>Notre service clients EDI est à votre disposition.</PanelText>
              <HelpRow>📞 01 40 20 40 20</HelpRow>
              <HelpRow>✉ edi@flowdiff.fr</HelpRow>
              <ContactBtn onClick={() => navigate('/contact')}>Nous contacter</ContactBtn>
            </PanelCard>
          </RightPanel>
        </MainLayout>

        {/* ── Paramètres EDI ── */}
        <ParamsCard>
          <SectionTitle style={{ marginBottom: 16 }}>Paramètres EDI</SectionTitle>
          <ParamsGrid>
            {/* Colonne gauche — toggles */}
            <div>
              <ToggleRow>
                <ToggleIcon>✉</ToggleIcon>
                <ToggleInfo>
                  <ToggleLabel>Préférer EDI par défaut</ToggleLabel>
                  <ToggleSub>Toutes vos commandes seront envoyées via EDI.</ToggleSub>
                </ToggleInfo>
                <ToggleSwitch>
                  <input
                    type="checkbox"
                    checked={params.preferEdiByDefault}
                    onChange={e => updateParams({ preferEdiByDefault: e.target.checked })}
                  />
                  <span />
                </ToggleSwitch>
              </ToggleRow>

              <ToggleRow>
                <ToggleIcon>✉</ToggleIcon>
                <ToggleInfo>
                  <ToggleLabel>Notifications par email</ToggleLabel>
                  <ToggleSub>Recevoir un email à chaque échange important.</ToggleSub>
                </ToggleInfo>
                <ToggleSwitch>
                  <input
                    type="checkbox"
                    checked={params.emailNotifications}
                    onChange={e => updateParams({ emailNotifications: e.target.checked })}
                  />
                  <span />
                </ToggleSwitch>
              </ToggleRow>
            </div>

            {/* Colonne droite — délai + bouton */}
            <ParamsRight>
              <DelayRow>
                <DelayLabel>Délai de relance en cas d'absence d'accusé</DelayLabel>
                <DelaySelect
                  value={params.relanceDelay}
                  onChange={e => updateParams({ relanceDelay: e.target.value as '12h' | '24h' | '48h' })}
                >
                  <option value="12h">12 heures</option>
                  <option value="24h">24 heures</option>
                  <option value="48h">48 heures</option>
                </DelaySelect>
              </DelayRow>
              <ModifierBtn onClick={handleSaveParams}>Modifier les paramètres</ModifierBtn>
            </ParamsRight>
          </ParamsGrid>
        </ParamsCard>
      </Page>

      {/* ── Footer EDI ── */}
      <EDIFooter>
        Les échanges EDI sont sécurisés et transitent via Dilicom.{' '}
        <strong style={{ color: theme.colors.navy }}>🏢 DILICOM</strong>
      </EDIFooter>

      <EDIMessageModal message={selectedMessage} onClose={() => setSelectedMessage(null)} />
    </>
  )
}
