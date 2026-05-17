import { lazy, Suspense, useEffect } from 'react'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { OrdersProvider } from '@/contexts/OrdersContext'
import { ReturnsProvider } from '@/contexts/ReturnsContext'
import { EDIProvider } from '@/contexts/EDIContext'
import { WishlistProvider } from '@/contexts/WishlistContext'
import { RdvProvider } from '@/contexts/RdvContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { OnboardingProvider } from '@/contexts/OnboardingContext'
import { NotificationsProvider } from '@/contexts/NotificationsContext'
import { DemoStateProvider } from '@/contexts/DemoStateContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { AdminAuthProvider } from '@/admin/contexts/AdminAuthContext'
import { AdminRoute } from '@/admin/AdminRoute'
import { AdminLayout } from '@/admin/AdminLayout'

const LoginPage        = lazy(() => import('@/pages/auth/LoginPage').then(m => ({ default: m.LoginPage })))
const RegisterPage     = lazy(() => import('@/pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })))
const HomePage         = lazy(() => import('@/pages/home/HomePage').then(m => ({ default: m.HomePage })))
const RecherchePage    = lazy(() => import('@/pages/search/RecherchePage').then(m => ({ default: m.RecherchePage })))
const NouveautesPage   = lazy(() => import('@/pages/nouveautes/NouveautesPage').then(m => ({ default: m.NouveautesPage })))
const FondsPage        = lazy(() => import('@/pages/fonds/FondsPage').then(m => ({ default: m.FondsPage })))
const FicheProduitPage = lazy(() => import('@/pages/catalogue/FicheProduitPage').then(m => ({ default: m.FicheProduitPage })))
const CartPage         = lazy(() => import('@/pages/cart/CartPage').then(m => ({ default: m.CartPage })))
const FlashInfosPage   = lazy(() => import('@/pages/flash-infos/FlashInfosPage').then(m => ({ default: m.FlashInfosPage })))
const MonComptePage    = lazy(() => import('@/pages/compte/MonComptePage').then(m => ({ default: m.MonComptePage })))
const HistoriquePage   = lazy(() => import('@/pages/historique/HistoriquePage').then(m => ({ default: m.HistoriquePage })))
const ContactPage      = lazy(() => import('@/pages/contact/ContactPage').then(m => ({ default: m.ContactPage })))
const ParametresPage   = lazy(() => import('@/pages/parametres/ParametresPage').then(m => ({ default: m.ParametresPage })))
const AidePage         = lazy(() => import('@/pages/aide/AidePage').then(m => ({ default: m.AidePage })))
const CGVPage          = lazy(() => import('@/pages/cgv/CGVPage').then(m => ({ default: m.CGVPage })))
const NewsletterPage   = lazy(() => import('@/pages/newsletter/NewsletterPage').then(m => ({ default: m.NewsletterPage })))
const SelectionsPage   = lazy(() => import('@/pages/selections/SelectionsPage').then(m => ({ default: m.SelectionsPage })))
const TopVentesPage    = lazy(() => import('@/pages/top-ventes/TopVentesPage').then(m => ({ default: m.TopVentesPage })))
const AuteurPage       = lazy(() => import('@/pages/auteur/AuteurPage').then(m => ({ default: m.AuteurPage })))
const FacturationPage  = lazy(() => import('@/pages/facturation/FacturationPage').then(m => ({ default: m.FacturationPage })))
const RdvPage          = lazy(() => import('@/pages/rdv/RdvPage').then(m => ({ default: m.RdvPage })))
const EDIPage          = lazy(() => import('@/pages/edi/EDIPage').then(m => ({ default: m.EDIPage })))
const OfficesPage      = lazy(() => import('@/pages/offices/OfficesPage').then(m => ({ default: m.OfficesPage })))
const AParaitrePage    = lazy(() => import('@/pages/a-paraitre/AParaitrePage').then(m => ({ default: m.AParaitrePage })))

// Admin back-office (lazy-loaded)
const AdminLoginPage     = lazy(() => import('@/admin/pages/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })))
const AdminDashboardPage = lazy(() => import('@/admin/pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })))
const AdminCataloguePage = lazy(() => import('@/admin/pages/AdminCataloguePage').then(m => ({ default: m.AdminCataloguePage })))
const AdminCommandesPage = lazy(() => import('@/admin/pages/AdminCommandesPage').then(m => ({ default: m.AdminCommandesPage })))
const AdminLibrairesPage = lazy(() => import('@/admin/pages/AdminLibrairesPage').then(m => ({ default: m.AdminLibrairesPage })))

function usePrefetchPages() {
  useEffect(() => {
    const t = setTimeout(() => {
      import('@/pages/home/HomePage')
      import('@/pages/fonds/FondsPage')
      import('@/pages/nouveautes/NouveautesPage')
      import('@/pages/a-paraitre/AParaitrePage')
      import('@/pages/top-ventes/TopVentesPage')
      import('@/pages/selections/SelectionsPage')
      import('@/pages/flash-infos/FlashInfosPage')
      import('@/pages/cart/CartPage')
      import('@/pages/catalogue/FicheProduitPage')
      import('@/pages/search/RecherchePage')
      import('@/pages/auteur/AuteurPage')
      import('@/pages/compte/MonComptePage')
      import('@/pages/historique/HistoriquePage')
      import('@/pages/contact/ContactPage')
      import('@/pages/parametres/ParametresPage')
      import('@/pages/facturation/FacturationPage')
      import('@/pages/edi/EDIPage')
      import('@/pages/offices/OfficesPage')
      import('@/pages/auth/LoginPage')
      import('@/pages/auth/RegisterPage')
      import('@/pages/auth/ForgotPasswordPage')
      import('@/pages/aide/AidePage')
      import('@/pages/cgv/CGVPage')
      import('@/pages/newsletter/NewsletterPage')
      import('@/pages/rdv/RdvPage')
    }, 100)
    return () => clearTimeout(t)
  }, [])
}

function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<AdminLoginPage />} />
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="catalogue" element={<AdminCataloguePage />} />
          <Route path="commandes" element={<AdminCommandesPage />} />
          <Route path="libraires" element={<AdminLibrairesPage />} />
        </Route>
      </Route>
      <Route index element={<Navigate to="dashboard" replace />} />
    </Routes>
  )
}

function ProtectedLayout() {
  return (
    <AppLayout>
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </AppLayout>
  )
}

export default function App() {
  usePrefetchPages()
  return (
    <ThemeProvider>
      <BrowserRouter>
          <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <NotificationsProvider>
              <WishlistProvider>
              <RdvProvider>
              <OrdersProvider>
              <EDIProvider>
              <DemoStateProvider>
              <ReturnsProvider>
              <OnboardingProvider>
              <Suspense fallback={<PageSkeleton />}>
              <Routes>
                {/* Admin back-office — isolated from libraire auth */}
                <Route
                  path="/admin/*"
                  element={
                    <AdminAuthProvider>
                      <Suspense fallback={null}>
                        <AdminRoutes />
                      </Suspense>
                    </AdminAuthProvider>
                  }
                />

                {/* Routes publiques */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                {/* Routes protégées */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<ProtectedLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/recherche" element={<RecherchePage />} />
                    <Route path="/a-paraitre" element={<AParaitrePage />} />
                    <Route path="/nouveautes" element={<NouveautesPage />} />
                    <Route path="/fonds" element={<FondsPage />} />
                    <Route path="/livre/:id" element={<FicheProduitPage />} />
                    <Route path="/panier" element={<CartPage />} />
                    <Route path="/top-ventes" element={<TopVentesPage />} />
                    <Route path="/selections" element={<SelectionsPage />} />
                    <Route path="/auteur/:auteurSlug" element={<AuteurPage />} />
                    <Route path="/flash-infos" element={<FlashInfosPage />} />
                    <Route path="/compte" element={<MonComptePage />} />
                    <Route path="/historique" element={<HistoriquePage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/parametres" element={<ParametresPage />} />
                    <Route path="/aide" element={<AidePage />} />
                    <Route path="/cgv" element={<CGVPage />} />
                    <Route path="/newsletter" element={<NewsletterPage />} />
                    <Route path="/facturation" element={<FacturationPage />} />
                    <Route path="/rdv-representant" element={<RdvPage />} />
                    <Route path="/edi" element={<EDIPage />} />
                    <Route path="/offices" element={<OfficesPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Route>
              </Routes>
              </Suspense>
              </OnboardingProvider>
              </ReturnsProvider>
              </DemoStateProvider>
              </EDIProvider>
              </OrdersProvider>
              </RdvProvider>
              </WishlistProvider>
              </NotificationsProvider>
            </CartProvider>
          </AuthProvider>
          </ToastProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
