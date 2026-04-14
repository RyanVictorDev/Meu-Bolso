import { createContext } from 'react'
import type { AuthUser } from './authTypes'

export type AuthContextValue = {
  loading: boolean
  user: AuthUser | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
