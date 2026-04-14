import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { apiRequest } from './apiClient'
import { AuthContext, type AuthContextValue } from './authContext'
import { clearSession, readSession, writeSession } from './authStorage'
import type { AuthResponse, AuthUser } from './authTypes'

async function persistAuthFromEndpoint(path: string, body: unknown): Promise<AuthUser> {
  const payload = await apiRequest<AuthResponse>(path, {
    method: 'POST',
    body,
    auth: false,
  })
  writeSession({
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    accessTokenExpiresAt: payload.accessTokenExpiresAt,
    user: payload.user,
  })
  return payload.user
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const hydrate = async () => {
      const existing = readSession()
      if (!existing) {
        setLoading(false)
        return
      }
      try {
        const me = await apiRequest<AuthUser>('/api/me', { method: 'GET' })
        const session = readSession()
        if (session) {
          writeSession({ ...session, user: me })
        }
        setUser(me)
      } catch {
        clearSession()
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    void hydrate()
  }, [])

  useEffect(() => {
    const onLogout = () => {
      setUser(null)
      setLoading(false)
    }
    window.addEventListener('auth:logout', onLogout)
    return () => window.removeEventListener('auth:logout', onLogout)
  }, [])

  const value: AuthContextValue = useMemo(
    () => ({
      loading,
      user,
      isAuthenticated: Boolean(user),
      login: async (email, password) => {
        const nextUser = await persistAuthFromEndpoint('/api/auth/login', { email, password })
        setUser(nextUser)
      },
      register: async (name, email, password) => {
        const nextUser = await persistAuthFromEndpoint('/api/auth/register', { name, email, password })
        setUser(nextUser)
      },
      logout: () => {
        clearSession()
        setUser(null)
      },
    }),
    [loading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
