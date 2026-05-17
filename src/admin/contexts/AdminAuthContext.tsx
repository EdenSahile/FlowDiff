import { createContext, useCallback, useMemo, useState } from 'react'

const SESSION_KEY = 'flowdiff_admin_session'
const ADMIN_EMAIL = 'admin@flowdiff.com'
const ADMIN_PASSWORD = 'FlowDiff2024!'

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

  const login = useCallback((email: string, password: string): boolean => {
    if (email.trim() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) return false
    const s: AdminSession = { email: ADMIN_EMAIL, role: 'admin', exp: Date.now() + 8 * 3600 * 1000 }
    localStorage.setItem(SESSION_KEY, JSON.stringify(s))
    setSession(s)
    return true
  }, [])

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
