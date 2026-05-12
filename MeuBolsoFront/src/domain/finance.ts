export type TransactionType = 'RECEITA' | 'DESPESA'

export type CategoryType = TransactionType

export interface Category {
  id: string
  name: string
  type: CategoryType
  /** Optional display emoji chosen by the user */
  emoji?: string
}

export interface UserSummary {
  id: string
  name: string
  email: string
}

export interface Transaction {
  id: string
  type: TransactionType
  categoryId: string
  description?: string
  amountCents: number
  occurredOn: string // YYYY-MM-DD
  createdAt: string // ISO timestamp
  createdBy?: UserSummary
}

export interface Budget {
  id: string
  month: string // YYYY-MM
  categoryId: string // DESPESA category
  limitCents: number
  createdAt: string // ISO timestamp
}

export interface GoalContribution {
  id: string
  goalId: string
  amountCents: number
  contributedOn: string // YYYY-MM-DD
  note?: string
  createdAt: string
  createdBy?: UserSummary
}

export interface Goal {
  id: string
  name: string
  description?: string
  targetCents: number
  currentCents: number
  dueOn?: string
  archived: boolean
  createdAt: string
  createdBy?: UserSummary
  contributions: GoalContribution[]
}

export interface FinanceData {
  categories: Category[]
  transactions: Transaction[]
  budgets: Budget[]
  goals: Goal[]
}

export const MAX_AMOUNT_CENTS = 99999999999999

export function formatBRLFromCents(amountCents: number): string {
  const amount = amountCents / 100
  return amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function formatCurrencyInputFromCents(amountCents: number): string {
  return (amountCents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatCurrencyInput(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  return formatCurrencyInputFromCents(Number(digits))
}

export function parseAmountToCents(input: string): number | null {
  const normalized = input
    .trim()
    .replaceAll('.', '')
    .replace(',', '.')

  const value = Number(normalized)
  if (!Number.isFinite(value)) return null
  return Math.round(value * 100)
}

export function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export function isValidYearMonth(value: string): boolean {
  if (!/^\d{4}-\d{2}$/.test(value)) return false
  const [year, month] = value.split('-').map(Number)
  return year >= 1 && month >= 1 && month <= 12
}

export function monthLabelFromYYYYMM(month: string): string {
  const [yearStr, monthStr] = month.split('-')
  const year = Number(yearStr)
  const monthIndex = Number(monthStr) - 1
  const date = new Date(Date.UTC(year, monthIndex, 1))
  const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

