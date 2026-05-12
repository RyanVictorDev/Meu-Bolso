import { useMemo, useState } from 'react'
import DespesasPorCategoriaDonutChart from '../components/charts/DespesasPorCategoriaDonutChart'
import ReceitasDespesasChart from '../components/charts/ReceitasDespesasChart'
import PageLoader from '../components/PageLoader'
import DateInput from '../components/ui/DateInput'
import PillTabs from '../components/ui/PillTabs'
import { formatBRDate, formatBRLFromCents } from '../domain/finance'
import { useFinance } from '../services/useFinance'

const TABS = [
  { value: 'resumo', label: 'Resumo' },
  { value: 'despesas', label: 'Despesas' },
  { value: 'metas', label: 'Metas' },
] as const

function todayISO() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function currentMonthStartISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

export default function GraficosPage() {
  const { loading, data } = useFinance()
  const [tab, setTab] = useState<(typeof TABS)[number]['value']>('resumo')
  const [dateFrom, setDateFrom] = useState(currentMonthStartISO)
  const [dateTo, setDateTo] = useState(todayISO)

  const filteredTransactions = useMemo(() => {
    const txs = data?.transactions ?? []
    return txs.filter((tx) => {
      if (dateFrom && tx.occurredOn < dateFrom) return false
      if (dateTo && tx.occurredOn > dateTo) return false
      return true
    })
  }, [data, dateFrom, dateTo])

  const totals = useMemo(() => {
    return {
      receitas: filteredTransactions.filter((tx) => tx.type === 'RECEITA').reduce((acc, tx) => acc + tx.amountCents, 0),
      despesas: filteredTransactions.filter((tx) => tx.type === 'DESPESA').reduce((acc, tx) => acc + tx.amountCents, 0),
    }
  }, [filteredTransactions])

  const expensesByCategory = useMemo(() => {
    if (!data) return []
    const totalsByCategory = new Map<string, number>()
    filteredTransactions
      .filter((tx) => tx.type === 'DESPESA')
      .forEach((tx) => totalsByCategory.set(tx.categoryId, (totalsByCategory.get(tx.categoryId) ?? 0) + tx.amountCents))
    return Array.from(totalsByCategory.entries()).map(([categoryId, valueCents], idx) => ({
      label: data.categories.find((category) => category.id === categoryId)?.name ?? 'Categoria',
      valueCents,
      color: idx % 2 === 0 ? '#f59e0b' : '#fbbf24',
    }))
  }, [data, filteredTransactions])

  const periodError = dateFrom && dateTo && dateFrom > dateTo ? 'A data inicial não pode ser maior que a final.' : null
  const periodLabel = useMemo(() => {
    if (dateFrom && dateTo) return `${formatBRDate(dateFrom)} até ${formatBRDate(dateTo)}`
    if (dateFrom) return `A partir de ${formatBRDate(dateFrom)}`
    if (dateTo) return `Até ${formatBRDate(dateTo)}`
    return 'Todos os períodos'
  }, [dateFrom, dateTo])

  const resetToCurrentMonth = () => {
    setDateFrom(currentMonthStartISO())
    setDateTo(todayISO())
  }

  const clearPeriod = () => {
    setDateFrom('')
    setDateTo('')
  }

  if (loading || !data) {
    return (
      <>
        <h1 className="pageTitle">Gráficos</h1>
        <div className="card">
          <PageLoader />
        </div>
      </>
    )
  }

  return (
    <>
      <h1 className="pageTitle">Gráficos</h1>
      <div className="pageSubtitle">Análises separadas para despesas, receitas e metas. Período: {periodLabel}</div>
      <div className="toolbar">
        <PillTabs items={TABS} value={tab} onChange={setTab} />
      </div>

      <div className="dateFilterCard">
        <div className="dateFilterHeader">
          <div>
            <div className="dateFilterTitle">Filtrar gráficos por data</div>
            <div className="dateFilterSubtitle">
              {filteredTransactions.length} transação{filteredTransactions.length === 1 ? '' : 'ões'} no período
            </div>
          </div>
          <div className="dateFilterActions">
            <button type="button" className="smallBtn" onClick={resetToCurrentMonth}>
              Mês atual
            </button>
            <button type="button" className="smallBtn" onClick={clearPeriod}>
              Limpar
            </button>
          </div>
        </div>
        <div className="dateFilterFields">
          <div className="field">
            <div className="label">De</div>
            <DateInput value={dateFrom} onChange={setDateFrom} max={dateTo || undefined} />
          </div>
          <div className="field">
            <div className="label">Até</div>
            <DateInput value={dateTo} onChange={setDateTo} min={dateFrom || undefined} />
          </div>
        </div>
        {periodError ? <div className="fieldError">{periodError}</div> : null}
      </div>

      {periodError ? (
        <div className="card">
          <div className="chartEmpty">{periodError}</div>
        </div>
      ) : tab === 'resumo' ? (
        <div className="grid2">
          <div className="card">
            <div className="sectionTitle">Receitas vs Despesas</div>
            <ReceitasDespesasChart revenuesCents={totals.receitas} expensesCents={totals.despesas} />
          </div>
          <div className="card">
            <div className="sectionTitle">Totais</div>
            <div className="detailsGrid">
              <div>
                <span className="detailsLabel">Receitas</span>
                <strong className="txAmountIn">{formatBRLFromCents(totals.receitas)}</strong>
              </div>
              <div>
                <span className="detailsLabel">Despesas</span>
                <strong className="txAmountOut">{formatBRLFromCents(totals.despesas)}</strong>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {!periodError && tab === 'despesas' ? (
        <div className="card">
          <div className="sectionTitle">Despesas por Categoria</div>
          {expensesByCategory.length === 0 ? (
            <div className="chartEmpty">Sem despesas para analisar</div>
          ) : (
            <DespesasPorCategoriaDonutChart segments={expensesByCategory} />
          )}
        </div>
      ) : null}

      {!periodError && tab === 'metas' ? (
        <div className="goalsGrid">
          {data.goals.map((goal) => {
            const progress = Math.min(100, Math.round((goal.currentCents / goal.targetCents) * 100))
            const periodContributedCents = goal.contributions
              .filter((contribution) => {
                if (dateFrom && contribution.contributedOn < dateFrom) return false
                if (dateTo && contribution.contributedOn > dateTo) return false
                return true
              })
              .reduce((acc, contribution) => acc + contribution.amountCents, 0)
            return (
              <div className="card goalCard" key={goal.id}>
                <div className="sectionTitle">{goal.name}</div>
                <div className="goalProgressBar">
                  <span style={{ width: `${progress}%` }} />
                </div>
                <div className="goalAmounts">
                  <strong>{progress}%</strong>
                  <span>
                    {formatBRLFromCents(goal.currentCents)} de {formatBRLFromCents(goal.targetCents)}
                  </span>
                </div>
                <div className="rowHint">Aportado no período: {formatBRLFromCents(periodContributedCents)}</div>
              </div>
            )
          })}
        </div>
      ) : null}
    </>
  )
}
