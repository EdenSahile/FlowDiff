import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { OrdersProvider } from '@/contexts/OrdersContext'
import { ToastProvider } from '@/components/ui/Toast'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { HomePage } from '@/pages/home/HomePage'
import { RecherchePage } from '@/pages/search/RecherchePage'
import { NouveautesPage } from '@/pages/nouveautes/NouveautesPage'
import { FondsPage } from '@/pages/fonds/FondsPage'
import { FicheProduitPage } from '@/pages/catalogue/FicheProduitPage'
import { CartPage } from '@/pages/cart/CartPage'
import { FlashInfosPage } from '@/pages/flash-infos/FlashInfosPage'
import { MonComptePage } from '@/pages/compte/MonComptePage'
import { HistoriquePage } from '@/pages/historique/HistoriquePage'
import { ContactPage } from '@/pages/contact/ContactPage'
import { ParametresPage } from '@/pages/parametres/ParametresPage'
import { AidePage } from '@/pages/aide/AidePage'
import { CGVPage } from '@/pages/cgv/CGVPage'
import { NewsletterPage } from '@/pages/newsletter/NewsletterPage'
import { SelectionsPage } from '@/pages/selections/SelectionsPage'
import { TopVentesPage } from '@/pages/top-ventes/TopVentesPage'
import { AuteurPage } from '@/pages/auteur/AuteurPage'

function ProtectedLayout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
          <ToastProvider>
          <CartProvider>
            <OrdersProvider>
            <AuthProvider>
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
                  </Route>
                </Route>
              </Routes>
            </AuthProvider>
            </OrdersProvider>
          </CartProvider>
          </ToastProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
