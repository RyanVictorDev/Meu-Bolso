import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import RequireAuth from './components/RequireAuth'
import { AuthProvider } from './services/authStore'
import { FinanceProvider } from './services/financeStore'
import DashboardPage from './pages/DashboardPage'
import TransacoesPage from './pages/TransacoesPage'
import CategoriasPage from './pages/CategoriasPage'
import OrcamentosPage from './pages/OrcamentosPage'
import LoginPage from './pages/LoginPage'
import './styles/app.css'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="*"
            element={
              <RequireAuth>
                <FinanceProvider>
                  <AppShell>
                    <Routes>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/transacoes" element={<TransacoesPage />} />
                      <Route path="/categorias" element={<CategoriasPage />} />
                      <Route path="/orcamentos" element={<OrcamentosPage />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </AppShell>
                </FinanceProvider>
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
