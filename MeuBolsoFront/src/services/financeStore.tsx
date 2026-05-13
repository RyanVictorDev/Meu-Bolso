import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { HttpFinanceRepository } from './httpFinanceRepository'
import type { FinanceData } from '../domain/finance'
import type { FinanceRepository } from './financeRepository'
import { FinanceContext, type FinanceContextValue } from './financeContext'
import { useEnvironment } from './useEnvironment'

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { activeEnvironmentId, loading: environmentsLoading } = useEnvironment()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<FinanceData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const repository: FinanceRepository = useMemo(() => new HttpFinanceRepository(), [])

  const refresh = async () => {
    if (environmentsLoading) return
    setLoading(true)
    try {
      const next = await repository.load(activeEnvironmentId)
      setData(next)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível carregar os dados financeiros')
      setData((current) =>
        current ?? {
          categories: [],
          transactions: [],
          budgets: [],
          goals: [],
        },
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!environmentsLoading) void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEnvironmentId, environmentsLoading])

  const value: FinanceContextValue = useMemo(
    () => ({
      loading,
      data,
      error,
      refresh,
      addCategory: async (input) => {
        const created = await repository.addCategory(input, activeEnvironmentId)
        await refresh()
        return created
      },
      listTransactions: (input) => repository.listTransactions(input, activeEnvironmentId),
      getTransactionSummary: (input) => repository.getTransactionSummary(input, activeEnvironmentId),
      addTransaction: async (input) => {
        const created = await repository.addTransaction(input, activeEnvironmentId)
        await refresh()
        return created
      },
      updateTransaction: async (id, input) => {
        const updated = await repository.updateTransaction(id, input, activeEnvironmentId)
        await refresh()
        return updated
      },
      deleteTransaction: async (id) => {
        await repository.deleteTransaction(id, activeEnvironmentId)
        await refresh()
      },
      setBudgetLimit: async (input) => {
        const updated = await repository.setBudgetLimit(input, activeEnvironmentId)
        await refresh()
        return updated
      },
      resetToSeed: async () => {
        await repository.resetToSeed(activeEnvironmentId)
        await refresh()
      },
      addGoal: async (input) => {
        const created = await repository.addGoal(input, activeEnvironmentId)
        await refresh()
        return created
      },
      updateGoal: async (id, input) => {
        const updated = await repository.updateGoal(id, input, activeEnvironmentId)
        await refresh()
        return updated
      },
      deleteGoal: async (id) => {
        await repository.deleteGoal(id, activeEnvironmentId)
        await refresh()
      },
      addGoalContribution: async (id, input) => {
        const updated = await repository.addGoalContribution(id, input, activeEnvironmentId)
        await refresh()
        return updated
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loading, data, error, activeEnvironmentId, environmentsLoading],
  )

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

