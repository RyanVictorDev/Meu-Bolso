export type EnvironmentRole = 'ADMIN' | 'EDITOR' | 'VIEWER'

export interface EnvironmentParticipant {
  userId: string
  name: string
  email: string
  role: EnvironmentRole
}

export interface Environment {
  id: string
  name: string
  description?: string
  ownerUserId: string
  role: EnvironmentRole
  createdByMe: boolean
  createdAt: string
  participants: EnvironmentParticipant[]
}

export interface EnvironmentList {
  createdByMe: Environment[]
  sharedWithMe: Environment[]
}
