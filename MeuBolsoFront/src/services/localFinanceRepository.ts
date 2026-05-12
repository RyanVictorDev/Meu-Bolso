import { isValidISODate, isValidYearMonth, MAX_AMOUNT_CENTS } from '../domain/finance'
import type { Budget, Category, FinanceData, Goal, Transaction, TransactionType } from '../domain/finance'
import { getSeedBudgets, getSeedCategories, getSeedTransactions } from '../mocks/seed'
import type {
  AddCategoryInput,
  AddGoalContributionInput,
  AddGoalInput,
  AddTransactionInput,
  FinanceRepository,
  SetBudgetLimitInput,
  UpdateGoalInput,
} from './financeRepository'

const STORAGE_KEY = 'meubolso_finance_v1'
const CATEGORY_NAME_MAX_LENGTH = 80
const CATEGORY_EMOJI_MAX_LENGTH = 16
const TRANSACTION_DESCRIPTION_MAX_LENGTH = 240
const GOAL_NAME_MAX_LENGTH = 120
const GOAL_DESCRIPTION_MAX_LENGTH = 280
const GOAL_CONTRIBUTION_NOTE_MAX_LENGTH = 180

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

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function assertPositiveAmountCents(value: number, field = 'Valor') {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${field} deve ser maior que zero`)
  }
  if (value > MAX_AMOUNT_CENTS) {
    throw new Error(`${field} excede o limite permitido`)
  }
}

function assertNonNegativeAmountCents(value: number, field = 'Valor') {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${field} deve ser maior ou igual a zero`)
  }
  if (value > MAX_AMOUNT_CENTS) {
    throw new Error(`${field} excede o limite permitido`)
  }
}

function assertTransactionDateIsValid(occurredOn: string) {
  if (!isValidISODate(occurredOn)) {
    throw new Error('Data inválida')
  }
  if (occurredOn < '2000-01-01' || occurredOn > '2200-12-31') {
    throw new Error('Data deve estar entre 2000-01-01 e 2200-12-31')
  }
}

function assertGoalDueOnIsValid(dueOn?: string) {
  if (!dueOn) {
    throw new Error('Informe o prazo da meta')
  }
  if (!isValidISODate(dueOn)) {
    throw new Error('Prazo da meta inválido')
  }
  if (dueOn < todayISO()) {
    throw new Error('O prazo da meta não pode ser no passado')
  }
}

function assertGoalInputIsValid(input: AddGoalInput | UpdateGoalInput) {
  const name = input.name.trim()
  if (!name) throw new Error('Informe um nome para a meta')
  if (name.length > GOAL_NAME_MAX_LENGTH) throw new Error('Nome da meta deve ter no máximo 120 caracteres')
  if ((input.description?.trim().length ?? 0) > GOAL_DESCRIPTION_MAX_LENGTH) {
    throw new Error('Descrição deve ter no máximo 280 caracteres')
  }
  assertPositiveAmountCents(input.targetCents, 'Valor alvo')
  assertGoalDueOnIsValid(input.dueOn)
}

function assertContributionInputIsValid(goal: Goal, input: AddGoalContributionInput) {
  if (goal.archived) throw new Error('Não é possível aportar em uma meta arquivada')
  assertPositiveAmountCents(input.amountCents, 'Aporte')
  if (!isValidISODate(input.contributedOn)) throw new Error('Data do aporte inválida')
  if (input.contributedOn > todayISO()) throw new Error('A data do aporte não pode ser no futuro')
  if (goal.dueOn && input.contributedOn > goal.dueOn) throw new Error('A data do aporte não pode passar do prazo da meta')
  if ((input.note?.trim().length ?? 0) > GOAL_CONTRIBUTION_NOTE_MAX_LENGTH) {
    throw new Error('Observação deve ter no máximo 180 caracteres')
  }
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
  const goals = Array.isArray(data.goals) ? data.goals.filter((g) => g && typeof (g as Goal).id === 'string') : []
  return { categories, transactions, budgets, goals } as FinanceData
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
          goals: normalized.goals ?? [],
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
      goals: [],
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    return seed
  }

  async resetToSeed(): Promise<FinanceData> {
    const seed: FinanceData = {
      categories: getSeedCategories(),
      transactions: getSeedTransactions(),
      budgets: getSeedBudgets(),
      goals: [],
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    return seed
  }

  async addCategory(input: AddCategoryInput): Promise<Category> {
    const data = await this.load()

    if (!isCategoryType(input.type)) {
      throw new Error('Tipo inválido')
    }
    const categoryName = input.name.trim()
    if (categoryName.length < 2 || categoryName.length > CATEGORY_NAME_MAX_LENGTH) {
      throw new Error('Nome da categoria deve ter entre 2 e 80 caracteres')
    }

    const existingByName = data.categories.find((c) => c.name.toLowerCase() === categoryName.toLowerCase() && c.type === input.type)
    if (existingByName) return existingByName

    const emojiTrim = input.emoji?.trim()
    if ((emojiTrim?.length ?? 0) > CATEGORY_EMOJI_MAX_LENGTH) {
      throw new Error('Ícone deve ter no máximo 16 caracteres')
    }
    const category: Category = {
      id: newId('cat'),
      name: categoryName,
      type: input.type,
      ...(emojiTrim ? { emoji: emojiTrim } : {}),
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
    assertTransactionDateIsValid(occurredOn)
    assertPositiveAmountCents(input.amountCents)
    if ((input.description?.trim().length ?? 0) > TRANSACTION_DESCRIPTION_MAX_LENGTH) {
      throw new Error('Descrição deve ter no máximo 240 caracteres')
    }

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

  async updateTransaction(id: string, input: AddTransactionInput): Promise<Transaction> {
    const data = await this.load()
    const existing = data.transactions.find((tx) => tx.id === id)
    if (!existing) throw new Error('Transação não encontrada')
    const occurredOn = input.occurredOn.trim()
    assertTransactionDateIsValid(occurredOn)
    assertPositiveAmountCents(input.amountCents)
    if ((input.description?.trim().length ?? 0) > TRANSACTION_DESCRIPTION_MAX_LENGTH) {
      throw new Error('Descrição deve ter no máximo 240 caracteres')
    }
    const category = data.categories.find((c) => c.id === input.categoryId)
    if (!category) throw new Error('Categoria inválida')
    if (category.type !== input.type) throw new Error('Tipo não corresponde à categoria')
    const updated: Transaction = {
      ...existing,
      type: input.type,
      categoryId: input.categoryId,
      description: input.description?.trim() || undefined,
      amountCents: input.amountCents,
      occurredOn,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, transactions: data.transactions.map((tx) => (tx.id === id ? updated : tx)) }))
    return updated
  }

  async deleteTransaction(id: string): Promise<void> {
    const data = await this.load()
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, transactions: data.transactions.filter((tx) => tx.id !== id) }))
  }

  async setBudgetLimit(input: SetBudgetLimitInput): Promise<Budget> {
    const data = await this.load()

    const budgetMonth = input.month.trim()
    if (!isValidYearMonth(budgetMonth)) {
      throw new Error('Mês inválido')
    }
    assertNonNegativeAmountCents(input.limitCents, 'Limite')

    const category = data.categories.find((c) => c.id === input.categoryId)
    if (!category) throw new Error('Categoria inválida')
    if (category.type !== 'DESPESA') throw new Error('Orçamento só para despesas')

    const limit = input.limitCents
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

  async addGoal(input: AddGoalInput): Promise<Goal> {
    const data = await this.load()
    assertGoalInputIsValid(input)
    const goal: Goal = {
      id: newId('goal'),
      name: input.name.trim(),
      description: input.description?.trim() || undefined,
      targetCents: input.targetCents,
      currentCents: 0,
      dueOn: input.dueOn,
      archived: false,
      createdAt: new Date().toISOString(),
      contributions: [],
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, goals: [goal, ...data.goals] }))
    return goal
  }

  async updateGoal(id: string, input: UpdateGoalInput): Promise<Goal> {
    const data = await this.load()
    const goal = data.goals.find((item) => item.id === id)
    if (!goal) throw new Error('Meta não encontrada')
    assertGoalInputIsValid(input)
    const updated: Goal = {
      ...goal,
      name: input.name.trim(),
      description: input.description?.trim() || undefined,
      targetCents: input.targetCents,
      dueOn: input.dueOn,
      archived: input.archived,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, goals: data.goals.map((item) => (item.id === id ? updated : item)) }))
    return updated
  }

  async deleteGoal(id: string): Promise<void> {
    const data = await this.load()
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, goals: data.goals.filter((goal) => goal.id !== id) }))
  }

  async addGoalContribution(id: string, input: AddGoalContributionInput): Promise<Goal> {
    const data = await this.load()
    const goal = data.goals.find((item) => item.id === id)
    if (!goal) throw new Error('Meta não encontrada')
    assertContributionInputIsValid(goal, input)
    const contribution = {
      id: newId('goal_contribution'),
      goalId: id,
      amountCents: input.amountCents,
      contributedOn: input.contributedOn,
      note: input.note?.trim() || undefined,
      createdAt: new Date().toISOString(),
    }
    const updated: Goal = {
      ...goal,
      currentCents: goal.currentCents + input.amountCents,
      contributions: [contribution, ...goal.contributions],
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, goals: data.goals.map((item) => (item.id === id ? updated : item)) }))
    return updated
  }
}

