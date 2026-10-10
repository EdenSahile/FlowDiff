import '@testing-library/jest-dom'

// Node 26 expose un localStorage natif (expérimental, nécessite --localstorage-file).
// Sans ce flag, il retourne undefined et masque celui de jsdom.
// On le polyfille ici pour que les tests aient un Storage fonctionnel.
if (typeof globalThis.localStorage === 'undefined') {
  const storage = new Map<string, string>()
  const localStoragePolyfill: Storage = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => { storage.set(key, String(value)) },
    removeItem: (key: string) => { storage.delete(key) },
    clear: () => { storage.clear() },
    key: (index: number) => [...storage.keys()][index] ?? null,
    get length() { return storage.size },
  }
  Object.defineProperty(globalThis, 'localStorage', { value: localStoragePolyfill, writable: true })
}

// jsdom n'implémente pas createObjectURL/revokeObjectURL. Les tests qui les
// espionnent via vi.spyOn échouent sans ces stubs, spyOn exigeant que la
// propriété existe déjà.
if (typeof URL.createObjectURL === 'undefined') {
  URL.createObjectURL = () => 'blob:jsdom'
  URL.revokeObjectURL = () => {}
}
