import type { Budget, Category, FinanceData, Transaction, TransactionType } from '../domain/finance'

export interface AddCategoryInput {
  name: string
  type: TransactionType
  emoji?: string
}

export interface AddTransactionInput {
  type: TransactionType
  categoryId: string
  description?: string
  amountCents: number
  occurredOn: string // YYYY-MM-DD
}

export interface SetBudgetLimitInput {
  month: string // YYYY-MM
  categoryId: string // DESPESA category
  limitCents: number
}

export interface FinanceRepository {
  load(): Promise<FinanceData>
  resetToSeed(): Promise<FinanceData>

  addCategory(input: AddCategoryInput): Promise<Category>
  addTransaction(input: AddTransactionInput): Promise<Transaction>

  setBudgetLimit(input: SetBudgetLimitInput): Promise<Budget>
}

