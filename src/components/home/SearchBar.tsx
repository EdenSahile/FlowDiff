import { useState } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { MOCK_BOOKS } from '@/data/mockBooks'

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M15.5 15.5L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function MicIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="8" y="2" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M4 11a7 7 0 0 0 14 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line x1="11" y1="18" x2="11" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

const Wrapper = styled.div`
  width: 100%;
`

const Form = styled.form`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.full};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: 0 ${({ theme }) => theme.spacing.md};
  gap: ${({ theme }) => theme.spacing.sm};
  height: 52px;
  transition: box-shadow 0.15s ease;

  &:focus-within {
    box-shadow: 0 0 0 3px rgba(255, 192, 0, 0.5), ${({ theme }) => theme.shadows.md};
  }
`

const SearchIconWrapper = styled.div`
  color: ${({ theme }) => theme.colors.gray[400]};
  display: flex;
  align-items: center;
  flex-shrink: 0;
`

const StyledInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.navy};

  &::placeholder {
    color: ${({ theme }) => theme.colors.gray[400]};
  }
`

const MicButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.navy};
  padding: 4px;
  border-radius: ${({ theme }) => theme.radii.full};
  flex-shrink: 0;
  transition: color 0.15s ease, background-color 0.15s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`

const Hint = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: rgba(30, 58, 95, 0.6);
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.sm};
`

export function SearchBar() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    const found = MOCK_BOOKS.find(b => b.isbn === q.replace(/\s/g, ''))
    navigate(found ? `/livre/${found.id}` : `/recherche?q=${encodeURIComponent(q)}`)
  }

  return (
    <Wrapper>
      <Form onSubmit={handleSubmit} role="search">
        <SearchIconWrapper>
          <SearchIcon />
        </SearchIconWrapper>
        <StyledInput
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="EAN, titre, éditeur, collection…"
          aria-label="Rechercher un livre"
        />
        <MicButton
          type="button"
          aria-label="Recherche vocale (bientôt disponible)"
          title="Recherche vocale — disponible en Phase 9"
        >
          <MicIcon />
        </MicButton>
      </Form>
      <Hint>Recherchez par EAN, titre, éditeur ou collection</Hint>
    </Wrapper>
  )
}
