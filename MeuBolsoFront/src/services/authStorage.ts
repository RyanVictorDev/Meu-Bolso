import type { AuthSession } from './authTypes'

const AUTH_STORAGE_KEY = 'meubolso_auth_v1'

export function readSession(): AuthSession | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthSession
  } catch {
    return null
  }
}

export function writeSession(session: AuthSession): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}
