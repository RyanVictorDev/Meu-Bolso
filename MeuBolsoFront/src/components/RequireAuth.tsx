import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import PageLoader from './PageLoader'
import { useAuth } from '../services/useAuth'

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { loading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="card">
        <PageLoader />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
