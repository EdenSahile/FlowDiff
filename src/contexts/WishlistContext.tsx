import { createContext, useContext, useState, useEffect } from 'react'
import type { Book } from '@/data/mockBooks'
import { useAuthContext } from '@/contexts/AuthContext'

export interface WishlistItem {
  book: Book
  addedBy?: string
  addedAt: string
}

export interface Wishlist {
  id: string
  name: string
  items: WishlistItem[]
  createdAt: string
}

interface WishlistContextValue {
  lists: Wishlist[]
  currentUserName: string
  setCurrentUserName: (name: string) => void
  createList: (name: string) => Wishlist
  deleteList: (listId: string) => void
  addToList: (listId: string, book: Book, addedBy?: string) => void
  removeFromList: (listId: string, bookId: string) => void
  isInAnyList: (bookId: string) => boolean
  isInList: (listId: string, bookId: string) => boolean
  getListsContaining: (bookId: string) => Wishlist[]
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

function storageKey(codeClient: string | undefined) {
  return `bookflow_wishlists_${codeClient ?? 'guest'}`
}

const NAME_KEY = 'bookflow_wishlist_username'

function loadLists(key: string): Wishlist[] {
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return []
    return JSON.parse(stored) as Wishlist[]
  } catch { return [] }
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext()
  const key = storageKey(user?.codeClient)

  const [lists, setLists] = useState<Wishlist[]>(() => loadLists(storageKey(user?.codeClient)))
  const [currentUserName, setCurrentUserNameState] = useState<string>(
    () => localStorage.getItem(NAME_KEY) ?? ''
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLists(loadLists(key))
  }, [key])

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(lists))
  }, [lists, key])

  function setCurrentUserName(name: string) {
    setCurrentUserNameState(name)
    localStorage.setItem(NAME_KEY, name)
  }

  const createList = (name: string): Wishlist => {
    const newList: Wishlist = {
      id: `wl-${Date.now()}`,
      name: name.trim(),
      items: [],
      createdAt: new Date().toISOString(),
    }
    setLists(prev => [...prev, newList])
    return newList
  }

  const deleteList = (listId: string) =>
    setLists(prev => prev.filter(l => l.id !== listId))

  const addToList = (listId: string, book: Book, addedBy?: string) =>
    setLists(prev => prev.map(l =>
      l.id !== listId ? l :
      l.items.some(i => i.book.id === book.id) ? l :
      { ...l, items: [...l.items, { book, addedBy: addedBy?.trim() || undefined, addedAt: new Date().toISOString() }] }
    ))

  const removeFromList = (listId: string, bookId: string) =>
    setLists(prev => prev.map(l =>
      l.id !== listId ? l :
      { ...l, items: l.items.filter(i => i.book.id !== bookId) }
    ))

  const isInAnyList = (bookId: string) =>
    lists.some(l => l.items.some(i => i.book.id === bookId))

  const isInList = (listId: string, bookId: string) =>
    lists.find(l => l.id === listId)?.items.some(i => i.book.id === bookId) ?? false

  const getListsContaining = (bookId: string) =>
    lists.filter(l => l.items.some(i => i.book.id === bookId))

  return (
    <WishlistContext.Provider value={{
      lists,
      currentUserName,
      setCurrentUserName,
      createList,
      deleteList,
      addToList,
      removeFromList,
      isInAnyList,
      isInList,
      getListsContaining,
    }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist doit être utilisé dans <WishlistProvider>')
  return ctx
}
