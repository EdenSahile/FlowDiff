import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { adminColors } from '@/admin/adminTheme'
import { AdminModal } from '@/admin/components/AdminModal'
import { StatutBadge } from '@/admin/components/StatutBadge'
import { getAllBooksAsync } from '@/services/books'
import { addLivre, updateLivre, deleteLivre } from '@/admin/services/adminServices'
import type { Book } from '@/data/mockBooks'
import type { LivreInsert } from '@/admin/types'

const TYPES = ['fonds', 'nouveaute', 'a-paraitre'] as const

export function AdminCataloguePage() {
  const [books, setBooks] = useState<Book[]>([])
  const [filtered, setFiltered] = useState<Book[]>([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('tous')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [selected, setSelected] = useState<Book | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Book | null>(null)
  const [saving, setSaving] = useState(false)

  async function reload() {
    setLoading(true)
    const data = await getAllBooksAsync()
    setBooks(data)
    setLoading(false)
  }

  useEffect(() => { reload() }, [])

  useEffect(() => {
    let list = books
    if (typeFilter !== 'tous') list = list.filter(b => b.type === typeFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.authors.some(a => a.toLowerCase().includes(q)) ||
        b.isbn.includes(q)
      )
    }
    setFiltered(list)
  }, [books, search, typeFilter])

  async function handleSave(data: LivreInsert) {
    setSaving(true)
    try {
      if (modal === 'add') await addLivre(data)
      else if (modal === 'edit' && selected) await updateLivre(selected.id, data)
      await reload()
      setModal(null)
      setSelected(null)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return
    await deleteLivre(confirmDelete.id)
    await reload()
    setConfirmDelete(null)
  }

  return (
    <Page>
      <PageHeader>
        <div>
          <PageTitle>Catalogue livres</PageTitle>
          <PageSub>{filtered.length} titre{filtered.length > 1 ? 's' : ''}</PageSub>
        </div>
        <AddBtn onClick={() => { setSelected(null); setModal('add') }}>+ Ajouter un livre</AddBtn>
      </PageHeader>

      <Toolbar>
        <SearchInput
          placeholder="Rechercher titre, auteur, ISBN…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <TypeSelect value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="tous">Tous les types</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </TypeSelect>
      </Toolbar>

      <TableWrap>
        <Table>
          <thead>
            <tr>
              <Th style={{ width: 60 }}>Cover</Th>
              <Th>Titre</Th>
              <Th>Auteur(s)</Th>
              <Th>ISBN</Th>
              <Th>Prix TTC</Th>
              <Th>Type</Th>
              <Th style={{ width: 120 }}>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><Td colSpan={7} style={{ textAlign: 'center', color: adminColors.textSecondary }}>Chargement…</Td></tr>
            )}
            {!loading && filtered.map(book => (
              <Tr key={book.id}>
                <Td>
                  {book.isbn ? (
                    <img
                      src={`https://covers.openlibrary.org/b/isbn/${book.isbn}-S.jpg`}
                      alt=""
                      style={{ width: 32, height: 48, objectFit: 'cover', borderRadius: 4 }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  ) : null}
                </Td>
                <Td style={{ fontWeight: 600, maxWidth: 220 }}>{book.title}</Td>
                <Td style={{ color: adminColors.textSecondary }}>{book.authors.join(', ')}</Td>
                <Td style={{ fontFamily: 'monospace', fontSize: 12 }}>{book.isbn}</Td>
                <Td>{book.priceTTC?.toFixed(2)} €</Td>
                <Td><StatutBadge statut={book.type} /></Td>
                <Td>
                  <Actions>
                    <ActionBtn onClick={() => { setSelected(book); setModal('edit') }}>Modifier</ActionBtn>
                    <DeleteBtn onClick={() => setConfirmDelete(book)}>Suppr.</DeleteBtn>
                  </Actions>
                </Td>
              </Tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><Td colSpan={7} style={{ textAlign: 'center', color: adminColors.textSecondary }}>Aucun résultat</Td></tr>
            )}
          </tbody>
        </Table>
      </TableWrap>

      {(modal === 'add' || modal === 'edit') && (
        <AdminModal
          title={modal === 'add' ? 'Ajouter un livre' : 'Modifier le livre'}
          onClose={() => { setModal(null); setSelected(null) }}
        >
          <LivreForm book={selected} onSave={handleSave} saving={saving} />
        </AdminModal>
      )}

      {confirmDelete && (
        <AdminModal title="Confirmer la suppression" onClose={() => setConfirmDelete(null)} width={400}>
          <p style={{ marginTop: 0 }}>Supprimer <strong>"{confirmDelete.title}"</strong> du catalogue ?</p>
          <FormActions>
            <CancelBtn onClick={() => setConfirmDelete(null)}>Annuler</CancelBtn>
            <DangerBtn onClick={handleDelete}>Supprimer</DangerBtn>
          </FormActions>
        </AdminModal>
      )}
    </Page>
  )
}

function LivreForm({ book, onSave, saving }: { book: Book | null; onSave: (d: LivreInsert) => void; saving: boolean }) {
  const ref = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData(ref.current!)
    const data: LivreInsert = {
      title:           fd.get('title') as string,
      authors:         [(fd.get('authors') as string)],
      isbn:            fd.get('isbn') as string,
      publisher:       fd.get('publisher') as string,
      universe:        fd.get('universe') as string,
      type:            fd.get('type') as string,
      price:           parseFloat(fd.get('price') as string),
      priceTTC:        parseFloat(fd.get('priceTTC') as string),
      format:          fd.get('format') as string,
      publicationDate: fd.get('publicationDate') as string,
      description:     fd.get('description') as string,
    }
    onSave(data)
  }

  return (
    <form ref={ref} onSubmit={handleSubmit}>
      <FormGrid>
        <FormField label="Titre" name="title" defaultValue={book?.title} required />
        <FormField label="Auteur(s)" name="authors" defaultValue={book?.authors.join(', ')} required />
        <FormField label="ISBN" name="isbn" defaultValue={book?.isbn} required />
        <FormField label="Éditeur" name="publisher" defaultValue={book?.publisher} required />
        <FormField label="Prix HT" name="price" type="number" step="0.01" defaultValue={book?.price} required />
        <FormField label="Prix TTC" name="priceTTC" type="number" step="0.01" defaultValue={book?.priceTTC} required />
        <FormField label="Format" name="format" defaultValue={book?.format ?? 'broché'} required />
        <FormField label="Date de parution" name="publicationDate" defaultValue={book?.publicationDate} required />
        <SelectField label="Univers" name="universe" defaultValue={book?.universe} options={['Littérature','BD / Mangas','Jeunesse','Adulte-pratique']} />
        <SelectField label="Type" name="type" defaultValue={book?.type} options={['fonds','nouveaute','a-paraitre']} />
      </FormGrid>
      <TextAreaField label="Description" name="description" defaultValue={book?.description} />
      <FormActions>
        <SubmitBtn type="submit" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</SubmitBtn>
      </FormActions>
    </form>
  )
}

function FormField({ label, name, defaultValue, type = 'text', step, required }: {
  label: string; name: string; defaultValue?: string | number; type?: string; step?: string; required?: boolean
}) {
  return (
    <Field>
      <Label>{label}</Label>
      <Input name={name} type={type} step={step} defaultValue={defaultValue ?? ''} required={required} />
    </Field>
  )
}

function SelectField({ label, name, defaultValue, options }: { label: string; name: string; defaultValue?: string; options: string[] }) {
  return (
    <Field>
      <Label>{label}</Label>
      <Select name={name} defaultValue={defaultValue ?? ''}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </Select>
    </Field>
  )
}

function TextAreaField({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return (
    <Field style={{ gridColumn: '1 / -1' }}>
      <Label>{label}</Label>
      <TextArea name={name} rows={3} defaultValue={defaultValue ?? ''} />
    </Field>
  )
}

const Page = styled.div` padding: 32px 40px; max-width: 1200px; `
const PageHeader = styled.div` display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; `
const PageTitle = styled.h1` font-size: 24px; font-weight: 700; color: ${adminColors.textPrimary}; margin: 0 0 4px; `
const PageSub = styled.p` font-size: 14px; color: ${adminColors.textSecondary}; margin: 0; `
const AddBtn = styled.button`
  background: ${adminColors.accent}; color: #fff; border: none; border-radius: 8px;
  padding: 10px 18px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Open Sans', sans-serif;
  &:hover { background: ${adminColors.accentHover}; }
`
const Toolbar = styled.div` display: flex; gap: 12px; margin-bottom: 16px; `
const SearchInput = styled.input`
  flex: 1; border: 1px solid ${adminColors.border}; border-radius: 8px;
  padding: 9px 14px; font-size: 14px; font-family: 'Open Sans', sans-serif; color: ${adminColors.textPrimary};
  &:focus { outline: none; border-color: ${adminColors.accent}; }
`
const TypeSelect = styled.select`
  border: 1px solid ${adminColors.border}; border-radius: 8px; padding: 9px 14px;
  font-size: 14px; font-family: 'Open Sans', sans-serif; background: ${adminColors.surface}; cursor: pointer;
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
const Actions = styled.div` display: flex; gap: 8px; `
const ActionBtn = styled.button`
  background: none; border: 1px solid ${adminColors.accent}; color: ${adminColors.accent};
  border-radius: 6px; padding: 4px 10px; font-size: 12px; cursor: pointer; font-family: 'Open Sans', sans-serif;
  &:hover { background: ${adminColors.accent}; color: #fff; }
`
const DeleteBtn = styled.button`
  background: none; border: 1px solid ${adminColors.danger}; color: ${adminColors.danger};
  border-radius: 6px; padding: 4px 10px; font-size: 12px; cursor: pointer; font-family: 'Open Sans', sans-serif;
  &:hover { background: ${adminColors.danger}; color: #fff; }
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
const TextArea = styled.textarea`
  border: 1px solid ${adminColors.border}; border-radius: 8px; padding: 8px 12px;
  font-size: 14px; font-family: 'Open Sans', sans-serif; resize: vertical;
  &:focus { outline: none; border-color: ${adminColors.accent}; }
`
const FormActions = styled.div` display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; `
const SubmitBtn = styled.button`
  background: ${adminColors.accent}; color: #fff; border: none; border-radius: 8px;
  padding: 10px 24px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Open Sans', sans-serif;
  &:hover { background: ${adminColors.accentHover}; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`
const CancelBtn = styled.button`
  background: none; border: 1px solid ${adminColors.border}; border-radius: 8px;
  padding: 10px 20px; font-size: 14px; cursor: pointer; font-family: 'Open Sans', sans-serif;
  color: ${adminColors.textSecondary};
`
const DangerBtn = styled.button`
  background: ${adminColors.danger}; color: #fff; border: none; border-radius: 8px;
  padding: 10px 20px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Open Sans', sans-serif;
  &:hover { background: ${adminColors.dangerHover}; }
`
