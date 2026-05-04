import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { MOCK_BOOKS } from '@/data/mockBooks'
import { useCart } from '@/contexts/CartContext'

export type NotifId = 'panier' | 'nouveautes' | 'topventes'

export interface Notification {
  id: NotifId
  emoji: string
  title: string
  subtitle: string
  time: string
  route: string
}

interface NotificationsContextValue {
  notifications: Notification[]
  unreadIds: Set<NotifId>
  unreadCount: number
  markAsRead: (id: NotifId) => void
  markAllAsRead: () => void
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

const WINDOW_MS = 60 * 24 * 60 * 60 * 1000 // 60 jours

function relativeTime(date: Date): string {
  const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return "aujourd'hui"
  if (diffDays === 1) return 'hier'
  if (diffDays < 7) return `il y a ${diffDays} jours`
  if (diffDays < 30) return `il y a ${Math.floor(diffDays / 7)} sem.`
  return 'ce mois-ci'
}

function buildNotifications(totalItems: number): Notification[] {
  const now = new Date()
  const notifs: Notification[] = []

  /* Panier en attente — en premier (urgence) */
  if (totalItems > 0) {
    notifs.push({
      id: 'panier',
      emoji: '⏳',
      title: 'Panier en attente',
      subtitle: `${totalItems} article${totalItems > 1 ? 's' : ''} non commandé${totalItems > 1 ? 's' : ''}`,
      time: "aujourd'hui",
      route: '/panier',
    })
  }

  /* Nouveautés — livres de type nouveaute publiés dans les 60 derniers jours */
  const recentNouveautes = MOCK_BOOKS.filter(b =>
    b.type === 'nouveaute' &&
    new Date(b.publicationDate) <= now &&
    now.getTime() - new Date(b.publicationDate).getTime() < WINDOW_MS
  )
  if (recentNouveautes.length > 0) {
    const universes = [...new Set(recentNouveautes.map(b => b.universe))]
    const mostRecent = recentNouveautes.reduce((latest, b) =>
      new Date(b.publicationDate) > new Date(latest.publicationDate) ? b : latest
    )
    notifs.push({
      id: 'nouveautes',
      emoji: '📚',
      title: `${recentNouveautes.length} nouveauté${recentNouveautes.length > 1 ? 's' : ''} ajoutée${recentNouveautes.length > 1 ? 's' : ''}`,
      subtitle: universes.join(' · '),
      time: relativeTime(new Date(mostRecent.publicationDate)),
      route: '/nouveautes',
    })
  }

  /* Top Ventes — mock statique */
  notifs.push({
    id: 'topventes',
    emoji: '🏆',
    title: 'Top Ventes mis à jour',
    subtitle: 'Nouveau classement disponible',
    time: 'il y a 1 jour',
    route: '/top-ventes',
  })

  return notifs
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { totalItems } = useCart()
  const notifications = useMemo(() => buildNotifications(totalItems), [totalItems])
  const [readIds, setReadIds] = useState<Set<NotifId>>(new Set())

  const unreadIds = useMemo(() => {
    const active = new Set(notifications.map(n => n.id))
    readIds.forEach(id => active.delete(id))
    return active
  }, [notifications, readIds])

  const unreadCount = unreadIds.size

  const markAsRead = useCallback((id: NotifId) => {
    setReadIds(prev => new Set([...prev, id]))
  }, [])

  const markAllAsRead = useCallback(() => {
    setReadIds(new Set(notifications.map(n => n.id)))
  }, [notifications])

  return (
    <NotificationsContext.Provider value={{ notifications, unreadIds, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider')
  return ctx
}
