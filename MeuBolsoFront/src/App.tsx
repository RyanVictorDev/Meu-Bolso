import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import RequireAuth from './components/RequireAuth'
import { AuthProvider } from './services/authStore'
import { EnvironmentProvider } from './services/environmentStore'
import { FinanceProvider } from './services/financeStore'
import DashboardPage from './pages/DashboardPage'
import TransacoesPage from './pages/TransacoesPage'
import CategoriasPage from './pages/CategoriasPage'
import ObjetivosPage from './pages/ObjetivosPage'
import GraficosPage from './pages/GraficosPage'
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
                <EnvironmentProvider>
                  <FinanceProvider>
                    <AppShell>
                      <Routes>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/transacoes" element={<TransacoesPage />} />
                        <Route path="/categorias" element={<CategoriasPage />} />
                        <Route path="/objetivos" element={<ObjetivosPage />} />
                        <Route path="/graficos" element={<GraficosPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </AppShell>
                  </FinanceProvider>
                </EnvironmentProvider>
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
