import { clearSession, readSession, writeSession } from './authStorage'
import type { AuthResponse } from './authTypes'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:2030'

export class ApiError extends Error {
  public readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

let refreshPromise: Promise<void> | null = null

function notifySessionExpired() {
  clearSession()
  window.dispatchEvent(new Event('auth:logout'))
}

async function refreshSession(): Promise<void> {
  if (refreshPromise) return refreshPromise
  refreshPromise = (async () => {
    const session = readSession()
    if (!session?.refreshToken) {
      notifySessionExpired()
      throw new ApiError(401, 'Sessão expirada')
    }
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    })
    if (!res.ok) {
      notifySessionExpired()
      throw new ApiError(401, 'Sessão expirada')
    }
    const payload = (await res.json()) as AuthResponse
    writeSession({
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      accessTokenExpiresAt: payload.accessTokenExpiresAt,
      user: payload.user,
    })
  })()
  try {
    await refreshPromise
  } finally {
    refreshPromise = null
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  auth?: boolean
  retry?: boolean
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = true, retry = true, headers, ...rest } = options
  const session = readSession()
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers ? (headers as Record<string, string>) : {}),
  }
  if (auth && session?.accessToken) {
    requestHeaders.Authorization = `Bearer ${session.accessToken}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401 && auth && retry) {
    await refreshSession()
    return apiRequest<T>(path, { ...options, retry: false })
  }

  if (!response.ok) {
    let message = 'Erro inesperado'
    try {
      const payload = (await response.json()) as { message?: string }
      message = payload.message ?? message
    } catch {
      // no-op
    }
    throw new ApiError(response.status, message)
  }

  if (response.status === 204) {
    return undefined as T
  }
  return (await response.json()) as T
}

export { API_BASE_URL }
