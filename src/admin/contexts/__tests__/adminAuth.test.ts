import { describe, it, expect, beforeEach } from 'vitest'

// Node v25 exposes a native Web Storage object without .clear() — override with a full mock
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true })

const SESSION_KEY = 'flowdiff_admin_session'

function fakeLogin(email: string, password: string): boolean {
  const ok = email === 'admin@flowdiff.com' && password === 'FlowDiff2024!'
  if (ok) localStorage.setItem(SESSION_KEY, JSON.stringify({ email, role: 'admin', exp: Date.now() + 8 * 3600 * 1000 }))
  return ok
}

function fakeIsAuthenticated(): boolean {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return false
    const session = JSON.parse(raw) as { role: string; exp: number }
    return session.role === 'admin' && session.exp > Date.now()
  } catch {
    return false
  }
}

beforeEach(() => localStorage.clear())

describe('admin auth logic', () => {
  it('rejects wrong credentials', () => {
    expect(fakeLogin('bad@test.com', 'wrong')).toBe(false)
    expect(fakeIsAuthenticated()).toBe(false)
  })

  it('accepts correct credentials and sets session', () => {
    expect(fakeLogin('admin@flowdiff.com', 'FlowDiff2024!')).toBe(true)
    expect(fakeIsAuthenticated()).toBe(true)
  })

  it('rejects expired session', () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email: 'admin@flowdiff.com', role: 'admin', exp: Date.now() - 1 }))
    expect(fakeIsAuthenticated()).toBe(false)
  })
})
