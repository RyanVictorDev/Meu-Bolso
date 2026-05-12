import { createContext } from 'react'
import type { Environment, EnvironmentList, EnvironmentRole } from '../domain/environment'

export type EnvironmentContextValue = {
  loading: boolean
  environments: EnvironmentList
  activeEnvironment: Environment | null
  activeEnvironmentId: string | null
  canEdit: boolean
  canAdmin: boolean
  refreshEnvironments: () => Promise<void>
  setActiveEnvironmentId: (id: string) => void
  createEnvironment: (input: { name: string; description?: string }) => Promise<Environment>
  updateEnvironment: (id: string, input: { name: string; description?: string }) => Promise<Environment>
  addMember: (environmentId: string, input: { email: string; role: EnvironmentRole }) => Promise<Environment>
  updateMemberRole: (environmentId: string, userId: string, role: EnvironmentRole) => Promise<Environment>
  removeMember: (environmentId: string, userId: string) => Promise<Environment>
}

export const EnvironmentContext = createContext<EnvironmentContextValue | null>(null)
