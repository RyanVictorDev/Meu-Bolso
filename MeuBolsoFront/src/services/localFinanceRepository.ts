import type { Budget, Category, FinanceData, Transaction, TransactionType } from '../domain/finance'
import { getSeedBudgets, getSeedCategories, getSeedTransactions } from '../mocks/seed'
import type { FinanceRepository, AddCategoryInput, AddTransactionInput, SetBudgetLimitInput } from './financeRepository'

const STORAGE_KEY = 'meubolso_finance_v1'

function safeParseJSON<T>(value: string | null): T | null {
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

function newId(prefix: string) {
  // crypto.randomUUID is supported in modern browsers
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return `${prefix}_${(crypto as any).randomUUID()}`
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function isCategoryType(value: unknown): value is TransactionType {
  return value === 'RECEITA' || value === 'DESPESA'
}

function normalizeFinanceData(raw: unknown): FinanceData | null {
  if (!raw || typeof raw !== 'object') return null
  const data = raw as Partial<FinanceData>
  if (!Array.isArray(data.categories) || !Array.isArray(data.transactions) || !Array.isArray(data.budgets)) {
    return null
  }

  // Minimal runtime checks (keeps the app resilient across versions)
  const categories = data.categories.filter((c) => c && typeof (c as Category).id === 'string')
  const transactions = data.transactions.filter(
    (t) =>
      t &&
      typeof (t as Transaction).id === 'string' &&
      typeof (t as Transaction).categoryId === 'string' &&
      typeof (t as Transaction).occurredOn === 'string',
  )
  const budgets = data.budgets.filter(
    (b) => b && typeof (b as Budget).id === 'string' && typeof (b as Budget).month === 'string',
  )

  if (categories.length === 0 && transactions.length === 0 && budgets.length === 0) return null
  return { categories, transactions, budgets } as FinanceData
}

export class LocalFinanceRepository implements FinanceRepository {
  async load(): Promise<FinanceData> {
    const existing = safeParseJSON<FinanceData>(localStorage.getItem(STORAGE_KEY))
    const normalized = normalizeFinanceData(existing)
    if (normalized) {
      // Light migration: if we previously seeded an "empty" demo state,
      // upgrade to the richer seed so the dashboard charts render correctly.
      const isLegacyEmpty =
        normalized.transactions.length === 0 && normalized.budgets.every((b) => b.limitCents === 0)

      if (isLegacyEmpty) {
        const seedUpgraded: FinanceData = {
          ...normalized,
          transactions: getSeedTransactions(),
          budgets: getSeedBudgets(),
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seedUpgraded))
        return seedUpgraded
      }

      return normalized
    }

    const seed: FinanceData = {
      categories: getSeedCategories(),
      transactions: getSeedTransactions(),
      budgets: getSeedBudgets(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    return seed
  }

  async resetToSeed(): Promise<FinanceData> {
    const seed: FinanceData = {
      categories: getSeedCategories(),
      transactions: getSeedTransactions(),
      budgets: getSeedBudgets(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    return seed
  }

  async addCategory(input: AddCategoryInput): Promise<Category> {
    const data = await this.load()

    if (!isCategoryType(input.type)) {
      throw new Error('Tipo inválido')
    }

    const existingByName = data.categories.find((c) => c.name.toLowerCase() === input.name.toLowerCase() && c.type === input.type)
    if (existingByName) return existingByName

    const emojiTrim = input.emoji?.trim()
    const category: Category = {
      id: newId('cat'),
      name: input.name.trim(),
      type: input.type,
      ...(emojiTrim ? { emoji: emojiTrim.slice(0, 8) } : {}),
    }

    const now = new Date().toISOString()
    const updatedBudgets = [...data.budgets]
    const currentMonth = updatedBudgets[0]?.month ?? '2026-03'
    if (category.type === 'DESPESA') {
      updatedBudgets.push({
        id: newId('budget'),
        month: currentMonth,
        categoryId: category.id,
        limitCents: 0,
        createdAt: now,
      })
    }

    const next: FinanceData = {
      ...data,
      categories: [...data.categories, category],
      budgets: updatedBudgets,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    return category
  }

  async addTransaction(input: AddTransactionInput): Promise<Transaction> {
    const data = await this.load()

    const occurredOn = input.occurredOn.trim()
    if (!/^\d{4}-\d{2}-\d{2}$/.test(occurredOn)) {
      throw new Error('Data inválida')
    }
    if (input.amountCents <= 0) throw new Error('Valor deve ser > 0')

    const category = data.categories.find((c) => c.id === input.categoryId)
    if (!category) throw new Error('Categoria inválida')
    if (category.type !== input.type) throw new Error('Tipo não corresponde à categoria')

    const tx: Transaction = {
      id: newId('tx'),
      type: input.type,
      categoryId: input.categoryId,
      description: input.description?.trim() || undefined,
      amountCents: input.amountCents,
      occurredOn,
      createdAt: new Date().toISOString(),
    }

    const next: FinanceData = {
      ...data,
      transactions: [tx, ...data.transactions],
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    return tx
  }

  async setBudgetLimit(input: SetBudgetLimitInput): Promise<Budget> {
    const data = await this.load()

    const budgetMonth = input.month.trim()
    if (!/^\d{4}-\d{2}$/.test(budgetMonth)) {
      throw new Error('Mês inválido')
    }

    const category = data.categories.find((c) => c.id === input.categoryId)
    if (!category) throw new Error('Categoria inválida')
    if (category.type !== 'DESPESA') throw new Error('Orçamento só para despesas')

    const limit = Math.max(0, input.limitCents)
    const existing = data.budgets.find((b) => b.month === budgetMonth && b.categoryId === input.categoryId)

    const now = new Date().toISOString()
    const budget: Budget = existing
      ? { ...existing, limitCents: limit }
      : {
          id: newId('budget'),
          month: budgetMonth,
          categoryId: input.categoryId,
          limitCents: limit,
          createdAt: now,
        }

    const nextBudgets = existing ? data.budgets.map((b) => (b.id === budget.id ? budget : b)) : [...data.budgets, budget]

    const next: FinanceData = {
      ...data,
      budgets: nextBudgets,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    return budget
  }
}

