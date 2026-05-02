import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { MOCK_USERS, VALID_CLIENT_CODES, type MockUser } from '@/lib/mockUsers'
import {
  loginSchema,
  registerSchema,
  createMockToken,
  parseMockToken,
  getZodErrors,
  type LoginInput,
  type RegisterInput,
} from '@/lib/authUtils'

const TOKEN_KEY = 'bookflow_token'
const BCRYPT_COST = 12

/* ── Types ── */

export interface AuthUser {
  id: string
  codeClient: string
  nomLibrairie: string
  email: string
  adresseLivraison: string
  remise: number
  telephone: string
  remisesParUnivers: Record<string, number>
}

interface AuthResult {
  success: boolean
  error?: string
  fieldErrors?: Partial<Record<string, string>>
}

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  login: (data: LoginInput) => Promise<AuthResult>
  register: (data: RegisterInput) => Promise<AuthResult>
  logout: () => void
}

/* ── Context ── */

const AuthContext = createContext<AuthContextValue | null>(null)

/* ── Provider ── */

function toAuthUser(u: MockUser): AuthUser {
  return {
    id: u.id,
    codeClient: u.codeClient,
    nomLibrairie: u.nomLibrairie,
    email: u.email,
    adresseLivraison: u.adresseLivraison,
    remise: u.remise,
    telephone: u.telephone,
    remisesParUnivers: u.remisesParUnivers ?? {},
  }
}

function findUser(identifier: string, sessionUsers: MockUser[]): MockUser | undefined {
  const id = identifier.trim().toLowerCase()
  const match = (u: MockUser) =>
    u.email.toLowerCase() === id || u.codeClient.toLowerCase() === id
  return sessionUsers.find(match) ?? MOCK_USERS.find(match)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const sessionUsersRef = useRef<MockUser[]>([])

  // Restaurer la session au montage
  useEffect(() => {
    // DEV : auto-login avec LIB001 si ?dev-login dans l'URL
    if (import.meta.env.DEV && window.location.search.includes('dev-login')) {
      const devUser = findUser('LIB001', sessionUsersRef.current)
      if (devUser) {
        const token = createMockToken(devUser.id, devUser.codeClient)
        localStorage.setItem(TOKEN_KEY, token)
        setUser(toAuthUser(devUser))
        setIsLoading(false)
        return
      }
    }
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      const payload = parseMockToken(token)
      if (payload) {
        const found = findUser(payload.codeClient, sessionUsersRef.current)
        if (found) {
          setUser(toAuthUser(found))
        } else {
          localStorage.removeItem(TOKEN_KEY)
        }
      } else {
        localStorage.removeItem(TOKEN_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (data: LoginInput): Promise<AuthResult> => {
    const result = loginSchema.safeParse(data)
    if (!result.success) {
      return { success: false, fieldErrors: getZodErrors(result) }
    }

    const found = findUser(result.data.identifier, sessionUsersRef.current)
    if (!found) {
      return { success: false, error: 'Code client ou email introuvable.' }
    }

    const { default: bcrypt } = await import('bcryptjs')
    const passwordMatch = await bcrypt.compare(result.data.password, found.passwordHash)
    if (!passwordMatch) {
      return { success: false, error: 'Mot de passe incorrect.' }
    }

    const token = createMockToken(found.id, found.codeClient)
    localStorage.setItem(TOKEN_KEY, token)
    setUser(toAuthUser(found))
    return { success: true }
  }, [])

  const register = useCallback(async (data: RegisterInput): Promise<AuthResult> => {
    const result = registerSchema.safeParse(data)
    if (!result.success) {
      return { success: false, fieldErrors: getZodErrors(result) }
    }

    const { codeClient, email, password } = result.data

    // Vérification double : le code client doit exister ET l'email doit correspondre
    const validEntry = VALID_CLIENT_CODES.find(
      (v) => v.codeClient === codeClient
    )
    if (!validEntry) {
      return { success: false, fieldErrors: { codeClient: 'Code client non reconnu.' } }
    }
    if (validEntry.email.toLowerCase() !== email.toLowerCase()) {
      return {
        success: false,
        fieldErrors: { email: "Cet email ne correspond pas à ce code client." },
      }
    }

    // Vérifier que le compte n'a pas déjà été créé en session
    const existing = sessionUsersRef.current.find((u) => u.codeClient === codeClient)
    if (existing) {
      return { success: false, error: 'Un compte existe déjà pour ce code client.' }
    }

    // Créer le compte (session uniquement — remplacé par Prisma en Phase 12)
    const base = MOCK_USERS.find((u) => u.codeClient === codeClient)!
    try {
      const { default: bcrypt } = await import('bcryptjs')
      const newUser: MockUser = {
        ...base,
        passwordHash: await bcrypt.hash(password, BCRYPT_COST),
      }
      sessionUsersRef.current.push(newUser)
      const token = createMockToken(newUser.id, newUser.codeClient)
      localStorage.setItem(TOKEN_KEY, token)
      setUser(toAuthUser(newUser))
    } catch {
      return { success: false, error: 'Erreur lors de la création du compte.' }
    }
    return { success: true }
  }, [])

  const logout = useCallback(() => {
    if (user?.codeClient) {
      localStorage.removeItem(`bookflow_wishlist_username_${user.codeClient}`)
    }
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
    /* Panier et historique conservés — partagés entre tous les utilisateurs de la librairie */
  }, [user?.codeClient])

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext doit être utilisé dans <AuthProvider>')
  return ctx
}
