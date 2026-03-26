export type TransactionType = 'RECEITA' | 'DESPESA'

export type CategoryType = TransactionType

export interface Category {
  id: string
  name: string
  type: CategoryType
}

export interface Transaction {
  id: string
  type: TransactionType
  categoryId: string
  description?: string
  amountCents: number
  occurredOn: string // YYYY-MM-DD
  createdAt: string // ISO timestamp
}

export interface Budget {
  id: string
  month: string // YYYY-MM
  categoryId: string // DESPESA category
  limitCents: number
  createdAt: string // ISO timestamp
}

export interface FinanceData {
  categories: Category[]
  transactions: Transaction[]
  budgets: Budget[]
}

export function formatBRLFromCents(amountCents: number): string {
  const amount = amountCents / 100
  return amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
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

export function monthLabelFromYYYYMM(month: string): string {
  const [yearStr, monthStr] = month.split('-')
  const year = Number(yearStr)
  const monthIndex = Number(monthStr) - 1
  const date = new Date(Date.UTC(year, monthIndex, 1))
  const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

