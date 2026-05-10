import { useNavigate, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { IconChevronLeft } from '@/components/ui/icons'

const Btn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.navy};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin-bottom: 12px;
  opacity: 0.65;
  transition: opacity 0.15s, color 0.15s;
  &:hover {
    opacity: 1;
    color: ${({ theme }) => theme.colors.accent};
  }
`

export function BackButton() {
  const navigate = useNavigate()
  const { key } = useLocation()
  if (key === 'default') return null
  return (
    <Btn type="button" aria-label="Retour à la page précédente" onClick={() => navigate(-1)}>
      <IconChevronLeft size={14} />
      Retour
    </Btn>
  )
}
