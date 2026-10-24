import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'

// bcryptjs est importe dynamiquement dans AuthContext (`await import('bcryptjs')`)
// ET statiquement dans mockUsers.ts (hashSync a l'init du module).
// vi.mock intercepte les 2 chemins d'import dans Vitest.
const { hashSpy } = vi.hoisted(() => ({
  hashSpy: vi.fn().mockResolvedValue('$2a$12$mockedhashvalue000000000000000000000000000000000000'),
}))

vi.mock('bcryptjs', () => ({
  default: {
    hash: hashSpy,
    hashSync: () => '$2a$04$mockedsyncvalue00000000000000000000000000000000000',
    compare: vi.fn().mockResolvedValue(false),
    compareSync: () => false,
  },
}))

import { AuthProvider, useAuthContext } from '@/contexts/AuthContext'

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

describe('register, FLOW-RM-012 : bcrypt cost factor', () => {
  beforeEach(() => {
    localStorage.clear()
    hashSpy.mockClear()
  })

  it('appelle bcrypt.hash avec le mot de passe et un cost factor de 12', async () => {
    const { result } = renderHook(() => useAuthContext(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const password = 'NouveauMdp123!'
    await act(async () => {
      await result.current.register({
        codeClient: 'LIB001',
        email: 'marie.lecomte@librairie-lira.fr',
        password,
        confirmPassword: password,
      })
    })

    expect(hashSpy).toHaveBeenCalledWith(password, 12)
  })
})
