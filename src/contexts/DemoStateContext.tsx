import { createContext, useContext, useState, type ReactNode } from 'react'

interface DemoStateCtx {
  seenDesadvIds: Set<string>
  markDesadvSeen: (id: string) => void
  validatedOfficeIds: Set<string>
  validateOffice: (id: string) => void
}

const Ctx = createContext<DemoStateCtx | null>(null)

export function DemoStateProvider({ children }: { children: ReactNode }) {
  const [seenDesadvIds, setSeenDesadvIds] = useState<Set<string>>(new Set())
  const [validatedOfficeIds, setValidatedOfficeIds] = useState<Set<string>>(new Set())

  function markDesadvSeen(id: string) {
    setSeenDesadvIds(prev => new Set([...prev, id]))
  }

  function validateOffice(id: string) {
    setValidatedOfficeIds(prev => new Set([...prev, id]))
  }

  return (
    <Ctx.Provider value={{ seenDesadvIds, markDesadvSeen, validatedOfficeIds, validateOffice }}>
      {children}
    </Ctx.Provider>
  )
}

export function useDemoState(): DemoStateCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useDemoState must be inside DemoStateProvider')
  return ctx
}
