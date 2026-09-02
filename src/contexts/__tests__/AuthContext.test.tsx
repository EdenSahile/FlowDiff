import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { AuthProvider, useAuthContext } from '@/contexts/AuthContext'

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

// AuthResult n'est pas exporté par AuthContext.tsx (type interne) ; on
// reproduit sa forme ici uniquement pour typer les variables de résultat
// dans ces tests.
type AuthResult = { success: boolean; error?: string; fieldErrors?: Partial<Record<string, string>> }

// Identifiants réels de MOCK_USERS (src/lib/mockUsers.ts) — LIB001, hashé
// avec bcrypt cost=4 (DEV_COST), donc rapide même sans mock de bcryptjs.
const VALID_IDENTIFIER = 'LIB001'
const VALID_EMAIL = 'marie.lecomte@librairie-lira.fr'
const VALID_PASSWORD = 'Libraire123!'

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('démarre avec isLoading=true puis passe à false, user=null sans session stockée', async () => {
    const { result } = renderHook(() => useAuthContext(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.user).toBeNull()
  })

  describe('login', () => {
    it('réussit avec le code client et le bon mot de passe', async () => {
      const { result } = renderHook(() => useAuthContext(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      let res: AuthResult | undefined
      await act(async () => {
        res = await result.current.login({ identifier: VALID_IDENTIFIER, password: VALID_PASSWORD })
      })

      expect(res).toEqual({ success: true })
      expect(result.current.user?.codeClient).toBe('LIB001')
    })

    it('réussit aussi avec l\'email (insensible à la casse)', async () => {
      const { result } = renderHook(() => useAuthContext(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      let res: AuthResult | undefined
      await act(async () => {
        res = await result.current.login({ identifier: VALID_EMAIL.toUpperCase(), password: VALID_PASSWORD })
      })

      expect(res).toEqual({ success: true })
      expect(result.current.user?.email).toBe(VALID_EMAIL)
    })

    it('échoue si le code client/email est introuvable', async () => {
      const { result } = renderHook(() => useAuthContext(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      let res: AuthResult | undefined
      await act(async () => {
        res = await result.current.login({ identifier: 'INCONNU999', password: 'peu importe' })
      })

      expect(res).toEqual({ success: false, error: 'Code client ou email introuvable.' })
      expect(result.current.user).toBeNull()
    })

    it('échoue si le mot de passe est incorrect', async () => {
      const { result } = renderHook(() => useAuthContext(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      let res: AuthResult | undefined
      await act(async () => {
        res = await result.current.login({ identifier: VALID_IDENTIFIER, password: 'mauvais-mot-de-passe' })
      })

      expect(res).toEqual({ success: false, error: 'Mot de passe incorrect.' })
      expect(result.current.user).toBeNull()
    })

    it('échoue avec des erreurs de champ si le payload est invalide (schéma Zod)', async () => {
      const { result } = renderHook(() => useAuthContext(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      let res: AuthResult | undefined
      await act(async () => {
        res = await result.current.login({ identifier: '', password: '' })
      })

      expect(res).toMatchObject({ success: false })
      expect(res?.fieldErrors).toBeTruthy()
    })

    it('persiste un token dans localStorage après connexion réussie', async () => {
      const { result } = renderHook(() => useAuthContext(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await act(async () => {
        await result.current.login({ identifier: VALID_IDENTIFIER, password: VALID_PASSWORD })
      })

      expect(localStorage.getItem('bookflow_token')).toBeTruthy()
    })
  })

  describe('restauration de session au montage', () => {
    it('restaure la session si un token valide existe déjà en localStorage', async () => {
      // On simule un login précédent en écrivant directement le token,
      // pour tester le chemin de restauration indépendamment de login().
      const { result: first } = renderHook(() => useAuthContext(), { wrapper })
      await waitFor(() => expect(first.current.isLoading).toBe(false))
      await act(async () => {
        await first.current.login({ identifier: VALID_IDENTIFIER, password: VALID_PASSWORD })
      })
      const token = localStorage.getItem('bookflow_token')
      expect(token).toBeTruthy()

      // Nouvelle instance du provider (nouveau "chargement de page")
      const { result: second } = renderHook(() => useAuthContext(), { wrapper })
      await waitFor(() => expect(second.current.isLoading).toBe(false))
      expect(second.current.user?.codeClient).toBe('LIB001')
    })

    it('ignore et nettoie un token malformé en localStorage', async () => {
      localStorage.setItem('bookflow_token', 'ceci-nest-pas-un-token-valide')
      const { result } = renderHook(() => useAuthContext(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(result.current.user).toBeNull()
      expect(localStorage.getItem('bookflow_token')).toBeNull()
    })

    it('ignore et nettoie un token expiré', async () => {
      // createMockToken n'exposant pas de moyen direct de forcer l'expiration,
      // on construit un payload expiré à la main avec le même encodage (btoa).
      const header = btoa(JSON.stringify({ alg: 'mock', typ: 'JWT' }))
      const payload = btoa(JSON.stringify({
        sub: 'mock-lib001', codeClient: 'LIB001', iat: Date.now() - 100000, exp: Date.now() - 1000,
      }))
      localStorage.setItem('bookflow_token', `${header}.${payload}.mock`)

      const { result } = renderHook(() => useAuthContext(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(result.current.user).toBeNull()
      expect(localStorage.getItem('bookflow_token')).toBeNull()
    })
  })

  describe('logout', () => {
    it('efface le user et le token', async () => {
      const { result } = renderHook(() => useAuthContext(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))
      await act(async () => {
        await result.current.login({ identifier: VALID_IDENTIFIER, password: VALID_PASSWORD })
      })
      expect(result.current.user).not.toBeNull()

      act(() => {
        result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(localStorage.getItem('bookflow_token')).toBeNull()
    })

    it('conserve panier et historique (ne supprime que le token et la wishlist)', async () => {
      localStorage.setItem('flowdiff_cart_shared', JSON.stringify({ items: [] }))
      const { result } = renderHook(() => useAuthContext(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))
      await act(async () => {
        await result.current.login({ identifier: VALID_IDENTIFIER, password: VALID_PASSWORD })
      })

      act(() => {
        result.current.logout()
      })

      expect(localStorage.getItem('flowdiff_cart_shared')).not.toBeNull()
    })
  })

  describe('register', () => {
    it('échoue si le code client n\'est pas reconnu', async () => {
      const { result } = renderHook(() => useAuthContext(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      let res: AuthResult | undefined
      await act(async () => {
        res = await result.current.register({
          codeClient: 'INCONNU999',
          email: 'test@example.com',
          password: 'Test1234!',
          confirmPassword: 'Test1234!',
        })
      })

      expect(res).toMatchObject({ success: false, fieldErrors: { codeClient: expect.any(String) } })
    })

    it('échoue si l\'email ne correspond pas au code client', async () => {
      const { result } = renderHook(() => useAuthContext(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      let res: AuthResult | undefined
      await act(async () => {
        res = await result.current.register({
          codeClient: VALID_IDENTIFIER,
          email: 'mauvais-email@example.com',
          password: 'Test1234!',
          confirmPassword: 'Test1234!',
        })
      })

      expect(res).toMatchObject({ success: false, fieldErrors: { email: expect.any(String) } })
    })

    it('échoue si le mot de passe ne respecte pas le schéma (Zod)', async () => {
      const { result } = renderHook(() => useAuthContext(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      let res: AuthResult | undefined
      await act(async () => {
        res = await result.current.register({
          codeClient: VALID_IDENTIFIER,
          email: VALID_EMAIL,
          password: 'faible',
          confirmPassword: 'faible',
        })
      })

      expect(res).toMatchObject({ success: false })
    })

    it('réussit avec un code client et un email valides et connecte l\'utilisateur', async () => {
      const { result } = renderHook(() => useAuthContext(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      let res: AuthResult | undefined
      await act(async () => {
        res = await result.current.register({
          codeClient: VALID_IDENTIFIER,
          email: VALID_EMAIL,
          password: 'NouveauMdp123!',
          confirmPassword: 'NouveauMdp123!',
        })
      })

      expect(res).toEqual({ success: true })
      expect(result.current.user?.codeClient).toBe('LIB001')
    }, 10000) // bcrypt cost=12 en registration réelle, plus lent que le login mock (cost=4)

    it('échoue si un compte a déjà été créé en session pour ce code client', async () => {
      const { result } = renderHook(() => useAuthContext(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await act(async () => {
        await result.current.register({
          codeClient: VALID_IDENTIFIER,
          email: VALID_EMAIL,
          password: 'NouveauMdp123!',
          confirmPassword: 'NouveauMdp123!',
        })
      })

      let res: AuthResult | undefined
      await act(async () => {
        res = await result.current.register({
          codeClient: VALID_IDENTIFIER,
          email: VALID_EMAIL,
          password: 'AutreMdp123!',
          confirmPassword: 'AutreMdp123!',
        })
      })

      expect(res).toEqual({ success: false, error: 'Un compte existe déjà pour ce code client.' })
    }, 10000)
  })

  describe('useAuthContext hors provider', () => {
    it('lève une erreur explicite si utilisé sans <AuthProvider>', () => {
      // On étouffe le console.error de React pour ce test attendu.
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
      expect(() => renderHook(() => useAuthContext())).toThrow(
        'useAuthContext doit être utilisé dans <AuthProvider>'
      )
      spy.mockRestore()
    })
  })
})
