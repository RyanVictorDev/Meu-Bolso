import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { LocalFinanceRepository } from './localFinanceRepository'
import type { FinanceData } from '../domain/finance'
import type { FinanceRepository } from './financeRepository'
import { FinanceContext, type FinanceContextValue } from './financeContext'

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<FinanceData | null>(null)

  const repository: FinanceRepository = useMemo(() => new LocalFinanceRepository(), [])

  const refresh = async () => {
    setLoading(true)
    try {
      const next = await repository.load()
      setData(next)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value: FinanceContextValue = useMemo(
    () => ({
      loading,
      data,
      refresh,
      addCategory: async (input) => {
        const created = await repository.addCategory(input)
        await refresh()
        return created
      },
      addTransaction: async (input) => {
        const created = await repository.addTransaction(input)
        await refresh()
        return created
      },
      setBudgetLimit: async (input) => {
        const updated = await repository.setBudgetLimit(input)
        await refresh()
        return updated
      },
      resetToSeed: async () => {
        await repository.resetToSeed()
        await refresh()
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loading, data],
  )

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

