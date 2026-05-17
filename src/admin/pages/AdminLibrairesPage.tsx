import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { adminColors } from '@/admin/adminTheme'
import { AdminModal } from '@/admin/components/AdminModal'
import { StatutBadge } from '@/admin/components/StatutBadge'
import { getAllLibraires, updateLibraire } from '@/admin/services/adminServices'
import type { Libraire } from '@/admin/types'

export function AdminLibrairesPage() {
  const [libraires, setLibraires] = useState<Libraire[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Libraire | null>(null)
  const [saving, setSaving] = useState(false)

  async function reload() {
    setLoading(true)
    setLibraires(await getAllLibraires())
    setLoading(false)
  }

  useEffect(() => { reload() }, [])

  const filtered = search.trim()
    ? libraires.filter(l =>
        l.nom.toLowerCase().includes(search.toLowerCase()) ||
        l.code_client.toLowerCase().includes(search.toLowerCase()) ||
        l.ville.toLowerCase().includes(search.toLowerCase())
      )
    : libraires

  async function handleSave(id: string, data: Partial<Libraire>) {
    setSaving(true)
    try {
      await updateLibraire(id, data)
      await reload()
      setSelected(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Page>
      <PageHeader>
        <div>
          <PageTitle>Libraires</PageTitle>
          <PageSub>{filtered.length} compte{filtered.length > 1 ? 's' : ''}</PageSub>
        </div>
      </PageHeader>

      <Toolbar>
        <SearchInput
          placeholder="Rechercher nom, code client, ville…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </Toolbar>

      <TableWrap>
        <Table>
          <thead>
            <tr>
              <Th>Code client</Th>
              <Th>Nom</Th>
              <Th>Ville</Th>
              <Th>Email</Th>
              <Th style={{ textAlign: 'right' }}>Remise</Th>
              <Th>Statut</Th>
              <Th>Reliquat</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><Td colSpan={8} style={{ textAlign: 'center', color: adminColors.textSecondary }}>Chargement…</Td></tr>}
            {!loading && filtered.map(l => (
              <Tr key={l.id}>
                <Td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{l.code_client}</Td>
                <Td style={{ fontWeight: 600 }}>{l.nom}</Td>
                <Td>{l.ville}</Td>
                <Td style={{ fontSize: 12, color: adminColors.textSecondary }}>{l.email}</Td>
                <Td style={{ textAlign: 'right', fontWeight: 600 }}>{l.remise}%</Td>
                <Td><StatutBadge statut={l.statut} /></Td>
                <Td><StatutBadge statut={l.reliquat ? 'actif' : 'bloque'} /></Td>
                <Td>
                  <ActionBtn onClick={() => setSelected(l)}>Modifier</ActionBtn>
                </Td>
              </Tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><Td colSpan={8} style={{ textAlign: 'center', color: adminColors.textSecondary }}>Aucun résultat</Td></tr>
            )}
          </tbody>
        </Table>
      </TableWrap>

      {selected && (
        <AdminModal title={`Modifier — ${selected.nom}`} onClose={() => setSelected(null)} width={480}>
          <LibraireForm libraire={selected} onSave={data => handleSave(selected.id, data)} saving={saving} />
        </AdminModal>
      )}
    </Page>
  )
}

function LibraireForm({ libraire, onSave, saving }: { libraire: Libraire; onSave: (d: Partial<Libraire>) => void; saving: boolean }) {
  const ref = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData(ref.current!)
    onSave({
      nom:       fd.get('nom') as string,
      email:     fd.get('email') as string,
      ville:     fd.get('ville') as string,
      telephone: fd.get('telephone') as string,
      remise:    parseFloat(fd.get('remise') as string),
      statut:    fd.get('statut') as 'actif' | 'bloque',
      reliquat:  fd.get('reliquat') === 'on',
    })
  }

  return (
    <form ref={ref} onSubmit={handleSubmit}>
      <FormGrid>
        <Field>
          <Label>Nom</Label>
          <Input name="nom" defaultValue={libraire.nom} required />
        </Field>
        <Field>
          <Label>Email</Label>
          <Input name="email" type="email" defaultValue={libraire.email} required />
        </Field>
        <Field>
          <Label>Ville</Label>
          <Input name="ville" defaultValue={libraire.ville} />
        </Field>
        <Field>
          <Label>Téléphone</Label>
          <Input name="telephone" defaultValue={libraire.telephone ?? ''} />
        </Field>
        <Field>
          <Label>Remise (%)</Label>
          <Input name="remise" type="number" step="0.5" min="0" max="60" defaultValue={libraire.remise} required />
        </Field>
        <Field>
          <Label>Statut</Label>
          <Select name="statut" defaultValue={libraire.statut}>
            <option value="actif">Actif</option>
            <option value="bloque">Bloqué</option>
          </Select>
        </Field>
        <Field style={{ flexDirection: 'row', alignItems: 'center', gap: 10, gridColumn: '1 / -1' }}>
          <Checkbox name="reliquat" type="checkbox" defaultChecked={libraire.reliquat} />
          <Label style={{ margin: 0 }}>Accepte les reliquats</Label>
        </Field>
      </FormGrid>
      <FormActions>
        <SubmitBtn type="submit" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</SubmitBtn>
      </FormActions>
    </form>
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
const FormGrid = styled.div` display: grid; grid-template-columns: 1fr 1fr; gap: 16px; `
const Field = styled.div` display: flex; flex-direction: column; gap: 6px; `
const Label = styled.label` font-size: 13px; font-weight: 600; color: ${adminColors.textPrimary}; `
const Input = styled.input`
  border: 1px solid ${adminColors.border}; border-radius: 8px; padding: 8px 12px;
  font-size: 14px; font-family: 'Open Sans', sans-serif;
  &:focus { outline: none; border-color: ${adminColors.accent}; }
`
const Select = styled.select`
  border: 1px solid ${adminColors.border}; border-radius: 8px; padding: 8px 12px;
  font-size: 14px; font-family: 'Open Sans', sans-serif; background: ${adminColors.surface};
`
const Checkbox = styled.input` width: 16px; height: 16px; cursor: pointer; `
const FormActions = styled.div` display: flex; justify-content: flex-end; margin-top: 20px; `
const SubmitBtn = styled.button`
  background: ${adminColors.accent}; color: #fff; border: none; border-radius: 8px;
  padding: 10px 24px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Open Sans', sans-serif;
  &:hover { background: ${adminColors.accentHover}; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`
