import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '@/hooks/useAuth'

const mockUseAuth = vi.mocked(useAuth)

function LoginCapture() {
  const location = useLocation()
  const state = location.state as { from?: string } | null
  return <div data-testid="login-from">{state?.from ?? 'none'}</div>
}

function renderWithRouter(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Contenu protege</div>} />
          <Route path="/catalogue" element={<div>Catalogue</div>} />
        </Route>
        <Route path="/login" element={<LoginCapture />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  it('rend null pendant le chargement (isLoading=true)', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: true, login: vi.fn(), register: vi.fn(), logout: vi.fn() })

    const { container } = renderWithRouter('/dashboard')

    expect(container).toBeEmptyDOMElement()
  })

  it('redirige vers /login quand user est null', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false, login: vi.fn(), register: vi.fn(), logout: vi.fn() })

    renderWithRouter('/dashboard')

    expect(screen.getByTestId('login-from')).toBeInTheDocument()
    expect(screen.queryByText('Contenu protege')).not.toBeInTheDocument()
  })

  it('transmet location.pathname + location.search dans state.from', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false, login: vi.fn(), register: vi.fn(), logout: vi.fn() })

    renderWithRouter('/catalogue?tri=titre')

    expect(screen.getByTestId('login-from').textContent).toBe('/catalogue?tri=titre')
  })

  it('rend le contenu enfant (Outlet) quand user existe', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', codeClient: 'LIB001' } as ReturnType<typeof useAuth>['user'],
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    })

    renderWithRouter('/dashboard')

    expect(screen.getByText('Contenu protege')).toBeInTheDocument()
  })
})
