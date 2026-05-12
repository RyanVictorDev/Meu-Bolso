import type { Budget, Category, FinanceData, Goal, Transaction, TransactionType } from '../domain/finance'

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

export interface AddGoalInput {
  name: string
  description?: string
  targetCents: number
  dueOn: string
}

export interface UpdateGoalInput extends AddGoalInput {
  archived: boolean
}

export interface AddGoalContributionInput {
  amountCents: number
  contributedOn: string
  note?: string
}

export interface FinanceRepository {
  load(environmentId?: string | null): Promise<FinanceData>
  resetToSeed(environmentId?: string | null): Promise<FinanceData>

  addCategory(input: AddCategoryInput, environmentId?: string | null): Promise<Category>
  addTransaction(input: AddTransactionInput, environmentId?: string | null): Promise<Transaction>
  updateTransaction(id: string, input: AddTransactionInput, environmentId?: string | null): Promise<Transaction>
  deleteTransaction(id: string, environmentId?: string | null): Promise<void>

  setBudgetLimit(input: SetBudgetLimitInput, environmentId?: string | null): Promise<Budget>

  addGoal(input: AddGoalInput, environmentId?: string | null): Promise<Goal>
  updateGoal(id: string, input: UpdateGoalInput, environmentId?: string | null): Promise<Goal>
  deleteGoal(id: string, environmentId?: string | null): Promise<void>
  addGoalContribution(id: string, input: AddGoalContributionInput, environmentId?: string | null): Promise<Goal>
}

