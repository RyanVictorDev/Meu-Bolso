import type { Budget, Category, FinanceData, Goal, Transaction } from '../domain/finance'
import { apiRequest } from './apiClient'
import type {
  AddCategoryInput,
  AddGoalContributionInput,
  AddGoalInput,
  AddTransactionInput,
  FinanceRepository,
  ListTransactionsInput,
  SetBudgetLimitInput,
  TransactionPage,
  TransactionSummary,
  TransactionSummaryInput,
  UpdateCategoryInput,
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

function withQuery(path: string, params: Record<string, string | number | undefined | null>) {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  if (entries.length === 0) return path
  const sep = path.includes('?') ? '&' : '?'
  return `${path}${sep}${entries.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`).join('&')}`
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

  async updateCategory(id: string, input: UpdateCategoryInput, environmentId?: string | null): Promise<Category> {
    return apiRequest<Category>(withEnvironment(`/api/categories/${encodeURIComponent(id)}`, environmentId), {
      method: 'PUT',
      body: input,
    })
  }

  async deleteCategory(id: string, environmentId?: string | null): Promise<void> {
    await apiRequest<void>(withEnvironment(`/api/categories/${encodeURIComponent(id)}`, environmentId), {
      method: 'DELETE',
    })
  }

  async listTransactions(input: ListTransactionsInput, environmentId?: string | null): Promise<TransactionPage> {
    return apiRequest<TransactionPage>(
      withEnvironment(
        withQuery('/api/transactions', {
          dateFrom: input.dateFrom,
          dateTo: input.dateTo,
          month: input.month,
          search: input.search,
          page: input.page,
          size: input.size,
        }),
        environmentId,
      ),
      { method: 'GET' },
    )
  }

  async getTransactionSummary(input: TransactionSummaryInput, environmentId?: string | null): Promise<TransactionSummary> {
    return apiRequest<TransactionSummary>(
      withEnvironment(
        withQuery('/api/transactions/summary', {
          dateFrom: input.dateFrom,
          dateTo: input.dateTo,
          month: input.month,
        }),
        environmentId,
      ),
      { method: 'GET' },
    )
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
