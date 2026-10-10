import { createContext, useCallback, useMemo, useState } from 'react'

const SESSION_KEY = 'flowdiff_admin_session'

interface AdminSession {
  email: string
  role: string
  exp: number
}

function readSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as AdminSession
    return s.role === 'admin' && s.exp > Date.now() ? s : null
  } catch {
    return null
  }
}

export interface AdminAuthContextValue {
  isAuthenticated: boolean
  login(email: string, password: string): boolean
  logout(): void
}

export const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(readSession)

  // Le back-office n'est plus routé et le projet n'a pas de backend.
  // Les identifiants ont été retirés de la source : comparés ici, ils
  // auraient été lisibles en clair dans le bundle public.
  // Une reprise devra valider la connexion côté serveur.
  const login = useCallback((_email: string, _password: string): boolean => false, [])

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
  }, [])

  const value = useMemo<AdminAuthContextValue>(
    () => ({ isAuthenticated: session !== null, login, logout }),
    [session, login, logout]
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}
