import { useEffect, useMemo, useState } from 'react'
import { formatBRDate, formatBRLFromCents, monthLabelFromYYYYMM as monthLabelFromYYYYMMUtil } from '../domain/finance'
import type { Transaction } from '../domain/finance'
import { useFinance } from '../services/useFinance'
import ReceitasDespesasChart from '../components/charts/ReceitasDespesasChart'
import DespesasPorCategoriaDonutChart from '../components/charts/DespesasPorCategoriaDonutChart'
import CategoryIcon from '../components/icons/CategoryIcon'
import DashboardSkeleton from '../components/DashboardSkeleton'

function previousMonthOf(month: string) {
  const [year, monthNumber] = month.split('-').map(Number)
  const date = new Date(year, monthNumber - 2, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
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
  const { loading, data, getTransactionSummary, listTransactions } = useFinance()
  const [monthSummary, setMonthSummary] = useState({ receitasCents: 0, despesasCents: 0, expensesByCategory: [] as Array<{ categoryName: string; amountCents: number }> })
  const [previousMonthExpensesCents, setPreviousMonthExpensesCents] = useState(0)
  const [recentTxs, setRecentTxs] = useState<Transaction[]>([])
  const monthOptions = useMemo(() => {
    const set = new Set<string>()
    const now = new Date()
    set.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
    data?.budgets.forEach((budget) => set.add(budget.month))
    return Array.from(set).sort((a, b) => b.localeCompare(a))
  }, [data])
  const [selectedMonth, setSelectedMonth] = useState('')

  const activeMonth = selectedMonth || monthOptions[0] || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`

  useEffect(() => {
    if (loading || !data) return
    const loadDashboardTransactions = async () => {
      const [summary, previousSummary, recent] = await Promise.all([
        getTransactionSummary({ month: activeMonth }),
        getTransactionSummary({ month: previousMonthOf(activeMonth) }),
        listTransactions({ month: activeMonth, page: 0, size: 5 }),
      ])
      setMonthSummary(summary)
      setPreviousMonthExpensesCents(previousSummary.despesasCents)
      setRecentTxs(recent.content)
    }
    void loadDashboardTransactions()
  }, [activeMonth, data, getTransactionSummary, listTransactions, loading])

  const receitasCents = monthSummary.receitasCents
  const despesasCents = monthSummary.despesasCents
  const saldoCents = receitasCents - despesasCents
  const expensesDeltaCents = despesasCents - previousMonthExpensesCents

  const budgetsTotalCents = useMemo(() => {
    if (!data) return 0
    return data.budgets.filter((b) => b.month === activeMonth).reduce((acc, b) => acc + b.limitCents, 0)
  }, [activeMonth, data])

  const withinBudget = budgetsTotalCents > 0 && despesasCents <= budgetsTotalCents

  const expensesByCategory = useMemo(() => {
    return monthSummary.expensesByCategory.map((item) => ({ categoryName: item.categoryName, amountCents: item.amountCents }))
  }, [monthSummary.expensesByCategory])

  const donutSegments = useMemo(() => {
    if (expensesByCategory.length === 0) return []
    const baseColor = '#f59e0b' // orange
    return expensesByCategory.map((row, idx) => ({
      label: row.categoryName,
      valueCents: row.amountCents,
      color: idx % 2 === 0 ? baseColor : '#fbbf24',
    }))
  }, [expensesByCategory])

  const goalSummary = useMemo(() => {
    const activeGoals = data?.goals.filter((goal) => !goal.archived) ?? []
    const targetCents = activeGoals.reduce((acc, goal) => acc + goal.targetCents, 0)
    const currentCents = activeGoals.reduce((acc, goal) => acc + goal.currentCents, 0)
    const averageProgress =
      activeGoals.length === 0
        ? 0
        : Math.round(
            activeGoals.reduce((acc, goal) => acc + Math.min(100, (goal.currentCents / goal.targetCents) * 100), 0) /
              activeGoals.length,
          )
    const closestGoal = activeGoals
      .slice()
      .sort((a, b) => b.currentCents / b.targetCents - a.currentCents / a.targetCents)[0]
    return { activeGoals, targetCents, currentCents, averageProgress, closestGoal }
  }, [data])

  if (loading || !data) {
    return <DashboardSkeleton />
  }

  return (
    <>
      <div className="pageHeaderRow">
        <div>
          <h1 className="pageTitle">Dashboard</h1>
          <div className="pageSubtitle">Visão geral das suas finanças</div>
        </div>

        <div className="monthSelectWrap">
          <select className="monthSelect" value={activeMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            {monthOptions.map((m) => (
              <option value={m} key={m}>
                {monthLabelFromYYYYMMUtil(m)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid4">
        <div className="card statCard">
          <div className="statTop">
            <div>
              <p className="statLabel">Receitas</p>
              <div className="statValue statValueIncome">{formatBRLFromCents(receitasCents)}</div>
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
              <div className="statValue statValueExpense">{formatBRLFromCents(despesasCents)}</div>
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

        <div className="card statCard">
          <div className="statTop">
            <div>
              <p className="statLabel">Despesas vs mês passado</p>
              <div className={expensesDeltaCents <= 0 ? 'statValue statValueIncome' : 'statValue statValueExpense'}>
                {expensesDeltaCents === 0 ? formatBRLFromCents(0) : `${expensesDeltaCents > 0 ? '+' : '-'}${formatBRLFromCents(Math.abs(expensesDeltaCents))}`}
              </div>
              <div className="statHint">Mês passado: {formatBRLFromCents(previousMonthExpensesCents)}</div>
            </div>
            <div className="statIconBadge statIconBadgeRed" aria-hidden="true">
              <StatIcon variant="out" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid3" style={{ marginTop: 14 }}>
        <div className="card statCard">
          <p className="statLabel">Metas ativas</p>
          <div className="statValue">{goalSummary.activeGoals.length}</div>
          <div className="statHint">Objetivos em andamento</div>
        </div>
        <div className="card statCard">
          <p className="statLabel">Total aportado</p>
          <div className="statValue statValueIncome">{formatBRLFromCents(goalSummary.currentCents)}</div>
          <div className="statHint">Meta total: {formatBRLFromCents(goalSummary.targetCents)}</div>
        </div>
        <div className="card statCard">
          <p className="statLabel">Progresso médio</p>
          <div className="statValue">{goalSummary.averageProgress}%</div>
          <div className="statHint">
            {goalSummary.closestGoal ? `Mais próxima: ${goalSummary.closestGoal.name}` : 'Nenhuma meta cadastrada'}
          </div>
        </div>
      </div>

      <div className="grid2" style={{ marginTop: 14 }}>
        <div className="card">
          <div className="sectionTitle">Receitas vs Despesas</div>
          {receitasCents === 0 && despesasCents === 0 ? (
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

                  <div className={tx.type === 'RECEITA' ? 'recentTxAmountIn' : 'recentTxAmountOut'}>
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

