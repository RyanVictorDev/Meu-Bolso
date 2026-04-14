import type { Budget, Category, FinanceData, Transaction } from '../domain/finance'
import { apiRequest } from './apiClient'
import type { AddCategoryInput, AddTransactionInput, FinanceRepository, SetBudgetLimitInput } from './financeRepository'

type ApiFinanceData = {
  categories: Category[]
  transactions: Array<Omit<Transaction, 'occurredOn'> & { occurredOn: string }>
  budgets: Budget[]
}

function normalizeFinanceData(payload: ApiFinanceData): FinanceData {
  return {
    categories: payload.categories,
    transactions: payload.transactions.map((tx) => ({
      ...tx,
      occurredOn: tx.occurredOn,
    })),
    budgets: payload.budgets,
  }
}

export class HttpFinanceRepository implements FinanceRepository {
  async load(): Promise<FinanceData> {
    const payload = await apiRequest<ApiFinanceData>('/api/finance', { method: 'GET' })
    return normalizeFinanceData(payload)
  }

  async resetToSeed(): Promise<FinanceData> {
    const payload = await apiRequest<ApiFinanceData>('/api/finance/reset', { method: 'POST' })
    return normalizeFinanceData(payload)
  }

  async addCategory(input: AddCategoryInput): Promise<Category> {
    return apiRequest<Category>('/api/categories', {
      method: 'POST',
      body: input,
    })
  }

  async addTransaction(input: AddTransactionInput): Promise<Transaction> {
    return apiRequest<Transaction>('/api/transactions', {
      method: 'POST',
      body: input,
    })
  }

  async setBudgetLimit(input: SetBudgetLimitInput): Promise<Budget> {
    return apiRequest<Budget>('/api/budgets/limit', {
      method: 'PUT',
      body: input,
    })
  }
}
