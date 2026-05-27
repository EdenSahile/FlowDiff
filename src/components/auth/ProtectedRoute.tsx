import { Outlet } from 'react-router-dom'
// import { Navigate, Outlet, useLocation } from 'react-router-dom'
// import { useAuth } from '@/hooks/useAuth'

// TEMP: bypass auth for Claude.ai demo — to restore, uncomment everything below and remove the direct <Outlet /> return
export function ProtectedRoute() {
  return <Outlet />

  // const { user, isLoading } = useAuth()
  // const location = useLocation()

  // if (isLoading) {
  //   return null
  // }

  // if (!user) {
  //   return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
  // }

  // return <Outlet />
}
