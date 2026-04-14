import { createContext } from 'react'
import type { Budget, Category, FinanceData, Transaction } from '../domain/finance'
import type {
  AddCategoryInput,
  AddTransactionInput,
  SetBudgetLimitInput,
} from './financeRepository'

export type FinanceContextValue = {
  loading: boolean
  data: FinanceData | null
  refresh: () => Promise<void>
  addCategory: (input: AddCategoryInput) => Promise<Category>
  addTransaction: (input: AddTransactionInput) => Promise<Transaction>
  setBudgetLimit: (input: SetBudgetLimitInput) => Promise<Budget>
  resetToSeed: () => Promise<void>
}

export const FinanceContext = createContext<FinanceContextValue | null>(null)

