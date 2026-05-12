import type { Budget, Category, Transaction, TransactionType } from '../domain/finance'

const DEFAUL_MONTH = '2026-03'

function makeId(name: string) {
  // Deterministic id: stable across dev refreshes
  return `seed_${name.toLowerCase().replaceAll(/\s+/g, '_')}`
}

export const CURRENT_MONTH = DEFAUL_MONTH

const EXPENSE_EMOJI: Record<string, string> = {
  Moradia: '🏠',
  Alimentação: '🍽️',
  Transporte: '🚗',
  Saúde: '⚕️',
  Lazer: '🎉',
  Educação: '📚',
  Contas: '📄',
  Mercado: '🛒',
  Assinaturas: '📺',
  Outros: '📌',
}

const REVENUE_EMOJI: Record<string, string> = {
  Salário: '💼',
  Freelance: '💻',
}

export function getSeedCategories(): Category[] {
  const expenseNames = [
    'Moradia',
    'Alimentação',
    'Transporte',
    'Saúde',
    'Lazer',
    'Educação',
    'Contas',
    'Mercado',
    'Assinaturas',
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
      emoji: EXPENSE_EMOJI[name],
    })),
    ...revenueNames.map((name) => ({
      id: makeId(name),
      name,
      type: revenueType,
      emoji: REVENUE_EMOJI[name],
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
  const moradiaCategoryId = makeId('Moradia')
  const mercadoCategoryId = makeId('Mercado')
  const transporteCategoryId = makeId('Transporte')

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
      id: 'seed_tx_aluguel',
      type: 'DESPESA',
      categoryId: moradiaCategoryId,
      description: 'Aluguel',
      amountCents: 120000, // R$ 1.200,00
      occurredOn: '2026-03-07',
      createdAt: now,
    },
    {
      id: 'seed_tx_mercado',
      type: 'DESPESA',
      categoryId: mercadoCategoryId,
      description: 'Compra do mês',
      amountCents: 68550, // R$ 685,50
      occurredOn: '2026-03-12',
      createdAt: now,
    },
    {
      id: 'seed_tx_transporte',
      type: 'DESPESA',
      categoryId: transporteCategoryId,
      description: 'Combustível e transporte',
      amountCents: 32000, // R$ 320,00
      occurredOn: '2026-02-20',
      createdAt: now,
    },
  ]
}

