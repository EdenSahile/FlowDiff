import { useEffect } from 'react'

export function useRefetchOnFocus(refetch: () => void) {
  useEffect(() => {
    const onVisibility = () => { if (!document.hidden) refetch() }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [refetch])
}
