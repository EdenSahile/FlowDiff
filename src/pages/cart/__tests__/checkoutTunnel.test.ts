import { describe, it, expect, beforeEach } from 'vitest'
import { transmissionSchema } from '../checkoutSchemas'
import {
  transmissionKey,
  loadTransmissionMode,
  hasReliquatInItems,
} from '@/contexts/CartContext'

describe('transmissionSchema (FLOW-RM-052)', () => {
  it('accepts FLOWDIFF', () => {
    const validFlowdiff = transmissionSchema.safeParse({ transmissionMode: 'FLOWDIFF' })

    expect(validFlowdiff.success).toBe(true)
  })

  it('accepts EDI', () => {
    const validEdi = transmissionSchema.safeParse({ transmissionMode: 'EDI' })

    expect(validEdi.success).toBe(true)
  })

  it('rejects an unknown transmission mode', () => {
    const unknownMode = transmissionSchema.safeParse({ transmissionMode: 'FAX' })

    expect(unknownMode.success).toBe(false)
  })

  it('rejects a missing transmissionMode field', () => {
    const missingField = transmissionSchema.safeParse({})

    expect(missingField.success).toBe(false)
  })
})

describe('loadTransmissionMode (FLOW-RM-053)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns FLOWDIFF when nothing is stored', () => {
    const mode = loadTransmissionMode('LIB001')

    expect(mode).toBe('FLOWDIFF')
  })

  it('returns FLOWDIFF when stored value is invalid', () => {
    localStorage.setItem(transmissionKey('LIB001'), 'FAX')

    const mode = loadTransmissionMode('LIB001')

    expect(mode).toBe('FLOWDIFF')
  })

  it('returns EDI when EDI is stored', () => {
    localStorage.setItem(transmissionKey('LIB001'), 'EDI')

    const mode = loadTransmissionMode('LIB001')

    expect(mode).toBe('EDI')
  })

  it('returns FLOWDIFF when FLOWDIFF is stored', () => {
    localStorage.setItem(transmissionKey('LIB001'), 'FLOWDIFF')

    const mode = loadTransmissionMode('LIB001')

    expect(mode).toBe('FLOWDIFF')
  })
})

describe('transmissionKey isolation par codeClient (FLOW-RM-054)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('generates a key scoped to the codeClient', () => {
    expect(transmissionKey('LIB001')).toBe('bookflow_transmission_LIB001')
    expect(transmissionKey('LIB999')).toBe('bookflow_transmission_LIB999')
  })

  it('falls back to guest when codeClient is undefined', () => {
    expect(transmissionKey(undefined)).toBe('bookflow_transmission_guest')
  })

  it('isolates stored preference between two clients', () => {
    localStorage.setItem(transmissionKey('LIB001'), 'EDI')
    localStorage.setItem(transmissionKey('LIB002'), 'FLOWDIFF')

    expect(loadTransmissionMode('LIB001')).toBe('EDI')
    expect(loadTransmissionMode('LIB002')).toBe('FLOWDIFF')
  })
})

describe('hasReliquatInItems (FLOW-RM-056)', () => {
  it('returns false for an empty list', () => {
    expect(hasReliquatInItems([])).toBe(false)
  })

  it('returns false when no item has enReliquat', () => {
    const itemsSansReliquat = [
      { enReliquat: false },
      { enReliquat: undefined },
    ]

    expect(hasReliquatInItems(itemsSansReliquat)).toBe(false)
  })

  it('returns true when at least one item has enReliquat', () => {
    const itemsAvecReliquat = [
      { enReliquat: false },
      { enReliquat: true },
    ]

    expect(hasReliquatInItems(itemsAvecReliquat)).toBe(true)
  })
})
