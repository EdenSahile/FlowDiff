import { Navigate, Outlet } from 'react-router-dom'
import { useAdminAuth } from '@/admin/hooks/useAdminAuth'

export function AdminRoute() {
  const { isAuthenticated } = useAdminAuth()
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  return <Outlet />
}
