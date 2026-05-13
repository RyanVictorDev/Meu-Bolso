import { createContext } from 'react'
import type { Budget, Category, FinanceData, Goal, Transaction } from '../domain/finance'
import type {
  AddCategoryInput,
  AddGoalContributionInput,
  AddGoalInput,
  AddTransactionInput,
  ListTransactionsInput,
  SetBudgetLimitInput,
  TransactionPage,
  TransactionSummary,
  TransactionSummaryInput,
  UpdateCategoryInput,
  UpdateGoalInput,
} from './financeRepository'

export type FinanceContextValue = {
  loading: boolean
  data: FinanceData | null
  error: string | null
  refresh: (options?: { silent?: boolean }) => Promise<void>
  addCategory: (input: AddCategoryInput) => Promise<Category>
  updateCategory: (id: string, input: UpdateCategoryInput) => Promise<Category>
  deleteCategory: (id: string) => Promise<void>
  listTransactions: (input: ListTransactionsInput) => Promise<TransactionPage>
  getTransactionSummary: (input: TransactionSummaryInput) => Promise<TransactionSummary>
  addTransaction: (input: AddTransactionInput) => Promise<Transaction>
  updateTransaction: (id: string, input: AddTransactionInput) => Promise<Transaction>
  deleteTransaction: (id: string) => Promise<void>
  setBudgetLimit: (input: SetBudgetLimitInput) => Promise<Budget>
  resetToSeed: () => Promise<void>
  addGoal: (input: AddGoalInput) => Promise<Goal>
  updateGoal: (id: string, input: UpdateGoalInput) => Promise<Goal>
  deleteGoal: (id: string) => Promise<void>
  addGoalContribution: (id: string, input: AddGoalContributionInput) => Promise<Goal>
}

export const FinanceContext = createContext<FinanceContextValue | null>(null)

