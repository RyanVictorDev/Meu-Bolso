export interface AuthUser {
  id: string
  name: string
  email: string
}

export interface AuthSession {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: string
  user: AuthUser
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: string
  user: AuthUser
}
