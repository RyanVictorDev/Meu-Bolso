import { clearSession, readSession, writeSession } from './authStorage'
import type { AuthResponse } from './authTypes'
import { getStoredLocale } from '../i18n/localeStorage'
import { findMessageKeyFromLocalizedText, localizeApiError, translate } from '../i18n/messages'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:2030'

export class ApiError extends Error {
  public readonly status: number
  public readonly fields: Record<string, string>

  constructor(status: number, message: string, fields: Record<string, string> = {}) {
    super(message)
    this.status = status
    this.fields = fields
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
      throw new ApiError(401, translate('ERR_SESSION_EXPIRED', getStoredLocale()))
    }
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    })
    if (!res.ok) {
      notifySessionExpired()
      throw new ApiError(401, translate('ERR_SESSION_EXPIRED', getStoredLocale()))
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
    const locale = getStoredLocale()
    let message = translate('ERR_UNEXPECTED', locale)
    let fields: Record<string, string> = {}
    try {
      const payload = (await response.json()) as { message?: string; fields?: Record<string, string> }
      message = payload.message ?? message
      fields = payload.fields ?? fields
    } catch {
      // no-op
    }
    const localizedMessage = localizeApiError(response.status, message, locale)
    const localizedFields: Record<string, string> = {}
    for (const [k, v] of Object.entries(fields)) {
      const fk = findMessageKeyFromLocalizedText(v)
      localizedFields[k] = fk ? translate(fk, locale) : v
    }
    throw new ApiError(response.status, localizedMessage, localizedFields)
  }

  if (response.status === 204 || response.status === 205) {
    return undefined as T
  }

  const raw = await response.text()
  if (!raw.trim()) {
    return undefined as T
  }

  try {
    return JSON.parse(raw) as T
  } catch {
    throw new ApiError(response.status, translate('ERR_INVALID_RESPONSE', getStoredLocale()))
  }
}

export { API_BASE_URL }
