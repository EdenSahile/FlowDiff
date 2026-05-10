import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider as SCThemeProvider } from 'styled-components'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { theme } from '@/lib/theme'
import { BackButton } from '@/components/ui/BackButton'

const mockNavigate = vi.fn()
const mockUseLocation = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate, useLocation: () => mockUseLocation() }
})

function wrap(ui: React.ReactElement) {
  return render(
    <SCThemeProvider theme={theme}>
      <MemoryRouter>{ui}</MemoryRouter>
    </SCThemeProvider>
  )
}

describe('BackButton', () => {
  beforeEach(() => { mockNavigate.mockClear() })

  it('renders when location key is not default', () => {
    mockUseLocation.mockReturnValue({ pathname: '/test', search: '', hash: '', state: null, key: 'abc123' })
    wrap(<BackButton />)
    expect(screen.getByRole('button', { name: /retour/i })).toBeInTheDocument()
  })

  it('renders nothing when location key is default', () => {
    mockUseLocation.mockReturnValue({ pathname: '/test', search: '', hash: '', state: null, key: 'default' })
    wrap(<BackButton />)
    expect(screen.queryByRole('button', { name: /retour/i })).toBeNull()
  })

  it('calls navigate(-1) on click', () => {
    mockUseLocation.mockReturnValue({ pathname: '/test', search: '', hash: '', state: null, key: 'abc123' })
    wrap(<BackButton />)
    fireEvent.click(screen.getByRole('button', { name: /retour/i }))
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })
})
