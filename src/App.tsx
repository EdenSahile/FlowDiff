import { lazy, Suspense } from 'react'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { OrdersProvider } from '@/contexts/OrdersContext'
import { ReturnsProvider } from '@/contexts/ReturnsContext'
import { EDIProvider } from '@/contexts/EDIContext'
import { WishlistProvider } from '@/contexts/WishlistContext'
import { RdvProvider } from '@/contexts/RdvContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'

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

function ProtectedLayout() {
  return (
    <AppLayout>
      <Suspense fallback={<PageSkeleton />}>
        <Outlet />
      </Suspense>
    </AppLayout>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
          <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
              <RdvProvider>
              <OrdersProvider>
              <EDIProvider>
              <ReturnsProvider>
              <Suspense fallback={<PageSkeleton />}>
              <Routes>
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
                  </Route>
                </Route>
              </Routes>
              </Suspense>
              </ReturnsProvider>
              </EDIProvider>
              </OrdersProvider>
              </RdvProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
          </ToastProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
