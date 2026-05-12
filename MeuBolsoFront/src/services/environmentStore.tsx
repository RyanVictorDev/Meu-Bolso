import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Environment, EnvironmentList, EnvironmentRole } from '../domain/environment'
import { apiRequest } from './apiClient'
import { EnvironmentContext, type EnvironmentContextValue } from './environmentContext'

const ACTIVE_ENV_KEY = 'meubolso_active_environment_id'
const EMPTY_LIST: EnvironmentList = { createdByMe: [], sharedWithMe: [] }

function flatten(list: EnvironmentList) {
  return [...list.createdByMe, ...list.sharedWithMe]
}

export function EnvironmentProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [environments, setEnvironments] = useState<EnvironmentList>(EMPTY_LIST)
  const [activeEnvironmentId, setActiveEnvironmentIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ACTIVE_ENV_KEY)
    } catch {
      return null
    }
  })

  const refreshEnvironments = async () => {
    setLoading(true)
    try {
      const next = await apiRequest<EnvironmentList>('/api/environments', { method: 'GET' })
      const all = flatten(next)
      setEnvironments(next)
      setActiveEnvironmentIdState((current) => {
        const stillAllowed = current && all.some((environment) => environment.id === current)
        const nextId = stillAllowed ? current : all[0]?.id ?? null
        try {
          if (nextId) localStorage.setItem(ACTIVE_ENV_KEY, nextId)
          else localStorage.removeItem(ACTIVE_ENV_KEY)
        } catch {
          // no-op
        }
        return nextId
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refreshEnvironments()
  }, [])

  const activeEnvironment = useMemo(() => {
    return flatten(environments).find((environment) => environment.id === activeEnvironmentId) ?? null
  }, [activeEnvironmentId, environments])

  const setActiveEnvironmentId = (id: string) => {
    setActiveEnvironmentIdState(id)
    try {
      localStorage.setItem(ACTIVE_ENV_KEY, id)
    } catch {
      // no-op
    }
  }

  const upsertActive = useCallback((environment: Environment) => {
    setEnvironments((prev) => {
      const remove = (items: Environment[]) => items.filter((item) => item.id !== environment.id)
      if (environment.createdByMe) {
        return { createdByMe: [environment, ...remove(prev.createdByMe)], sharedWithMe: remove(prev.sharedWithMe) }
      }
      return { createdByMe: remove(prev.createdByMe), sharedWithMe: [environment, ...remove(prev.sharedWithMe)] }
    })
    setActiveEnvironmentId(environment.id)
  }, [])

  const value: EnvironmentContextValue = useMemo(
    () => ({
      loading,
      environments,
      activeEnvironment,
      activeEnvironmentId,
      canEdit: activeEnvironment?.role === 'ADMIN' || activeEnvironment?.role === 'EDITOR',
      canAdmin: activeEnvironment?.role === 'ADMIN',
      refreshEnvironments,
      setActiveEnvironmentId,
      createEnvironment: async (input) => {
        const created = await apiRequest<Environment>('/api/environments', { method: 'POST', body: input })
        upsertActive(created)
        return created
      },
      updateEnvironment: async (id, input) => {
        const updated = await apiRequest<Environment>(`/api/environments/${id}`, { method: 'PUT', body: input })
        upsertActive(updated)
        return updated
      },
      addMember: async (environmentId, input) => {
        const updated = await apiRequest<Environment>(`/api/environments/${environmentId}/members`, { method: 'POST', body: input })
        upsertActive(updated)
        return updated
      },
      updateMemberRole: async (environmentId, userId, role: EnvironmentRole) => {
        const updated = await apiRequest<Environment>(`/api/environments/${environmentId}/members/${userId}`, {
          method: 'PUT',
          body: { role },
        })
        upsertActive(updated)
        return updated
      },
      removeMember: async (environmentId, userId) => {
        const updated = await apiRequest<Environment>(`/api/environments/${environmentId}/members/${userId}`, { method: 'DELETE' })
        upsertActive(updated)
        return updated
      },
    }),
    [activeEnvironment, activeEnvironmentId, environments, loading, upsertActive],
  )

  return <EnvironmentContext.Provider value={value}>{children}</EnvironmentContext.Provider>
}
