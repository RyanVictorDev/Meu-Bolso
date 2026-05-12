import type { Budget, Category, FinanceData, Goal, Transaction } from '../domain/finance'
import { apiRequest } from './apiClient'
import type {
  AddCategoryInput,
  AddGoalContributionInput,
  AddGoalInput,
  AddTransactionInput,
  FinanceRepository,
  SetBudgetLimitInput,
  UpdateGoalInput,
} from './financeRepository'

type ApiFinanceData = {
  categories: Category[]
  transactions: Array<Omit<Transaction, 'occurredOn'> & { occurredOn: string }>
  budgets: Budget[]
  goals?: Goal[]
}

function withEnvironment(path: string, environmentId?: string | null) {
  if (!environmentId) return path
  const sep = path.includes('?') ? '&' : '?'
  return `${path}${sep}environmentId=${encodeURIComponent(environmentId)}`
}

function normalizeFinanceData(payload: ApiFinanceData): FinanceData {
  return {
    categories: payload.categories,
    transactions: payload.transactions.map((tx) => ({
      ...tx,
      occurredOn: tx.occurredOn,
    })),
    budgets: payload.budgets,
    goals: payload.goals ?? [],
  }
}

export class HttpFinanceRepository implements FinanceRepository {
  async load(environmentId?: string | null): Promise<FinanceData> {
    const payload = await apiRequest<ApiFinanceData>(withEnvironment('/api/finance', environmentId), { method: 'GET' })
    return normalizeFinanceData(payload)
  }

  async resetToSeed(environmentId?: string | null): Promise<FinanceData> {
    const payload = await apiRequest<ApiFinanceData>(withEnvironment('/api/finance/reset', environmentId), { method: 'POST' })
    return normalizeFinanceData(payload)
  }

  async addCategory(input: AddCategoryInput, environmentId?: string | null): Promise<Category> {
    return apiRequest<Category>(withEnvironment('/api/categories', environmentId), {
      method: 'POST',
      body: input,
    })
  }

  async addTransaction(input: AddTransactionInput, environmentId?: string | null): Promise<Transaction> {
    return apiRequest<Transaction>(withEnvironment('/api/transactions', environmentId), {
      method: 'POST',
      body: input,
    })
  }

  async updateTransaction(id: string, input: AddTransactionInput, environmentId?: string | null): Promise<Transaction> {
    return apiRequest<Transaction>(withEnvironment(`/api/transactions/${id}`, environmentId), {
      method: 'PUT',
      body: input,
    })
  }

  async deleteTransaction(id: string, environmentId?: string | null): Promise<void> {
    return apiRequest<void>(withEnvironment(`/api/transactions/${id}`, environmentId), { method: 'DELETE' })
  }

  async setBudgetLimit(input: SetBudgetLimitInput, environmentId?: string | null): Promise<Budget> {
    return apiRequest<Budget>(withEnvironment('/api/budgets/limit', environmentId), {
      method: 'PUT',
      body: input,
    })
  }

  async addGoal(input: AddGoalInput, environmentId?: string | null): Promise<Goal> {
    return apiRequest<Goal>(withEnvironment('/api/goals', environmentId), { method: 'POST', body: input })
  }

  async updateGoal(id: string, input: UpdateGoalInput, environmentId?: string | null): Promise<Goal> {
    return apiRequest<Goal>(withEnvironment(`/api/goals/${id}`, environmentId), { method: 'PUT', body: input })
  }

  async deleteGoal(id: string, environmentId?: string | null): Promise<void> {
    return apiRequest<void>(withEnvironment(`/api/goals/${id}`, environmentId), { method: 'DELETE' })
  }

  async addGoalContribution(id: string, input: AddGoalContributionInput, environmentId?: string | null): Promise<Goal> {
    return apiRequest<Goal>(withEnvironment(`/api/goals/${id}/contributions`, environmentId), { method: 'POST', body: input })
  }
}
