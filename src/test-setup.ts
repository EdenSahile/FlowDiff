import '@testing-library/jest-dom'

// Node 26 expose un localStorage natif (expérimental, nécessite --localstorage-file).
// Sans ce flag, il retourne undefined et masque celui de jsdom.
// On le polyfille ici pour que les tests aient un Storage fonctionnel.
if (typeof globalThis.localStorage === 'undefined') {
  const storage = new Map<string, string>()
  const methods: Storage = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => { storage.set(key, String(value)) },
    removeItem: (key: string) => { storage.delete(key) },
    clear: () => { storage.clear() },
    key: (index: number) => [...storage.keys()][index] ?? null,
    get length() { return storage.size },
  }
  // Proxy pour que Object.keys(localStorage) retourne les cles de stockage,
  // pas les noms de methodes. C'est le comportement des navigateurs.
  const localStoragePolyfill = new Proxy(methods, {
    ownKeys() {
      return [...storage.keys()]
    },
    getOwnPropertyDescriptor(target, prop: string) {
      if (storage.has(prop)) {
        return { configurable: true, enumerable: true, value: storage.get(prop) }
      }
      return Reflect.getOwnPropertyDescriptor(target, prop)
    },
  })
  Object.defineProperty(globalThis, 'localStorage', { value: localStoragePolyfill, writable: true })
}
