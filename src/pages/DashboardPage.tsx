import { useMemo, useState } from 'react'
import { CURRENT_MONTH } from '../mocks/seed'
import { formatBRLFromCents, monthLabelFromYYYYMM as monthLabelFromYYYYMMUtil } from '../domain/finance'
import { useFinance } from '../services/useFinance'
import ReceitasDespesasChart from '../components/charts/ReceitasDespesasChart'
import DespesasPorCategoriaDonutChart from '../components/charts/DespesasPorCategoriaDonutChart'
import CategoryIcon from '../components/icons/CategoryIcon'

type TxType = 'RECEITA' | 'DESPESA'

function sumByType(transactions: Array<{ type: TxType; amountCents: number }>, type: TxType) {
  return transactions.filter((t) => t.type === type).reduce((acc, t) => acc + t.amountCents, 0)
}

function formatBRDate(dateISO: string) {
  const [y, m, d] = dateISO.split('-')
  if (!y || !m || !d) return dateISO
  return `${d}/${m}/${y}`
}

function StatIcon({ variant }: { variant: 'in' | 'out' | 'edit' }) {
  if (variant === 'in') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 5V19" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        <path d="M7 10L12 5L17 10" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (variant === 'out') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 5V19" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        <path d="M7 14L12 19L17 14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 20h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}

export default function DashboardPage() {
  const { loading, data } = useFinance()
  const monthOptions = useMemo(
    () => ['2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03'],
    [],
  )
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH)

  const monthTransactions = useMemo(() => {
    if (!data) return []
    return data.transactions.filter((t) => t.occurredOn.startsWith(selectedMonth))
  }, [data, selectedMonth])

  const receitasCents = useMemo(() => sumByType(monthTransactions, 'RECEITA'), [monthTransactions])
  const despesasCents = useMemo(() => sumByType(monthTransactions, 'DESPESA'), [monthTransactions])
  const saldoCents = receitasCents - despesasCents

  const budgetsTotalCents = useMemo(() => {
    if (!data) return 0
    return data.budgets.filter((b) => b.month === selectedMonth).reduce((acc, b) => acc + b.limitCents, 0)
  }, [data, selectedMonth])

  const withinBudget = budgetsTotalCents > 0 && despesasCents <= budgetsTotalCents

  const expensesByCategory = useMemo(() => {
    if (!data) return []
    const expenseTx = monthTransactions.filter((t) => t.type === 'DESPESA')
    const totals = new Map<string, number>()
    for (const tx of expenseTx) {
      totals.set(tx.categoryId, (totals.get(tx.categoryId) ?? 0) + tx.amountCents)
    }
    return Array.from(totals.entries())
      .map(([categoryId, amountCents]) => {
        const categoryName = data.categories.find((c) => c.id === categoryId)?.name ?? 'Categoria'
        return { categoryId, categoryName, amountCents }
      })
      .sort((a, b) => b.amountCents - a.amountCents)
  }, [data, monthTransactions])

  const donutSegments = useMemo(() => {
    if (expensesByCategory.length === 0) return []
    const baseColor = '#f59e0b' // orange
    return expensesByCategory.map((row, idx) => ({
      label: row.categoryName,
      valueCents: row.amountCents,
      color: idx % 2 === 0 ? baseColor : '#fbbf24',
    }))
  }, [expensesByCategory])

  const recentTxs = useMemo(() => {
    return monthTransactions
      .slice()
      .sort((a, b) => b.occurredOn.localeCompare(a.occurredOn))
      .slice(0, 5)
  }, [monthTransactions])

  if (loading || !data) {
    return (
      <>
        <div className="pageHeaderRow">
          <div>
            <h1 className="pageTitle">Dashboard</h1>
            <div className="pageSubtitle">Visão geral das suas finanças</div>
          </div>
        </div>
        <div className="card">
          <div className="muted">Carregando...</div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="pageHeaderRow">
        <div>
          <h1 className="pageTitle">Dashboard</h1>
          <div className="pageSubtitle">Visão geral das suas finanças</div>
        </div>

        <div className="monthSelectWrap">
          <select className="monthSelect" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            {monthOptions.map((m) => (
              <option value={m} key={m}>
                {monthLabelFromYYYYMMUtil(m)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid3">
        <div className="card statCard">
          <div className="statTop">
            <div>
              <p className="statLabel">Receitas</p>
              <div className="statValue">{formatBRLFromCents(receitasCents)}</div>
            </div>
            <div className="statIconBadge statIconBadgeGreen" aria-hidden="true">
              <StatIcon variant="in" />
            </div>
          </div>
        </div>

        <div className="card statCard">
          <div className="statTop">
            <div>
              <p className="statLabel">Despesas</p>
              <div className="statValue">{formatBRLFromCents(despesasCents)}</div>
            </div>
            <div className="statIconBadge statIconBadgeRed" aria-hidden="true">
              <StatIcon variant="out" />
            </div>
          </div>
        </div>

        <div className="card statCard">
          <div className="statTop">
            <div>
              <p className="statLabel">Saldo</p>
              <div className="statValue">{formatBRLFromCents(saldoCents)}</div>
              <div className="statHint">{withinBudget ? 'Dentro do orçamento' : 'Fora do orçamento'}</div>
            </div>
            <div className="statIconBadge statIconBadgePurple" aria-hidden="true">
              <StatIcon variant="edit" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid2" style={{ marginTop: 14 }}>
        <div className="card">
          <div className="sectionTitle">Receitas vs Despesas</div>
          {monthTransactions.length === 0 ? (
            <div className="chartEmpty">Sem transações neste mês</div>
          ) : (
            <ReceitasDespesasChart revenuesCents={receitasCents} expensesCents={despesasCents} />
          )}
        </div>

        <div className="card">
          <div className="sectionTitle">Despesas por Categoria</div>
          {donutSegments.length === 0 ? (
            <div className="chartEmpty">Sem despesas neste mês</div>
          ) : (
            <DespesasPorCategoriaDonutChart segments={donutSegments} />
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="sectionTitle">Transações Recentes</div>
        {recentTxs.length === 0 ? (
          <div className="chartEmpty" style={{ height: 120 }}>
            Nenhuma transação registrada ainda
          </div>
        ) : (
          <div className="transactionsRecentList">
            {recentTxs.map((tx) => {
              const cat = data.categories.find((c) => c.id === tx.categoryId)
              const categoryName = cat?.name ?? 'Categoria'
              const sign = tx.type === 'RECEITA' ? '+' : '-'
              const color = tx.type === 'RECEITA' ? '#22c55e' : '#ef4444'
              return (
                <div className="recentTxRow" key={tx.id}>
                  <div className="recentTxLeft">
                    <div className={`recentTxIcon ${tx.type === 'RECEITA' ? 'recentTxIconIn' : 'recentTxIconOut'}`}>
                      <CategoryIcon name={categoryName} emoji={cat?.emoji} />
                    </div>
                    <div>
                      <div className="recentTxTextTitle">{tx.type === 'RECEITA' ? 'ENTRADA' : 'SAÍDA'}</div>
                      <div className="recentTxTextSub">
                        {categoryName} • {formatBRDate(tx.occurredOn)}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontWeight: 900, color, fontSize: 13 }}>
                    {sign} {formatBRLFromCents(tx.amountCents)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

