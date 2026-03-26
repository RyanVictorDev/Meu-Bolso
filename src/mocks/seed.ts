import type { Budget, Category, Transaction, TransactionType } from '../domain/finance'

const DEFAUL_MONTH = '2026-03'

function makeId(name: string) {
  // Deterministic id: stable across dev refreshes
  return `seed_${name.toLowerCase().replaceAll(/\s+/g, '_')}`
}

export const CURRENT_MONTH = DEFAUL_MONTH

export function getSeedCategories(): Category[] {
  const expenseNames = [
    'Moradia',
    'Alimentação',
    'Transporte',
    'Saúde',
    'Lazer',
    'Educação',
    'Contas',
    'Outros',
  ]
  const revenueNames = ['Salário', 'Freelance']

  const expenseType: TransactionType = 'DESPESA'
  const revenueType: TransactionType = 'RECEITA'

  return [
    ...expenseNames.map((name) => ({
      id: makeId(name),
      name,
      type: expenseType,
    })),
    ...revenueNames.map((name) => ({
      id: makeId(name),
      name,
      type: revenueType,
    })),
  ]
}

export function getSeedBudgets(): Budget[] {
  const categories = getSeedCategories()
  const expenseCategories = categories.filter((c) => c.type === 'DESPESA')

  const now = new Date().toISOString()
  return expenseCategories.map((category) => {
    // Keep a budget mostly empty, but with one category having a realistic limit.
    const limitCents =
      category.name === 'Alimentação' ? 500000 : 0 // R$ 5.000,00

    return {
      id: `seed_budget_${category.id}_${DEFAUL_MONTH}`,
      month: DEFAUL_MONTH,
      categoryId: category.id,
      limitCents,
      createdAt: now,
    }
  })
}

export function getSeedTransactions(): Transaction[] {
  const now = new Date().toISOString()
  const occurredOn = '2026-03-26'

  const freelanceCategoryId = makeId('Freelance')
  const alimentacaoCategoryId = makeId('Alimentação')

  return [
    {
      id: 'seed_tx_freelance',
      type: 'RECEITA',
      categoryId: freelanceCategoryId,
      description: 'Freelance',
      amountCents: 2131200, // R$ 21.312,00
      occurredOn,
      createdAt: now,
    },
    {
      id: 'seed_tx_teste',
      type: 'DESPESA',
      categoryId: alimentacaoCategoryId,
      description: 'Teste',
      amountCents: 12300, // R$ 123,00
      occurredOn,
      createdAt: now,
    },
  ]
}

