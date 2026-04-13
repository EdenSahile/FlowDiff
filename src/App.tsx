import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
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

function Placeholder({ title }: { title: string }) {
  return (
    <div style={{ padding: '32px 24px', fontFamily: 'Arial, sans-serif', color: '#1E3A5F' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>{title}</h1>
      <p style={{ color: '#757575' }}>Cette section sera développée dans les phases suivantes.</p>
    </div>
  )
}

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
                    <Route path="/top-ventes" element={<Placeholder title="Top Ventes" />} />
                    <Route path="/selections" element={<Placeholder title="Sélections" />} />
                    <Route path="/flash-infos" element={<FlashInfosPage />} />
                  </Route>
                </Route>
              </Routes>
            </AuthProvider>
          </CartProvider>
          </ToastProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
